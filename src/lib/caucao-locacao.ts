import type { Prisma } from "@/generated/prisma/client";

/** Valor da caução na retirada (igual a uma semana por padrão). */
export function calcularValorCaucao(
  valorSemanal: number,
  cobrarCaucao: boolean
): number {
  if (!cobrarCaucao || valorSemanal <= 0) return 0;
  return Math.round(valorSemanal * 100) / 100;
}

export function totalRecebimentoRetirada(
  valorSemanal: number,
  valorCaucao: number
): number {
  return Math.round((valorSemanal + valorCaucao) * 100) / 100;
}

export function caucaoPendente(locacao: {
  valorCaucao: unknown;
  caucaoPaga: boolean;
}): boolean {
  return Number(locacao.valorCaucao) > 0 && !locacao.caucaoPaga;
}

export type LocacaoComCaucao = {
  id: string;
  valorDiaria: unknown;
  valorCaucao: unknown;
  caucaoPaga: boolean;
  caucaoDataPagamento: Date | null;
};

export function resumoCaucaoLocacao(locacao: LocacaoComCaucao) {
  const semanal = Number(locacao.valorDiaria);
  const caucao = Number(locacao.valorCaucao);
  return {
    valorSemanal: semanal,
    valorCaucao: caucao,
    totalRetirada: totalRecebimentoRetirada(semanal, caucao),
    pendente: caucaoPendente(locacao),
    paga: locacao.caucaoPaga,
    dataPagamento: locacao.caucaoDataPagamento,
  };
}

export function dadosCaucaoCreate(
  valorSemanal: number,
  cobrarCaucao: boolean
): Pick<Prisma.LocacaoCreateInput, "valorCaucao" | "caucaoPaga"> {
  return {
    valorCaucao: calcularValorCaucao(valorSemanal, cobrarCaucao),
    caucaoPaga: false,
  };
}
