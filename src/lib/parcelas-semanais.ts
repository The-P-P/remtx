import { addWeeks, format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Prisma } from "@/generated/prisma/client";

export function nomeDiaSemana(data: Date): string {
  return format(data, "EEEE", { locale: ptBR });
}

/** Vencimentos semanais no mesmo dia da semana da data de retirada. */
export function listarVencimentosSemanais(
  dataRetirada: Date,
  dataFim: Date
): Date[] {
  const inicio = startOfDay(dataRetirada);
  const fim = startOfDay(dataFim);
  if (fim < inicio) return [];

  const vencimentos: Date[] = [];
  let atual = inicio;

  while (atual <= fim) {
    vencimentos.push(new Date(atual));
    atual = addWeeks(atual, 1);
  }

  return vencimentos;
}

export function calcularValorTotalSemanal(
  dataRetirada: Date,
  dataFim: Date,
  valorSemanal: number
): number {
  const semanas = listarVencimentosSemanais(dataRetirada, dataFim).length;
  return Math.round(semanas * valorSemanal * 100) / 100;
}

type Tx = Prisma.TransactionClient;

export async function sincronizarParcelasSemanais(
  tx: Tx,
  locacaoId: string,
  dataRetirada: Date,
  dataFimPrevista: Date,
  valorSemanal: number
) {
  await tx.parcelaLocacao.deleteMany({
    where: {
      locacaoId,
      dataPagamento: null,
    },
  });

  const vencimentos = listarVencimentosSemanais(dataRetirada, dataFimPrevista);

  if (vencimentos.length === 0) return;

  await tx.parcelaLocacao.createMany({
    data: vencimentos.map((dataVencimento, index) => ({
      locacaoId,
      valorBase: valorSemanal,
      valorJuros: 0,
      valor: valorSemanal,
      dataVencimento,
      dataVencimentoOriginal: dataVencimento,
      observacoes: `Semana ${index + 1} — ${format(dataVencimento, "dd/MM/yyyy", { locale: ptBR })}`,
    })),
  });
}

export async function encerrarParcelasAposDevolucao(
  tx: Tx,
  locacaoId: string,
  dataFimReal: Date
) {
  const fim = startOfDay(dataFimReal);
  await tx.parcelaLocacao.deleteMany({
    where: {
      locacaoId,
      dataPagamento: null,
      dataVencimento: { gt: fim },
    },
  });
}
