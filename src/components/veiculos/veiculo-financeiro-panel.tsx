import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type {
  MovimentoVeiculo,
  VeiculoFinanceiroData,
} from "@/lib/veiculo-financeiro";
import { VeiculoFinanciamentoCard } from "@/components/veiculos/veiculo-financiamento-card";

const ORIGEM_LABEL: Record<MovimentoVeiculo["origem"], string> = {
  aquisicao: "Aquisição",
  financiamento_entrada: "Financiamento",
  financiamento_parcela: "Financiamento",
  manutencao: "Manutenção",
  locacao: "Locação",
  outro: "Outro",
};

function KpiCard({
  label,
  value,
  sub,
  variant = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  variant?: "default" | "positive" | "negative";
}) {
  const valueClass =
    variant === "positive"
      ? "text-emerald-700 dark:text-emerald-400"
      : variant === "negative"
        ? "text-red-700 dark:text-red-400"
        : "";

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-bold tabular-nums ${valueClass}`}>
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

export function VeiculoFinanceiroPanel({
  data,
}: {
  data: VeiculoFinanceiroData;
}) {
  const { resumo, movimentos, financiamento } = data;
  const lucroPositivo = resumo.lucroLiquido >= 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-5" />
            Financeiro do veículo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <KpiCard
              label="Investimento"
              value={formatCurrency(resumo.investimentoTotal)}
              sub={
                resumo.valorCompra
                  ? resumo.dataCompra
                    ? `Compra em ${format(new Date(resumo.dataCompra), "dd/MM/yyyy", { locale: ptBR })}`
                    : "Valor de compra"
                  : financiamento
                    ? "Entrada + valor financiado"
                    : "Sem dados de aquisição"
              }
            />
            <KpiCard
              label="Receitas (locações)"
              value={formatCurrency(resumo.receitaLocacoes)}
              variant="positive"
            />
            <KpiCard
              label="Manutenção"
              value={formatCurrency(resumo.gastoManutencao)}
              variant="negative"
            />
            <KpiCard
              label="Financiamento pago"
              value={formatCurrency(resumo.gastoFinanciamento)}
              variant="negative"
              sub={
                resumo.saldoFinanciamento != null
                  ? `Saldo devedor: ${formatCurrency(resumo.saldoFinanciamento)}`
                  : undefined
              }
            />
            <KpiCard
              label="Total entradas"
              value={formatCurrency(resumo.totalEntradas)}
              variant="positive"
            />
            <KpiCard
              label="Resultado líquido"
              value={formatCurrency(resumo.lucroLiquido)}
              variant={lucroPositivo ? "positive" : "negative"}
              sub={`Saídas: ${formatCurrency(resumo.totalSaidas)}`}
            />
          </div>

          {movimentos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum lançamento financeiro registrado para este veículo.
              Cadastre o valor de compra na edição, registre locações pagas,
              manutenções e financiamento para ver o histórico aqui.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Data</th>
                      <th className="px-3 py-2 font-medium">Tipo</th>
                      <th className="px-3 py-2 font-medium">Categoria</th>
                      <th className="hidden px-3 py-2 font-medium sm:table-cell">
                        Descrição
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {movimentos.map((m) => (
                      <tr key={m.id} className="hover:bg-muted/30">
                        <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                          {format(new Date(m.data), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </td>
                        <td className="px-3 py-2.5">
                          {m.tipo === "entrada" ? (
                            <Badge className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200">
                              <ArrowDownLeft className="size-3" />
                              Entrada
                            </Badge>
                          ) : (
                            <Badge className="gap-1 bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-200">
                              <ArrowUpRight className="size-3" />
                              Saída
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs text-muted-foreground">
                            {ORIGEM_LABEL[m.origem]}
                          </span>
                          <p className="font-medium">{m.categoria}</p>
                        </td>
                        <td className="hidden max-w-[240px] truncate px-3 py-2.5 sm:table-cell">
                          {m.linkHref ? (
                            <Link
                              href={m.linkHref}
                              className="hover:underline"
                            >
                              {m.descricao}
                            </Link>
                          ) : (
                            m.descricao
                          )}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-right font-semibold tabular-nums ${
                            m.tipo === "entrada"
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-red-700 dark:text-red-400"
                          }`}
                        >
                          {m.tipo === "entrada" ? "+" : "−"}
                          {formatCurrency(m.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="size-3.5 text-emerald-600" />
              Entradas: locações e outros recebimentos vinculados
            </span>
            <span className="inline-flex items-center gap-1">
              <TrendingDown className="size-3.5 text-red-600" />
              Saídas: compra, manutenção e parcelas de financiamento pagas
            </span>
          </div>
        </CardContent>
      </Card>

      {financiamento && (
        <VeiculoFinanciamentoCard financiamento={financiamento} />
      )}
    </div>
  );
}
