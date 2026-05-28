"use server";

import { revalidatePath } from "next/cache";
import {
  startOfDay,
  startOfYear,
  endOfYear,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  eachDayOfInterval,
} from "date-fns";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasPermission } from "@/lib/auth";
import { ensureCategoriasFinanceirasPadrao } from "@/lib/financeiro-categorias";
import { parsePeriodoFinanceiro } from "@/lib/financeiro-periodo";
import { labelOrigemTransacao } from "@/lib/financeiro-export";
import {
  categoriaSchema,
  transacaoSchema,
} from "@/lib/validations/financeiro";

export type FiltrosTransacao = {
  ano?: string;
  mes?: string;
  de?: string;
  ate?: string;
  periodoTipo?: string;
  dataRef?: string;
  tipo?: string;
  categoriaId?: string;
  q?: string;
};

const transacaoInclude = {
  categoria: { select: { id: true, nome: true, tipo: true } },
  parcela: {
    select: {
      id: true,
      locacaoId: true,
      locacao: {
        select: {
          id: true,
          veiculo: { select: { placa: true } },
        },
      },
    },
  },
  manutencao: {
    select: {
      id: true,
      veiculo: { select: { placa: true } },
      tipoManutencao: { select: { nome: true } },
    },
  },
  locacao: {
    select: {
      id: true,
      veiculo: { select: { placa: true } },
      cliente: { select: { nome: true } },
    },
  },
  parcelaFinanciamento: {
    select: {
      id: true,
      numero: true,
      financiamento: {
        select: {
          veiculo: { select: { id: true, placa: true } },
        },
      },
    },
  },
};

export type TransacaoListItem = Prisma.TransacaoFinanceiraGetPayload<{
  include: typeof transacaoInclude;
}>;

function buildFiltroTransacoes(params: FiltrosTransacao) {
  const periodo = parsePeriodoFinanceiro(params);
  const tipo =
    params.tipo === "ENTRADA" || params.tipo === "SAIDA"
      ? params.tipo
      : undefined;
  const q = params.q?.trim();

  const where: Prisma.TransacaoFinanceiraWhereInput = {
    data: { gte: periodo.inicio, lte: periodo.fim },
    ...(tipo ? { tipo } : {}),
    ...(params.categoriaId ? { categoriaId: params.categoriaId } : {}),
    ...(q ? { descricao: { contains: q, mode: "insensitive" } } : {}),
  };

  return { periodo, where };
}

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
    include: {
      categoria: true,
      parcela: transacaoInclude.parcela,
      manutencao: transacaoInclude.manutencao,
      locacao: transacaoInclude.locacao,
    },
  });
}

export async function getTransacoes(
  params: FiltrosTransacao
): Promise<TransacaoListItem[]> {
  await ensureCategoriasFinanceirasPadrao();
  const { where } = buildFiltroTransacoes(params);

  return prisma.transacaoFinanceira.findMany({
    where,
    orderBy: [{ data: "desc" }, { createdAt: "desc" }],
    include: transacaoInclude,
  }) as Promise<TransacaoListItem[]>;
}

export type ResumoCategoriaItem = {
  categoriaId: string;
  nome: string;
  tipo: "ENTRADA" | "SAIDA";
  total: number;
};

