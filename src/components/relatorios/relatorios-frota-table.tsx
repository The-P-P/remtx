import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { FrotaVeiculoRelatorio } from "@/lib/relatorios-types";
import { cn } from "@/lib/utils";

export function RelatoriosFrotaTable({ frota }: { frota: FrotaVeiculoRelatorio[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Desempenho por veículo</CardTitle>
        <p className="text-sm text-muted-foreground">
          Receita de locações, custos de manutenção e financiamento no período.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Veículo</TableHead>
              <TableHead className="text-right">Ocupação</TableHead>
              <TableHead className="text-right">Dias loc.</TableHead>
              <TableHead className="text-right">Receita</TableHead>
              <TableHead className="text-right">Manutenção</TableHead>
              <TableHead className="text-right">Financ.</TableHead>
              <TableHead className="text-right">Lucro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {frota.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  Nenhum veículo ativo.
                </TableCell>
              </TableRow>
            ) : (
              frota.map((v) => (
                <TableRow key={v.veiculoId}>
                  <TableCell>
                    <Link
                      href={`/veiculos/${v.veiculoId}`}
                      className="font-mono font-medium hover:underline"
                    >
                      {v.placa}
                    </Link>
                    <p className="text-xs text-muted-foreground">{v.modelo}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {v.taxaOcupacao.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {v.diasLocados}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(v.receita)}
                  </TableCell>
                  <TableCell className="text-right text-red-700 dark:text-red-400">
                    {formatCurrency(v.custoManutencao)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(v.custoFinanciamento)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      v.lucro >= 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-700 dark:text-red-400"
                    )}
                  >
                    {formatCurrency(v.lucro)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
