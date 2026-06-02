import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import type { InadimplenciaItem } from "@/lib/relatorios-types";

function InadimplenciaMobileCard({ i }: { i: InadimplenciaItem }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{i.clienteNome}</p>
          <p className="font-mono text-xs text-muted-foreground">{i.veiculoPlaca}</p>
        </div>
        <p className="shrink-0 font-semibold tabular-nums">
          {formatCurrency(i.valor)}
        </p>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Vencimento</dt>
          <dd>
            {format(new Date(i.dataVencimento), "dd/MM/yyyy", {
              locale: ptBR,
            })}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Atraso</dt>
          <dd className="font-medium text-red-700 dark:text-red-400">
            {i.diasAtraso} dia{i.diasAtraso !== 1 ? "s" : ""}
          </dd>
        </div>
      </dl>
      <Link
        href={`/locacoes/${i.locacaoId}`}
        className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
      >
        Ver locação
      </Link>
    </div>
  );
}

export function RelatoriosInadimplencia({
  itens,
}: {
  itens: InadimplenciaItem[];
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="px-3 sm:px-4">
        <CardTitle className="text-sm sm:text-base">Parcelas em atraso</CardTitle>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Cobranças pendentes com vencimento até a data de referência do relatório.
        </p>
      </CardHeader>
      <CardContent className="px-3 sm:px-4">
        {itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma parcela em atraso no momento.
          </p>
        ) : (
          <>
            <div className="space-y-2 md:hidden">
              {itens.map((i) => (
                <InadimplenciaMobileCard key={i.parcelaId} i={i} />
              ))}
            </div>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Atraso</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((i) => (
                    <TableRow key={i.parcelaId}>
                      <TableCell>{i.clienteNome}</TableCell>
                      <TableCell className="font-mono">{i.veiculoPlaca}</TableCell>
                      <TableCell>
                        {format(new Date(i.dataVencimento), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-right text-red-700 dark:text-red-400">
                        {i.diasAtraso} dia{i.diasAtraso !== 1 ? "s" : ""}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(i.valor)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/locacoes/${i.locacaoId}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Ver locação
                        </Link>
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
