import { endOfMonth, startOfMonth } from "date-fns";

export function parsePeriodoFinanceiro(params: {
  ano?: string;
  mes?: string;
}) {
  const agora = new Date();
  const ano = Number(params.ano) || agora.getFullYear();
  const mes =
    Number(params.mes) >= 1 && Number(params.mes) <= 12
      ? Number(params.mes)
      : agora.getMonth() + 1;
  const inicio = startOfMonth(new Date(ano, mes - 1, 1));
  const fim = endOfMonth(inicio);
  return { ano, mes, inicio, fim };
}

export function financeiroQuery(ano: number, mes: number, extra?: string) {
  const base = `ano=${ano}&mes=${mes}`;
  return extra ? `/financeiro?${base}&${extra}` : `/financeiro?${base}`;
}
