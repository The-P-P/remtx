import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

type TopVeiculo = { placa: string; modelo: string; receita: number; qtd: number };
type TopCliente = { nome: string; receita: number; qtd: number };
type Categoria = { nome: string; tipo: "ENTRADA" | "SAIDA"; total: number };

type Serie = { ano: number; mes: number; entradas: number; saidas: number; lucro: number };

export function RelatoriosRankings({
  topVeiculos,
  topClientes,
  categorias,
  serie,
}: {
  topVeiculos: TopVeiculo[];
  topClientes: TopCliente[];
  categorias: Categoria[];
  serie: Serie[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Top veículos por receita</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Veículo</TableHead><TableHead>Pagamentos</TableHead><TableHead className="text-right">Receita</TableHead></TableRow></TableHeader>
            <TableBody>
              {topVeiculos.length === 0 ? <TableRow><TableCell colSpan={3} className="text-muted-foreground">Sem dados no período.</TableCell></TableRow> : topVeiculos.map((v) => (
                <TableRow key={v.placa}><TableCell>{v.placa} <span className="text-xs text-muted-foreground">{v.modelo}</span></TableCell><TableCell>{v.qtd}</TableCell><TableCell className="text-right font-medium">{formatCurrency(v.receita)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Top clientes por receita</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Pagamentos</TableHead><TableHead className="text-right">Receita</TableHead></TableRow></TableHeader>
            <TableBody>
              {topClientes.length === 0 ? <TableRow><TableCell colSpan={3} className="text-muted-foreground">Sem dados no período.</TableCell></TableRow> : topClientes.map((c) => (
                <TableRow key={c.nome}><TableCell>{c.nome}</TableCell><TableCell>{c.qtd}</TableCell><TableCell className="text-right font-medium">{formatCurrency(c.receita)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Categorias (período)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Categoria</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {categorias.length === 0 ? <TableRow><TableCell colSpan={3} className="text-muted-foreground">Sem dados no período.</TableCell></TableRow> : categorias.map((cat) => (
                <TableRow key={cat.nome}><TableCell>{cat.nome}</TableCell><TableCell>{cat.tipo === "ENTRADA" ? "Entrada" : "Saída"}</TableCell><TableCell className="text-right font-medium">{formatCurrency(cat.total)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Evolução mensal (12 meses)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Mês</TableHead><TableHead className="text-right">Entradas</TableHead><TableHead className="text-right">Saídas</TableHead><TableHead className="text-right">Lucro</TableHead></TableRow></TableHeader>
            <TableBody>
              {serie.map((m) => (
                <TableRow key={`${m.ano}-${m.mes}`}>
                  <TableCell>{String(m.mes).padStart(2, "0")}/{m.ano}</TableCell>
                  <TableCell className="text-right">{formatCurrency(m.entradas)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(m.saidas)}</TableCell>
                  <TableCell className={`text-right font-medium ${m.lucro >= 0 ? "text-blue-700 dark:text-blue-500" : "text-red-700 dark:text-red-500"}`}>{formatCurrency(m.lucro)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
