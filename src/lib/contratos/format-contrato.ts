import { differenceInCalendarDays, format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

export function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseDataContrato(s: string) {
  return parse(s, "dd/MM/yyyy", new Date());
}

/** Ex.: 14 de abril de 2026 */
export function dataPorExtenso(s: string) {
  return format(parseDataContrato(s), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/** Ex.: terças (para "todas as terças de cada semana") */
export function diaSemanaPagamento(s: string): string {
  const w = format(parseDataContrato(s), "EEEE", { locale: ptBR }).toLowerCase();
  if (w === "sábado") return "sábados";
  if (w === "domingo") return "domingos";
  if (w.endsWith("-feira")) return `${w.replace("-feira", "")}s`;
  return `${w}s`;
}

export function prazoValidadeDias(dataInicio: string, dataFim?: string | null) {
  if (!dataFim) return null;
  const dias = differenceInCalendarDays(parseDataContrato(dataFim), parseDataContrato(dataInicio));
  return dias > 0 ? dias : null;
}
