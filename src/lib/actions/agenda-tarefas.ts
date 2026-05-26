"use server";

import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasPermission } from "@/lib/auth";
import { atualizarJurosParcelasPendentes } from "@/lib/parcelas-juros";
import { getCategoriaLocacaoVeiculos } from "@/lib/financeiro-categorias";
import {
  calcularJurosParcela,
  valorTotalParcela,
} from "@/lib/juros-parcela";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function assertAgendaAccess() {
  const user = await requireAuth();
  if (!hasPermission(user.role, "locacoes")) {
    throw new Error("Sem permissão para gerenciar a agenda");
  }
  return user;
}

function revalidateAgenda() {
  revalidatePath("/locacoes");
  revalidatePath("/clientes/contratos");
  revalidatePath("/financeiro");
}

export async function concluirTarefaAgenda(
  chave: string,
  tipo: string,
  referenciaId: string
): Promise<ActionResult> {
  try {
    await assertAgendaAccess();

    if (chave.startsWith("parcela-")) {
      return {
        success: false,
        error: "Use confirmar pagamento para parcelas",
      };
    }

    if (!chave.startsWith("loc-") && !chave.startsWith("ipva-")) {
      const evento = await prisma.eventoAgenda.findUnique({
        where: { id: referenciaId },
      });
      if (!evento) {
        return { success: false, error: "Evento não encontrado" };
      }
      await prisma.eventoAgenda.update({
        where: { id: referenciaId },
        data: { concluido: true },
      });
      revalidateAgenda();
      return { success: true };
    }

    const dataPrevista = await extrairDataPrevistaDaChave(chave);
    await prisma.conclusaoAgenda.upsert({
      where: { chave },
      create: {
        chave,
        tipo: tipo as never,
        dataPrevista,
        concluida: true,
        concluidaEm: new Date(),
      },
      update: {
        concluida: true,
        concluidaEm: new Date(),
      },
    });

    revalidateAgenda();
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao concluir tarefa",
    };
  }
}

export async function desfazerTarefaAgenda(
  chave: string,
  referenciaId: string
): Promise<ActionResult> {
  try {
    await assertAgendaAccess();

    if (chave.startsWith("parcela-")) {
      const parcela = await prisma.parcelaLocacao.findUnique({
        where: { id: referenciaId },
      });
      if (!parcela?.dataPagamento) {
        return { success: false, error: "Parcela não está paga" };
      }
      await prisma.parcelaLocacao.update({
        where: { id: referenciaId },
        data: {
          dataPagamento: null,
          pagamentoAjustado: false,
          isentarJuros: false,
        },
      });
      await atualizarJurosParcelasPendentes();
      revalidateAgenda();
      return { success: true };
    }

    if (!chave.startsWith("loc-") && !chave.startsWith("ipva-")) {
      await prisma.eventoAgenda.update({
        where: { id: referenciaId },
        data: { concluido: false },
      });
      revalidateAgenda();
      return { success: true };
    }

    await prisma.conclusaoAgenda.updateMany({
      where: { chave },
      data: { concluida: false, concluidaEm: null },
    });

    revalidateAgenda();
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao desfazer",
    };
  }
}

export async function reagendarTarefaAgenda(
  chave: string,
  tipo: string,
  referenciaId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await assertAgendaAccess();

    const novaDataStr = formData.get("novaData") as string;
    if (!novaDataStr) {
      return { success: false, error: "Informe a nova data" };
    }

    const data = startOfDay(new Date(novaDataStr + "T12:00:00"));
    const aplicarJuros =
      formData.get("aplicarJuros") === "on" ||
      formData.get("aplicarJuros") === "true";

    if (chave.startsWith("parcela-")) {
      const parcela = await prisma.parcelaLocacao.findUnique({
        where: { id: referenciaId },
      });
      if (!parcela) {
        return { success: false, error: "Parcela não encontrada" };
      }
      if (parcela.dataPagamento) {
        return { success: false, error: "Parcela já paga não pode ser reagendada" };
      }

      const base = Number(parcela.valorBase ?? parcela.valor);
      const vencimentoOriginal =
        parcela.dataVencimentoOriginal ?? parcela.dataVencimento;

      let valorJuros = 0;
      let observacaoExtra = `Reagendado para ${novaDataStr} (sem juros de atraso)`;

      if (aplicarJuros) {
        const juros = calcularJurosParcela(
          base,
          vencimentoOriginal,
          data,
          false
        );
        valorJuros = juros.valorJuros;
        observacaoExtra =
          valorJuros > 0
            ? `Reagendado para ${novaDataStr} (juros ${juros.diasAtraso} dia(s) até a nova data: R$ ${valorJuros.toFixed(2)})`
            : `Reagendado para ${novaDataStr} (sem juros — nova data não ultrapassa o vencimento do contrato)`;
      }

      await prisma.parcelaLocacao.update({
        where: { id: referenciaId },
        data: {
          dataVencimento: data,
          dataVencimentoOriginal: vencimentoOriginal,
          valorJuros,
          jurosTravados: aplicarJuros ? valorJuros : 0,
          valor: valorTotalParcela(base, valorJuros),
          isentarJuros: false,
          observacoes: [parcela.observacoes, observacaoExtra]
            .filter(Boolean)
            .join(" · "),
        },
      });
      await atualizarJurosParcelasPendentes();
      revalidateAgenda();
      return { success: true };
    }

    if (!chave.startsWith("loc-") && !chave.startsWith("ipva-")) {
      await prisma.eventoAgenda.update({
        where: { id: referenciaId },
        data: { dataInicio: data, concluido: false },
      });
      revalidateAgenda();
      return { success: true };
    }

    const dataPrevista = await extrairDataPrevistaDaChave(chave);
    await prisma.conclusaoAgenda.upsert({
      where: { chave },
      create: {
        chave,
        tipo: tipo as never,
        dataPrevista,
        reagendadaPara: data,
        concluida: false,
      },
      update: {
        reagendadaPara: data,
        concluida: false,
        concluidaEm: null,
      },
    });

    revalidateAgenda();
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao reagendar",
    };
  }
}

