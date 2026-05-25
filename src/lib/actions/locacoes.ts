"use server";

import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  calcularValorTotalSemanal,
  encerrarParcelasAposDevolucao,
  sincronizarParcelasSemanais,
} from "@/lib/parcelas-semanais";
import { requireAuth, hasPermission } from "@/lib/auth";
import {
  locacaoCreateSchema,
  locacaoUpdateSchema,
  locacaoFinalizarSchema,
  parcelaSchema,
} from "@/lib/validations/locacao";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function assertLocacaoAccess() {
  const user = await requireAuth();
  if (!hasPermission(user.role, "locacoes")) {
    throw new Error("Sem permissão para gerenciar locações");
  }
  return user;
}

async function assertVeiculoDisponivelParaLocacao(
  veiculoId: string,
  statusDesejado: "RESERVADA" | "ATIVA",
  excludeLocacaoId?: string
) {
  const veiculo = await prisma.veiculo.findUnique({
    where: { id: veiculoId },
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
  revalidatePath("/locacoes/contratos");
  revalidatePath("/");
  revalidatePath("/veiculos");
  if (locacaoId) revalidatePath(`/locacoes/${locacaoId}`);
  if (veiculoId) revalidatePath(`/veiculos/${veiculoId}`);
}

export async function getLocacoes(status?: string, veiculoId?: string) {
  return prisma.locacao.findMany({
    where: {
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
  return prisma.locacao.findUnique({
    where: { id },
    include: {
      veiculo: true,
      cliente: true,
      parcelas: { orderBy: { dataVencimento: "asc" } },
    },
  });
}

export async function getVeiculosDisponiveisParaLocacao() {
  return prisma.veiculo.findMany({
    where: {
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
    await assertLocacaoAccess();

    const parsed = locacaoCreateSchema.safeParse({
      veiculoId: formData.get("veiculoId"),
      clienteId: formData.get("clienteId"),
      dataInicio: formData.get("dataInicio"),
      dataFimPrevista: formData.get("dataFimPrevista"),
      kmInicio: formData.get("kmInicio"),
      valorDiaria: formData.get("valorDiaria"),
      status: formData.get("status") || "RESERVADA",
      observacoes: formData.get("observacoes") || undefined,
      iniciarAgora: formData.get("iniciarAgora"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    const status =
      parsed.data.iniciarAgora || parsed.data.status === "ATIVA"
        ? "ATIVA"
        : "RESERVADA";

    const veiculo = await assertVeiculoDisponivelParaLocacao(
      parsed.data.veiculoId,
      status
    );

    if (parsed.data.kmInicio < veiculo.kmAtual && status === "ATIVA") {
      return {
        success: false,
        error: `Km de retirada não pode ser menor que o km atual (${veiculo.kmAtual})`,
      };
    }

    const locacao = await prisma.$transaction(async (tx) => {
      const created = await tx.locacao.create({
        data: {
          veiculoId: parsed.data.veiculoId,
          clienteId: parsed.data.clienteId,
          dataInicio: parsed.data.dataInicio,
          dataFimPrevista: parsed.data.dataFimPrevista,
          kmInicio: parsed.data.kmInicio,
          valorDiaria: parsed.data.valorDiaria,
          status,
          observacoes: parsed.data.observacoes,
        },
      });

      if (status === "ATIVA") {
        const dataRetirada = startOfDay(parsed.data.dataInicio);
        await tx.veiculo.update({
          where: { id: parsed.data.veiculoId },
          data: { status: "ALUGADO", kmAtual: parsed.data.kmInicio },
        });
        await sincronizarParcelasSemanais(
          tx,
          created.id,
          dataRetirada,
          parsed.data.dataFimPrevista,
          parsed.data.valorDiaria
        );
      }

      return created;
    });

    revalidateLocacaoPaths(locacao.id, locacao.veiculoId);
    return { success: true, data: { id: locacao.id } };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao criar locação",
    };
  }
}

export async function updateLocacao(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await assertLocacaoAccess();

    const locacao = await prisma.locacao.findUnique({ where: { id } });
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
      dataFimPrevista: formData.get("dataFimPrevista"),
      valorDiaria: formData.get("valorDiaria"),
      observacoes: formData.get("observacoes") || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    if (parsed.data.dataFimPrevista < locacao.dataInicio) {
      return {
        success: false,
        error: "Data de devolução deve ser posterior ao início",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.locacao.update({
        where: { id },
        data: parsed.data,
      });

      if (locacao.status === "ATIVA") {
        await sincronizarParcelasSemanais(
          tx,
          id,
          startOfDay(locacao.dataInicio),
          parsed.data.dataFimPrevista,
          parsed.data.valorDiaria
        );
      }
    });

    revalidateLocacaoPaths(id, locacao.veiculoId);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao atualizar locação",
    };
  }
}

export async function ativarLocacao(id: string): Promise<ActionResult> {
  try {
    await assertLocacaoAccess();

    const locacao = await prisma.locacao.findUnique({
      where: { id },
      include: { veiculo: { select: { kmAtual: true, placa: true } } },
    });

    if (!locacao) {
      return { success: false, error: "Locação não encontrada" };
    }

    if (locacao.status !== "RESERVADA") {
      return { success: false, error: "Somente reservas podem ser ativadas" };
    }

    await assertVeiculoDisponivelParaLocacao(locacao.veiculoId, "ATIVA", id);

    const kmInicio = Math.max(locacao.kmInicio, locacao.veiculo.kmAtual);
    const dataRetirada = startOfDay(new Date());

    await prisma.$transaction(async (tx) => {
      await tx.locacao.update({
        where: { id },
        data: { status: "ATIVA", kmInicio, dataInicio: dataRetirada },
      });
      await tx.veiculo.update({
        where: { id: locacao.veiculoId },
        data: { status: "ALUGADO", kmAtual: kmInicio },
      });
      await sincronizarParcelasSemanais(
        tx,
        id,
        dataRetirada,
        locacao.dataFimPrevista,
        Number(locacao.valorDiaria)
      );
    });

    revalidateLocacaoPaths(id, locacao.veiculoId);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao ativar locação",
    };
  }
}

export async function finalizarLocacao(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await assertLocacaoAccess();

    const locacao = await prisma.locacao.findUnique({
      where: { id },
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

    const dataRetirada = startOfDay(locacao.dataInicio);
    const dataFimReal = startOfDay(parsed.data.dataFimReal);
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
        const categoria = await tx.categoriaFinanceira.findFirst({
          where: { nome: "Locação de veículos" },
        });
        if (categoria) {
          await tx.transacaoFinanceira.create({
            data: {
              categoriaId: categoria.id,
              tipo: "ENTRADA",
              valor: valorTotal,
              descricao: `Locação ${locacao.veiculo.placa} — ${locacao.cliente.nome}`,
              data: parsed.data.dataFimReal,
            },
          });
        }
      }
    });

    revalidateLocacaoPaths(id, locacao.veiculoId);
    revalidatePath("/financeiro");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao finalizar locação",
    };
  }
}

export async function cancelarLocacao(id: string): Promise<ActionResult> {
  try {
    await assertLocacaoAccess();

    const locacao = await prisma.locacao.findUnique({ where: { id } });
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
      error: e instanceof Error ? e.message : "Erro ao cancelar locação",
    };
  }
}

export async function createParcela(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    await assertLocacaoAccess();

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
      };
    }

    const parcela = await prisma.parcelaLocacao.create({
      data: {
        locacaoId: parsed.data.locacaoId,
        valor: parsed.data.valor,
        dataVencimento: parsed.data.dataVencimento,
        observacoes: parsed.data.observacoes,
      },
    });

    revalidateLocacaoPaths(parsed.data.locacaoId);
    return { success: true, data: { id: parcela.id } };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao criar parcela",
    };
  }
}

export async function marcarParcelaPaga(id: string): Promise<ActionResult> {
  const { confirmarPagamentoParcela } = await import(
    "@/lib/actions/agenda-tarefas"
  );
  const fd = new FormData();
  fd.set("registrarFinanceiro", "false");
  return confirmarPagamentoParcela(id, fd);
}
