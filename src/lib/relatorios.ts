import { differenceInCalendarDays, endOfMonth, max, min, startOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { parsePeriodoFinanceiro } from "@/lib/financeiro-periodo";

export type RelatorioFiltros = {
  ano?: string;
  mes?: string;
  de?: string;
  ate?: string;
};

type SerieMesItem = {
  ano: number;
  mes: number;
  entradas: number;
  saidas: number;
  lucro: number;
};

export async function getRelatorioGeral(filtros: RelatorioFiltros) {
  const periodo = parsePeriodoFinanceiro(filtros);
  const inicio = periodo.inicio;
  const fim = periodo.fim;

  const [
    transacoes,
    parcelasPagas,
    parcelasVencidas,
    manutencoes,
    locacoesSobrepostas,
    totalVeiculosAtivos,
    locacoesFinalizadas,
    transacoesSerie,
  ] = await Promise.all([
    prisma.transacaoFinanceira.findMany({
      where: { data: { gte: inicio, lte: fim } },
      include: { categoria: { select: { nome: true, tipo: true } } },
    }),
    prisma.parcelaLocacao.findMany({
      where: { dataPagamento: { gte: inicio, lte: fim } },
      include: {
        locacao: {
          select: {
            id: true,
            cliente: { select: { id: true, nome: true } },
            veiculo: { select: { id: true, placa: true, marca: true, modelo: true } },
          },
        },
      },
    }),
    prisma.parcelaLocacao.findMany({
      where: { dataVencimento: { gte: inicio, lte: fim } },
      include: {
        locacao: {
          select: {
            cliente: { select: { id: true, nome: true } },
            veiculo: { select: { id: true, placa: true } },
          },
        },
      },
    }),
    prisma.manutencao.findMany({
      where: { dataRealizada: { gte: inicio, lte: fim } },
      include: {
        veiculo: { select: { id: true, placa: true, marca: true, modelo: true } },
        tipoManutencao: { select: { nome: true } },
      },
    }),
    prisma.locacao.findMany({
      where: {
        dataInicio: { lte: fim },
        OR: [{ dataFimReal: null }, { dataFimReal: { gte: inicio } }],
      },
      select: {
        id: true,
        dataInicio: true,
        dataFimReal: true,
        veiculoId: true,
      },
    }),
    prisma.veiculo.count({ where: { status: { not: "INATIVO" } } }),
    prisma.locacao.findMany({
      where: { dataFimReal: { gte: inicio, lte: fim } },
      select: { id: true, valorTotal: true },
    }),
    prisma.transacaoFinanceira.findMany({
      where: {
        data: {
          gte: startOfMonth(subMonths(fim, 11)),
          lte: endOfMonth(fim),
        },
      },
      select: { data: true, tipo: true, valor: true },
    }),
  ]);

  const receita = transacoes
    .filter((t) => t.tipo === "ENTRADA")
    .reduce((s, t) => s + Number(t.valor), 0);
  const despesa = transacoes
    .filter((t) => t.tipo === "SAIDA")
    .reduce((s, t) => s + Number(t.valor), 0);
  const lucro = receita - despesa;

  const custoManutencao = manutencoes.reduce(
    (s, m) => s + Number(m.custo ?? 0),
    0
  );

  const ticketMedio =
    locacoesFinalizadas.length > 0
      ? locacoesFinalizadas.reduce((s, l) => s + Number(l.valorTotal ?? 0), 0) /
        locacoesFinalizadas.length
      : 0;

  const diasPeriodo = differenceInCalendarDays(fim, inicio) + 1;
  const baseCapacidade = totalVeiculosAtivos * Math.max(1, diasPeriodo);

  let diasLocados = 0;
  for (const loc of locacoesSobrepostas) {
    const fimLoc = loc.dataFimReal ?? fim;
    const inicioRecorte = max([loc.dataInicio, inicio]);
    const fimRecorte = min([fimLoc, fim]);
    if (fimRecorte >= inicioRecorte) {
      diasLocados += differenceInCalendarDays(fimRecorte, inicioRecorte) + 1;
    }
  }
  const taxaOcupacao = baseCapacidade > 0 ? (diasLocados / baseCapacidade) * 100 : 0;

  const totalVencido = parcelasVencidas.reduce((s, p) => s + Number(p.valor), 0);
  const parcelasAtrasadas = parcelasVencidas.filter(
    (p) => !p.dataPagamento || p.dataPagamento > fim
  );
  const valorAtrasado = parcelasAtrasadas.reduce((s, p) => s + Number(p.valor), 0);
  const inadimplencia = totalVencido > 0 ? (valorAtrasado / totalVencido) * 100 : 0;

  const topVeiculosMap = new Map<string, { placa: string; modelo: string; receita: number; qtd: number }>();
  for (const p of parcelasPagas) {
    const key = p.locacao.veiculo.id;
    const atual = topVeiculosMap.get(key) ?? {
      placa: p.locacao.veiculo.placa,
      modelo: `${p.locacao.veiculo.marca} ${p.locacao.veiculo.modelo}`,
      receita: 0,
      qtd: 0,
    };
    atual.receita += Number(p.valor);
    atual.qtd += 1;
    topVeiculosMap.set(key, atual);
  }

  const topClientesMap = new Map<string, { nome: string; receita: number; qtd: number }>();
  for (const p of parcelasPagas) {
    const key = p.locacao.cliente.id;
    const atual = topClientesMap.get(key) ?? {
      nome: p.locacao.cliente.nome,
      receita: 0,
      qtd: 0,
    };
    atual.receita += Number(p.valor);
    atual.qtd += 1;
    topClientesMap.set(key, atual);
  }

  const categoriasMap = new Map<string, { nome: string; tipo: "ENTRADA" | "SAIDA"; total: number }>();
  for (const t of transacoes) {
    const key = t.categoria.nome;
    const atual = categoriasMap.get(key) ?? {
      nome: t.categoria.nome,
      tipo: t.tipo,
      total: 0,
    };
    atual.total += Number(t.valor);
    categoriasMap.set(key, atual);
  }

  const serieMap = new Map<string, SerieMesItem>();
  for (let i = 11; i >= 0; i--) {
    const ref = subMonths(startOfMonth(fim), i);
    const key = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}`;
    serieMap.set(key, {
      ano: ref.getFullYear(),
      mes: ref.getMonth() + 1,
      entradas: 0,
      saidas: 0,
      lucro: 0,
    });
  }
  for (const t of transacoesSerie) {
    const key = `${t.data.getFullYear()}-${String(t.data.getMonth() + 1).padStart(2, "0")}`;
    const item = serieMap.get(key);
    if (!item) continue;
    if (t.tipo === "ENTRADA") item.entradas += Number(t.valor);
    else item.saidas += Number(t.valor);
  }

  const serieMensal = [...serieMap.values()].map((m) => ({
    ...m,
    entradas: Math.round(m.entradas * 100) / 100,
    saidas: Math.round(m.saidas * 100) / 100,
    lucro: Math.round((m.entradas - m.saidas) * 100) / 100,
  }));

  return {
    periodo,
    kpis: {
      receita: Math.round(receita * 100) / 100,
      despesa: Math.round(despesa * 100) / 100,
      lucro: Math.round(lucro * 100) / 100,
      custoManutencao: Math.round(custoManutencao * 100) / 100,
      ticketMedio: Math.round(ticketMedio * 100) / 100,
      taxaOcupacao: Math.round(taxaOcupacao * 100) / 100,
      inadimplencia: Math.round(inadimplencia * 100) / 100,
      parcelasAtrasadas: parcelasAtrasadas.length,
      valorAtrasado: Math.round(valorAtrasado * 100) / 100,
    },
    rankings: {
      topVeiculos: [...topVeiculosMap.values()]
        .sort((a, b) => b.receita - a.receita)
        .slice(0, 8),
      topClientes: [...topClientesMap.values()]
        .sort((a, b) => b.receita - a.receita)
        .slice(0, 8),
      categorias: [...categoriasMap.values()].sort((a, b) => b.total - a.total),
    },
    serieMensal,
  };
}
