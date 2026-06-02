import { addMonths, setDate, startOfDay } from "date-fns";
import type { Prisma } from "@/generated/prisma/client";
import { dateKey, parseDateInput } from "@/lib/utils";

type Tx = Prisma.TransactionClient;

function chaveVencimento(data: Date) {
  return dateKey(data);
}

/** Vencimentos mensais — dia 5 de cada mês (padrão Plano Conquista). */
export function listarVencimentosMensais(
  dataInicio: Date,
  totalMeses: number,
  diaVencimento = 5
): Date[] {
  const inicio = parseDateInput(dataInicio);
  const vencimentos: Date[] = [];

  for (let i = 0; i < totalMeses; i++) {
    const base = addMonths(inicio, i);
    vencimentos.push(startOfDay(setDate(base, diaVencimento)));
  }

  return vencimentos;
}

export async function sincronizarParcelasMensais(
  tx: Tx,
  locacaoId: string,
  dataInicio: Date,
  totalMeses: number,
  valorMensal: number,
  diaVencimento = 5
) {
  const esperados = listarVencimentosMensais(dataInicio, totalMeses, diaVencimento);
  const esperadoKeys = new Set(esperados.map(chaveVencimento));

  const existentes = await tx.parcelaLocacao.findMany({
    where: { locacaoId },
    orderBy: { dataVencimento: "asc" },
  });

  const datasComParcela = new Set(
    existentes.map((p) =>
      chaveVencimento(p.dataVencimentoOriginal ?? p.dataVencimento)
    )
  );

  for (const data of esperados) {
    const key = chaveVencimento(data);
    if (datasComParcela.has(key)) continue;

    await tx.parcelaLocacao.create({
      data: {
        locacaoId,
        valorBase: valorMensal,
        valorJuros: 0,
        jurosTravados: 0,
        valor: valorMensal,
        dataVencimento: data,
        dataVencimentoOriginal: data,
      },
    });
  }

  for (const p of existentes) {
    if (p.dataPagamento) continue;
    const key = chaveVencimento(p.dataVencimentoOriginal ?? p.dataVencimento);
    if (!esperadoKeys.has(key)) {
      await tx.parcelaLocacao.delete({ where: { id: p.id } });
    }
  }
}
