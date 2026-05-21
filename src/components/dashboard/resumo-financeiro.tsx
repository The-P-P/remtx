import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ResumoFinanceiroProps {
  entradas: number;
  saidas: number;
  saldo: number;
  periodo: { inicio: Date; fim: Date };
}

export function ResumoFinanceiro({
  entradas,
  saidas,
  saldo,
  periodo,
}: ResumoFinanceiroProps) {
  const mesLabel = format(periodo.inicio, "MMMM yyyy", { locale: ptBR });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base capitalize">
          Resumo financeiro — {mesLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border bg-emerald-50/50 p-4">
          <ArrowUpRight className="size-8 text-emerald-600" />
          <div>
            <p className="text-xs text-muted-foreground">Entradas</p>
            <p className="text-xl font-bold text-emerald-700">
              {formatCurrency(entradas)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-red-50/50 p-4">
          <ArrowDownLeft className="size-8 text-red-600" />
          <div>
            <p className="text-xs text-muted-foreground">Saídas</p>
            <p className="text-xl font-bold text-red-700">
              {formatCurrency(saidas)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-blue-50/50 p-4">
          <Scale className="size-8 text-blue-600" />
          <div>
            <p className="text-xs text-muted-foreground">Saldo</p>
            <p
              className={`text-xl font-bold ${saldo >= 0 ? "text-blue-700" : "text-red-700"}`}
            >
              {formatCurrency(saldo)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
