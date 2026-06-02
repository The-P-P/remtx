import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { STATUS_PLANO_CONQUISTA_LABEL } from "@/lib/constants/enums";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { StatusPlanoConquista } from "@/types/prisma";

type Plano = {
  id: string;
  status: StatusPlanoConquista;
  totalMeses: number;
  mesesPagos: number;
  valorMensal: unknown;
  valorAdesao: unknown;
  adesaoPaga: boolean;
  dataPrevistaConclusao: Date | null;
  registros: {
    mesNumero: number;
    dataVencimento: Date;
    dataPagamento: Date | null;
  }[];
};

export function PlanoConquistaCard({ plano }: { plano: Plano }) {
  const pct = Math.round((plano.mesesPagos / plano.totalMeses) * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Plano Conquista</CardTitle>
          <Badge variant="secondary">
            {STATUS_PLANO_CONQUISTA_LABEL[plano.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <p>
          <strong>{plano.mesesPagos}</strong> de <strong>{plano.totalMeses}</strong>{" "}
          mensalidades pagas ({pct}%)
        </p>
        <p className="text-muted-foreground">
          Mensal: {formatCurrency(Number(plano.valorMensal))} · Adesão:{" "}
          {formatCurrency(Number(plano.valorAdesao))}{" "}
          {plano.adesaoPaga ? "(paga)" : "(pendente)"}
        </p>
        {plano.dataPrevistaConclusao && (
          <p className="text-muted-foreground">
            Previsão de conclusão:{" "}
            {format(plano.dataPrevistaConclusao, "dd/MM/yyyy", { locale: ptBR })}
          </p>
        )}
        <Link
          href="/clientes/contratos/planos-conquista"
          className="text-primary underline-offset-4 hover:underline"
        >
          Ver todos os planos Conquista
        </Link>
      </CardContent>
    </Card>
  );
}
