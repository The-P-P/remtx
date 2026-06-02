import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  max,
  min,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { parsePeriodoFinanceiro, type PeriodoFinanceiro } from "@/lib/financeiro-periodo";
import { FORMA_PAGAMENTO_LABEL } from "@/lib/constants/enums";
import type { FormaPagamento } from "@/types/prisma";
import type {
  RelatorioFiltros,
  RelatorioGeralData,
  RelatorioKpis,
  AlertaRelatorio,
} from "@/lib/relatorios-types";

export type { RelatorioFiltros } from "@/lib/relatorios-types";
export type { RelatorioGeralData } from "@/lib/relatorios-types";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function calcularPeriodoAnterior(periodo: PeriodoFinanceiro) {
  if (periodo.modo === "intervalo") {
    const dias = differenceInCalendarDays(periodo.fim, periodo.inicio) + 1;
    const fimAnt = subDays(periodo.inicio, 1);
    const inicioAnt = subDays(fimAnt, dias - 1);
    return {
      inicio: startOfDay(inicioAnt),
      fim: startOfDay(fimAnt),
      label: `${format(inicioAnt, "dd/MM/yyyy", { locale: ptBR })} – ${format(fimAnt, "dd/MM/yyyy", { locale: ptBR })}`,
    };
  }

  const ref = subMonths(periodo.inicio, 1);
  const inicio = startOfMonth(ref);
  const fim = endOfMonth(ref);
  return {
    inicio,
    fim,
    label: format(inicio, "MMMM yyyy", { locale: ptBR }),
  };
}

function pctVariacao(atual: number, anterior: number): number | null {
  if (anterior === 0) return atual === 0 ? 0 : null;
  return round2(((atual - anterior) / anterior) * 100);
}

type PeriodoRaw = {
  transacoes: Awaited<ReturnType<typeof fetchTransacoes>>;
  parcelasPagas: Awaited<ReturnType<typeof fetchParcelasPagas>>;
  parcelasVencidas: Awaited<ReturnType<typeof fetchParcelasVencidas>>;
  manutencoes: Awaited<ReturnType<typeof fetchManutencoes>>;
  locacoesSobrepostas: Awaited<ReturnType<typeof fetchLocacoesSobrepostas>>;
  locacoesFinalizadas: Awaited<ReturnType<typeof fetchLocacoesFinalizadas>>;
  totalVeiculosAtivos: number;
};

async function fetchTransacoes(
  inicio: Date,
  fim: Date,
  locadoraId: string
) {
  return prisma.transacaoFinanceira.findMany({
    where: {
      categoria: { locadoraId },
      data: { gte: inicio, lte: fim },
    },
    include: { categoria: { select: { nome: true, tipo: true } } },
  });
}

async function fetchParcelasPagas(
  inicio: Date,
  fim: Date,
  locadoraId: string
) {
  return prisma.parcelaLocacao.findMany({
    where: {
      dataPagamento: { gte: inicio, lte: fim },
      locacao: { locadoraId },
    },
    include: {
      locacao: {
        select: {
          id: true,
          cliente: { select: { id: true, nome: true } },
          veiculo: { select: { id: true, placa: true, marca: true, modelo: true } },
        },
      },
    },
  });
}

async function fetchParcelasVencidas(
  inicio: Date,
  fim: Date,
  locadoraId: string
) {
  return prisma.parcelaLocacao.findMany({
    where: {
      dataVencimento: { gte: inicio, lte: fim },
      locacao: { locadoraId },
    },
    include: {
      locacao: {
        select: {
          id: true,
          cliente: { select: { id: true, nome: true } },
          veiculo: { select: { id: true, placa: true } },
        },
      },
    },
  });
}

async function fetchManutencoes(
  inicio: Date,
  fim: Date,
  locadoraId: string
) {
  return prisma.manutencao.findMany({
    where: {
      dataRealizada: { gte: inicio, lte: fim },
      veiculo: { locadoraId },
    },
    include: {
      veiculo: { select: { id: true, placa: true, marca: true, modelo: true } },
      tipoManutencao: { select: { nome: true } },
    },
  });
}

