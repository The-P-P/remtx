"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasPermission } from "@/lib/auth";
import { veiculoSchema, problemaCronicoSchema } from "@/lib/validations/veiculo";
import { parseFinanciamentoFromFormData } from "@/lib/validations/financiamento-veiculo";
import { criarFinanciamentoVeiculo } from "@/lib/actions/financiamento-veiculo";
import { atualizarFinanciamentoBasico } from "@/lib/actions/financiamento-veiculo";
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function assertVeiculoAccess() {
  const user = await requireAuth();
  if (!hasPermission(user.role, "veiculos")) {
    throw new Error("Sem permissão para gerenciar veículos");
  }
  return user;
}

export async function getVeiculos(status?: string) {
  return prisma.veiculo.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { placa: "asc" },
    include: {
      financiamento: {
        select: {
          ativo: true,
          saldoDevedor: true,
          totalParcelas: true,
          parcelas: {
            where: { dataPagamento: null },
            select: { id: true },
          },
        },
      },
      _count: {
        select: {
          problemasCronicos: { where: { ativo: true } },
          locacoes: true,
        },
      },
      locacoes: {
        where: { status: { in: ["ATIVA", "RESERVADA"] } },
        take: 1,
        select: { id: true, status: true },
      },
    },
  });
}

export async function getVeiculoById(id: string) {
  return prisma.veiculo.findUnique({
    where: { id },
    include: {
      manutencoes: {
        orderBy: { dataRealizada: "desc" },
        include: {
          tipoManutencao: { select: { nome: true, intervaloKm: true } },
          pecas: true,
        },
      },
      _count: { select: { manutencoes: true } },
      problemasCronicos: { orderBy: { dataRegistro: "desc" } },
      locacoes: {
        orderBy: { dataInicio: "desc" },
        take: 10,
        include: {
          cliente: { select: { id: true, nome: true } },
        },
      },
      financiamento: {
        include: {
          parcelas: { orderBy: { numero: "asc" } },
        },
      },
    },
  });
}

