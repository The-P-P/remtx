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
import { dateKey, parseDateInput } from "@/lib/utils";
import {
  calcularEncargosParcela,
  descricaoEncargosContrato,
} from "@/lib/juros-parcela";
import type { TipoEventoAgenda } from "@/types/prisma";

export type ReferenciaAgenda =
  | "parcela"
  | "evento"
  | "agenda"
  | "financiamento"
  | "transacao"
  | "manutencao"
  | "locacao";

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
    locacaoId?: string;
    valor?: number;
    valorCaucao?: number;
    totalRetirada?: number;
    valorBase?: number;
    valorJuros?: number;
    valorMulta?: number;
    valorJurosDiarios?: number;
    modeloEncargos?: "PADRAO" | "PLANO_CONQUISTA";
    encargosContrato?: string;
    diasAtraso?: number;
    atrasado?: boolean;
    concluido?: boolean;
    pagamentoAjustado?: boolean;
    dataVencimentoContrato?: Date;
    diaSemanaContrato?: string;
    pagamentoReagendado?: boolean;
    parcelaNumero?: number;
    totalParcelas?: number;
    dataPagamento?: Date;
    ePrimeiraSemanaRetirada?: boolean;
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
      locacaoId: l.id,
      concluido: conclusao?.concluida ?? false,
    },
  };
}

