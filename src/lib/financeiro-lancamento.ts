import type { Prisma } from "@/generated/prisma/client";
import type { FormaPagamento } from "@/types/prisma";

type Tx = Prisma.TransactionClient;

export type DadosLancamentoFinanceiro = {
  categoriaId: string;
  tipo: "ENTRADA" | "SAIDA";
  valor: number;
  descricao: string;
  data: Date;
  formaPagamento?: FormaPagamento | null;
  parcelaId?: string | null;
  manutencaoId?: string | null;
  locacaoId?: string | null;
  parcelaFinanciamentoId?: string | null;
};

/** Cria ou atualiza lançamento vinculado à parcela (evita duplicata e corrige data). */
export async function sincronizarLancamentoParcela(
  tx: Tx,
  dados: DadosLancamentoFinanceiro & { parcelaId: string }
) {
  const existente = await tx.transacaoFinanceira.findUnique({
    where: { parcelaId: dados.parcelaId },
  });
  if (existente) {
    return tx.transacaoFinanceira.update({
      where: { id: existente.id },
      data: {
        categoriaId: dados.categoriaId,
        tipo: dados.tipo,
        valor: dados.valor,
        descricao: dados.descricao.trim(),
        data: dados.data,
        formaPagamento: dados.formaPagamento ?? null,
        locacaoId: dados.locacaoId ?? null,
      },
    });
  }
  return criarLancamentoFinanceiro(tx, dados);
}

/** Cria ou atualiza lançamento de caução da locação. */
export async function sincronizarLancamentoCaucao(
  tx: Tx,
  dados: DadosLancamentoFinanceiro & { locacaoId: string; categoriaId: string }
) {
  const existente = await tx.transacaoFinanceira.findFirst({
    where: {
      locacaoId: dados.locacaoId,
      categoriaId: dados.categoriaId,
      parcelaId: null,
    },
    orderBy: { createdAt: "desc" },
  });
  if (existente) {
    return tx.transacaoFinanceira.update({
      where: { id: existente.id },
      data: {
        tipo: dados.tipo,
        valor: dados.valor,
        descricao: dados.descricao.trim(),
        data: dados.data,
        formaPagamento: dados.formaPagamento ?? null,
      },
    });
  }
  return criarLancamentoFinanceiro(tx, {
    ...dados,
    parcelaId: null,
  });
}

export async function criarLancamentoFinanceiro(tx: Tx, dados: DadosLancamentoFinanceiro) {
  if (dados.parcelaId) {
    const existente = await tx.transacaoFinanceira.findUnique({
      where: { parcelaId: dados.parcelaId },
    });
    if (existente) return existente;
  }
  if (dados.manutencaoId) {
    const existente = await tx.transacaoFinanceira.findUnique({
      where: { manutencaoId: dados.manutencaoId },
    });
    if (existente) return existente;
  }
  if (dados.parcelaFinanciamentoId) {
    const existente = await tx.transacaoFinanceira.findUnique({
      where: { parcelaFinanciamentoId: dados.parcelaFinanciamentoId },
    });
    if (existente) return existente;
  }

  return tx.transacaoFinanceira.create({
    data: {
      categoriaId: dados.categoriaId,
      tipo: dados.tipo,
      valor: dados.valor,
      descricao: dados.descricao.trim(),
      data: dados.data,
      formaPagamento: dados.formaPagamento ?? null,
      parcelaId: dados.parcelaId ?? null,
      manutencaoId: dados.manutencaoId ?? null,
      locacaoId: dados.locacaoId ?? null,
      parcelaFinanciamentoId: dados.parcelaFinanciamentoId ?? null,
    },
  });
}

export async function sincronizarLancamentoManutencao(
  tx: Tx,
  manutencaoId: string,
  dados: Omit<DadosLancamentoFinanceiro, "manutencaoId">
) {
  const existente = await tx.transacaoFinanceira.findUnique({
    where: { manutencaoId },
  });
  if (existente) {
    return tx.transacaoFinanceira.update({
      where: { id: existente.id },
      data: {
        categoriaId: dados.categoriaId,
        tipo: dados.tipo,
        valor: dados.valor,
        descricao: dados.descricao.trim(),
        data: dados.data,
        formaPagamento: dados.formaPagamento ?? null,
      },
    });
  }
  return criarLancamentoFinanceiro(tx, { ...dados, manutencaoId });
}
