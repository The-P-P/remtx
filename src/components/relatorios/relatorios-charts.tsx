"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type {
  CategoriaResumo,
  FormaPagamentoResumo,
  SerieMes,
  TopCliente,
  TopVeiculo,
} from "@/lib/relatorios-types";

const CORES = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#ca8a04",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
  "#64748b",
];

function fmtMoeda(v: number) {
  return formatCurrency(v);
}

export function RelatoriosCharts({
  serie,
  topVeiculos,
  topClientes,
  categorias,
  formasPagamento,
}: {
  serie: SerieMes[];
  topVeiculos: TopVeiculo[];
  topClientes: TopCliente[];
  categorias: CategoriaResumo[];
  formasPagamento: FormaPagamentoResumo[];
}) {
  const serieChart = serie.map((m) => ({
    label: `${String(m.mes).padStart(2, "0")}/${m.ano}`,
    entradas: m.entradas,
    saidas: m.saidas,
    lucro: m.lucro,
  }));

  const veiculosChart = topVeiculos.slice(0, 6).map((v) => ({
    nome: v.placa,
    receita: v.receita,
  }));

  const clientesChart = topClientes.slice(0, 6).map((c) => ({
    nome: c.nome.length > 18 ? `${c.nome.slice(0, 16)}…` : c.nome,
    receita: c.receita,
  }));

  const saidasCat = categorias
    .filter((c) => c.tipo === "SAIDA")
    .slice(0, 6)
    .map((c) => ({ nome: c.nome, valor: c.total }));

  const entradasCat = categorias
    .filter((c) => c.tipo === "ENTRADA")
    .slice(0, 6)
    .map((c) => ({ nome: c.nome, valor: c.total }));

  const formasChart = formasPagamento.map((f) => ({
    nome: f.label,
    valor: f.total,
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Evolução financeira (12 meses)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={serieChart}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip formatter={(v) => fmtMoeda(Number(v))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="entradas"
                name="Entradas"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="saidas"
                name="Saídas"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="lucro"
                name="Lucro"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top veículos (receita)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {veiculosChart.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados no período.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={veiculosChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="nome" width={56} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmtMoeda(Number(v))} />
                <Bar dataKey="receita" name="Receita" fill="#2563eb" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top clientes (receita)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {clientesChart.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados no período.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientesChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="nome" width={72} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => fmtMoeda(Number(v))} />
                <Bar dataKey="receita" name="Receita" fill="#16a34a" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {formasChart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Formas de pagamento</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formasChart}
                  dataKey="valor"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(props) => {
                    const nome = String(props.name ?? "");
                    const pct = ((props.percent ?? 0) * 100).toFixed(0);
                    return `${nome} ${pct}%`;
                  }}
                >
                  {formasChart.map((_, i) => (
                    <Cell key={i} fill={CORES[i % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmtMoeda(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {saidasCat.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={saidasCat}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                <XAxis dataKey="nome" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmtMoeda(Number(v))} />
                <Bar dataKey="valor" name="Total" fill="#dc2626" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {entradasCat.length > 0 && (
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Receitas por categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={entradasCat}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmtMoeda(Number(v))} />
                <Bar dataKey="valor" name="Total" fill="#16a34a" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
