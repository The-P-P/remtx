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
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    label: "Em dia",
  },
  AMARELO: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    label: "Próximo",
  },
  VERMELHO: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    label: "Vencido",
  },
};
