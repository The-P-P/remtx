"use server";

import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { dateKey, parseDateInput } from "@/lib/utils";
import { requireAuth, hasPermission } from "@/lib/auth";
import { atualizarJurosParcelasPendentes } from "@/lib/parcelas-juros";
import { removerParcelasPendentesDuplicadas } from "@/lib/parcelas-semanais";
import {
  ensureCategoriasFinanceirasPadrao,
  getCategoriaCaucao,
  getCategoriaLocacaoVeiculos,
} from "@/lib/financeiro-categorias";
import { caucaoPendente } from "@/lib/caucao-locacao";
import {
  sincronizarLancamentoCaucao,
  sincronizarLancamentoParcela,
} from "@/lib/financeiro-lancamento";
import { estornarPagamentoParcelaFinanciamento } from "@/lib/actions/financiamento-veiculo";
import type { FormaPagamento } from "@/types/prisma";
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
  revalidatePath("/financeiro/fluxo");
  revalidatePath("/financeiro/categorias");
  revalidatePath("/");
}

export type ConfirmacaoPagamentoInput = {
  registrarFinanceiro?: boolean;
  formaPagamento?: string | null;
  /** yyyy-MM-dd do dia em que o pagamento foi confirmado na agenda */
  dataRecebimento?: string | null;
};

function parseFormaPagamento(raw: unknown): FormaPagamento | null {
  return typeof raw === "string" && raw.length > 0
    ? (raw as FormaPagamento)
    : null;
}

function parseConfirmacaoPagamentoInput(
  input: FormData | ConfirmacaoPagamentoInput
): Required<Pick<ConfirmacaoPagamentoInput, "registrarFinanceiro">> &
  ConfirmacaoPagamentoInput & { formaPagamento: FormaPagamento | null } {
  if (input instanceof FormData) {
    const v = input.get("registrarFinanceiro");
    const registrarFinanceiro =
      v == null ? true : v === "on" || v === "true";
    return {
      registrarFinanceiro,
      formaPagamento: parseFormaPagamento(input.get("formaPagamento")),
      dataRecebimento: (input.get("dataRecebimento") as string) || null,
    };
  }
  return {
    registrarFinanceiro: input.registrarFinanceiro !== false,
    formaPagamento: parseFormaPagamento(input.formaPagamento),
    dataRecebimento: input.dataRecebimento ?? null,
  };
}

function resolveDataPagamentoConfirmado(
  dataRecebimento: string | null | undefined,
  fallback: Date
): Date {
  if (dataRecebimento && String(dataRecebimento).trim().length > 0) {
    return parseDateInput(dataRecebimento);
  }
  return parseDateInput(fallback);
}

