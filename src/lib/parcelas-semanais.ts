import { addWeeks, differenceInCalendarDays, format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { dateKey, parseDateInput } from "@/lib/utils";

/** Horizonte de parcelas sem data de devolução (renovável ao confirmar pagamentos). */
export const SEMANAS_PARCELAS_PRAZO_INDETERMINADO = 52;

export function dataFimParaParcelas(
  dataRetirada: Date,
  dataFimPrevista: Date | null
): Date {
  if (dataFimPrevista) return parseDateInput(dataFimPrevista);
  return addWeeks(
    parseDateInput(dataRetirada),
    SEMANAS_PARCELAS_PRAZO_INDETERMINADO
  );
}

export function nomeDiaSemana(data: Date): string {
  return format(parseDateInput(data), "EEEE", { locale: ptBR });
}

/** Vencimentos semanais no mesmo dia da semana da data de retirada. */
export function listarVencimentosSemanais(
  dataRetirada: Date,
  dataFim: Date
): Date[] {
  const inicio = parseDateInput(dataRetirada);
  const fim = parseDateInput(dataFim);
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

function chaveVencimentoParcela(data: Date): string {
  return dateKey(data);
}

export async function sincronizarParcelasSemanais(
  tx: Tx,
  locacaoId: string,
  dataRetirada: Date,
  dataFimPrevista: Date | null,
  valorSemanal: number
) {
  const retirada = parseDateInput(dataRetirada);
  const fim = dataFimParaParcelas(retirada, dataFimPrevista);
  const esperados = listarVencimentosSemanais(retirada, fim);
  const esperadoKeys = new Set(esperados.map(chaveVencimentoParcela));

  const existentes = await tx.parcelaLocacao.findMany({
    where: { locacaoId },
    orderBy: { dataVencimento: "asc" },
  });

  const datasComParcela = new Set(
    existentes.map((p) =>
      chaveVencimentoParcela(p.dataVencimentoOriginal ?? p.dataVencimento)
    )
  );

  for (const p of existentes) {
    if (p.dataPagamento) continue;
    const key = chaveVencimentoParcela(
      p.dataVencimentoOriginal ?? p.dataVencimento
    );
    if (!esperadoKeys.has(key)) {
      await tx.parcelaLocacao.delete({ where: { id: p.id } });
    }
  }

  const novos = esperados.filter((d) => !datasComParcela.has(chaveVencimentoParcela(d)));

  if (novos.length === 0) return;

  await tx.parcelaLocacao.createMany({
    data: novos.map((dataVencimento) => {
      const semana =
        esperados.findIndex(
          (e) =>
            chaveVencimentoParcela(e) === chaveVencimentoParcela(dataVencimento)
        ) + 1;
      return {
        locacaoId,
        valorBase: valorSemanal,
        valorJuros: 0,
        valor: valorSemanal,
        dataVencimento,
        dataVencimentoOriginal: dataVencimento,
        observacoes: `Semana ${semana} — ${format(dataVencimento, "dd/MM/yyyy", { locale: ptBR })}`,
      };
    }),
  });
}

/** Remove parcelas pendentes duplicadas no mesmo vencimento. */
export async function removerParcelasPendentesDuplicadas() {
  const pendentes = await prisma.parcelaLocacao.findMany({
    where: { dataPagamento: null },
    orderBy: { createdAt: "asc" },
  });

  const visto = new Map<string, string>();

  for (const p of pendentes) {
    const key = `${p.locacaoId}:${chaveVencimentoParcela(p.dataVencimento)}`;
    const anterior = visto.get(key);
    if (anterior) {
      await prisma.parcelaLocacao.delete({ where: { id: p.id } });
    } else {
      visto.set(key, p.id);
    }
  }
}

/** Corrige apenas datas salvas como meia-noite UTC (deslocam 1 dia no Brasil). */
export async function corrigirVencimentosDeslocadosPorTimezone() {
  const locacoes = await prisma.locacao.findMany({
    select: { id: true, dataInicio: true, dataFimPrevista: true },
  });

  for (const loc of locacoes) {
    const inicioCorrigido = parseDateInput(loc.dataInicio);
    if (dateKey(loc.dataInicio) !== dateKey(inicioCorrigido)) {
      await prisma.locacao.update({
        where: { id: loc.id },
        data: { dataInicio: inicioCorrigido },
      });
    }
    if (loc.dataFimPrevista) {
      const fimCorrigido = parseDateInput(loc.dataFimPrevista);
      if (dateKey(loc.dataFimPrevista) !== dateKey(fimCorrigido)) {
        await prisma.locacao.update({
          where: { id: loc.id },
          data: { dataFimPrevista: fimCorrigido },
        });
      }
    }
  }

  const parcelas = await prisma.parcelaLocacao.findMany({
    where: { dataPagamento: null },
  });

  for (const p of parcelas) {
    const atual = startOfDay(p.dataVencimento);
    const corrigido = parseDateInput(p.dataVencimento);
    const diff = Math.abs(differenceInCalendarDays(corrigido, atual));
    if (diff !== 1) continue;

    const duplicata = await prisma.parcelaLocacao.findFirst({
      where: {
        locacaoId: p.locacaoId,
        id: { not: p.id },
        OR: [
          { dataVencimento: corrigido },
          { dataVencimentoOriginal: corrigido },
        ],
      },
    });
    if (duplicata) {
      await prisma.parcelaLocacao.delete({ where: { id: p.id } });
      continue;
    }

    await prisma.parcelaLocacao.update({
      where: { id: p.id },
      data: {
        dataVencimento: corrigido,
        dataVencimentoOriginal: corrigido,
      },
    });
  }
}

export async function encerrarParcelasAposDevolucao(
  tx: Tx,
  locacaoId: string,
  dataFimReal: Date
) {
  const fim = parseDateInput(dataFimReal);
  await tx.parcelaLocacao.deleteMany({
    where: {
      locacaoId,
      dataPagamento: null,
      dataVencimento: { gt: fim },
    },
  });
}
