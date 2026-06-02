"use server";

import { friendlyErrorMessage } from "@/lib/errors/friendly-message";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/auth";
import { requireTenant } from "@/lib/tenant";
import {
  manutencaoSchema,
  manutencaoUpdateSchema,
  tipoManutencaoSchema,
} from "@/lib/validations/manutencao";
import { calcularAlertaKm } from "@/lib/manutencao-alerts";
import { getCategoriaManutencaoFrota } from "@/lib/financeiro-categorias";
import { sincronizarLancamentoManutencao } from "@/lib/financeiro-lancamento";
import type { FormaPagamento } from "@/types/prisma";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function assertManutencaoAccess() {
  const tenant = await requireTenant();
  if (!hasPermission(tenant.role, "manutencoes")) {
    throw new Error("Sem permissão para gerenciar manutenções");
  }
  return tenant;
}

export async function getManutencoes(veiculoId?: string) {
  const { locadoraId } = await requireTenant();
  return prisma.manutencao.findMany({
    where: {
      veiculo: { locadoraId },
      ...(veiculoId ? { veiculoId } : {}),
    },
    orderBy: { dataRealizada: "desc" },
    include: {
      veiculo: {
        select: { id: true, placa: true, marca: true, modelo: true },
      },
      tipoManutencao: { select: { nome: true, intervaloKm: true } },
      pecas: true,
    },
  });
}

export async function getVeiculoParaFiltroManutencoes(id: string) {
  const { locadoraId } = await requireTenant();
  return prisma.veiculo.findFirst({
    where: { id, locadoraId },
    select: { id: true, placa: true, marca: true, modelo: true },
  });
}