async function fetchLocacoesSobrepostas(
  inicio: Date,
  fim: Date,
  locadoraId: string
) {
  return prisma.locacao.findMany({
    where: {
      locadoraId,
      dataInicio: { lte: fim },
      OR: [{ dataFimReal: null }, { dataFimReal: { gte: inicio } }],
    },
    select: {
      id: true,
      dataInicio: true,
      dataFimReal: true,
      veiculoId: true,
      clienteId: true,
    },
  });
}

async function fetchLocacoesFinalizadas(
  inicio: Date,
  fim: Date,
  locadoraId: string
) {
  return prisma.locacao.findMany({
    where: { locadoraId, dataFimReal: { gte: inicio, lte: fim } },
    select: {
      id: true,
      valorTotal: true,
      dataInicio: true,
      dataFimReal: true,
      clienteId: true,
    },
  });
}

async function fetchPeriodoRaw(
  inicio: Date,
  fim: Date,
  locadoraId: string
): Promise<PeriodoRaw> {
  const [
    transacoes,
    parcelasPagas,
    parcelasVencidas,
    manutencoes,
    locacoesSobrepostas,
    locacoesFinalizadas,
    totalVeiculosAtivos,
  ] = await Promise.all([
    fetchTransacoes(inicio, fim, locadoraId),
    fetchParcelasPagas(inicio, fim, locadoraId),
    fetchParcelasVencidas(inicio, fim, locadoraId),
    fetchManutencoes(inicio, fim, locadoraId),
    fetchLocacoesSobrepostas(inicio, fim, locadoraId),
    fetchLocacoesFinalizadas(inicio, fim, locadoraId),
    prisma.veiculo.count({
      where: { locadoraId, status: { not: "INATIVO" } },
    }),
  ]);

  return {
    transacoes,
    parcelasPagas,
    parcelasVencidas,
    manutencoes,
    locacoesSobrepostas,
    locacoesFinalizadas,
    totalVeiculosAtivos,
  };
}

function buildKpis(
  raw: PeriodoRaw,
  inicio: Date,
  fim: Date,
  refInadimplencia: Date
): RelatorioKpis {
  const receita = raw.transacoes
    .filter((t) => t.tipo === "ENTRADA")
    .reduce((s, t) => s + Number(t.valor), 0);
  const despesa = raw.transacoes
    .filter((t) => t.tipo === "SAIDA")
    .reduce((s, t) => s + Number(t.valor), 0);
  const receitaLocacao = raw.parcelasPagas.reduce((s, p) => s + Number(p.valor), 0);
  const custoManutencao = raw.manutencoes.reduce(
    (s, m) => s + Number(m.custo ?? 0),
    0
  );

  const ticketMedio =
    raw.locacoesFinalizadas.length > 0
      ? raw.locacoesFinalizadas.reduce((s, l) => s + Number(l.valorTotal ?? 0), 0) /
        raw.locacoesFinalizadas.length
      : 0;

  const diasPeriodo = differenceInCalendarDays(fim, inicio) + 1;
  const baseCapacidade = raw.totalVeiculosAtivos * Math.max(1, diasPeriodo);

  let diasLocados = 0;
  for (const loc of raw.locacoesSobrepostas) {
    const fimLoc = loc.dataFimReal ?? fim;
    const inicioRecorte = max([loc.dataInicio, inicio]);
    const fimRecorte = min([fimLoc, fim]);
    if (fimRecorte >= inicioRecorte) {
      diasLocados += differenceInCalendarDays(fimRecorte, inicioRecorte) + 1;
    }
  }
  const taxaOcupacao = baseCapacidade > 0 ? (diasLocados / baseCapacidade) * 100 : 0;

  const totalVencido = raw.parcelasVencidas.reduce((s, p) => s + Number(p.valor), 0);
  const parcelasAtrasadas = raw.parcelasVencidas.filter((p) => {
    if (p.dataVencimento > refInadimplencia) return false;
    return !p.dataPagamento || p.dataPagamento > refInadimplencia;
  });
  const valorAtrasado = parcelasAtrasadas.reduce((s, p) => s + Number(p.valor), 0);
  const inadimplencia = totalVencido > 0 ? (valorAtrasado / totalVencido) * 100 : 0;

  return {
    receita: round2(receita),
    despesa: round2(despesa),
    lucro: round2(receita - despesa),
    custoManutencao: round2(custoManutencao),
    receitaLocacao: round2(receitaLocacao),
    ticketMedio: round2(ticketMedio),
    taxaOcupacao: round2(taxaOcupacao),
    inadimplencia: round2(inadimplencia),
    parcelasAtrasadas: parcelasAtrasadas.length,
    valorAtrasado: round2(valorAtrasado),
  };
}

