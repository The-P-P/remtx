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

export function RelatoriosInadimplencia({
  itens,
}: {
  itens: InadimplenciaItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Parcelas em atraso</CardTitle>
        <p className="text-sm text-muted-foreground">
          Cobranças pendentes com vencimento até a data de referência do relatório.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
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
            {itens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Nenhuma parcela em atraso no momento.
                </TableCell>
              </TableRow>
            ) : (
              itens.map((i) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
