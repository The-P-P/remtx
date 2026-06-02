import { startOfDay } from "date-fns";
import { criarLancamentosFaltantesPagamentos } from "@/lib/financeiro-sync-parcelas";
import { prisma } from "@/lib/prisma";
import {
  corrigirVencimentosDeslocadosPorTimezone,
  removerParcelasPendentesDuplicadas,
} from "@/lib/parcelas-semanais";
import {
  calcularEncargosParcela,
  valorTotalParcela,
} from "@/lib/juros-parcela";

/** Atualiza multa e juros de parcelas em aberto conforme o modelo de contrato. */
export async function atualizarJurosParcelasPendentes(locadoraId: string) {
  const parcelas = await prisma.parcelaLocacao.findMany({
    where: {
      dataPagamento: null,
      pagamentoAjustado: false,
      locacao: { locadoraId },
    },
    include: {
      locacao: {
        select: {
          modeloContrato: true,
          periodicidadePagamento: true,
        },
      },
    },
  });

  const hoje = new Date();

  await Promise.all(
    parcelas.map(async (p) => {
      const valorBase = Number(p.valorBase ?? p.valor);
      const jurosTravados = Number(p.jurosTravados ?? 0);

      const encargos = calcularEncargosParcela(
        valorBase,
        p.dataVencimento,
        hoje,
        p.isentarJuros,
        {
          modeloContrato: p.locacao.modeloContrato,
          periodicidadePagamento: p.locacao.periodicidadePagamento,
        }
      );

      const valorJuros = p.isentarJuros
        ? 0
        : Math.round((jurosTravados + encargos.valorEncargos) * 100) / 100;
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
export async function normalizarParcelasLegadas(locadoraId: string) {
  const parcelas = await prisma.parcelaLocacao.findMany({
    where: { locacao: { locadoraId } },
  });
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

export async function prepararParcelasParaAgenda(locadoraId: string) {
  await normalizarParcelasLegadas(locadoraId);
  await corrigirVencimentosDeslocadosPorTimezone(locadoraId);
  await removerParcelasPendentesDuplicadas(locadoraId);
  await criarLancamentosFaltantesPagamentos(locadoraId);
  await atualizarJurosParcelasPendentes(locadoraId);
}
