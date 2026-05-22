import { Badge } from "@/components/ui/badge";
import { ALERTA_CORES } from "@/lib/manutencao-alerts";
import { calcularAlertaKm } from "@/lib/manutencao-alerts";
import { formatKm } from "@/lib/utils";

export function AlertaKmBadge({
  kmAtual,
  kmProximaRevisao,
}: {
  kmAtual: number;
  kmProximaRevisao: number;
}) {
  const alerta = calcularAlertaKm(kmAtual, kmProximaRevisao);
  const estilo = ALERTA_CORES[alerta];
  const kmRestante = kmProximaRevisao - kmAtual;

  return (
    <Badge className={`${estilo.bg} ${estilo.text} ${estilo.border} border`}>
      {kmRestante <= 0
        ? `Vencido ${Math.abs(kmRestante)} km`
        : `${estilo.label} · ${formatKm(kmRestante)}`}
    </Badge>
  );
}