export async function concluirTarefaAgenda(
  chave: string,
  tipo: string,
  referenciaId: string
): Promise<ActionResult> {
  try {
    await assertAgendaAccess();

    if (
      chave.startsWith("parcela-") ||
      chave.startsWith("financiamento-") ||
      chave.startsWith("caucao-")
    ) {
      return {
        success: false,
        error: "Use confirmar pagamento para parcelas e caução",
      };
    }

    if (
      !chave.startsWith("loc-") &&
      !chave.startsWith("ipva-") &&
      !chave.startsWith("manutencao-")
    ) {
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

    if (chave.startsWith("financiamento-")) {
      return estornarPagamentoParcelaFinanciamento(referenciaId);
    }

    if (chave.startsWith("caucao-")) {
      const locacao = await prisma.locacao.findUnique({
        where: { id: referenciaId },
      });
      if (!locacao?.caucaoPaga) {
        return { success: false, error: "Caução não está registrada como paga" };
      }
      const categoria = await getCategoriaCaucao();
      await prisma.$transaction(async (tx) => {
        await tx.locacao.update({
          where: { id: referenciaId },
          data: { caucaoPaga: false, caucaoDataPagamento: null },
        });
        await tx.transacaoFinanceira.deleteMany({
          where: {
            locacaoId: referenciaId,
            categoriaId: categoria.id,
            parcelaId: null,
          },
        });
      });
      revalidateAgenda();
      revalidatePath(`/locacoes/${referenciaId}`);
      return { success: true };
    }

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

    if (
      !chave.startsWith("loc-") &&
      !chave.startsWith("ipva-") &&
      !chave.startsWith("manutencao-")
    ) {
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

    if (chave.startsWith("financiamento-")) {
      const parcela = await prisma.parcelaFinanciamento.findUnique({
        where: { id: referenciaId },
      });
      if (!parcela) {
        return { success: false, error: "Parcela não encontrada" };
      }
      if (parcela.dataPagamento) {
        return { success: false, error: "Parcela já paga não pode ser reagendada" };
      }
      await prisma.parcelaFinanciamento.update({
        where: { id: referenciaId },
        data: { dataVencimento: data },
      });
      revalidateAgenda();
      revalidatePath("/veiculos");
      return { success: true };
    }

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

    if (
      !chave.startsWith("loc-") &&
      !chave.startsWith("ipva-") &&
      !chave.startsWith("manutencao-")
    ) {
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

export async function confirmarCaucaoLocacao(
  locacaoId: string,
  input: FormData | ConfirmacaoPagamentoInput
): Promise<ActionResult> {
  try {
    await assertAgendaAccess();

    const locacao = await prisma.locacao.findUnique({
      where: { id: locacaoId },
      include: {
        veiculo: { select: { placa: true } },
        cliente: { select: { nome: true } },
      },
    });

    if (!locacao) {
      return { success: false, error: "Locação não encontrada" };
    }
    if (locacao.caucaoPaga) {
      return { success: false, error: "Caução já foi recebida" };
    }
    const valorCaucao = Number(locacao.valorCaucao);
    if (valorCaucao <= 0) {
      return { success: false, error: "Esta locação não possui caução" };
    }

    const opts = parseConfirmacaoPagamentoInput(input);
    const dataPagamento = resolveDataPagamentoConfirmado(
      opts.dataRecebimento,
      locacao.dataInicio
    );

    await prisma.$transaction(async (tx) => {
      await tx.locacao.update({
        where: { id: locacaoId },
        data: { caucaoPaga: true, caucaoDataPagamento: dataPagamento },
      });

      if (opts.registrarFinanceiro) {
        await ensureCategoriasFinanceirasPadrao(tx);
        const categoria = await getCategoriaCaucao(tx);
        await sincronizarLancamentoCaucao(tx, {
          categoriaId: categoria.id,
          tipo: "ENTRADA",
          valor: valorCaucao,
          descricao: `Caução — ${locacao.veiculo.placa} — ${locacao.cliente.nome}`,
          data: dataPagamento,
          formaPagamento: opts.formaPagamento,
          locacaoId,
        });
      }
    });

    revalidateAgenda();
    revalidatePath(`/locacoes/${locacaoId}`);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao confirmar caução",
    };
  }
}

/** 1ª semana + caução na retirada do veículo. */
export async function confirmarRecebimentoRetirada(
  locacaoId: string,
  input: FormData | ConfirmacaoPagamentoInput
): Promise<ActionResult> {
  try {
    await assertAgendaAccess();

    const locacao = await prisma.locacao.findUnique({
      where: { id: locacaoId },
    });
    if (!locacao) {
      return { success: false, error: "Locação não encontrada" };
    }

    let recebeuAlgo = false;
    const dataRetirada = parseDateInput(locacao.dataInicio);

    const primeiraParcela = await prisma.parcelaLocacao.findFirst({
      where: { locacaoId, dataPagamento: null },
      orderBy: { dataVencimento: "asc" },
    });

    const parcelaNaRetirada =
      primeiraParcela &&
      dateKey(primeiraParcela.dataVencimento) === dateKey(dataRetirada);

    if (caucaoPendente(locacao) && parcelaNaRetirada) {
      const rCaucao = await confirmarCaucaoLocacao(locacaoId, input);
      if (!rCaucao.success) return rCaucao;
      recebeuAlgo = true;
    }

    if (primeiraParcela && parcelaNaRetirada) {
      const rParcela = await confirmarPagamentoParcela(
        primeiraParcela.id,
        input
      );
      if (!rParcela.success) return rParcela;
      recebeuAlgo = true;
    }

    if (!recebeuAlgo) {
      return { success: false, error: "Nada pendente para receber na retirada" };
    }

    await removerParcelasPendentesDuplicadas();
    revalidateAgenda();
    revalidatePath(`/locacoes/${locacaoId}`);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "Erro ao confirmar recebimento",
    };
  }
}

export async function confirmarPagamentoParcela(
  parcelaId: string,
  input: FormData | ConfirmacaoPagamentoInput = { registrarFinanceiro: true }
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

    const opts = parseConfirmacaoPagamentoInput(input);
    const valorPago = Number(parcela.valor);
    const dataPagamento = resolveDataPagamentoConfirmado(
      opts.dataRecebimento,
      parcela.dataVencimento
    );

    await prisma.$transaction(async (tx) => {
      await tx.parcelaLocacao.update({
        where: { id: parcelaId },
        data: {
          dataPagamento,
          pagamentoAjustado: false,
          isentarJuros: false,
        },
      });

      if (opts.registrarFinanceiro) {
        await ensureCategoriasFinanceirasPadrao(tx);
        const categoria = await getCategoriaLocacaoVeiculos(tx);
        const descricaoJuros =
          Number(parcela.valorJuros) > 0
            ? ` (incl. juros R$ ${Number(parcela.valorJuros).toFixed(2)})`
            : "";
        await sincronizarLancamentoParcela(tx, {
          categoriaId: categoria.id,
          tipo: "ENTRADA",
          valor: valorPago,
          descricao: `Locação ${parcela.locacao.veiculo.placa} — ${parcela.locacao.cliente.nome}${descricaoJuros}`,
          data: dataPagamento,
          formaPagamento: opts.formaPagamento,
          parcelaId,
          locacaoId: parcela.locacaoId,
        });
      }
    });

    await removerParcelasPendentesDuplicadas();
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
        await sincronizarLancamentoParcela(tx, {
          categoriaId: categoria.id,
          tipo: "ENTRADA",
          valor: valorBase,
          descricao: `Locação ${parcela.locacao.veiculo.placa} — ${parcela.locacao.cliente.nome} (ajuste)`,
          data: dataPagamento,
          parcelaId,
          locacaoId: parcela.locacaoId,
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

  if (chave.startsWith("manutencao-")) {
    const manutencaoId = chave.slice("manutencao-".length);
    const manutencao = await prisma.manutencao.findUnique({
      where: { id: manutencaoId },
      select: { dataRealizada: true },
    });
    return startOfDay(manutencao?.dataRealizada ?? new Date());
  }

  return startOfDay(new Date());
}
