"use server";

import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { parseDateInput } from "@/lib/utils";
import { dadosCaucaoCreate } from "@/lib/caucao-locacao";
import { provisionarContratoLocacao } from "@/lib/contratos/provisionar";
import { sincronizarParcelasMensais } from "@/lib/parcelas-mensais";
import {
  calcularValorTotalSemanal,
  encerrarParcelasAposDevolucao,
  sincronizarParcelasSemanais,
} from "@/lib/parcelas-semanais";
import { addMonths } from "date-fns";
import { getCategoriaLocacaoVeiculos } from "@/lib/financeiro-categorias";
import { criarLancamentoFinanceiro } from "@/lib/financeiro-lancamento";
import { hasPermission } from "@/lib/auth";
import { requireTenant } from "@/lib/tenant";
import {
  locacaoCreateSchema,
  locacaoUpdateSchema,
  locacaoFinalizarSchema,
  parcelaSchema,
} from "@/lib/validations/locacao";

import { zodFieldErrors } from "@/lib/form/state";
import type { ActionResult } from "@/lib/actions/action-result";
import { friendlyErrorMessage } from "@/lib/errors/friendly-message";

async function assertLocacaoAccess() {
  const tenant = await requireTenant();
  if (!hasPermission(tenant.role, "locacoes")) {
    throw new Error("Sem permissão para gerenciar locações");
  }
  return tenant;
}

async function assertVeiculoDisponivelParaLocacao(
  veiculoId: string,
  locadoraId: string,
  statusDesejado: "RESERVADA" | "ATIVA",
  excludeLocacaoId?: string
) {
  const veiculo = await prisma.veiculo.findFirst({
    where: { id: veiculoId, locadoraId },
    select: { status: true, placa: true, kmAtual: true },
  });

  if (!veiculo) {
    throw new Error("Veículo não encontrado");
  }

  if (veiculo.status === "INATIVO") {
    throw new Error("Veículo inativo não pode ser locado");
  }

  if (veiculo.status === "EM_MANUTENCAO") {
    throw new Error("Veículo em manutenção não pode ser locado");
  }

  const conflito = await prisma.locacao.findFirst({
    where: {
      locadoraId,
      veiculoId,
      status: { in: ["ATIVA", "RESERVADA"] },
      id: excludeLocacaoId ? { not: excludeLocacaoId } : undefined,
    },
  });

  if (conflito) {
    throw new Error(
      `Veículo ${veiculo.placa} já possui locação ${conflito.status === "ATIVA" ? "ativa" : "reservada"}`
    );
  }

  if (statusDesejado === "ATIVA" && veiculo.status === "ALUGADO") {
    throw new Error(`Veículo ${veiculo.placa} já está alugado`);
  }

  return veiculo;
}

function revalidateLocacaoPaths(locacaoId?: string, veiculoId?: string) {
  revalidatePath("/locacoes");
  revalidatePath("/clientes/contratos");
  revalidatePath("/");
  revalidatePath("/veiculos");
  if (locacaoId) revalidatePath(`/locacoes/${locacaoId}`);
  if (veiculoId) revalidatePath(`/veiculos/${veiculoId}`);
}

export async function getLocacoes(status?: string, veiculoId?: string) {
  const { locadoraId } = await requireTenant();
  return prisma.locacao.findMany({
    where: {
      locadoraId,
      ...(status ? { status: status as never } : {}),
      ...(veiculoId ? { veiculoId } : {}),
    },
    orderBy: { dataInicio: "desc" },
    include: {
      veiculo: { select: { id: true, placa: true, marca: true, modelo: true } },
      cliente: { select: { id: true, nome: true, telefone: true } },
      _count: { select: { parcelas: true } },
    },
  });
}

export async function getLocacaoById(id: string) {
  const { locadoraId } = await requireTenant();
  return prisma.locacao.findFirst({
    where: { id, locadoraId },
    include: {
      veiculo: true,
      cliente: true,
      parcelas: { orderBy: { dataVencimento: "asc" } },
      contrato: true,
      planoConquista: {
        include: { registros: { orderBy: { mesNumero: "asc" } } },
      },
    },
  });
}

