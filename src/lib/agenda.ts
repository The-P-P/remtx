import {
  startOfMonth,
  endOfMonth,
  eachYearOfInterval,
  setYear,
  startOfDay,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import { prepararParcelasParaAgenda } from "@/lib/parcelas-juros";
import { calcularJurosParcela } from "@/lib/juros-parcela";
import type { TipoEventoAgenda } from "@/types/prisma";

export type ReferenciaAgenda = "parcela" | "evento" | "agenda";

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

  const [
    locacoes,
    parcelas,
    eventosManuais,
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
    const pago = !!p.dataPagamento;
    const dataExibicao = pago
      ? startOfDay(p.dataPagamento!)
      : startOfDay(p.dataVencimento);

    if (!dataNoIntervalo(dataExibicao, inicio, fim)) continue;

    const { diasAtraso, valorJuros } = pago
      ? { diasAtraso: 0, valorJuros: Number(p.valorJuros) }
      : calcularJurosParcela(
          valorBase,
          p.dataVencimento,
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
        valor: Number(p.valor),
        valorBase,
        valorJuros,
        diasAtraso,
        atrasado: !pago && diasAtraso > 0,
        concluido: pago,
        pagamentoAjustado: p.pagamentoAjustado,
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
