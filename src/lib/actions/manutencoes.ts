"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasPermission } from "@/lib/auth";
import {
  manutencaoSchema,
  tipoManutencaoSchema,
} from "@/lib/validations/manutencao";
import { calcularAlertaKm } from "@/lib/manutencao-alerts";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function assertManutencaoAccess() {
  const user = await requireAuth();
  if (!hasPermission(user.role, "manutencoes")) {
    throw new Error("Sem permissão para gerenciar manutenções");
  }
  return user;
}

export async function getManutencoes() {
  return prisma.manutencao.findMany({
    orderBy: { dataRealizada: "desc" },
    include: {
      veiculo: { select: { placa: true, marca: true, modelo: true } },
      tipoManutencao: { select: { nome: true } },
      pecas: true,
    },
  });
}

export async function getTiposManutencao() {
  return prisma.tipoManutencao.findMany({
    where: { ativo: true },
    include: { pecasPadrao: true },
    orderBy: { nome: "asc" },
  });
}

export async function getTipoManutencaoById(id: string) {
  return prisma.tipoManutencao.findUnique({
    where: { id },
    include: { pecasPadrao: true },
  });
}

export async function createManutencao(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    await assertManutencaoAccess();

    const pecasExtrasRaw = formData.get("pecasExtras");
    let pecasExtras: { nome: string; quantidade: number; valorUnitario?: number }[] = [];
    if (pecasExtrasRaw && typeof pecasExtrasRaw === "string") {
      try {
        pecasExtras = JSON.parse(pecasExtrasRaw);
      } catch {
        pecasExtras = [];
      }
    }

    const parsed = manutencaoSchema.safeParse({
      veiculoId: formData.get("veiculoId"),
      tipoManutencaoId: formData.get("tipoManutencaoId"),
      dataRealizada: formData.get("dataRealizada"),
      kmRealizada: formData.get("kmRealizada"),
      custo: formData.get("custo") || undefined,
      observacoes: formData.get("observacoes") || undefined,
      pecasExtras,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    const tipo = await prisma.tipoManutencao.findUnique({
      where: { id: parsed.data.tipoManutencaoId },
      include: { pecasPadrao: true },
    });
    if (!tipo) {
      return { success: false, error: "Tipo de manutenção não encontrado" };
    }

    const kmProxima = parsed.data.kmRealizada + tipo.intervaloKm;
    const alerta = calcularAlertaKm(parsed.data.kmRealizada, kmProxima);

    const pecasCreate = [
      ...tipo.pecasPadrao.map((p) => ({
        nome: p.nome,
        quantidade: p.quantidade,
      })),
      ...parsed.data.pecasExtras.map((p) => ({
        nome: p.nome,
        quantidade: p.quantidade,
        valorUnitario: p.valorUnitario,
      })),
    ];

    const manutencao = await prisma.$transaction(async (tx) => {
      const m = await tx.manutencao.create({
        data: {
          veiculoId: parsed.data.veiculoId,
          tipoManutencaoId: parsed.data.tipoManutencaoId,
          dataRealizada: parsed.data.dataRealizada,
          kmRealizada: parsed.data.kmRealizada,
          kmProxima,
          custo: parsed.data.custo,
          alerta,
          observacoes: parsed.data.observacoes,
          pecas: { create: pecasCreate },
        },
      });

      const veiculo = await tx.veiculo.findUnique({
        where: { id: parsed.data.veiculoId },
      });
      await tx.veiculo.update({
        where: { id: parsed.data.veiculoId },
        data: {
          kmAtual: parsed.data.kmRealizada,
          kmProximaRevisao: kmProxima,
          ...(veiculo?.status === "EM_MANUTENCAO"
            ? { status: "DISPONIVEL" as const }
            : {}),
        },
      });

      return m;
    });

    revalidatePath("/manutencoes");
    revalidatePath("/veiculos");
    revalidatePath(`/veiculos/${parsed.data.veiculoId}`);
    revalidatePath("/");
    return { success: true, data: { id: manutencao.id } };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao registrar manutenção",
    };
  }
}

export async function createTipoManutencao(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    await assertManutencaoAccess();

    const pecasRaw = formData.get("pecas");
    let pecas: { nome: string; quantidade: number }[] = [];
    if (pecasRaw && typeof pecasRaw === "string") {
      try {
        pecas = JSON.parse(pecasRaw);
      } catch {
        pecas = [];
      }
    }

    const parsed = tipoManutencaoSchema.safeParse({
      nome: formData.get("nome"),
      descricao: formData.get("descricao") || undefined,
      intervaloKm: formData.get("intervaloKm"),
      pecas,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    const tipo = await prisma.tipoManutencao.create({
      data: {
        nome: parsed.data.nome,
        descricao: parsed.data.descricao,
        intervaloKm: parsed.data.intervaloKm,
        pecasPadrao: {
          create: parsed.data.pecas.map((p) => ({
            nome: p.nome,
            quantidade: p.quantidade,
          })),
        },
      },
    });

    revalidatePath("/manutencoes");
    return { success: true, data: { id: tipo.id } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar tipo";
    if (msg.includes("Unique constraint")) {
      return { success: false, error: "Tipo já existe com este nome" };
    }
    return { success: false, error: msg };
  }
}

export async function getVeiculosParaSelect() {
  return prisma.veiculo.findMany({
    where: { status: { not: "INATIVO" } },
    select: { id: true, placa: true, marca: true, modelo: true, kmAtual: true },
    orderBy: { placa: "asc" },
  });
}