export async function getVeiculosDisponiveisParaLocacao() {
  const { locadoraId } = await requireTenant();
  return prisma.veiculo.findMany({
    where: {
      locadoraId,
      status: { in: ["DISPONIVEL", "ALUGADO"] },
    },
    orderBy: { placa: "asc" },
    select: {
      id: true,
      placa: true,
      marca: true,
      modelo: true,
      kmAtual: true,
      status: true,
    },
  });
}

export async function createLocacao(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const tenant = await assertLocacaoAccess();

    const parsed = locacaoCreateSchema.safeParse({
      veiculoId: formData.get("veiculoId"),
      clienteId: formData.get("clienteId"),
      dataInicio: formData.get("dataInicio"),
      dataFimPrevista: formData.get("dataFimPrevista") || undefined,
      prazoIndeterminado: formData.get("prazoIndeterminado"),
      kmInicio: formData.get("kmInicio"),
      valorDiaria: formData.get("valorDiaria"),
      status: formData.get("status") || "RESERVADA",
      observacoes: formData.get("observacoes") || undefined,
      iniciarAgora: formData.get("iniciarAgora"),
      cobrarCaucao: formData.get("cobrarCaucao") || undefined,
      modeloContrato: formData.get("modeloContrato") || "PADRAO",
      planoConquistaMeses: formData.get("planoConquistaMeses") || undefined,
      planoConquistaValorAdesao:
        formData.get("planoConquistaValorAdesao") || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }

    const status =
      parsed.data.iniciarAgora || parsed.data.status === "ATIVA"
        ? "ATIVA"
        : "RESERVADA";

    const veiculo = await assertVeiculoDisponivelParaLocacao(
      parsed.data.veiculoId,
      tenant.locadoraId,
      status
    );

    if (parsed.data.kmInicio < veiculo.kmAtual && status === "ATIVA") {
      return {
        success: false,
        error: `Km de retirada não pode ser menor que o km atual (${veiculo.kmAtual})`,
      };
    }

    const isPlano = parsed.data.modeloContrato === "PLANO_CONQUISTA";
    const dataInicio = parseDateInput(parsed.data.dataInicio);
    const dataFim =
      parsed.data.dataFimPrevista ??
      (isPlano
        ? addMonths(dataInicio, parsed.data.planoConquistaMeses ?? 24)
        : null);

    const caucaoPadrao = dadosCaucaoCreate(
      parsed.data.valorDiaria,
      parsed.data.cobrarCaucao
    );
    const valorCaucao = isPlano
      ? Number(
          parsed.data.planoConquistaValorAdesao ??
            caucaoPadrao.valorCaucao ??
            parsed.data.valorDiaria
        )
      : Number(caucaoPadrao.valorCaucao);

    const locacao = await prisma.$transaction(async (tx) => {
      const created = await tx.locacao.create({
        data: {
          locadoraId: tenant.locadoraId,
          veiculoId: parsed.data.veiculoId,
          clienteId: parsed.data.clienteId,
          dataInicio,
          dataFimPrevista: dataFim ? parseDateInput(dataFim) : null,
          kmInicio: parsed.data.kmInicio,
          valorDiaria: parsed.data.valorDiaria,
          valorCaucao,
          caucaoPaga: false,
          modeloContrato: parsed.data.modeloContrato,
          periodicidadePagamento: parsed.data.periodicidadePagamento,
          planoConquistaMeses: parsed.data.planoConquistaMeses,
          planoConquistaValorAdesao: parsed.data.planoConquistaValorAdesao,
          status,
          observacoes: parsed.data.observacoes,
        },
      });

      if (status === "ATIVA") {
        await tx.veiculo.update({
          where: { id: parsed.data.veiculoId },
          data: { status: "ALUGADO", kmAtual: parsed.data.kmInicio },
        });
      }

      await provisionarContratoLocacao(created.id, tx);
      return created;
    });

    revalidateLocacaoPaths(locacao.id, locacao.veiculoId);
    return { success: true, data: { id: locacao.id } };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao criar locação"),
    };
  }
}

