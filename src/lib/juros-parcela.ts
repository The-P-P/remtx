import { differenceInCalendarDays, startOfDay } from "date-fns";

/** 5% do valor semanal da locação por dia de atraso. */
export const TAXA_JUROS_DIA = 0.05;

export function calcularJurosParcela(
  valorBase: number,
  dataVencimento: Date,
  referencia: Date = new Date(),
  isentarJuros = false
) {
  if (isentarJuros) {
    return { diasAtraso: 0, valorJuros: 0 };
  }

  const hoje = startOfDay(referencia);
  const vencimento = startOfDay(dataVencimento);
  const diasAtraso = Math.max(0, differenceInCalendarDays(hoje, vencimento));

  const valorJuros =
    Math.round(valorBase * TAXA_JUROS_DIA * diasAtraso * 100) / 100;

  return { diasAtraso, valorJuros };
}

export function valorTotalParcela(valorBase: number, valorJuros: number) {
  return Math.round((valorBase + valorJuros) * 100) / 100;
}
