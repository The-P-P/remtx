import { prisma } from "@/lib/prisma";
import { resumoFinanciamento } from "@/lib/financiamento-parcelas";

export type MovimentoVeiculoOrigem =
  | "aquisicao"
  | "financiamento_entrada"
  | "financiamento_parcela"
  | "manutencao"
  | "locacao"
  | "outro";

export type MovimentoVeiculo = {
  id: string;
  data: string;
  tipo: "entrada" | "saida";
  origem: MovimentoVeiculoOrigem;
  categoria: string;
  descricao: string;
  valor: number;
  linkHref?: string;
};

export type VeiculoFinanceiroResumo = {
  valorCompra: number | null;
  dataCompra: string | null;
  investimentoTotal: number;
  receitaLocacoes: number;
  gastoManutencao: number;
  gastoFinanciamento: number;
  totalEntradas: number;
  totalSaidas: number;
  lucroLiquido: number;
  saldoFinanciamento: number | null;
  parcelasFinanciamentoPagas: number;
  parcelasFinanciamentoRestantes: number;
};

export type VeiculoFinanceiroData = {
  resumo: VeiculoFinanceiroResumo;
  movimentos: MovimentoVeiculo[];
  financiamento: Awaited<ReturnType<typeof loadFinanciamento>> | null;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

async function loadFinanciamento(veiculoId: string) {
  return prisma.financiamentoVeiculo.findUnique({
    where: { veiculoId },
    include: {
      parcelas: { orderBy: { numero: "asc" } },
    },
  });
}

export async function getVeiculoFinanceiro(
  veiculoId: string
): Promise<VeiculoFinanceiroData | null> {
  const veiculo = await prisma.veiculo.findUnique({
    where: { id: veiculoId },
    select: {
      id: true,
      valorCompra: true,
      dataCompra: true,
    },
  });

  if (!veiculo) return null;

  const [parcelasLocacao, manutencoes, financiamento, transacoes] =
    await Promise.all([
      prisma.parcelaLocacao.findMany({
        where: {
          locacao: { veiculoId },
          dataPagamento: { not: null },
        },
        include: {
          locacao: {
            select: {
              id: true,
              cliente: { select: { nome: true } },
            },
          },
        },
        orderBy: { dataPagamento: "desc" },
      }),
      prisma.manutencao.findMany({
        where: { veiculoId },
        include: {
          tipoManutencao: { select: { nome: true } },
        },
        orderBy: { dataRealizada: "desc" },
      }),
      loadFinanciamento(veiculoId),
      prisma.transacaoFinanceira.findMany({
        where: {
          OR: [
            { locacao: { veiculoId } },
            { manutencao: { veiculoId } },
            {
              parcelaFinanciamento: {
                financiamento: { veiculoId },
              },
            },
          ],
        },
        include: { categoria: { select: { nome: true } } },
        orderBy: { data: "desc" },
        take: 100,
      }),
    ]);

  const movimentos: MovimentoVeiculo[] = [];
  const idsParcelaLocacao = new Set<string>();
  const idsManutencao = new Set<string>();
  const idsParcelaFin = new Set<string>();

  const valorCompra = veiculo.valorCompra
    ? round2(Number(veiculo.valorCompra))
    : null;

  if (valorCompra && valorCompra > 0) {
    movimentos.push({
      id: `compra-${veiculoId}`,
      data: (veiculo.dataCompra ?? new Date()).toISOString(),
      tipo: "saida",
      origem: "aquisicao",
      categoria: "Aquisição",
      descricao: "Valor de compra do veículo",
      valor: valorCompra,
    });
  }

  let gastoFinanciamentoEntrada = 0;
  let gastoFinanciamentoParcelas = 0;

  if (financiamento) {
    const entrada = round2(Number(financiamento.valorEntrada));
    const usaValorCompra = valorCompra != null && valorCompra > 0;

    if (entrada > 0 && !usaValorCompra) {
      movimentos.push({
        id: `fin-entrada-${financiamento.id}`,
        data: financiamento.dataPrimeiraParcela.toISOString(),
        tipo: "saida",
        origem: "financiamento_entrada",
        categoria: "Financiamento",
        descricao: "Entrada do financiamento",
        valor: entrada,
      });
      gastoFinanciamentoEntrada = entrada;
    }

    for (const p of financiamento.parcelas) {
      if (!p.dataPagamento) continue;
      idsParcelaFin.add(p.id);
      const valor = round2(Number(p.valor));
      gastoFinanciamentoParcelas += valor;
      movimentos.push({
        id: `fin-parcela-${p.id}`,
        data: p.dataPagamento.toISOString(),
        tipo: "saida",
        origem: "financiamento_parcela",
        categoria: "Financiamento",
        descricao: `${p.numero}ª parcela do financiamento`,
        valor,
      });
    }
  }

  let receitaLocacoes = 0;
  for (const p of parcelasLocacao) {
    if (!p.dataPagamento) continue;
    idsParcelaLocacao.add(p.id);
    const valor = round2(Number(p.valor));
    receitaLocacoes += valor;
    movimentos.push({
      id: `loc-${p.id}`,
      data: p.dataPagamento.toISOString(),
      tipo: "entrada",
      origem: "locacao",
      categoria: "Locação",
      descricao: `Parcela — ${p.locacao.cliente.nome}`,
      valor,
      linkHref: `/locacoes/${p.locacao.id}`,
    });
  }

  let gastoManutencao = 0;
  for (const m of manutencoes) {
    const custo = round2(Number(m.custo ?? 0));
    if (custo <= 0) continue;
    idsManutencao.add(m.id);
    gastoManutencao += custo;
    movimentos.push({
      id: `man-${m.id}`,
      data: m.dataRealizada.toISOString(),
      tipo: "saida",
      origem: "manutencao",
      categoria: "Manutenção",
      descricao: m.tipoManutencao.nome,
      valor: custo,
      linkHref: `/manutencoes?veiculoId=${veiculoId}`,
    });
  }

  let outrosEntradas = 0;
  let outrosSaidas = 0;

  for (const t of transacoes) {
    if (t.parcelaId && idsParcelaLocacao.has(t.parcelaId)) continue;
    if (t.manutencaoId && idsManutencao.has(t.manutencaoId)) continue;
    if (
      t.parcelaFinanciamentoId &&
      idsParcelaFin.has(t.parcelaFinanciamentoId)
    ) {
      continue;
    }

    const valor = round2(Number(t.valor));
    movimentos.push({
      id: `tx-${t.id}`,
      data: t.data.toISOString(),
      tipo: t.tipo === "ENTRADA" ? "entrada" : "saida",
      origem: "outro",
      categoria: t.categoria.nome,
      descricao: t.descricao,
      valor,
      linkHref: "/financeiro",
    });

    if (t.tipo === "ENTRADA") outrosEntradas += valor;
    else outrosSaidas += valor;
  }

  const gastoFinanciamento = round2(
    gastoFinanciamentoEntrada + gastoFinanciamentoParcelas
  );

  movimentos.sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  const investimentoTotal =
    valorCompra && valorCompra > 0
      ? valorCompra
      : financiamento
        ? round2(
            Number(financiamento.valorEntrada) +
              Number(financiamento.valorFinanciado)
          )
        : 0;

  const totalEntradas = round2(receitaLocacoes + outrosEntradas);
  const totalSaidas = round2(
    (valorCompra && valorCompra > 0 ? valorCompra : 0) +
      gastoManutencao +
      gastoFinanciamento +
      outrosSaidas
  );
  const lucroLiquido = round2(totalEntradas - totalSaidas);

  const finResumo = financiamento
    ? resumoFinanciamento(financiamento.parcelas)
    : null;

  return {
    resumo: {
      valorCompra,
      dataCompra: veiculo.dataCompra?.toISOString() ?? null,
      investimentoTotal,
      receitaLocacoes: round2(receitaLocacoes),
      gastoManutencao: round2(gastoManutencao),
      gastoFinanciamento: round2(gastoFinanciamento),
      totalEntradas,
      totalSaidas,
      lucroLiquido,
      saldoFinanciamento: financiamento
        ? round2(Number(financiamento.saldoDevedor))
        : null,
      parcelasFinanciamentoPagas: finResumo?.parcelasPagas ?? 0,
      parcelasFinanciamentoRestantes: finResumo?.parcelasRestantes ?? 0,
    },
    movimentos,
    financiamento,
  };
}
