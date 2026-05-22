"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasPermission } from "@/lib/auth";
import { veiculoSchema, problemaCronicoSchema } from "@/lib/validations/veiculo";
import { calcularAlertaKm } from "@/lib/manutencao-alerts";

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
      _count: { select: { problemasCronicos: { where: { ativo: true } } } },
    },
  });
}

export async function getVeiculoById(id: string) {
  return prisma.veiculo.findUnique({
    where: { id },
    include: {
      manutencoes: {
        orderBy: { dataRealizada: "desc" },
        take: 10,
        include: {
          tipoManutencao: { select: { nome: true } },
          pecas: true,
        },
      },
      problemasCronicos: { orderBy: { dataRegistro: "desc" } },
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
      marca: formData.get("marca"),
      modelo: formData.get("modelo"),
      ano: formData.get("ano"),
      cor: formData.get("cor") || undefined,
      kmAtual: formData.get("kmAtual"),
      kmProximaRevisao: formData.get("kmProximaRevisao"),
      status: formData.get("status"),
      observacoes: formData.get("observacoes") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    const veiculo = await prisma.veiculo.create({ data: parsed.data });
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
      marca: formData.get("marca"),
      modelo: formData.get("modelo"),
      ano: formData.get("ano"),
      cor: formData.get("cor") || undefined,
      kmAtual: formData.get("kmAtual"),
      kmProximaRevisao: formData.get("kmProximaRevisao"),
      status: formData.get("status"),
      observacoes: formData.get("observacoes") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    await prisma.veiculo.update({ where: { id }, data: parsed.data });
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
    const locacaoAtiva = await prisma.locacao.findFirst({
      where: { veiculoId: id, status: { in: ["ATIVA", "RESERVADA"] } },
    });
    if (locacaoAtiva) {
      return { success: false, error: "Veículo possui locação ativa ou reservada" };
    }
    await prisma.veiculo.update({
      where: { id },
      data: { status: "INATIVO" },
    });
    revalidatePath("/veiculos");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao inativar veículo",
    };
  }
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
