import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { STATUS_LOCACAO_LABEL } from "@/lib/constants/enums";
import type { StatusLocacao, TipoTransacao } from "@/types/prisma";

interface LocacaoItem {
  id: string;
  status: StatusLocacao;
  dataInicio: Date;
  veiculo: { placa: string; modelo: string };
  cliente: { nome: string };
}

interface TransacaoItem {
  id: string;
  tipo: TipoTransacao;
  valor: unknown;
  descricao: string;
  data: Date;
  categoria: { nome: string };
}

export function UltimasLocacoes({ locacoes }: { locacoes: LocacaoItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Últimas locações</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhuma locação registrada.
                </TableCell>
              </TableRow>
            ) : (
              locacoes.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/locacoes/${l.id}`}
                      className="hover:underline"
                    >
                      {l.cliente.nome}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {l.veiculo.placa} — {l.veiculo.modelo}
                  </TableCell>
                  <TableCell>
                    {format(l.dataInicio, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {STATUS_LOCACAO_LABEL[l.status]}
                    </Badge>
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

export function UltimasTransacoes({
  transacoes,
}: {
  transacoes: TransacaoItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Últimas transações</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhuma transação registrada.
                </TableCell>
              </TableRow>
            ) : (
              transacoes.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.descricao}</TableCell>
                  <TableCell>{t.categoria.nome}</TableCell>
                  <TableCell>
                    {format(t.data, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${t.tipo === "ENTRADA" ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {t.tipo === "ENTRADA" ? "+" : "-"}
                    {formatCurrency(Number(t.valor))}
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
