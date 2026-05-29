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
import type {
  CategoriaResumo,
  SerieMes,
  TopCliente,
  TopVeiculo,
} from "@/lib/relatorios-types";

export function RelatoriosTabelasResumo({
  topVeiculos,
  topClientes,
  categorias,
  serie,
}: {
  topVeiculos: TopVeiculo[];
  topClientes: TopCliente[];
  categorias: CategoriaResumo[];
  serie: SerieMes[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top veículos (detalhe)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Veículo</TableHead>
                <TableHead>Pagamentos</TableHead>
                <TableHead className="text-right">Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topVeiculos.map((v) => (
                <TableRow key={v.veiculoId}>
                  <TableCell>
                    {v.placa}{" "}
                    <span className="text-xs text-muted-foreground">{v.modelo}</span>
                  </TableCell>
                  <TableCell>{v.qtd}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(v.receita)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top clientes (detalhe)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Pagamentos</TableHead>
                <TableHead className="text-right">Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topClientes.map((c) => (
                <TableRow key={c.clienteId}>
                  <TableCell>{c.nome}</TableCell>
                  <TableCell>{c.qtd}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(c.receita)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Categorias financeiras</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((cat) => (
                <TableRow key={`${cat.tipo}-${cat.nome}`}>
                  <TableCell>{cat.nome}</TableCell>
                  <TableCell>
                    {cat.tipo === "ENTRADA" ? "Entrada" : "Saída"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(cat.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Evolução mensal (tabela)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Entradas</TableHead>
                <TableHead className="text-right">Saídas</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serie.map((m) => (
                <TableRow key={`${m.ano}-${m.mes}`}>
                  <TableCell>
                    {String(m.mes).padStart(2, "0")}/{m.ano}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(m.entradas)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(m.saidas)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${m.lucro >= 0 ? "text-blue-700 dark:text-blue-500" : "text-red-700 dark:text-red-500"}`}
                  >
                    {formatCurrency(m.lucro)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