export async function getResumoPorCategoria(params: FiltrosTransacao) {
  const { where } = buildFiltroTransacoes(params);
  const transacoes = await prisma.transacaoFinanceira.findMany({
    where,
    select: {
      categoriaId: true,
      tipo: true,
      valor: true,
      categoria: { select: { nome: true } },
    },
  });

  const map = new Map<string, ResumoCategoriaItem>();
  for (const t of transacoes) {
    const key = t.categoriaId;
    const atual = map.get(key);
    const v = Number(t.valor);
    if (atual) {
      atual.total = Math.round((atual.total + v) * 100) / 100;
    } else {
      map.set(key, {
        categoriaId: t.categoriaId,
        nome: t.categoria.nome,
        tipo: t.tipo,
        total: v,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.total - a.total);
}

export async function getResumoFinanceiro(params: FiltrosTransacao) {
  const { periodo, where } = buildFiltroTransacoes(params);
  const { inicio, fim, ano, mes, modo } = periodo;
  const transacoes = await prisma.transacaoFinanceira.findMany({
    where,
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
    modo,
    entradas: Math.round(entradas * 100) / 100,
    saidas: Math.round(saidas * 100) / 100,
    saldo: Math.round((entradas - saidas) * 100) / 100,
    quantidade: transacoes.length,
  };
}

export async function duplicateTransacao(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await assertFinanceiroAccess();
    const original = await prisma.transacaoFinanceira.findUnique({
      where: { id },
    });
    if (!original) {
      return { success: false, error: "Lançamento não encontrado" };
    }
    if (original.parcelaId || original.manutencaoId) {
      return {
        success: false,
        error:
          "Lançamentos vinculados a parcela ou manutenção não podem ser duplicados. Crie um lançamento manual.",
      };
    }

    const copia = await prisma.transacaoFinanceira.create({
      data: {
        categoriaId: original.categoriaId,
        tipo: original.tipo,
        valor: original.valor,
        descricao: `${original.descricao} (cópia)`,
        data: new Date(),
        formaPagamento: original.formaPagamento,
        locacaoId: original.locacaoId,
      },
    });

    revalidateFinanceiro();
    return { success: true, data: { id: copia.id } };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao duplicar",
    };
  }
}

export async function getTransacoesParaExport(params: FiltrosTransacao) {
  const transacoes = await getTransacoes(params);
  return transacoes.map((t) => ({
    data: t.data,
    tipo: t.tipo,
    categoria: t.categoria.nome,
    descricao: t.descricao,
    valor: Number(t.valor),
    formaPagamento: t.formaPagamento,
    origem: labelOrigemTransacao(t),
  }));
}

export type FluxoGranularidade = "mensal" | "semanal" | "diario";

export type FluxoPeriodoItem = {
  chave: string;
  inicio: Date;
  fim: Date;
  entradas: number;
  saidas: number;
  saldo: number;
};

export async function getFluxoAno(
  anoParam?: string,
  granularidade: FluxoGranularidade = "mensal"
): Promise<{
  ano: number;
  granularidade: FluxoGranularidade;
  periodos: FluxoPeriodoItem[];
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

  const periodos: FluxoPeriodoItem[] =
    granularidade === "diario"
      ? eachDayOfInterval({ start: inicio, end: fim }).map((d) => ({
          chave: d.toISOString().slice(0, 10),
          inicio: d,
          fim: d,
          entradas: 0,
          saidas: 0,
          saldo: 0,
        }))
      : granularidade === "semanal"
        ? eachWeekOfInterval(
            { start: inicio, end: fim },
            { weekStartsOn: 1 }
          ).map((w) => {
            const weekStart = startOfWeek(w, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(w, { weekStartsOn: 1 });
            return {
              chave: weekStart.toISOString().slice(0, 10),
              inicio: weekStart,
              fim: weekEnd > fim ? fim : weekEnd,
              entradas: 0,
              saidas: 0,
              saldo: 0,
            };
          })
        : Array.from({ length: 12 }, (_, i) => {
            const mInicio = startOfDay(new Date(ano, i, 1));
            const mFim = endOfMonth(mInicio);
            return {
              chave: `${ano}-${String(i + 1).padStart(2, "0")}`,
              inicio: mInicio,
              fim: mFim > fim ? fim : mFim,
              entradas: 0,
              saidas: 0,
              saldo: 0,
            };
          });

  for (const t of transacoes) {
    let idx = -1;
    if (granularidade === "mensal") {
      idx = t.data.getMonth();
    } else {
      idx = periodos.findIndex((p) => t.data >= p.inicio && t.data <= p.fim);
    }
    if (idx < 0) continue;
    const v = Number(t.valor);
    if (t.tipo === "ENTRADA") periodos[idx].entradas += v;
    else periodos[idx].saidas += v;
  }

  let totalEntradas = 0;
  let totalSaidas = 0;
  for (const p of periodos) {
    p.entradas = Math.round(p.entradas * 100) / 100;
    p.saidas = Math.round(p.saidas * 100) / 100;
    p.saldo = Math.round((p.entradas - p.saidas) * 100) / 100;
    totalEntradas += p.entradas;
    totalSaidas += p.saidas;
  }

  return {
    ano,
    granularidade,
    periodos,
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
      formaPagamento: formData.get("formaPagamento") || undefined,
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
        formaPagamento: parsed.data.formaPagamento,
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
      formaPagamento: formData.get("formaPagamento") || undefined,
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

    const existente = await prisma.transacaoFinanceira.findUnique({
      where: { id },
    });
    if (!existente) {
      return { success: false, error: "Lançamento não encontrado" };
    }

    await prisma.transacaoFinanceira.update({
      where: { id },
      data: {
        tipo: parsed.data.tipo,
        categoriaId: parsed.data.categoriaId,
        valor: parsed.data.valor,
        descricao: parsed.data.descricao.trim(),
        data: startOfDay(parsed.data.data),
        formaPagamento: parsed.data.formaPagamento,
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