export async function updateLocacao(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const tenant = await assertLocacaoAccess();

    const locacao = await prisma.locacao.findFirst({
      where: { id, locadoraId: tenant.locadoraId },
    });
    if (!locacao) {
      return { success: false, error: "Locação não encontrada" };
    }

    if (!["RESERVADA", "ATIVA"].includes(locacao.status)) {
      return {
        success: false,
        error: "Somente locações reservadas ou ativas podem ser editadas",
      };
    }

    const parsed = locacaoUpdateSchema.safeParse({
      dataFimPrevista: formData.get("dataFimPrevista") || undefined,
      prazoIndeterminado: formData.get("prazoIndeterminado"),
      valorDiaria: formData.get("valorDiaria"),
      observacoes: formData.get("observacoes") || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }

    if (
      parsed.data.dataFimPrevista &&
      parsed.data.dataFimPrevista <
        parseDateInput(locacao.dataInicio)
    ) {
      return {
        success: false,
        error: "Data de devolução deve ser posterior ao início",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.locacao.update({
        where: { id },
        data: {
          dataFimPrevista: parsed.data.dataFimPrevista,
          valorDiaria: parsed.data.valorDiaria,
          observacoes: parsed.data.observacoes,
        },
      });

      if (locacao.status === "ATIVA") {
        const dataInicio = parseDateInput(locacao.dataInicio);
        if (locacao.periodicidadePagamento === "MENSAL") {
          await sincronizarParcelasMensais(
            tx,
            id,
            dataInicio,
            locacao.planoConquistaMeses ?? 24,
            Number(parsed.data.valorDiaria)
          );
        } else {
          await sincronizarParcelasSemanais(
            tx,
            id,
            dataInicio,
            parsed.data.dataFimPrevista,
            parsed.data.valorDiaria
          );
        }
        await provisionarContratoLocacao(id, tx);
      }
    });

    revalidateLocacaoPaths(id, locacao.veiculoId);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao atualizar locação"),
    };
  }
}

export async function ativarLocacao(id: string): Promise<ActionResult> {
  try {
    const tenant = await assertLocacaoAccess();

    const locacao = await prisma.locacao.findFirst({
      where: { id, locadoraId: tenant.locadoraId },
      include: { veiculo: { select: { kmAtual: true, placa: true } } },
    });

    if (!locacao) {
      return { success: false, error: "Locação não encontrada" };
    }

    if (locacao.status !== "RESERVADA") {
      return { success: false, error: "Somente reservas podem ser ativadas" };
    }

    await assertVeiculoDisponivelParaLocacao(
      locacao.veiculoId,
      tenant.locadoraId,
      "ATIVA",
      id
    );

    const kmInicio = Math.max(locacao.kmInicio, locacao.veiculo.kmAtual);
    const dataRetirada = parseDateInput(locacao.dataInicio);

    await prisma.$transaction(async (tx) => {
      await tx.locacao.update({
        where: { id },
        data: { status: "ATIVA", kmInicio, dataInicio: dataRetirada },
      });
      await tx.veiculo.update({
        where: { id: locacao.veiculoId },
        data: { status: "ALUGADO", kmAtual: kmInicio },
      });
      await provisionarContratoLocacao(id, tx);
    });

    revalidateLocacaoPaths(id, locacao.veiculoId);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao ativar locação"),
    };
  }
}

