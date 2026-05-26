import { startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { calcularAlertaKm } from "@/lib/manutencao-alerts";
import { ensureCategoriasFinanceirasPadrao } from "@/lib/financeiro-categorias";
import type { AlertaManutencao } from "@/types/prisma";

export async function getDashboardData() {
  await ensureCategoriasFinanceirasPadrao();

  const agora = new Date();
  const inicioMes = startOfMonth(agora);
  const fimMes = endOfMonth(agora);

  const [
    totalVeiculos,
    disponiveis,
    alugados,
    emManutencao,
    veiculos,
    problemasCronicos,
    transacoesMes,
    ultimasLocacoes,
    ultimasTransacoes,
  ] = await Promise.all([
    prisma.veiculo.count({ where: { status: { not: "INATIVO" } } }),
    prisma.veiculo.count({ where: { status: "DISPONIVEL" } }),
    prisma.veiculo.count({ where: { status: "ALUGADO" } }),
    prisma.veiculo.count({ where: { status: "EM_MANUTENCAO" } }),
    prisma.veiculo.findMany({
      where: { status: { not: "INATIVO" } },
      select: {
        id: true,
        placa: true,
        marca: true,
        modelo: true,
        kmAtual: true,
        kmProximaRevisao: true,
        status: true,
      },
    }),
    prisma.problemaCronico.findMany({
      where: { ativo: true },
      include: {
        veiculo: { select: { placa: true, marca: true, modelo: true } },
      },
      take: 5,
      orderBy: { dataRegistro: "desc" },
    }),
    prisma.transacaoFinanceira.findMany({
      where: { data: { gte: inicioMes, lte: fimMes } },
    }),
    prisma.locacao.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        veiculo: { select: { placa: true, modelo: true } },
        cliente: { select: { nome: true } },
      },
    }),
    prisma.transacaoFinanceira.findMany({
      take: 5,
      orderBy: { data: "desc" },
      include: { categoria: { select: { nome: true } } },
    }),
  ]);

  const alertasManutencao = veiculos
    .map((v) => ({
      ...v,
      alerta: calcularAlertaKm(v.kmAtual, v.kmProximaRevisao),
      kmRestante: v.kmProximaRevisao - v.kmAtual,
    }))
    .filter((v) => v.alerta !== "VERDE")
    .sort((a, b) => a.kmRestante - b.kmRestante);

  const entradas = transacoesMes
    .filter((t) => t.tipo === "ENTRADA")
    .reduce((s, t) => s + Number(t.valor), 0);

  const saidas = transacoesMes
    .filter((t) => t.tipo === "SAIDA")
    .reduce((s, t) => s + Number(t.valor), 0);

  const contagemAlertas: Record<AlertaManutencao, number> = {
    VERDE: veiculos.filter(
      (v) => calcularAlertaKm(v.kmAtual, v.kmProximaRevisao) === "VERDE"
    ).length,
    AMARELO: alertasManutencao.filter((v) => v.alerta === "AMARELO").length,
    VERMELHO: alertasManutencao.filter((v) => v.alerta === "VERMELHO").length,
  };

  return {
    frota: { totalVeiculos, disponiveis, alugados, emManutencao },
    alertasManutencao,
    contagemAlertas,
    problemasCronicos,
    financeiro: { entradas, saidas, saldo: entradas - saidas },
    ultimasLocacoes,
    ultimasTransacoes,
    periodo: { inicio: inicioMes, fim: fimMes },
  };
}