export async function createVeiculo(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    await assertVeiculoAccess();
    const parsed = veiculoSchema.safeParse({
      placa: formData.get("placa"),
      apelido: formData.get("apelido") || undefined,
      marca: formData.get("marca"),
      modelo: formData.get("modelo"),
      ano: formData.get("ano"),
      cor: formData.get("cor") || undefined,
      porte: formData.get("porte"),
      kmAtual: formData.get("kmAtual"),
      kmProximaRevisao: formData.get("kmProximaRevisao"),
      status: formData.get("status"),
      observacoes: formData.get("observacoes") || undefined,
      ipvaVencimento: formData.get("ipvaVencimento") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    const financiamentoInput = parseFinanciamentoFromFormData(formData);
    if (financiamentoInput.emFinanciamento && "error" in financiamentoInput) {
      return {
        success: false,
        error: financiamentoInput.error ?? "Dados de financiamento inválidos",
      };
    }

    const veiculo = await prisma.veiculo.create({ data: parsed.data });

    if (financiamentoInput.emFinanciamento && financiamentoInput.data) {
      await criarFinanciamentoVeiculo(veiculo.id, financiamentoInput.data);
    }

    revalidatePath("/veiculos");
    revalidatePath("/");
    return { success: true, data: { id: veiculo.id } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar veículo";
    if (msg.includes("Unique constraint")) {
      return { success: false, error: "Placa já cadastrada" };
    }
    return { success: false, error: msg };
  }
}

export async function updateVeiculo(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await assertVeiculoAccess();
    const parsed = veiculoSchema.safeParse({
      placa: formData.get("placa"),
      apelido: formData.get("apelido") || undefined,
      marca: formData.get("marca"),
      modelo: formData.get("modelo"),
      ano: formData.get("ano"),
      cor: formData.get("cor") || undefined,
      porte: formData.get("porte"),
      kmAtual: formData.get("kmAtual"),
      kmProximaRevisao: formData.get("kmProximaRevisao"),
      status: formData.get("status"),
      observacoes: formData.get("observacoes") || undefined,
      ipvaVencimento: formData.get("ipvaVencimento") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    const financiamentoInput = parseFinanciamentoFromFormData(formData);

    const existenteFin = await prisma.financiamentoVeiculo.findUnique({
      where: { veiculoId: id },
    });

    if (financiamentoInput.emFinanciamento && "error" in financiamentoInput) {
      return {
        success: false,
        error: financiamentoInput.error ?? "Dados de financiamento inválidos",
      };
    }

    await prisma.veiculo.update({ where: { id }, data: parsed.data });

    if (financiamentoInput.emFinanciamento && financiamentoInput.data) {
      if (existenteFin) {
        const finResult = await atualizarFinanciamentoBasico(
          existenteFin.id,
          id,
          formData
        );
        if (!finResult.success) return finResult;
      } else {
        await criarFinanciamentoVeiculo(id, financiamentoInput.data);
      }
    }

    revalidatePath("/locacoes");
    revalidatePath("/veiculos");
    revalidatePath(`/veiculos/${id}`);
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao atualizar veículo";
    return { success: false, error: msg };
  }
}

export async function deleteVeiculo(id: string): Promise<ActionResult> {
  try {
    await assertVeiculoAccess();

    const veiculo = await prisma.veiculo.findUnique({
      where: { id },
      select: { placa: true, status: true },
    });
    if (!veiculo) {
      return { success: false, error: "Veículo não encontrado" };
    }

    const locacaoAtiva = await prisma.locacao.findFirst({
      where: { veiculoId: id, status: { in: ["ATIVA", "RESERVADA"] } },
    });
    if (locacaoAtiva) {
      return {
        success: false,
        error: "Não é possível excluir: veículo com locação ativa ou reservada",
      };
    }

    const totalLocacoes = await prisma.locacao.count({
      where: { veiculoId: id },
    });

    if (totalLocacoes === 0) {
      await prisma.veiculo.delete({ where: { id } });
    } else {
      await prisma.veiculo.update({
        where: { id },
        data: { status: "INATIVO" },
      });
    }

    revalidatePath("/veiculos");
    revalidatePath(`/veiculos/${id}`);
    revalidatePath("/manutencoes");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao excluir veículo",
    };
  }
}

export async function getVeiculoDeleteInfo(id: string) {
  const [veiculo, locacaoAtiva, totalLocacoes] = await Promise.all([
    prisma.veiculo.findUnique({
      where: { id },
      select: { placa: true, marca: true, modelo: true, status: true },
    }),
    prisma.locacao.findFirst({
      where: { veiculoId: id, status: { in: ["ATIVA", "RESERVADA"] } },
      select: { id: true },
    }),
    prisma.locacao.count({ where: { veiculoId: id } }),
  ]);

  if (!veiculo) return null;

  return {
    veiculo,
    locacaoAtiva: !!locacaoAtiva,
    totalLocacoes,
    modoExclusao: totalLocacoes === 0 ? ("permanente" as const) : ("inativar" as const),
  };
}

export async function createProblemaCronico(
  formData: FormData
): Promise<ActionResult> {
  try {
    await assertVeiculoAccess();
    const parsed = problemaCronicoSchema.safeParse({
      veiculoId: formData.get("veiculoId"),
      descricao: formData.get("descricao"),
      gravidade: formData.get("gravidade"),
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }
    await prisma.problemaCronico.create({ data: parsed.data });
    revalidatePath(`/veiculos/${parsed.data.veiculoId}`);
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao registrar problema",
    };
  }
}

export async function toggleProblemaCronico(
  id: string,
  veiculoId: string,
  ativo: boolean
): Promise<ActionResult> {
  try {
    await assertVeiculoAccess();
    await prisma.problemaCronico.update({ where: { id }, data: { ativo } });
    revalidatePath(`/veiculos/${veiculoId}`);
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao atualizar problema",
    };
  }
}
