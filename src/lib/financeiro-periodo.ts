import { endOfMonth, startOfDay, startOfMonth } from "date-fns";

export type PeriodoFinanceiro = {
  ano: number;
  mes: number;
  inicio: Date;
  fim: Date;
  modo: "mes" | "intervalo";
};

export function parsePeriodoFinanceiro(params: {
  ano?: string;
  mes?: string;
  de?: string;
  ate?: string;
}): PeriodoFinanceiro {
  const agora = new Date();

  if (params.de && params.ate) {
    const inicio = startOfDay(new Date(params.de + "T12:00:00"));
    const fim = startOfDay(new Date(params.ate + "T12:00:00"));
    return {
      ano: inicio.getFullYear(),
      mes: inicio.getMonth() + 1,
      inicio,
      fim: fim < inicio ? inicio : fim,
      modo: "intervalo",
    };
  }

  const ano = Number(params.ano) || agora.getFullYear();
  const mes =
    Number(params.mes) >= 1 && Number(params.mes) <= 12
      ? Number(params.mes)
      : agora.getMonth() + 1;
  const inicio = startOfMonth(new Date(ano, mes - 1, 1));
  const fim = endOfMonth(inicio);
  return { ano, mes, inicio, fim, modo: "mes" };
}

export function financeiroQuery(
  ano: number,
  mes: number,
  extra?: Record<string, string | undefined>
) {
  const parts = new URLSearchParams({ ano: String(ano), mes: String(mes) });
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) parts.set(k, v);
    }
  }
  return `/financeiro?${parts.toString()}`;
}
