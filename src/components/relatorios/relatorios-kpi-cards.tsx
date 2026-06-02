import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { RelatorioComparativo, RelatorioKpis } from "@/lib/relatorios-types";
import { cn } from "@/lib/utils";

function Variacao({
  valor,
  sufixo = "%",
  invertido = false,
}: {
  valor: number | null;
  sufixo?: string;
  invertido?: boolean;
}) {
  if (valor === null) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="size-3" /> n/a
      </span>
    );
  }

  const positivo = invertido ? valor < 0 : valor > 0;
  const negativo = invertido ? valor > 0 : valor < 0;
  const Icon = valor > 0 ? ArrowUp : valor < 0 ? ArrowDown : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        positivo && "text-emerald-600 dark:text-emerald-400",
        negativo && "text-red-600 dark:text-red-400",
        valor === 0 && "text-muted-foreground"
      )}
    >
      <Icon className="size-3" />
      {valor > 0 ? "+" : ""}
      {valor.toFixed(1)}
      {sufixo}
      <span className="hidden sm:inline"> vs período anterior</span>
      <span className="sm:hidden"> vs ant.</span>
    </span>
  );
}

function KpiCard({
  label,
  value,
  valueClass,
  variacao,
  variacaoSufixo,
  invertidoVariacao,
}: {
  label: string;
  value: string;
  valueClass?: string;
  variacao?: number | null;
  variacaoSufixo?: string;
  invertidoVariacao?: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-1 px-3 pt-4 pb-4 sm:px-4 sm:pt-6">
        <p className="text-[11px] leading-tight text-muted-foreground sm:text-xs">
          {label}
        </p>
        <p className={cn("text-base font-bold sm:text-lg", valueClass)}>{value}</p>
        {variacao !== undefined && (
          <Variacao
            valor={variacao}
            sufixo={variacaoSufixo}
            invertido={invertidoVariacao}
          />
        )}
      </CardContent>
    </Card>
  );
}

export function RelatoriosKpiCards({
  data,
  comparativo,
}: {
  data: RelatorioKpis;
  comparativo: RelatorioComparativo;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      <KpiCard
        label="Receita (financeiro)"
        value={formatCurrency(data.receita)}
        valueClass="text-emerald-700 dark:text-emerald-500"
        variacao={comparativo.receita}
      />
      <KpiCard
        label="Despesa"
        value={formatCurrency(data.despesa)}
        valueClass="text-red-700 dark:text-red-500"
        variacao={comparativo.despesa}
        invertidoVariacao
      />
      <KpiCard
        label="Lucro"
        value={formatCurrency(data.lucro)}
        valueClass={
          data.lucro >= 0
            ? "text-blue-700 dark:text-blue-500"
            : "text-red-700 dark:text-red-500"
        }
        variacao={comparativo.lucro}
      />
      <KpiCard
        label="Receita locações"
        value={formatCurrency(data.receitaLocacao)}
      />
      <KpiCard
        label="Custo manutenção"
        value={formatCurrency(data.custoManutencao)}
      />
      <KpiCard label="Ticket médio" value={formatCurrency(data.ticketMedio)} />
      <KpiCard
        label="Taxa ocupação"
        value={`${data.taxaOcupacao.toFixed(1)}%`}
        variacao={comparativo.taxaOcupacao}
        variacaoSufixo=" p.p."
      />
      <KpiCard
        label="Inadimplência"
        value={`${data.inadimplencia.toFixed(1)}%`}
        variacao={comparativo.inadimplencia}
        variacaoSufixo=" p.p."
        invertidoVariacao
      />
    </div>
  );
}