export async function getManutencaoById(id: string) {
  const { locadoraId } = await requireTenant();
  return prisma.manutencao.findFirst({
    where: { id, veiculo: { locadoraId } },
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

async function validarKmManutencao(
  veiculoId: string,
  locadoraId: string,
  kmRealizada: number,
  manutencaoIdExcluir?: string,
  kmAnteriorRegistro?: number
) {
  const veiculo = await prisma.veiculo.findFirst({
    where: { id: veiculoId, locadoraId },
    select: { kmAtual: true, placa: true, status: true },
  });
  if (!veiculo) {
    return { ok: false as const, error: "Veículo não encontrado" };
  }
  if (kmRealizada < veiculo.kmAtual) {
    const ultima = await prisma.manutencao.findFirst({
      where: { veiculoId },
      orderBy: [{ dataRealizada: "desc" }, { kmRealizada: "desc" }],
      select: { id: true },
    });
    const editandoUltima =
      manutencaoIdExcluir && ultima?.id === manutencaoIdExcluir;
    const apenasCorrigindoRegistro =
      kmAnteriorRegistro !== undefined && kmRealizada >= kmAnteriorRegistro;

    if (!editandoUltima && !apenasCorrigindoRegistro) {
      return {
        ok: false as const,
        error: `Km informado (${kmRealizada.toLocaleString("pt-BR")}) não pode ser menor que o km atual do veículo (${veiculo.kmAtual.toLocaleString("pt-BR")} km).`,
      };
    }
  }

  const duplicada = await prisma.manutencao.findFirst({
    where: {
      veiculoId,
      kmRealizada,
      ...(manutencaoIdExcluir ? { id: { not: manutencaoIdExcluir } } : {}),
    },
    select: { id: true },
  });
  if (duplicada) {
    return {
      ok: false as const,
      error: "Já existe manutenção registrada com este km para este veículo.",
    };
  }

  return { ok: true as const, veiculo };
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
  const { locadoraId } = await requireTenant();
  const where = options?.apenasAtivos
    ? {
        locadoraId,
        OR: [
          { ativo: true },
          ...(options.incluirId ? [{ id: options.incluirId }] : []),
        ],
      }
    : { locadoraId };

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
  const { locadoraId } = await requireTenant();
  return prisma.tipoManutencao.findFirst({
    where: { id, locadoraId },
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
    const tenant = await assertManutencaoAccess();

    const pecasForm = parsePecasForm(formData);
    const colocarEmManutencao = formData.get("colocarEmManutencao") === "on";
    const registrarFinanceiro =
      formData.get("registrarFinanceiro") === "on" ||
      formData.get("registrarFinanceiro") === "true";
    const formaRaw = formData.get("formaPagamento");
    const formaPagamento =
      typeof formaRaw === "string" && formaRaw.length > 0
        ? (formaRaw as FormaPagamento)
        : null;

    const parsed = manutencaoSchema.safeParse({
      veiculoId: formData.get("veiculoId"),
      tipoManutencaoId: formData.get("tipoManutencaoId"),
      dataRealizada: formData.get("dataRealizada"),
      kmRealizada: formData.get("kmRealizada"),
      custo: formData.get("custo") || undefined,
      observacoes: formData.get("observacoes") || undefined,
      pecasExtras: pecasForm,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    const kmCheck = await validarKmManutencao(
      parsed.data.veiculoId,
      tenant.locadoraId,
      parsed.data.kmRealizada
    );
    if (!kmCheck.ok) {
      return { success: false, error: kmCheck.error };
    }

    const tipo = await prisma.tipoManutencao.findFirst({
      where: { id: parsed.data.tipoManutencaoId, locadoraId: tenant.locadoraId },
      include: { pecasPadrao: true },
    });
    if (!tipo) {
      return { success: false, error: "Tipo de manutenção não encontrado" };
    }

    const kmProxima = parsed.data.kmRealizada + tipo.intervaloKm;
    const alerta = calcularAlertaKm(parsed.data.kmRealizada, kmProxima);

    const pecasCreate =
      pecasForm.length > 0
        ? pecasForm.map((p) => ({
            nome: p.nome,
            quantidade: p.quantidade,
            valorUnitario: p.valorUnitario,
          }))
        : tipo.pecasPadrao.map((p) => ({
            nome: p.nome,
            quantidade: p.quantidade,
          }));

    const custoValor = parsed.data.custo ? Number(parsed.data.custo) : 0;

    const manutencao = await prisma.$transaction(async (tx) => {
      const veiculo = await tx.veiculo.findUnique({
        where: { id: parsed.data.veiculoId },
        select: { status: true, placa: true },
      });

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

      let novoStatus = veiculo?.status;
      if (colocarEmManutencao && veiculo?.status !== "ALUGADO") {
        novoStatus = "EM_MANUTENCAO";
      } else if (veiculo?.status === "EM_MANUTENCAO") {
        novoStatus = "DISPONIVEL";
      }

      await tx.veiculo.update({
        where: { id: parsed.data.veiculoId },
        data: {
          kmAtual: parsed.data.kmRealizada,
          kmProximaRevisao: kmProxima,
          ...(novoStatus ? { status: novoStatus } : {}),
        },
      });

      if (registrarFinanceiro && custoValor > 0) {
        const categoria = await getCategoriaManutencaoFrota(
          tenant.locadoraId,
          tx
        );
        await sincronizarLancamentoManutencao(tx, m.id, {
          categoriaId: categoria.id,
          tipo: "SAIDA",
          valor: custoValor,
          descricao: `Manutenção ${veiculo?.placa ?? ""} — ${tipo.nome}`.trim(),
          data: parsed.data.dataRealizada,
          formaPagamento,
        });
      }

      return m;
    });

    revalidatePath("/manutencoes");
    revalidatePath("/financeiro");
    revalidatePath("/locacoes");
    revalidatePath("/veiculos");
    revalidatePath(`/veiculos/${parsed.data.veiculoId}`);
    revalidatePath("/");
    return { success: true, data: { id: manutencao.id } };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao registrar manutenção"),
    };
  }
}

export async function updateManutencao(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const tenant = await assertManutencaoAccess();

    const existente = await prisma.manutencao.findFirst({
      where: { id, veiculo: { locadoraId: tenant.locadoraId } },
    });
    if (!existente) {
      return { success: false, error: "Manutenção não encontrada" };
    }

    const pecas = parsePecasForm(formData);
    const registrarFinanceiro =
      formData.get("registrarFinanceiro") === "on" ||
      formData.get("registrarFinanceiro") === "true";
    const formaRaw = formData.get("formaPagamento");
    const formaPagamento =
      typeof formaRaw === "string" && formaRaw.length > 0
        ? (formaRaw as FormaPagamento)
        : null;

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

    const kmCheck = await validarKmManutencao(
      parsed.data.veiculoId,
      tenant.locadoraId,
      parsed.data.kmRealizada,
      id,
      existente.kmRealizada
    );
    if (!kmCheck.ok) {
      return { success: false, error: kmCheck.error };
    }

    const tipo = await prisma.tipoManutencao.findFirst({
      where: { id: parsed.data.tipoManutencaoId, locadoraId: tenant.locadoraId },
    });
    if (!tipo) {
      return { success: false, error: "Tipo de manutenção não encontrado" };
    }

    const kmProxima =
      parsed.data.kmProxima ??
      parsed.data.kmRealizada + tipo.intervaloKm;
    const alerta = calcularAlertaKm(parsed.data.kmRealizada, kmProxima);
    const veiculoAnteriorId = existente.veiculoId;
    const custoValor = parsed.data.custo ? Number(parsed.data.custo) : 0;

    await prisma.$transaction(async (tx) => {
      const veiculo = await tx.veiculo.findUnique({
        where: { id: parsed.data.veiculoId },
        select: { placa: true },
      });

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

      if (registrarFinanceiro && custoValor > 0) {
        const categoria = await getCategoriaManutencaoFrota(
          tenant.locadoraId,
          tx
        );
        await sincronizarLancamentoManutencao(tx, id, {
          categoriaId: categoria.id,
          tipo: "SAIDA",
          valor: custoValor,
          descricao: `Manutenção ${veiculo?.placa ?? ""} — ${tipo.nome}`.trim(),
          data: parsed.data.dataRealizada,
          formaPagamento,
        });
      }
    });

    revalidatePath("/manutencoes");
    revalidatePath("/financeiro");
    revalidatePath("/locacoes");
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
      error: friendlyErrorMessage(e, "Erro ao atualizar manutenção"),
    };
  }
}

export async function deleteManutencao(id: string): Promise<ActionResult> {
  try {
    const tenant = await assertManutencaoAccess();

    const existente = await prisma.manutencao.findFirst({
      where: { id, veiculo: { locadoraId: tenant.locadoraId } },
    });
    if (!existente) {
      return { success: false, error: "Manutenção não encontrada" };
    }

    const veiculoId = existente.veiculoId;

    await prisma.$transaction(async (tx) => {
      await tx.manutencao.delete({ where: { id } });
      await syncVeiculoKmFromUltimaManutencao(veiculoId, tx);
    });

    revalidatePath("/manutencoes");
    revalidatePath("/locacoes");
    revalidatePath("/veiculos");
    revalidatePath(`/veiculos/${veiculoId}`);
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao excluir manutenção"),
    };
  }
}

export async function createTipoManutencao(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const tenant = await assertManutencaoAccess();

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
        locadoraId: tenant.locadoraId,
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
    const msg = friendlyErrorMessage(e, "Erro ao criar tipo");
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
    const tenant = await assertManutencaoAccess();

    const existente = await prisma.tipoManutencao.findFirst({
      where: { id, locadoraId: tenant.locadoraId },
    });
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
    const msg = friendlyErrorMessage(e, "Erro ao atualizar tipo");
    if (msg.includes("Unique constraint")) {
      return { success: false, error: "Já existe outro tipo com este nome" };
    }
    return { success: false, error: msg };
  }
}

export async function deleteTipoManutencao(id: string): Promise<ActionResult> {
  try {
    const tenant = await assertManutencaoAccess();

    const tipo = await prisma.tipoManutencao.findFirst({
      where: { id, locadoraId: tenant.locadoraId },
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
      error: friendlyErrorMessage(e, "Erro ao excluir tipo"),
    };
  }
}

export async function getVeiculosParaSelect() {
  const { locadoraId } = await requireTenant();
  return prisma.veiculo.findMany({
    where: { locadoraId, status: { not: "INATIVO" } },
    select: { id: true, placa: true, marca: true, modelo: true, kmAtual: true },
    orderBy: { placa: "asc" },
  });
}
