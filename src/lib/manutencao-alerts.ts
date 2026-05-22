import type { AlertaManutencao } from "@/types/prisma";

/** Regras de negócio: alerta por km restante até próxima revisão */
export function calcularAlertaKm(
  kmAtual: number,
  kmProximaRevisao: number
): AlertaManutencao {
  const kmRestante = kmProximaRevisao - kmAtual;

  if (kmRestante <= 0 || kmRestante < 500) {
    return "VERMELHO";
  }
  if (kmRestante <= 2000) {
    return "AMARELO";
  }
  return "VERDE";
}

export const ALERTA_CORES: Record<
  AlertaManutencao,
  { bg: string; text: string; border: string; label: string }
> = {
  VERDE: {
    bg: "bg-emerald-50 dark:bg-emerald-950/70",
    text: "text-emerald-800 dark:text-emerald-200",
    border: "border-emerald-200 dark:border-emerald-800",
    label: "Em dia",
  },
  AMARELO: {
    bg: "bg-amber-50 dark:bg-amber-950/70",
    text: "text-amber-800 dark:text-amber-200",
    border: "border-amber-200 dark:border-amber-800",
    label: "Próximo",
  },
  VERMELHO: {
    bg: "bg-red-50 dark:bg-red-950/70",
    text: "text-red-800 dark:text-red-200",
    border: "border-red-200 dark:border-red-800",
    label: "Vencido",
  },
};
