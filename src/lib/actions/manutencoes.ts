"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasPermission } from "@/lib/auth";
import {
  manutencaoSchema,
  manutencaoUpdateSchema,
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

export async function getManutencaoById(id: string) {
  return prisma.manutencao.findUnique({
    where: { id },
    include: {
      veiculo: { select: { placa: true, marca: true, modelo: true } },
      tipoManutencao: { select: { nome: true, intervaloKm: true } },
      pecas: { orderBy: { nome: "asc" } },
    },
  });
}

function parsePecasForm(formData: FormData) {
  const raw = formData.get("pecas");
  if (!raw || typeof raw !== "string") return [];
  try {
    return JSON.parse(raw) as {
      nome: string;
      quantidade: number;
      valorUnitario?: number;
    }[];
  } catch {
    return [];
  }
}

async function syncVeiculoKmFromUltimaManutencao(
  veiculoId: string,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
) {
  const ultima = await tx.manutencao.findFirst({
    where: { veiculoId },
    orderBy: [{ dataRealizada: "desc" }, { kmRealizada: "desc" }],
  });
  if (!ultima) return;

  const veiculo = await tx.veiculo.findUnique({
    where: { id: veiculoId },
    select: { status: true },
  });
  await tx.veiculo.update({
    where: { id: veiculoId },
    data: {
      kmAtual: ultima.kmRealizada,
      kmProximaRevisao: ultima.kmProxima,
      ...(veiculo?.status === "EM_MANUTENCAO"
        ? { status: "DISPONIVEL" as const }
        : {}),
    },
  });
}

export async function getTiposManutencao(options?: {
  apenasAtivos?: boolean;
  incluirId?: string;
}) {
  const where = options?.apenasAtivos
    ? {
        OR: [
          { ativo: true },
          ...(options.incluirId ? [{ id: options.incluirId }] : []),
        ],
      }
    : undefined;

  return prisma.tipoManutencao.findMany({
    where,
    include: {
      pecasPadrao: true,
      _count: { select: { manutencoes: true } },
    },
    orderBy: { nome: "asc" },
  });
}

export async function getTipoManutencaoById(id: string) {
  return prisma.tipoManutencao.findUnique({
    where: { id },
    include: {
      pecasPadrao: true,
      _count: { select: { manutencoes: true } },
    },
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

export async function updateManutencao(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await assertManutencaoAccess();

    const existente = await prisma.manutencao.findUnique({ where: { id } });
    if (!existente) {
      return { success: false, error: "Manutenção não encontrada" };
    }

    const pecas = parsePecasForm(formData);
    const parsed = manutencaoUpdateSchema.safeParse({
      veiculoId: formData.get("veiculoId"),
      tipoManutencaoId: formData.get("tipoManutencaoId"),
      dataRealizada: formData.get("dataRealizada"),
      kmRealizada: formData.get("kmRealizada"),
      kmProxima: formData.get("kmProxima") || undefined,
      custo: formData.get("custo") || undefined,
      observacoes: formData.get("observacoes") || undefined,
      pecas,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    const tipo = await prisma.tipoManutencao.findUnique({
      where: { id: parsed.data.tipoManutencaoId },
    });
    if (!tipo) {
      return { success: false, error: "Tipo de manutenção não encontrado" };
    }

    const kmProxima =
      parsed.data.kmProxima ??
      parsed.data.kmRealizada + tipo.intervaloKm;
    const alerta = calcularAlertaKm(parsed.data.kmRealizada, kmProxima);
    const veiculoAnteriorId = existente.veiculoId;

    await prisma.$transaction(async (tx) => {
      await tx.pecaManutencao.deleteMany({ where: { manutencaoId: id } });

      await tx.manutencao.update({
        where: { id },
        data: {
          veiculoId: parsed.data.veiculoId,
          tipoManutencaoId: parsed.data.tipoManutencaoId,
          dataRealizada: parsed.data.dataRealizada,
          kmRealizada: parsed.data.kmRealizada,
          kmProxima,
          custo: parsed.data.custo ?? null,
          alerta,
          observacoes: parsed.data.observacoes ?? null,
          pecas: {
            create: parsed.data.pecas.map((p) => ({
              nome: p.nome,
              quantidade: p.quantidade,
              valorUnitario: p.valorUnitario ?? null,
            })),
          },
        },
      });

      await syncVeiculoKmFromUltimaManutencao(parsed.data.veiculoId, tx);
      if (veiculoAnteriorId !== parsed.data.veiculoId) {
        await syncVeiculoKmFromUltimaManutencao(veiculoAnteriorId, tx);
      }
    });

    revalidatePath("/manutencoes");
    revalidatePath(`/manutencoes/${id}/editar`);
    revalidatePath("/veiculos");
    revalidatePath(`/veiculos/${parsed.data.veiculoId}`);
    if (veiculoAnteriorId !== parsed.data.veiculoId) {
      revalidatePath(`/veiculos/${veiculoAnteriorId}`);
    }
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao atualizar manutenção",
    };
  }
}

export async function deleteManutencao(id: string): Promise<ActionResult> {
  try {
    await assertManutencaoAccess();

    const existente = await prisma.manutencao.findUnique({ where: { id } });
    if (!existente) {
      return { success: false, error: "Manutenção não encontrada" };
    }

    const veiculoId = existente.veiculoId;

    await prisma.$transaction(async (tx) => {
      await tx.manutencao.delete({ where: { id } });
      await syncVeiculoKmFromUltimaManutencao(veiculoId, tx);
    });

    revalidatePath("/manutencoes");
    revalidatePath("/veiculos");
    revalidatePath(`/veiculos/${veiculoId}`);
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao excluir manutenção",
    };
  }
}

export async function createTipoManutencao(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    await assertManutencaoAccess();

    const parsed = tipoManutencaoSchema.safeParse({
      nome: formData.get("nome"),
      descricao: formData.get("descricao") || undefined,
      intervaloKm: formData.get("intervaloKm"),
      pecas: parsePecasTipoForm(formData),
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

function parsePecasTipoForm(formData: FormData) {
  const pecasRaw = formData.get("pecas");
  let pecas: { nome: string; quantidade: number }[] = [];
  if (pecasRaw && typeof pecasRaw === "string") {
    try {
      pecas = JSON.parse(pecasRaw);
    } catch {
      pecas = [];
    }
  }
  return pecas;
}

export async function updateTipoManutencao(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await assertManutencaoAccess();

    const existente = await prisma.tipoManutencao.findUnique({ where: { id } });
    if (!existente) {
      return { success: false, error: "Tipo de manutenção não encontrado" };
    }

    const parsed = tipoManutencaoSchema.safeParse({
      nome: formData.get("nome"),
      descricao: formData.get("descricao") || undefined,
      intervaloKm: formData.get("intervaloKm"),
      pecas: parsePecasTipoForm(formData),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.pecaPadraoTipo.deleteMany({ where: { tipoManutencaoId: id } });
      await tx.tipoManutencao.update({
        where: { id },
        data: {
          nome: parsed.data.nome,
          descricao: parsed.data.descricao ?? null,
          intervaloKm: parsed.data.intervaloKm,
          pecasPadrao: {
            create: parsed.data.pecas.map((p) => ({
              nome: p.nome,
              quantidade: p.quantidade,
            })),
          },
        },
      });
    });

    revalidatePath("/manutencoes");
    revalidatePath(`/manutencoes/tipos/${id}/editar`);
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao atualizar tipo";
    if (msg.includes("Unique constraint")) {
      return { success: false, error: "Já existe outro tipo com este nome" };
    }
    return { success: false, error: msg };
  }
}

export async function deleteTipoManutencao(id: string): Promise<ActionResult> {
  try {
    await assertManutencaoAccess();

    const tipo = await prisma.tipoManutencao.findUnique({
      where: { id },
      select: { nome: true },
    });
    if (!tipo) {
      return { success: false, error: "Tipo de manutenção não encontrado" };
    }

    const totalManutencoes = await prisma.manutencao.count({
      where: { tipoManutencaoId: id },
    });

    if (totalManutencoes === 0) {
      await prisma.tipoManutencao.delete({ where: { id } });
    } else {
      await prisma.tipoManutencao.update({
        where: { id },
        data: { ativo: false },
      });
    }

    revalidatePath("/manutencoes");
    revalidatePath(`/manutencoes/tipos/${id}/editar`);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao excluir tipo",
    };
  }
}

export async function getVeiculosParaSelect() {
  return prisma.veiculo.findMany({
    where: { status: { not: "INATIVO" } },
    select: { id: true, placa: true, marca: true, modelo: true, kmAtual: true },
    orderBy: { placa: "asc" },
  });
}
