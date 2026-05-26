"use server";

import { revalidatePath } from "next/cache";
import { startOfDay, startOfYear, endOfYear } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasPermission } from "@/lib/auth";
import { ensureCategoriasFinanceirasPadrao } from "@/lib/financeiro-categorias";
import { parsePeriodoFinanceiro } from "@/lib/financeiro-periodo";
import {
  categoriaSchema,
  transacaoSchema,
} from "@/lib/validations/financeiro";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function assertFinanceiroAccess() {
  const user = await requireAuth();
  if (!hasPermission(user.role, "financeiro")) {
    throw new Error("Sem permissão para o financeiro");
  }
  return user;
}

function revalidateFinanceiro() {
  revalidatePath("/financeiro");
  revalidatePath("/financeiro/fluxo");
  revalidatePath("/financeiro/categorias");
  revalidatePath("/");
}

export async function getCategoriasFinanceiras(apenasAtivas = false) {
  await ensureCategoriasFinanceirasPadrao();
  return prisma.categoriaFinanceira.findMany({
    where: apenasAtivas ? { ativo: true } : undefined,
    orderBy: [{ tipo: "asc" }, { nome: "asc" }],
    include: { _count: { select: { transacoes: true } } },
  });
}

export async function getCategoriaById(id: string) {
  return prisma.categoriaFinanceira.findUnique({
    where: { id },
    include: { _count: { select: { transacoes: true } } },
  });
}

export async function getTransacaoById(id: string) {
  return prisma.transacaoFinanceira.findUnique({
    where: { id },
    include: { categoria: true },
  });
}

export async function getTransacoes(params: {
  ano?: string;
  mes?: string;
  tipo?: string;
  categoriaId?: string;
}) {
  await ensureCategoriasFinanceirasPadrao();
  const { inicio, fim } = parsePeriodoFinanceiro(params);

  const tipo =
    params.tipo === "ENTRADA" || params.tipo === "SAIDA"
      ? params.tipo
      : undefined;

  return prisma.transacaoFinanceira.findMany({
    where: {
      data: { gte: inicio, lte: fim },
      ...(tipo ? { tipo } : {}),
      ...(params.categoriaId ? { categoriaId: params.categoriaId } : {}),
    },
    orderBy: [{ data: "desc" }, { createdAt: "desc" }],
    include: { categoria: { select: { id: true, nome: true, tipo: true } } },
  });
}

export async function getResumoFinanceiro(params: {
  ano?: string;
  mes?: string;
}) {
  const { inicio, fim, ano, mes } = parsePeriodoFinanceiro(params);
  const transacoes = await prisma.transacaoFinanceira.findMany({
    where: { data: { gte: inicio, lte: fim } },
    select: { tipo: true, valor: true },
  });

  let entradas = 0;
  let saidas = 0;
  for (const t of transacoes) {
    const v = Number(t.valor);
    if (t.tipo === "ENTRADA") entradas += v;
    else saidas += v;
  }

  return {
    ano,
    mes,
    inicio,
    fim,
    entradas: Math.round(entradas * 100) / 100,
    saidas: Math.round(saidas * 100) / 100,
    saldo: Math.round((entradas - saidas) * 100) / 100,
    quantidade: transacoes.length,
  };
}

export type FluxoMensalItem = {
  mes: number;
  entradas: number;
  saidas: number;
  saldo: number;
};

export async function getFluxoMensalAno(anoParam?: string): Promise<{
  ano: number;
  meses: FluxoMensalItem[];
  totalEntradas: number;
  totalSaidas: number;
  saldoAno: number;
}> {
  const ano = Number(anoParam) || new Date().getFullYear();
  const inicio = startOfYear(new Date(ano, 0, 1));
  const fim = endOfYear(inicio);

  const transacoes = await prisma.transacaoFinanceira.findMany({
    where: { data: { gte: inicio, lte: fim } },
    select: { tipo: true, valor: true, data: true },
  });

  const meses: FluxoMensalItem[] = Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    entradas: 0,
    saidas: 0,
    saldo: 0,
  }));

  for (const t of transacoes) {
    const idx = t.data.getMonth();
    const v = Number(t.valor);
    if (t.tipo === "ENTRADA") meses[idx].entradas += v;
    else meses[idx].saidas += v;
  }

  let totalEntradas = 0;
  let totalSaidas = 0;
  for (const m of meses) {
    m.entradas = Math.round(m.entradas * 100) / 100;
    m.saidas = Math.round(m.saidas * 100) / 100;
    m.saldo = Math.round((m.entradas - m.saidas) * 100) / 100;
    totalEntradas += m.entradas;
    totalSaidas += m.saidas;
  }

  return {
    ano,
    meses,
    totalEntradas: Math.round(totalEntradas * 100) / 100,
    totalSaidas: Math.round(totalSaidas * 100) / 100,
    saldoAno: Math.round((totalEntradas - totalSaidas) * 100) / 100,
  };
}

