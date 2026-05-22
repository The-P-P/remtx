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
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-500/40 dark:bg-emerald-500/10">
          <ArrowUpRight className="size-8 text-emerald-600 dark:text-emerald-500" />
          <div>
            <p className="text-xs font-medium text-muted-foreground dark:text-emerald-500">
              Entradas
            </p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-500">
              {formatCurrency(entradas)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-red-200/60 bg-red-50/50 p-4 dark:border-red-500/40 dark:bg-red-500/10">
          <ArrowDownLeft className="size-8 text-red-600 dark:text-red-500" />
          <div>
            <p className="text-xs font-medium text-muted-foreground dark:text-red-500">
              Saídas
            </p>
            <p className="text-xl font-bold text-red-700 dark:text-red-500">
              {formatCurrency(saidas)}
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-3 rounded-lg border p-4 ${
            saldo >= 0
              ? "border-blue-200/60 bg-blue-50/50 dark:border-blue-500/40 dark:bg-blue-500/10"
              : "border-red-200/60 bg-red-50/50 dark:border-red-500/40 dark:bg-red-500/10"
          }`}
        >
          <Scale
            className={`size-8 ${saldo >= 0 ? "text-blue-600 dark:text-blue-500" : "text-red-600 dark:text-red-500"}`}
          />
          <div>
            <p
              className={`text-xs font-medium text-muted-foreground ${saldo >= 0 ? "dark:text-blue-500" : "dark:text-red-500"}`}
            >
              Saldo
            </p>
            <p
              className={`text-xl font-bold ${saldo >= 0 ? "text-blue-700 dark:text-blue-500" : "text-red-700 dark:text-red-500"}`}
            >
              {formatCurrency(saldo)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
