import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ALERTA_CORES } from "@/lib/manutencao-alerts";
import { formatKm } from "@/lib/utils";
import type { AlertaManutencao } from "@/types/prisma";

interface AlertaVeiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  kmAtual: number;
  kmProximaRevisao: number;
  alerta: AlertaManutencao;
  kmRestante: number;
}

interface AlertasManutencaoProps {
  alertas: AlertaVeiculo[];
  contagem: Record<AlertaManutencao, number>;
}

export function AlertasManutencao({ alertas, contagem }: AlertasManutencaoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="size-4 text-amber-500" />
          Alertas de manutenção
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            {contagem.VERDE} em dia
          </Badge>
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            {contagem.AMARELO} próximos
          </Badge>
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            {contagem.VERMELHO} vencidos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {alertas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum alerta de manutenção no momento.
          </p>
        ) : (
          <ul className="space-y-3">
            {alertas.map((v) => {
              const estilo = ALERTA_CORES[v.alerta];
              return (
                <li
                  key={v.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${estilo.bg} ${estilo.border}`}
                >
                  <div>
                    <p className={`font-medium ${estilo.text}`}>
                      {v.placa} — {v.marca} {v.modelo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Atual: {formatKm(v.kmAtual)} · Próxima:{" "}
                      {formatKm(v.kmProximaRevisao)}
                    </p>
                  </div>
                  <Badge
                    className={`${estilo.bg} ${estilo.text} border ${estilo.border}`}
                  >
                    {v.kmRestante <= 0
                      ? `Vencido ${Math.abs(v.kmRestante)} km`
                      : `Faltam ${formatKm(v.kmRestante)}`}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