export async function getEventosAgenda(
  inicio: Date,
  fim: Date,
  locadoraId: string
): Promise<AgendaEvento[]> {
  await prepararParcelasParaAgenda(locadoraId);

  const conclusoesManutencaoReagendadas =
    await prisma.conclusaoAgenda.findMany({
      where: {
        locadoraId,
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
      where: { locadoraId, status: { not: "CANCELADA" } },
      include: {
        veiculo: { select: { placa: true, modelo: true } },
        cliente: { select: { nome: true } },
      },
    }),
    prisma.parcelaLocacao.findMany({
      where: {
        locacao: { locadoraId },
        OR: [
          { dataVencimento: { gte: inicio, lte: fim } },
          { dataPagamento: { gte: inicio, lte: fim } },
        ],
      },
      include: {
        locacao: {
          select: {
            id: true,
            dataInicio: true,
            valorCaucao: true,
            caucaoPaga: true,
            periodicidadePagamento: true,
            modeloContrato: true,
            veiculo: { select: { placa: true } },
            cliente: { select: { nome: true, id: true } },
          },
        },
      },
    }),
    prisma.parcelaFinanciamento.findMany({
      where: {
        financiamento: { ativo: true, veiculo: { locadoraId } },
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
        locadoraId,
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
        categoria: { locadoraId },
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
        veiculo: { locadoraId },
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
        locadoraId,
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
        locadoraId,
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
        locadoraId,
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
    const dataInicioLoc = parseDateInput(l.dataInicio);
    const dataFimPrevistaLoc = l.dataFimPrevista
      ? parseDateInput(l.dataFimPrevista)
      : null;
    const dataFimRealLoc = l.dataFimReal
      ? parseDateInput(l.dataFimReal)
      : null;

    const evInicio = emitirEventoLocacao(
      l,
      "inicio",
      dataInicioLoc,
      "LOCACAO_INICIO",
      `Retirada — ${l.veiculo.placa}`,
      inicio,
      fim,
      conclusaoMap
    );
    if (evInicio) eventos.push(evInicio);

    const valorCaucaoLoc = Number(l.valorCaucao);
    if (
      valorCaucaoLoc > 0 &&
      !l.caucaoPaga &&
      ["RESERVADA", "ATIVA"].includes(l.status) &&
      dataNoIntervalo(dataInicioLoc, inicio, fim)
    ) {
      eventos.push({
        id: `caucao-${l.id}`,
        chave: `caucao-${l.id}`,
        referenciaTipo: "locacao",
        referenciaId: l.id,
        titulo: `Caução — ${l.cliente.nome}`,
        descricao: `${l.veiculo.placa} · depósito reembolsável na devolução`,
        dataInicio: dataInicioLoc,
        tipo: "CAUCAO_LOCACAO",
        href: `/locacoes/${l.id}`,
        meta: {
          placa: l.veiculo.placa,
          clienteNome: l.cliente.nome,
          locacaoId: l.id,
          valor: valorCaucaoLoc,
          concluido: l.caucaoPaga,
          dataPagamento: l.caucaoDataPagamento
            ? parseDateInput(l.caucaoDataPagamento)
            : undefined,
        },
      });
    }

    if (dataFimPrevistaLoc) {
      const evFimPrev = emitirEventoLocacao(
        l,
        "fim-prev",
        dataFimPrevistaLoc,
        "LOCACAO_FIM_PREVISTO",
        `Devolução prevista — ${l.veiculo.placa}`,
        inicio,
        fim,
        conclusaoMap
      );
      if (evFimPrev) eventos.push(evFimPrev);
    }

    if (dataFimRealLoc) {
      const evFimReal = emitirEventoLocacao(
        l,
        "fim-real",
        dataFimRealLoc,
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
    // Mantém o evento no dia do vencimento na agenda (evita sumir ao confirmar pagamento).
    const dataExibicao = parseDateInput(p.dataVencimento);

    if (!dataNoIntervalo(dataExibicao, inicio, fim)) continue;

    const vencimentoContrato = parseDateInput(
      p.dataVencimentoOriginal ?? p.dataVencimento
    );
    const vencimentoPagamento = parseDateInput(p.dataVencimento);
    const pagamentoReagendado =
      vencimentoContrato.getTime() !== vencimentoPagamento.getTime();

    const encargosOpts = {
      modeloContrato: p.locacao.modeloContrato,
      periodicidadePagamento: p.locacao.periodicidadePagamento,
    };
    const encargos = pago
      ? null
      : calcularEncargosParcela(
          valorBase,
          vencimentoPagamento,
          hoje,
          p.isentarJuros,
          encargosOpts
        );
    const diasAtraso = encargos?.diasAtraso ?? 0;

    const isMensal = p.locacao.periodicidadePagamento === "MENSAL";
    const isPlano = p.locacao.modeloContrato === "PLANO_CONQUISTA";
    const dataInicioLocacao = parseDateInput(p.locacao.dataInicio);
    const ePrimeiraSemanaRetirada =
      !isMensal &&
      !pago &&
      Number(p.locacao.valorCaucao) > 0 &&
      !p.locacao.caucaoPaga &&
      dateKey(dataExibicao) === dateKey(dataInicioLocacao);

    const tituloPagamento = ePrimeiraSemanaRetirada
      ? `1ª semana — ${p.locacao.cliente.nome}`
      : isMensal
        ? `Mensalidade${isPlano ? " Conquista" : ""} — ${p.locacao.cliente.nome}`
        : `Pagamento — ${p.locacao.cliente.nome}`;

    eventos.push({
      id: `parcela-${p.id}`,
      chave: `parcela-${p.id}`,
      referenciaTipo: "parcela",
      referenciaId: p.id,
      titulo: tituloPagamento,
      descricao: ePrimeiraSemanaRetirada
        ? `${p.locacao.veiculo.placa} · caução é item separado no mesmo dia`
        : isMensal
          ? `${p.locacao.veiculo.placa} · vence dia 5`
          : p.locacao.veiculo.placa,
      dataInicio: dataExibicao,
      tipo: "PAGAMENTO_CLIENTE",
      href: `/locacoes/${p.locacaoId}`,
      meta: {
        placa: p.locacao.veiculo.placa,
        clienteNome: p.locacao.cliente.nome,
        locacaoId: p.locacaoId,
        valor,
        valorBase,
        valorJuros,
        valorMulta: encargos?.valorMulta,
        valorJurosDiarios: encargos?.valorJurosDiarios,
        modeloEncargos: encargos?.modelo,
        encargosContrato: encargos
          ? descricaoEncargosContrato(encargos.modelo)
          : undefined,
        diasAtraso,
        atrasado: !pago && diasAtraso > 0,
        concluido: pago,
        pagamentoAjustado: p.pagamentoAjustado,
        dataVencimentoContrato: vencimentoContrato,
        diaSemanaContrato: nomeDiaSemana(vencimentoContrato),
        pagamentoReagendado,
        dataPagamento: p.dataPagamento
          ? parseDateInput(p.dataPagamento)
          : undefined,
        ePrimeiraSemanaRetirada,
      },
    });
  }

  for (const p of parcelasFinanciamento) {
    const pago = !!p.dataPagamento;
    const dataExibicao = parseDateInput(p.dataVencimento);

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
        dataPagamento: p.dataPagamento
          ? startOfDay(p.dataPagamento)
          : undefined,
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

export async function getEventosAgendaMes(
  ano: number,
  mes: number,
  locadoraId: string
) {
  const inicio = startOfMonth(new Date(ano, mes - 1, 1));
  const fim = endOfMonth(inicio);
  return getEventosAgenda(inicio, fim, locadoraId);
}
