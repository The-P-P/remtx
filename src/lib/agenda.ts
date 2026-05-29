import {
  startOfMonth,
  endOfMonth,
  eachYearOfInterval,
  setYear,
  startOfDay,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import { prepararParcelasParaAgenda } from "@/lib/parcelas-juros";
import { nomeDiaSemana } from "@/lib/parcelas-semanais";
import { calcularJurosParcela } from "@/lib/juros-parcela";
import type { TipoEventoAgenda } from "@/types/prisma";

export type ReferenciaAgenda =
  | "parcela"
  | "evento"
  | "agenda"
  | "financiamento"
  | "transacao"
  | "manutencao";

export type AgendaEvento = {
  id: string;
  chave: string;
  referenciaTipo: ReferenciaAgenda;
  referenciaId: string;
  titulo: string;
  descricao?: string | null;
  dataInicio: Date;
  dataFim?: Date | null;
  tipo: TipoEventoAgenda;
  href?: string;
  meta?: {
    placa?: string;
    clienteNome?: string;
    veiculoId?: string;
    clienteId?: string;
    valor?: number;
    valorBase?: number;
    valorJuros?: number;
    diasAtraso?: number;
    atrasado?: boolean;
    concluido?: boolean;
    pagamentoAjustado?: boolean;
    dataVencimentoContrato?: Date;
    diaSemanaContrato?: string;
    pagamentoReagendado?: boolean;
    parcelaNumero?: number;
    totalParcelas?: number;
  };
};

function locacaoEventId(locacaoId: string, suffix: string) {
  return `loc-${locacaoId}-${suffix}`;
}

function ipvaEventId(veiculoId: string, year: number) {
  return `ipva-${veiculoId}-${year}`;
}

function dataNoIntervalo(data: Date, inicio: Date, fim: Date) {
  const d = startOfDay(data);
  return d >= startOfDay(inicio) && d <= startOfDay(fim);
}

function expandIpvaNoPeriodo(
  veiculo: {
    id: string;
    placa: string;
    marca: string;
    modelo: string;
    ipvaVencimento: Date;
  },
  inicio: Date,
  fim: Date,
  conclusaoMap: Map<string, { concluida: boolean; reagendadaPara: Date | null }>
): AgendaEvento[] {
  const eventos: AgendaEvento[] = [];
  const base = veiculo.ipvaVencimento;
  const years = eachYearOfInterval({ start: inicio, end: fim }).map((d) =>
    d.getFullYear()
  );

  for (const year of years) {
    const dataOriginal = setYear(base, year);
    const chave = ipvaEventId(veiculo.id, year);
    const conclusao = conclusaoMap.get(chave);
    const dataExibicao = conclusao?.reagendadaPara ?? dataOriginal;

    if (!dataNoIntervalo(dataExibicao, inicio, fim)) continue;

    eventos.push({
      id: chave,
      chave,
      referenciaTipo: "agenda",
      referenciaId: veiculo.id,
      titulo: `IPVA — ${veiculo.placa}`,
      descricao: `${veiculo.marca} ${veiculo.modelo}`,
      dataInicio: dataExibicao,
      tipo: "IPVA",
      href: `/veiculos/${veiculo.id}`,
      meta: {
        placa: veiculo.placa,
        concluido: conclusao?.concluida ?? false,
      },
    });
  }

  return eventos;
}

function emitirEventoLocacao(
  l: {
    id: string;
    dataInicio: Date;
    dataFimPrevista: Date | null;
    dataFimReal: Date | null;
    veiculo: { placa: string; modelo: string };
    cliente: { nome: string };
  },
  suffix: "inicio" | "fim-prev" | "fim-real",
  dataOriginal: Date,
  tipo: TipoEventoAgenda,
  titulo: string,
  inicio: Date,
  fim: Date,
  conclusaoMap: Map<string, { concluida: boolean; reagendadaPara: Date | null }>
): AgendaEvento | null {
  const chave = locacaoEventId(l.id, suffix);
  const conclusao = conclusaoMap.get(chave);
  const dataExibicao = conclusao?.reagendadaPara ?? dataOriginal;

  if (!dataNoIntervalo(dataExibicao, inicio, fim)) return null;

  return {
    id: chave,
    chave,
    referenciaTipo: "agenda",
    referenciaId: l.id,
    titulo,
    descricao: l.cliente.nome,
    dataInicio: dataExibicao,
    tipo,
    href: `/locacoes/${l.id}`,
    meta: {
      placa: l.veiculo.placa,
      clienteNome: l.cliente.nome,
      concluido: conclusao?.concluida ?? false,
    },
  };
}

export async function getEventosAgenda(
  inicio: Date,
  fim: Date
): Promise<AgendaEvento[]> {
  await prepararParcelasParaAgenda();

  const conclusoesManutencaoReagendadas =
    await prisma.conclusaoAgenda.findMany({
      where: {
        chave: { startsWith: "manutencao-" },
        reagendadaPara: { gte: inicio, lte: fim },
      },
    });
  const manutencaoIdsReagendadas = conclusoesManutencaoReagendadas.map((c) =>
    c.chave.slice("manutencao-".length)
  );

  const [
    locacoes,
    parcelas,
    parcelasFinanciamento,
    eventosManuais,
    transacoesManuais,
    manutencoes,
    veiculosComIpva,
    conclusoes,
  ] = await Promise.all([
    prisma.locacao.findMany({
      where: { status: { not: "CANCELADA" } },
      include: {
        veiculo: { select: { placa: true, modelo: true } },
        cliente: { select: { nome: true } },
      },
    }),
    prisma.parcelaLocacao.findMany({
      where: {
        OR: [
          { dataVencimento: { gte: inicio, lte: fim } },
          { dataPagamento: { gte: inicio, lte: fim } },
        ],
      },
      include: {
        locacao: {
          include: {
            veiculo: { select: { placa: true } },
            cliente: { select: { nome: true, id: true } },
          },
        },
      },
    }),
    prisma.parcelaFinanciamento.findMany({
      where: {
        financiamento: { ativo: true },
        OR: [
          { dataVencimento: { gte: inicio, lte: fim } },
          { dataPagamento: { gte: inicio, lte: fim } },
        ],
      },
      include: {
        financiamento: {
          include: {
            veiculo: {
              select: { id: true, placa: true, apelido: true, marca: true, modelo: true },
            },
          },
        },
      },
    }),
    prisma.eventoAgenda.findMany({
      where: {
        dataInicio: { lte: fim },
        OR: [{ dataFim: null }, { dataFim: { gte: inicio } }],
      },
      include: {
        veiculo: { select: { placa: true } },
        cliente: { select: { nome: true } },
      },
    }),
    prisma.transacaoFinanceira.findMany({
      where: {
        data: { gte: inicio, lte: fim },
        parcelaId: null,
        manutencaoId: null,
        parcelaFinanciamentoId: null,
      },
      include: {
        categoria: { select: { nome: true } },
        locacao: {
          select: {
            id: true,
            veiculo: { select: { placa: true } },
            cliente: { select: { nome: true, id: true } },
          },
        },
      },
    }),
    prisma.manutencao.findMany({
      where: {
        OR: [
          { dataRealizada: { gte: inicio, lte: fim } },
          ...(manutencaoIdsReagendadas.length > 0
            ? [{ id: { in: manutencaoIdsReagendadas } }]
            : []),
        ],
      },
      include: {
        veiculo: {
          select: { id: true, placa: true, marca: true, modelo: true },
        },
        tipoManutencao: { select: { nome: true } },
      },
    }),
    prisma.veiculo.findMany({
      where: {
        ipvaVencimento: { not: null },
        status: { not: "INATIVO" },
      },
      select: {
        id: true,
        placa: true,
        marca: true,
        modelo: true,
        ipvaVencimento: true,
      },
    }),
    prisma.conclusaoAgenda.findMany({
      where: {
        OR: [
          { dataPrevista: { lte: fim, gte: inicio } },
          { reagendadaPara: { lte: fim, gte: inicio } },
        ],
      },
    }),
  ]);

  const conclusaoMap = new Map(
    conclusoes.map((c) => [
      c.chave,
      { concluida: c.concluida, reagendadaPara: c.reagendadaPara },
    ])
  );

  if (manutencoes.length > 0) {
    const conclusoesManutencao = await prisma.conclusaoAgenda.findMany({
      where: {
        chave: { in: manutencoes.map((m) => `manutencao-${m.id}`) },
      },
    });
    for (const c of conclusoesManutencao) {
      conclusaoMap.set(c.chave, {
        concluida: c.concluida,
        reagendadaPara: c.reagendadaPara,
      });
    }
  }

  const eventos: AgendaEvento[] = [];
  const hoje = new Date();

  for (const l of locacoes) {
    const evInicio = emitirEventoLocacao(
      l,
      "inicio",
      l.dataInicio,
      "LOCACAO_INICIO",
      `Retirada — ${l.veiculo.placa}`,
      inicio,
      fim,
      conclusaoMap
    );
    if (evInicio) eventos.push(evInicio);

    if (l.dataFimPrevista) {
      const evFimPrev = emitirEventoLocacao(
        l,
        "fim-prev",
        l.dataFimPrevista,
        "LOCACAO_FIM_PREVISTO",
        `Devolução prevista — ${l.veiculo.placa}`,
        inicio,
        fim,
        conclusaoMap
      );
      if (evFimPrev) eventos.push(evFimPrev);
    }

    if (l.dataFimReal) {
      const evFimReal = emitirEventoLocacao(
        l,
        "fim-real",
        l.dataFimReal,
        "LOCACAO_FIM_REAL",
        `Devolução — ${l.veiculo.placa}`,
        inicio,
        fim,
        conclusaoMap
      );
      if (evFimReal) eventos.push(evFimReal);
    }
  }

  for (const p of parcelas) {
    const valorBase = Number(p.valorBase ?? p.valor);
    const valorJuros = Number(p.valorJuros);
    const valor = Number(p.valor);
    const pago = !!p.dataPagamento;
    const dataExibicao = pago
      ? startOfDay(p.dataPagamento!)
      : startOfDay(p.dataVencimento);

    if (!dataNoIntervalo(dataExibicao, inicio, fim)) continue;

    const vencimentoContrato = startOfDay(
      p.dataVencimentoOriginal ?? p.dataVencimento
    );
    const vencimentoPagamento = startOfDay(p.dataVencimento);
    const pagamentoReagendado =
      vencimentoContrato.getTime() !== vencimentoPagamento.getTime();

    const { diasAtraso } = pago
      ? { diasAtraso: 0 }
      : calcularJurosParcela(
          valorBase,
          vencimentoPagamento,
          hoje,
          p.isentarJuros
        );

    eventos.push({
      id: `parcela-${p.id}`,
      chave: `parcela-${p.id}`,
      referenciaTipo: "parcela",
      referenciaId: p.id,
      titulo: `Pagamento — ${p.locacao.cliente.nome}`,
      descricao: p.locacao.veiculo.placa,
      dataInicio: dataExibicao,
      tipo: "PAGAMENTO_CLIENTE",
      href: `/locacoes/${p.locacaoId}`,
      meta: {
        placa: p.locacao.veiculo.placa,
        clienteNome: p.locacao.cliente.nome,
        valor,
        valorBase,
        valorJuros,
        diasAtraso,
        atrasado: !pago && diasAtraso > 0,
        concluido: pago,
        pagamentoAjustado: p.pagamentoAjustado,
        dataVencimentoContrato: vencimentoContrato,
        diaSemanaContrato: nomeDiaSemana(vencimentoContrato),
        pagamentoReagendado,
      },
    });
  }

  for (const p of parcelasFinanciamento) {
    const pago = !!p.dataPagamento;
    const dataExibicao = pago
      ? startOfDay(p.dataPagamento!)
      : startOfDay(p.dataVencimento);

    if (!dataNoIntervalo(dataExibicao, inicio, fim)) continue;

    const v = p.financiamento.veiculo;
    const labelVeiculo = v.apelido
      ? `${v.apelido} (${v.placa})`
      : `${v.placa} — ${v.marca} ${v.modelo}`;
    const atrasado =
      !pago && startOfDay(p.dataVencimento) < startOfDay(hoje);

    eventos.push({
      id: `financiamento-${p.id}`,
      chave: `financiamento-${p.id}`,
      referenciaTipo: "financiamento",
      referenciaId: p.id,
      titulo: `Financiamento — ${labelVeiculo}`,
      descricao: [
        p.financiamento.instituicao,
        `Parcela ${p.numero}/${p.financiamento.totalParcelas}`,
      ]
        .filter(Boolean)
        .join(" · "),
      dataInicio: dataExibicao,
      tipo: "FINANCIAMENTO_VEICULO",
      href: `/veiculos/${v.id}`,
      meta: {
        placa: v.placa,
        veiculoId: v.id,
        valor: Number(p.valor),
        atrasado,
        concluido: pago,
        parcelaNumero: p.numero,
        totalParcelas: p.financiamento.totalParcelas,
      },
    });
  }

  for (const e of eventosManuais) {
    const dataExibicao = startOfDay(e.dataInicio);
    if (!dataNoIntervalo(dataExibicao, inicio, fim)) continue;

    eventos.push({
      id: e.id,
      chave: e.id,
      referenciaTipo: "evento",
      referenciaId: e.id,
      titulo: e.titulo,
      descricao: e.descricao,
      dataInicio: dataExibicao,
      dataFim: e.dataFim ? startOfDay(e.dataFim) : null,
      tipo: e.tipo,
      href: e.locacaoId
        ? `/locacoes/${e.locacaoId}`
        : e.veiculoId
          ? `/veiculos/${e.veiculoId}`
          : e.clienteId
            ? `/clientes/${e.clienteId}`
            : undefined,
      meta: {
        placa: e.veiculo?.placa,
        clienteNome: e.cliente?.nome,
        veiculoId: e.veiculoId ?? undefined,
        clienteId: e.clienteId ?? undefined,
        valor: e.valor ? Number(e.valor) : undefined,
        concluido: e.concluido,
      },
    });
  }

  for (const t of transacoesManuais) {
    const dataExibicao = startOfDay(t.data);
    if (!dataNoIntervalo(dataExibicao, inicio, fim)) continue;

    const prefixo = t.tipo === "ENTRADA" ? "Entrada" : "Saída";
    const extras = [
      t.categoria.nome,
      t.locacao?.veiculo.placa,
      t.locacao?.cliente.nome,
    ].filter(Boolean);

    eventos.push({
      id: `transacao-${t.id}`,
      chave: `transacao-${t.id}`,
      referenciaTipo: "transacao",
      referenciaId: t.id,
      titulo: `${prefixo} — ${t.descricao}`,
      descricao: extras.length > 0 ? extras.join(" · ") : null,
      dataInicio: dataExibicao,
      tipo: "FINANCEIRO",
      href: `/financeiro/${t.id}/editar`,
      meta: {
        valor: Number(t.valor),
        placa: t.locacao?.veiculo.placa,
        clienteNome: t.locacao?.cliente.nome,
        clienteId: t.locacao?.cliente.id,
        concluido: true,
      },
    });
  }

  for (const m of manutencoes) {
    const chave = `manutencao-${m.id}`;
    const conclusao = conclusaoMap.get(chave);
    const dataExibicao = startOfDay(
      conclusao?.reagendadaPara ?? m.dataRealizada
    );
    if (!dataNoIntervalo(dataExibicao, inicio, fim)) continue;

    eventos.push({
      id: chave,
      chave,
      referenciaTipo: "manutencao",
      referenciaId: m.id,
      titulo: `${m.tipoManutencao.nome} — ${m.veiculo.placa}`,
      descricao: [
        `${m.veiculo.marca} ${m.veiculo.modelo}`,
        `${m.kmRealizada.toLocaleString("pt-BR")} km`,
        m.kmProxima
          ? `Próxima: ${m.kmProxima.toLocaleString("pt-BR")} km`
          : null,
      ]
        .filter(Boolean)
        .join(" · "),
      dataInicio: dataExibicao,
      tipo: "MANUTENCAO_AGENDADA",
      href: `/manutencoes/${m.id}/editar`,
      meta: {
        placa: m.veiculo.placa,
        veiculoId: m.veiculo.id,
        valor: m.custo ? Number(m.custo) : undefined,
        concluido: conclusao?.concluida ?? false,
      },
    });
  }

  for (const v of veiculosComIpva) {
    if (!v.ipvaVencimento) continue;
    eventos.push(
      ...expandIpvaNoPeriodo(
        {
          id: v.id,
          placa: v.placa,
          marca: v.marca,
          modelo: v.modelo,
          ipvaVencimento: v.ipvaVencimento,
        },
        inicio,
        fim,
        conclusaoMap
      )
    );
  }

  return eventos.sort(
    (a, b) => a.dataInicio.getTime() - b.dataInicio.getTime()
  );
}

export async function getEventosAgendaMes(ano: number, mes: number) {
  const inicio = startOfMonth(new Date(ano, mes - 1, 1));
  const fim = endOfMonth(inicio);
  return getEventosAgenda(inicio, fim);
}