export async function confirmarPagamentoParcela(
  parcelaId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await assertAgendaAccess();
    await atualizarJurosParcelasPendentes();

    const parcela = await prisma.parcelaLocacao.findUnique({
      where: { id: parcelaId },
      include: {
        locacao: {
          include: {
            veiculo: { select: { placa: true } },
            cliente: { select: { nome: true } },
          },
        },
      },
    });

    if (!parcela) {
      return { success: false, error: "Parcela não encontrada" };
    }
    if (parcela.dataPagamento) {
      return { success: false, error: "Parcela já está paga" };
    }

    const registrarFinanceiro =
      formData.get("registrarFinanceiro") === "on" ||
      formData.get("registrarFinanceiro") === "true";

    const valorPago = Number(parcela.valor);

    await prisma.$transaction(async (tx) => {
      await tx.parcelaLocacao.update({
        where: { id: parcelaId },
        data: {
          dataPagamento: new Date(),
          pagamentoAjustado: false,
          isentarJuros: false,
        },
      });

      if (registrarFinanceiro) {
        const categoria = await getCategoriaLocacaoVeiculos(tx);
        const descricaoJuros =
          Number(parcela.valorJuros) > 0
            ? ` (incl. juros R$ ${Number(parcela.valorJuros).toFixed(2)})`
            : "";
        await tx.transacaoFinanceira.create({
          data: {
            categoriaId: categoria.id,
            tipo: "ENTRADA",
            valor: valorPago,
            descricao: `Locação ${parcela.locacao.veiculo.placa} — ${parcela.locacao.cliente.nome}${descricaoJuros}`,
            data: new Date(),
          },
        });
      }
    });

    revalidateAgenda();
    revalidatePath(`/locacoes/${parcela.locacaoId}`);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao confirmar pagamento",
    };
  }
}

/** Ajuste quando o funcionário esqueceu de dar check — sem distorcer juros/financeiro. */
export async function ajustarPagamentoParcela(
  parcelaId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await assertAgendaAccess();

    const parcela = await prisma.parcelaLocacao.findUnique({
      where: { id: parcelaId },
      include: {
        locacao: {
          include: {
            veiculo: { select: { placa: true } },
            cliente: { select: { nome: true } },
          },
        },
      },
    });

    if (!parcela) {
      return { success: false, error: "Parcela não encontrada" };
    }

    const dataPagamentoStr = formData.get("dataPagamento") as string;
    if (!dataPagamentoStr) {
      return { success: false, error: "Informe a data do pagamento" };
    }

    const dataPagamento = startOfDay(new Date(dataPagamentoStr + "T12:00:00"));
    const isentarJuros =
      formData.get("isentarJuros") === "on" ||
      formData.get("isentarJuros") === "true";
    const registrarFinanceiro =
      formData.get("registrarFinanceiro") === "on" ||
      formData.get("registrarFinanceiro") === "true";
    const observacoes = (formData.get("observacoes") as string) || undefined;
    const valorBase = Number(parcela.valorBase);

    await prisma.$transaction(async (tx) => {
      await tx.parcelaLocacao.update({
        where: { id: parcelaId },
        data: {
          dataPagamento,
          pagamentoAjustado: true,
          isentarJuros,
          valorJuros: 0,
          valor: valorBase,
          observacoes: [
            parcela.observacoes,
            observacoes ?? "Ajuste manual (check esquecido)",
          ]
            .filter(Boolean)
            .join(" · "),
        },
      });

      if (registrarFinanceiro) {
        const categoria = await getCategoriaLocacaoVeiculos(tx);
        await tx.transacaoFinanceira.create({
          data: {
            categoriaId: categoria.id,
            tipo: "ENTRADA",
            valor: valorBase,
            descricao: `Locação ${parcela.locacao.veiculo.placa} — ${parcela.locacao.cliente.nome} (ajuste)`,
            data: dataPagamento,
          },
        });
      }
    });

    revalidateAgenda();
    revalidatePath(`/locacoes/${parcela.locacaoId}`);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro no ajuste",
    };
  }
}

async function extrairDataPrevistaDaChave(chave: string): Promise<Date> {
  const ipvaMatch = chave.match(/^ipva-(.+)-(\d{4})$/);
  if (ipvaMatch) {
    const [, veiculoId, yearStr] = ipvaMatch;
    const veiculo = await prisma.veiculo.findUnique({
      where: { id: veiculoId },
      select: { ipvaVencimento: true },
    });
    if (veiculo?.ipvaVencimento) {
      const d = new Date(veiculo.ipvaVencimento);
      d.setFullYear(Number(yearStr));
      return startOfDay(d);
    }
  }

  const locMatch = chave.match(/^loc-(.+)-(inicio|fim-prev|fim-real)$/);
  if (locMatch) {
    const [, locacaoId, suffix] = locMatch;
    const loc = await prisma.locacao.findUnique({
      where: { id: locacaoId },
      select: { dataInicio: true, dataFimPrevista: true, dataFimReal: true },
    });
    if (suffix === "fim-prev") return startOfDay(loc?.dataFimPrevista ?? new Date());
    if (suffix === "fim-real")
      return startOfDay(loc?.dataFimReal ?? new Date());
    return startOfDay(loc?.dataInicio ?? new Date());
  }

  return startOfDay(new Date());
}