export async function createTransacao(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    await assertFinanceiroAccess();
    const parsed = transacaoSchema.safeParse({
      tipo: formData.get("tipo"),
      categoriaId: formData.get("categoriaId"),
      valor: formData.get("valor"),
      descricao: formData.get("descricao"),
      data: formData.get("data"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    const categoria = await prisma.categoriaFinanceira.findUnique({
      where: { id: parsed.data.categoriaId },
    });
    if (!categoria?.ativo) {
      return { success: false, error: "Categoria inválida ou inativa" };
    }
    if (categoria.tipo !== parsed.data.tipo) {
      return {
        success: false,
        error: "A categoria não corresponde ao tipo do lançamento",
      };
    }

    const transacao = await prisma.transacaoFinanceira.create({
      data: {
        tipo: parsed.data.tipo,
        categoriaId: parsed.data.categoriaId,
        valor: parsed.data.valor,
        descricao: parsed.data.descricao.trim(),
        data: startOfDay(parsed.data.data),
      },
    });

    revalidateFinanceiro();
    return { success: true, data: { id: transacao.id } };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao criar lançamento",
    };
  }
}

export async function updateTransacao(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await assertFinanceiroAccess();
    const parsed = transacaoSchema.safeParse({
      tipo: formData.get("tipo"),
      categoriaId: formData.get("categoriaId"),
      valor: formData.get("valor"),
      descricao: formData.get("descricao"),
      data: formData.get("data"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    const categoria = await prisma.categoriaFinanceira.findUnique({
      where: { id: parsed.data.categoriaId },
    });
    if (!categoria?.ativo) {
      return { success: false, error: "Categoria inválida ou inativa" };
    }
    if (categoria.tipo !== parsed.data.tipo) {
      return {
        success: false,
        error: "A categoria não corresponde ao tipo do lançamento",
      };
    }

    await prisma.transacaoFinanceira.update({
      where: { id },
      data: {
        tipo: parsed.data.tipo,
        categoriaId: parsed.data.categoriaId,
        valor: parsed.data.valor,
        descricao: parsed.data.descricao.trim(),
        data: startOfDay(parsed.data.data),
      },
    });

    revalidateFinanceiro();
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao atualizar lançamento",
    };
  }
}

export async function deleteTransacao(id: string): Promise<ActionResult> {
  try {
    await assertFinanceiroAccess();
    await prisma.transacaoFinanceira.delete({ where: { id } });
    revalidateFinanceiro();
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao excluir lançamento",
    };
  }
}

export async function createCategoria(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    await assertFinanceiroAccess();
    const parsed = categoriaSchema.safeParse({
      nome: formData.get("nome"),
      tipo: formData.get("tipo"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    const categoria = await prisma.categoriaFinanceira.create({
      data: {
        nome: parsed.data.nome.trim(),
        tipo: parsed.data.tipo,
        ativo: true,
      },
    });

    revalidateFinanceiro();
    return { success: true, data: { id: categoria.id } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar categoria";
    if (msg.includes("Unique constraint")) {
      return { success: false, error: "Já existe uma categoria com este nome" };
    }
    return { success: false, error: msg };
  }
}

export async function updateCategoria(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await assertFinanceiroAccess();
    const parsed = categoriaSchema.safeParse({
      nome: formData.get("nome"),
      tipo: formData.get("tipo"),
      ativo: formData.get("ativo"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    await prisma.categoriaFinanceira.update({
      where: { id },
      data: {
        nome: parsed.data.nome.trim(),
        tipo: parsed.data.tipo,
        ativo: parsed.data.ativo ?? true,
      },
    });

    revalidateFinanceiro();
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao atualizar categoria";
    if (msg.includes("Unique constraint")) {
      return { success: false, error: "Já existe uma categoria com este nome" };
    }
    return { success: false, error: msg };
  }
}

export async function deleteCategoria(id: string): Promise<ActionResult> {
  try {
    await assertFinanceiroAccess();
    const count = await prisma.transacaoFinanceira.count({
      where: { categoriaId: id },
    });
    if (count > 0) {
      return {
        success: false,
        error: `Categoria com ${count} lançamento(s). Desative em vez de excluir.`,
      };
    }
    await prisma.categoriaFinanceira.delete({ where: { id } });
    revalidateFinanceiro();
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao excluir categoria",
    };
  }
}
