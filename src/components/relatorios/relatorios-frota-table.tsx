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

function FrotaMobileCard({ v }: { v: FrotaVeiculoRelatorio }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/veiculos/${v.veiculoId}`}
            className="font-mono font-semibold hover:underline"
          >
            {v.placa}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{v.modelo}</p>
        </div>
        <p
          className={cn(
            "shrink-0 text-right font-semibold tabular-nums",
            v.lucro >= 0
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-red-700 dark:text-red-400"
          )}
        >
          {formatCurrency(v.lucro)}
        </p>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Ocupação</dt>
          <dd className="font-medium tabular-nums">{v.taxaOcupacao.toFixed(1)}%</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Dias locados</dt>
          <dd className="font-medium tabular-nums">{v.diasLocados}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Receita</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(v.receita)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Manutenção</dt>
          <dd className="font-medium tabular-nums text-red-700 dark:text-red-400">
            {formatCurrency(v.custoManutencao)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">Financiamento</dt>
          <dd className="font-medium tabular-nums">
            {formatCurrency(v.custoFinanciamento)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function RelatoriosFrotaTable({ frota }: { frota: FrotaVeiculoRelatorio[] }) {
  return (
    <Card className="min-w-0">
      <CardHeader className="px-3 sm:px-4">
        <CardTitle className="text-sm sm:text-base">Desempenho por veículo</CardTitle>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Receita de locações, custos de manutenção e financiamento no período.
        </p>
      </CardHeader>
      <CardContent className="px-3 sm:px-4">
        {frota.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum veículo ativo.</p>
        ) : (
          <>
            <div className="space-y-2 md:hidden">
              {frota.map((v) => (
                <FrotaMobileCard key={v.veiculoId} v={v} />
              ))}
            </div>
            <div className="hidden md:block">
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
                  {frota.map((v) => (
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
