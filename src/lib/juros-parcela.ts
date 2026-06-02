import { differenceInCalendarDays, startOfDay } from "date-fns";
import type {
  PeriodicidadePagamento,
  TipoModeloContrato,
} from "@/types/prisma";

/** @deprecated Use calcularEncargosParcela — mantido por compatibilidade. */
export const TAXA_JUROS_DIA = 0.05;

export type OpcoesEncargosParcela = {
  modeloContrato?: TipoModeloContrato;
  periodicidadePagamento?: PeriodicidadePagamento;
};

export type EncargosParcela = {
  diasAtraso: number;
  /** Multa de mora (5% semanal ou 3% mensal Conquista). */
  valorMulta: number;
  /** Juros de 1% ao dia sobre o valor da parcela. */
  valorJurosDiarios: number;
  /** Multa + juros (valor armazenado em parcela.valorJuros). */
  valorEncargos: number;
  modelo: "PADRAO" | "PLANO_CONQUISTA";
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function resolverModeloEncargos(
  opts?: OpcoesEncargosParcela
): "PADRAO" | "PLANO_CONQUISTA" {
  if (opts?.modeloContrato === "PLANO_CONQUISTA") return "PLANO_CONQUISTA";
  if (opts?.periodicidadePagamento === "MENSAL") return "PLANO_CONQUISTA";
  return "PADRAO";
}

/**
 * Encargos conforme contrato:
 * - Padrão (semanal): multa de mora 5% + juros 1% ao dia (cláusula 10ª).
 * - Plano Conquista (mensal): multa 3% + juros 1% ao dia, até 30 dias (cláusulas 8ª–9ª).
 */
export function calcularEncargosParcela(
  valorBase: number,
  dataVencimento: Date,
  referencia: Date = new Date(),
  isentarJuros = false,
  opts?: OpcoesEncargosParcela
): EncargosParcela {
  const modelo = resolverModeloEncargos(opts);
  const vazio: EncargosParcela = {
    diasAtraso: 0,
    valorMulta: 0,
    valorJurosDiarios: 0,
    valorEncargos: 0,
    modelo,
  };

  if (isentarJuros) return vazio;

  const hoje = startOfDay(referencia);
  const vencimento = startOfDay(dataVencimento);
  const diasAtraso = Math.max(0, differenceInCalendarDays(hoje, vencimento));

  if (diasAtraso === 0) return vazio;

  if (modelo === "PLANO_CONQUISTA") {
    const diasJuros = Math.min(diasAtraso, 30);
    const valorMulta = round2(valorBase * 0.03);
    const valorJurosDiarios = round2(valorBase * 0.01 * diasJuros);
    return {
      diasAtraso,
      valorMulta,
      valorJurosDiarios,
      valorEncargos: round2(valorMulta + valorJurosDiarios),
      modelo,
    };
  }

  const valorMulta = round2(valorBase * 0.05);
  const valorJurosDiarios = round2(valorBase * 0.01 * diasAtraso);
  return {
    diasAtraso,
    valorMulta,
    valorJurosDiarios,
    valorEncargos: round2(valorMulta + valorJurosDiarios),
    modelo,
  };
}

/** Retorna encargos totais em valorJuros (compatível com código legado). */
export function calcularJurosParcela(
  valorBase: number,
  dataVencimento: Date,
  referencia: Date = new Date(),
  isentarJuros = false,
  opts?: OpcoesEncargosParcela
) {
  const e = calcularEncargosParcela(
    valorBase,
    dataVencimento,
    referencia,
    isentarJuros,
    opts
  );
  return { diasAtraso: e.diasAtraso, valorJuros: e.valorEncargos };
}

export function descricaoEncargosContrato(modelo: "PADRAO" | "PLANO_CONQUISTA") {
  if (modelo === "PLANO_CONQUISTA") {
    return "multa 3% + 1% ao dia (até 30 dias de atraso)";
  }
  return "multa de mora 5% + 1% ao dia";
}

export function valorTotalParcela(valorBase: number, valorEncargos: number) {
  return round2(valorBase + valorEncargos);
}