export async function getRelatorioGeral(
  filtros: RelatorioFiltros
): Promise<RelatorioGeralData> {
  const { locadoraId } = await requireTenant();
  const periodo = parsePeriodoFinanceiro(filtros);
  const { inicio, fim } = periodo;
  const periodoAnt = calcularPeriodoAnterior(periodo);
  const refInadimplencia = min([fim, startOfDay(new Date())]);
  const hoje = startOfDay(new Date());
  const previsaoFim = addDays(hoje, 30);

  const [
    rawAtual,
    rawAnt,
    transacoesSerie,
    veiculos,
    parcelasInadimplencia,
    parcelasPrevisao,
    saidasPrevisao,
    locacoesIniciadas,
    locacoesAtivasFim,
    financiamentoPagos,
    clientesComLocacao,
    todasLocacoesClientes,
  ] = await Promise.all([
    fetchPeriodoRaw(inicio, fim, locadoraId),
    fetchPeriodoRaw(periodoAnt.inicio, periodoAnt.fim, locadoraId),
    prisma.transacaoFinanceira.findMany({
      where: {
        categoria: { locadoraId },
        data: {
          gte: startOfMonth(subMonths(fim, 11)),
          lte: endOfMonth(fim),
        },
      },
      select: { data: true, tipo: true, valor: true },
    }),
    prisma.veiculo.findMany({
      where: { locadoraId, status: { not: "INATIVO" } },
      select: {
        id: true,
        placa: true,
        marca: true,
        modelo: true,
        status: true,
      },
    }),
    prisma.parcelaLocacao.findMany({
      where: {
        locacao: { locadoraId },
        dataVencimento: { lte: refInadimplencia },
        OR: [{ dataPagamento: null }, { dataPagamento: { gt: refInadimplencia } }],
      },
      include: {
        locacao: {
          select: {
            id: true,
            cliente: { select: { nome: true } },
            veiculo: { select: { placa: true } },
          },
        },
      },
      orderBy: { dataVencimento: "asc" },
      take: 50,
    }),
    prisma.parcelaLocacao.findMany({
      where: {
        locacao: { locadoraId },
        dataVencimento: { gte: hoje, lte: previsaoFim },
        dataPagamento: null,
      },
      include: {
        locacao: {
          select: {
            cliente: { select: { nome: true } },
            veiculo: { select: { placa: true } },
          },
        },
      },
      orderBy: { dataVencimento: "asc" },
    }),
    prisma.transacaoFinanceira.findMany({
      where: {
        categoria: { locadoraId },
        tipo: "SAIDA",
        data: { gte: hoje, lte: previsaoFim },
      },
      select: { id: true, descricao: true, valor: true, data: true },
      orderBy: { data: "asc" },
    }),
    prisma.locacao.count({
      where: { locadoraId, dataInicio: { gte: inicio, lte: fim } },
    }),
    prisma.locacao.count({
      where: {
        locadoraId,
        status: { in: ["ATIVA", "RESERVADA"] },
        dataInicio: { lte: fim },
      },
    }),
    prisma.transacaoFinanceira.findMany({
      where: {
        categoria: { locadoraId },
        tipo: "SAIDA",
        data: { gte: inicio, lte: fim },
        parcelaFinanciamentoId: { not: null },
      },
      select: { valor: true, parcelaFinanciamento: { select: { financiamento: { select: { veiculoId: true } } } } },
    }),
    prisma.locacao.findMany({
      where: {
        locadoraId,
        dataInicio: { lte: fim },
        OR: [{ dataFimReal: null }, { dataFimReal: { gte: inicio } }],
      },
      select: { clienteId: true, dataInicio: true },
    }),
    prisma.locacao.findMany({
      where: { locadoraId },
      select: { clienteId: true, dataInicio: true },
      orderBy: { dataInicio: "asc" },
    }),
  ]);

  const kpis = buildKpis(rawAtual, inicio, fim, refInadimplencia);
  const kpisAnt = buildKpis(rawAnt, periodoAnt.inicio, periodoAnt.fim, periodoAnt.fim);

  const comparativo = {
    receita: pctVariacao(kpis.receita, kpisAnt.receita),
    despesa: pctVariacao(kpis.despesa, kpisAnt.despesa),
    lucro: pctVariacao(kpis.lucro, kpisAnt.lucro),
    taxaOcupacao: round2(kpis.taxaOcupacao - kpisAnt.taxaOcupacao),
    inadimplencia: round2(kpis.inadimplencia - kpisAnt.inadimplencia),
  };

  const topVeiculosMap = new Map<string, { veiculoId: string; placa: string; modelo: string; receita: number; qtd: number }>();
  for (const p of rawAtual.parcelasPagas) {
    const key = p.locacao.veiculo.id;
    const atual = topVeiculosMap.get(key) ?? {
      veiculoId: key,
      placa: p.locacao.veiculo.placa,
      modelo: `${p.locacao.veiculo.marca} ${p.locacao.veiculo.modelo}`,
      receita: 0,
      qtd: 0,
    };
    atual.receita += Number(p.valor);
    atual.qtd += 1;
    topVeiculosMap.set(key, atual);
  }

  const topClientesMap = new Map<string, { clienteId: string; nome: string; receita: number; qtd: number }>();
  for (const p of rawAtual.parcelasPagas) {
    const key = p.locacao.cliente.id;
    const atual = topClientesMap.get(key) ?? {
      clienteId: key,
      nome: p.locacao.cliente.nome,
      receita: 0,
      qtd: 0,
    };
    atual.receita += Number(p.valor);
    atual.qtd += 1;
    topClientesMap.set(key, atual);
  }

  const categoriasMap = new Map<string, { nome: string; tipo: "ENTRADA" | "SAIDA"; total: number }>();
  for (const t of rawAtual.transacoes) {
    const key = `${t.categoria.tipo}:${t.categoria.nome}`;
    const atual = categoriasMap.get(key) ?? {
      nome: t.categoria.nome,
      tipo: t.categoria.tipo,
      total: 0,
    };
    atual.total += Number(t.valor);
    categoriasMap.set(key, atual);
  }

  const serieMap = new Map<string, { ano: number; mes: number; entradas: number; saidas: number; lucro: number }>();
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
    entradas: round2(m.entradas),
    saidas: round2(m.saidas),
    lucro: round2(m.entradas - m.saidas),
  }));

  const diasPeriodo = differenceInCalendarDays(fim, inicio) + 1;
  const finPorVeiculo = new Map<string, number>();
  for (const t of financiamentoPagos) {
    const vid = t.parcelaFinanciamento?.financiamento?.veiculoId;
    if (!vid) continue;
    finPorVeiculo.set(vid, (finPorVeiculo.get(vid) ?? 0) + Number(t.valor));
  }

  const frota = veiculos.map((v) => {
    const receita = rawAtual.parcelasPagas
      .filter((p) => p.locacao.veiculo.id === v.id)
      .reduce((s, p) => s + Number(p.valor), 0);
    const custoManutencao = rawAtual.manutencoes
      .filter((m) => m.veiculo.id === v.id)
      .reduce((s, m) => s + Number(m.custo ?? 0), 0);
    const custoFinanciamento = finPorVeiculo.get(v.id) ?? 0;

    let diasLocados = 0;
    let qtdLocacoes = 0;
    for (const loc of rawAtual.locacoesSobrepostas) {
      if (loc.veiculoId !== v.id) continue;
      qtdLocacoes += 1;
      const fimLoc = loc.dataFimReal ?? fim;
      const inicioRecorte = max([loc.dataInicio, inicio]);
      const fimRecorte = min([fimLoc, fim]);
      if (fimRecorte >= inicioRecorte) {
        diasLocados += differenceInCalendarDays(fimRecorte, inicioRecorte) + 1;
      }
    }

    const diasParados = Math.max(0, diasPeriodo - diasLocados);
    const taxaOcupacaoVeiculo =
      diasPeriodo > 0 ? round2((diasLocados / diasPeriodo) * 100) : 0;
    const lucro = round2(receita - custoManutencao - custoFinanciamento);

    return {
      veiculoId: v.id,
      placa: v.placa,
      modelo: `${v.marca} ${v.modelo}`,
      status: v.status,
      diasLocados,
      diasParados,
      taxaOcupacao: taxaOcupacaoVeiculo,
      receita: round2(receita),
      custoManutencao: round2(custoManutencao),
      custoFinanciamento: round2(custoFinanciamento),
      lucro,
      qtdLocacoes,
    };
  }).sort((a, b) => b.lucro - a.lucro);

  const inadimplencia = parcelasInadimplencia.map((p) => ({
    parcelaId: p.id,
    locacaoId: p.locacao.id,
    clienteNome: p.locacao.cliente.nome,
    veiculoPlaca: p.locacao.veiculo.placa,
    valor: round2(Number(p.valor)),
    dataVencimento: p.dataVencimento.toISOString(),
    diasAtraso: Math.max(
      0,
      differenceInCalendarDays(refInadimplencia, p.dataVencimento)
    ),
  }));

  const formasMap = new Map<FormaPagamento, { total: number; qtd: number }>();
  for (const t of rawAtual.transacoes) {
    if (!t.formaPagamento) continue;
    const atual = formasMap.get(t.formaPagamento) ?? { total: 0, qtd: 0 };
    atual.total += Number(t.valor);
    atual.qtd += 1;
    formasMap.set(t.formaPagamento, atual);
  }
  const formasPagamento = [...formasMap.entries()]
    .map(([forma, d]) => ({
      forma,
      label: FORMA_PAGAMENTO_LABEL[forma],
      total: round2(d.total),
      qtd: d.qtd,
    }))
    .sort((a, b) => b.total - a.total);

  const manutMap = new Map<string, { qtd: number; custo: number }>();
  for (const m of rawAtual.manutencoes) {
    const tipo = m.tipoManutencao.nome;
    const atual = manutMap.get(tipo) ?? { qtd: 0, custo: 0 };
    atual.qtd += 1;
    atual.custo += Number(m.custo ?? 0);
    manutMap.set(tipo, atual);
  }
  const manutencaoPorTipo = [...manutMap.entries()]
    .map(([tipo, d]) => ({ tipo, qtd: d.qtd, custo: round2(d.custo) }))
    .sort((a, b) => b.custo - a.custo);

  const previsaoItens = [
    ...parcelasPrevisao.map((p) => ({
      id: p.id,
      tipo: "parcela" as const,
      descricao: `${p.locacao.cliente.nome} · ${p.locacao.veiculo.placa}`,
      valor: round2(Number(p.valor)),
      data: p.dataVencimento.toISOString(),
    })),
    ...saidasPrevisao.map((t) => ({
      id: t.id,
      tipo: "saida" as const,
      descricao: t.descricao,
      valor: round2(Number(t.valor)),
      data: t.data.toISOString(),
    })),
  ].sort((a, b) => a.data.localeCompare(b.data));

  const entradasPrevistas = round2(
    parcelasPrevisao.reduce((s, p) => s + Number(p.valor), 0)
  );
  const saidasPrevistas = round2(
    saidasPrevisao.reduce((s, t) => s + Number(t.valor), 0)
  );

  let diasMedioLocacao = 0;
  if (rawAtual.locacoesFinalizadas.length > 0) {
    const totalDias = rawAtual.locacoesFinalizadas.reduce((s, l) => {
      if (!l.dataFimReal) return s;
      return s + differenceInCalendarDays(l.dataFimReal, l.dataInicio) + 1;
    }, 0);
    diasMedioLocacao = round2(totalDias / rawAtual.locacoesFinalizadas.length);
  }

  const primeiroLocacao = new Map<string, Date>();
  for (const loc of todasLocacoesClientes) {
    if (!primeiroLocacao.has(loc.clienteId)) {
      primeiroLocacao.set(loc.clienteId, loc.dataInicio);
    }
  }

  const clientesNoPeriodo = new Set(
    clientesComLocacao.map((l) => l.clienteId)
  );
  let novos = 0;
  let recorrentes = 0;
  for (const cid of clientesNoPeriodo) {
    const primeira = primeiroLocacao.get(cid);
    if (primeira && primeira >= inicio && primeira <= fim) novos += 1;
    else recorrentes += 1;
  }

  const alertas: AlertaRelatorio[] = [];
  if (kpis.lucro < 0) {
    alertas.push({
      nivel: "danger",
      titulo: "Lucro negativo no período",
      descricao: `Prejuízo de R$ ${Math.abs(kpis.lucro).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`,
    });
  }
  if (kpis.inadimplencia > 15) {
    alertas.push({
      nivel: "warning",
      titulo: "Inadimplência elevada",
      descricao: `${kpis.inadimplencia.toFixed(1)}% das parcelas vencidas no período estão em atraso.`,
    });
  }
  if (kpis.taxaOcupacao < 35) {
    alertas.push({
      nivel: "warning",
      titulo: "Taxa de ocupação baixa",
      descricao: `A frota ficou ${kpis.taxaOcupacao.toFixed(1)}% ocupada no período.`,
    });
  }
  const veiculosParados = frota.filter((v) => v.diasLocados === 0);
  if (veiculosParados.length > 0) {
    alertas.push({
      nivel: "info",
      titulo: `${veiculosParados.length} veículo(s) sem locação`,
      descricao: veiculosParados.map((v) => v.placa).join(", "),
    });
  }
  if (inadimplencia.length > 0) {
    alertas.push({
      nivel: "warning",
      titulo: `${inadimplencia.length} parcela(s) em atraso`,
      descricao: `Total em aberto: R$ ${inadimplencia.reduce((s, i) => s + i.valor, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`,
    });
  }

  return {
    periodo,
    periodoAnterior: {
      inicio: periodoAnt.inicio.toISOString(),
      fim: periodoAnt.fim.toISOString(),
      label: periodoAnt.label,
    },
    kpis,
    comparativo,
    rankings: {
      topVeiculos: [...topVeiculosMap.values()]
        .sort((a, b) => b.receita - a.receita)
        .slice(0, 10),
      topClientes: [...topClientesMap.values()]
        .sort((a, b) => b.receita - a.receita)
        .slice(0, 10),
      categorias: [...categoriasMap.values()].sort((a, b) => b.total - a.total),
    },
    serieMensal,
    frota,
    inadimplencia,
    formasPagamento,
    manutencaoPorTipo,
    previsao: {
      entradasPrevistas,
      saidasPrevistas,
      saldoPrevisto: round2(entradasPrevistas - saidasPrevistas),
      itens: previsaoItens,
    },
    operacao: {
      locacoesIniciadas,
      locacoesFinalizadas: rawAtual.locacoesFinalizadas.length,
      locacoesAtivasNoFim: locacoesAtivasFim,
      diasMedioLocacao,
    },
    clientes: {
      novos,
      recorrentes,
      totalComLocacao: clientesNoPeriodo.size,
    },
    alertas,
  };
}