export async function finalizarLocacao(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const tenant = await assertLocacaoAccess();

    const locacao = await prisma.locacao.findFirst({
      where: { id, locadoraId: tenant.locadoraId },
      include: {
        veiculo: true,
        cliente: { select: { nome: true } },
      },
    });

    if (!locacao) {
      return { success: false, error: "Locação não encontrada" };
    }

    if (locacao.status !== "ATIVA") {
      return { success: false, error: "Somente locações ativas podem ser finalizadas" };
    }

    const parsed = locacaoFinalizarSchema.safeParse({
      kmFim: formData.get("kmFim"),
      dataFimReal: formData.get("dataFimReal"),
      registrarFinanceiro: formData.get("registrarFinanceiro"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }

    if (parsed.data.kmFim < locacao.kmInicio) {
      return {
        success: false,
        error: "Km final não pode ser menor que o km de retirada",
      };
    }

    if (parsed.data.kmFim < locacao.veiculo.kmAtual) {
      return {
        success: false,
        error: `Km final não pode ser menor que o km atual (${locacao.veiculo.kmAtual})`,
      };
    }

    const dataRetirada = parseDateInput(locacao.dataInicio);
    const dataFimReal = parseDateInput(parsed.data.dataFimReal);
    const valorSemanal = Number(locacao.valorDiaria);
    const valorTotal = calcularValorTotalSemanal(
      dataRetirada,
      dataFimReal,
      valorSemanal
    );

    await prisma.$transaction(async (tx) => {
      await encerrarParcelasAposDevolucao(tx, id, dataFimReal);

      await tx.locacao.update({
        where: { id },
        data: {
          status: "FINALIZADA",
          kmFim: parsed.data.kmFim,
          dataFimReal: parsed.data.dataFimReal,
          valorTotal,
        },
      });

      await tx.veiculo.update({
        where: { id: locacao.veiculoId },
        data: {
          status: "DISPONIVEL",
          kmAtual: parsed.data.kmFim,
        },
      });

      if (parsed.data.registrarFinanceiro) {
        const categoria = await getCategoriaLocacaoVeiculos(
          tenant.locadoraId,
          tx
        );
        await criarLancamentoFinanceiro(tx, {
          categoriaId: categoria.id,
          tipo: "ENTRADA",
          valor: valorTotal,
          descricao: `Locação ${locacao.veiculo.placa} — ${locacao.cliente.nome} (encerramento)`,
          data: parsed.data.dataFimReal,
          locacaoId: id,
        });
      }
    });

    revalidateLocacaoPaths(id, locacao.veiculoId);
    revalidatePath("/financeiro");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao finalizar locação"),
    };
  }
}

export async function cancelarLocacao(id: string): Promise<ActionResult> {
  try {
    const tenant = await assertLocacaoAccess();

    const locacao = await prisma.locacao.findFirst({
      where: { id, locadoraId: tenant.locadoraId },
    });
    if (!locacao) {
      return { success: false, error: "Locação não encontrada" };
    }

    if (!["RESERVADA", "ATIVA"].includes(locacao.status)) {
      return { success: false, error: "Locação não pode ser cancelada" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.parcelaLocacao.deleteMany({ where: { locacaoId: id } });
      await tx.locacao.update({
        where: { id },
        data: { status: "CANCELADA" },
      });

      if (locacao.status === "ATIVA") {
        await tx.veiculo.update({
          where: { id: locacao.veiculoId },
          data: { status: "DISPONIVEL" },
        });
      }
    });

    revalidateLocacaoPaths(id, locacao.veiculoId);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao cancelar locação"),
    };
  }
}

export async function createParcela(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const tenant = await assertLocacaoAccess();

    const parsed = parcelaSchema.safeParse({
      locacaoId: formData.get("locacaoId"),
      valor: formData.get("valor"),
      dataVencimento: formData.get("dataVencimento"),
      observacoes: formData.get("observacoes") || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }

    const locacao = await prisma.locacao.findFirst({
      where: { id: parsed.data.locacaoId, locadoraId: tenant.locadoraId },
      select: { id: true },
    });
    if (!locacao) {
      return { success: false, error: "Locação não encontrada" };
    }

    const dataVencimento = parseDateInput(parsed.data.dataVencimento);
    const parcela = await prisma.parcelaLocacao.create({
      data: {
        locacaoId: parsed.data.locacaoId,
        valor: parsed.data.valor,
        valorBase: parsed.data.valor,
        dataVencimento,
        dataVencimentoOriginal: dataVencimento,
        observacoes: parsed.data.observacoes,
      },
    });

    revalidateLocacaoPaths(parsed.data.locacaoId);
    return { success: true, data: { id: parcela.id } };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao criar parcela"),
    };
  }
}

export async function marcarParcelaPaga(id: string): Promise<ActionResult> {
  const { confirmarPagamentoParcela } = await import(
    "@/lib/actions/agenda-tarefas"
  );
  return confirmarPagamentoParcela(id, { registrarFinanceiro: false });
}
