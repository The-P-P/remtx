import { startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  calcularJurosParcela,
  valorTotalParcela,
} from "@/lib/juros-parcela";

/** Atualiza juros de parcelas em aberto (5% do valor base por dia de atraso). */
export async function atualizarJurosParcelasPendentes() {
  const parcelas = await prisma.parcelaLocacao.findMany({
    where: {
      dataPagamento: null,
      pagamentoAjustado: false,
    },
  });

  const hoje = new Date();

  await Promise.all(
    parcelas.map(async (p) => {
      const valorBase = Number(p.valorBase ?? p.valor);
      const jurosTravados = Number(p.jurosTravados ?? 0);

      const { valorJuros: jurosDoVencimento } = calcularJurosParcela(
        valorBase,
        p.dataVencimento,
        hoje,
        p.isentarJuros
      );

      const valorJuros = p.isentarJuros
        ? 0
        : Math.round((jurosTravados + jurosDoVencimento) * 100) / 100;
      const valor = valorTotalParcela(valorBase, valorJuros);

      if (
        Number(p.valorJuros) === valorJuros &&
        Number(p.valor) === valor
      ) {
        return;
      }

      await prisma.parcelaLocacao.update({
        where: { id: p.id },
        data: { valorBase, valorJuros, valor },
      });
    })
  );
}

/** Preenche campos novos em parcelas antigas. */
export async function normalizarParcelasLegadas() {
  const parcelas = await prisma.parcelaLocacao.findMany();
  for (const p of parcelas) {
    const base = Number(p.valorBase);
    if (base > 0 && p.dataVencimentoOriginal) continue;
    const v = Number(p.valor);
    await prisma.parcelaLocacao.update({
      where: { id: p.id },
      data: {
        valorBase: base > 0 ? base : v,
        dataVencimentoOriginal:
          p.dataVencimentoOriginal ?? p.dataVencimento,
      },
    });
  }
}

export async function prepararParcelasParaAgenda() {
  await normalizarParcelasLegadas();
  await atualizarJurosParcelasPendentes();
}
