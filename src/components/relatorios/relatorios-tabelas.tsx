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

function TopVeiculosMobile({ items }: { items: TopVeiculo[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem dados no período.</p>;
  }
  return (
    <div className="space-y-2 md:hidden">
      {items.map((v) => (
        <div
          key={v.veiculoId}
          className="flex items-center justify-between gap-2 rounded-lg border bg-muted/20 p-3 text-sm"
        >
          <div className="min-w-0">
            <p className="font-mono font-medium">{v.placa}</p>
            <p className="truncate text-xs text-muted-foreground">{v.modelo}</p>
            <p className="text-xs text-muted-foreground">{v.qtd} pagamento(s)</p>
          </div>
          <p className="shrink-0 font-semibold tabular-nums">
            {formatCurrency(v.receita)}
          </p>
        </div>
      ))}
    </div>
  );
}

function TopClientesMobile({ items }: { items: TopCliente[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem dados no período.</p>;
  }
  return (
    <div className="space-y-2 md:hidden">
      {items.map((c) => (
        <div
          key={c.clienteId}
          className="flex items-center justify-between gap-2 rounded-lg border bg-muted/20 p-3 text-sm"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{c.nome}</p>
            <p className="text-xs text-muted-foreground">{c.qtd} pagamento(s)</p>
          </div>
          <p className="shrink-0 font-semibold tabular-nums">
            {formatCurrency(c.receita)}
          </p>
        </div>
      ))}
    </div>
  );
}

function CategoriasMobile({ items }: { items: CategoriaResumo[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem dados no período.</p>;
  }
  return (
    <div className="space-y-2 md:hidden">
      {items.map((cat) => (
        <div
          key={`${cat.tipo}-${cat.nome}`}
          className="flex items-center justify-between gap-2 rounded-lg border bg-muted/20 p-3 text-sm"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{cat.nome}</p>
            <p className="text-xs text-muted-foreground">
              {cat.tipo === "ENTRADA" ? "Entrada" : "Saída"}
            </p>
          </div>
          <p className="shrink-0 font-semibold tabular-nums">
            {formatCurrency(cat.total)}
          </p>
        </div>
      ))}
    </div>
  );
}

function SerieMobile({ items }: { items: SerieMes[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem dados no período.</p>;
  }
  return (
    <div className="space-y-2 md:hidden">
      {items.map((m) => (
        <div
          key={`${m.ano}-${m.mes}`}
          className="rounded-lg border bg-muted/20 p-3 text-sm"
        >
          <p className="mb-2 font-medium">
            {String(m.mes).padStart(2, "0")}/{m.ano}
          </p>
          <dl className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <dt className="text-muted-foreground">Entradas</dt>
              <dd className="font-medium tabular-nums">
                {formatCurrency(m.entradas)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Saídas</dt>
              <dd className="font-medium tabular-nums">
                {formatCurrency(m.saidas)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Lucro</dt>
              <dd
                className={`font-semibold tabular-nums ${m.lucro >= 0 ? "text-blue-700 dark:text-blue-500" : "text-red-700 dark:text-red-500"}`}
              >
                {formatCurrency(m.lucro)}
              </dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}

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
    <div className="grid min-w-0 gap-3 sm:gap-4 xl:grid-cols-2">
      {topVeiculos.length > 0 && (
        <Card className="min-w-0">
          <CardHeader className="px-3 sm:px-4">
            <CardTitle className="text-sm sm:text-base">Top veículos (detalhe)</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4">
            <TopVeiculosMobile items={topVeiculos} />
            <div className="hidden md:block">
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
            </div>
          </CardContent>
        </Card>
      )}

      {topClientes.length > 0 && (
        <Card className="min-w-0">
          <CardHeader className="px-3 sm:px-4">
            <CardTitle className="text-sm sm:text-base">Top clientes (detalhe)</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4">
            <TopClientesMobile items={topClientes} />
            <div className="hidden md:block">
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
            </div>
          </CardContent>
        </Card>
      )}

      {categorias.length > 0 && (
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader className="px-3 sm:px-4">
            <CardTitle className="text-sm sm:text-base">Categorias financeiras</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4">
            <CategoriasMobile items={categorias} />
            <div className="hidden md:block">
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
            </div>
          </CardContent>
        </Card>
      )}

      {serie.length > 0 && (
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader className="px-3 sm:px-4">
            <CardTitle className="text-sm sm:text-base">Evolução mensal (tabela)</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4">
            <SerieMobile items={serie} />
            <div className="hidden md:block">
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
