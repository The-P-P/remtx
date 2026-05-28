import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export type PeriodoFinanceiro = {
  ano: number;
  mes: number;
  inicio: Date;
  fim: Date;
  modo: "mes" | "intervalo" | "semana" | "dia";
};

export function parsePeriodoFinanceiro(params: {
  ano?: string;
  mes?: string;
  de?: string;
  ate?: string;
  periodoTipo?: string;
  dataRef?: string;
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

  if (params.periodoTipo === "semana" || params.periodoTipo === "dia") {
    const ref = params.dataRef
      ? startOfDay(new Date(params.dataRef + "T12:00:00"))
      : startOfDay(agora);

    if (params.periodoTipo === "dia") {
      return {
        ano: ref.getFullYear(),
        mes: ref.getMonth() + 1,
        inicio: ref,
        fim: endOfDay(ref),
        modo: "dia",
      };
    }

    const inicioSemana = startOfWeek(ref, { weekStartsOn: 1 });
    const fimSemana = endOfWeek(ref, { weekStartsOn: 1 });
    return {
      ano: ref.getFullYear(),
      mes: ref.getMonth() + 1,
      inicio: inicioSemana,
      fim: fimSemana,
      modo: "semana",
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
