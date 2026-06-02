"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  RelatoriosAbas,
  type RelatorioSecaoId,
} from "@/components/relatorios/relatorios-abas";
import { RelatoriosKpiCards } from "@/components/relatorios/relatorios-kpi-cards";
import { RelatoriosAlertas } from "@/components/relatorios/relatorios-alertas";
import { RelatoriosCharts } from "@/components/relatorios/relatorios-charts";
import { RelatoriosFrotaTable } from "@/components/relatorios/relatorios-frota-table";
import { RelatoriosInadimplencia } from "@/components/relatorios/relatorios-inadimplencia";
import { RelatoriosTabelasResumo } from "@/components/relatorios/relatorios-tabelas";
import { downloadRelatorioCsv } from "@/lib/relatorios-export";
import { formatCurrency } from "@/lib/utils";
import type { RelatorioGeralData } from "@/lib/relatorios-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RelatorioDashboardProps = {
  data: RelatorioGeralData;
};

function SecaoTitulo({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao?: string;
}) {
  return (
    <div className="border-b border-border/60 pb-3">
      <h2 className="text-base font-semibold">{titulo}</h2>
      {descricao && (
        <p className="mt-0.5 text-sm text-muted-foreground">{descricao}</p>
      )}
    </div>
  );
}

export function RelatoriosDashboard({ data }: RelatorioDashboardProps) {
  const [secao, setSecao] = useState<RelatorioSecaoId>("geral");

  const inicio =
    data.periodo.inicio instanceof Date
      ? data.periodo.inicio
      : new Date(data.periodo.inicio);
  const fim =
    data.periodo.fim instanceof Date
      ? data.periodo.fim
      : new Date(data.periodo.fim);

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between">
        <Card className="min-w-0 flex-1 bg-muted/20">
          <CardContent className="space-y-1 py-3 text-sm">
            <p>
              <span className="text-muted-foreground">Período:</span>{" "}
              <strong className="break-words">
                {format(inicio, "dd/MM/yyyy", { locale: ptBR })} até{" "}
                {format(fim, "dd/MM/yyyy", { locale: ptBR })}
              </strong>
            </p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Comparado com {data.periodoAnterior.label}
            </p>
          </CardContent>
        </Card>
        <Button
          type="button"
          variant="outline"
          className="w-full shrink-0 sm:w-auto"
          onClick={() => downloadRelatorioCsv(data)}
        >
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </div>

      <Card className="w-full min-w-0 overflow-hidden p-0 gap-0">
        <RelatoriosAbas ativa={secao} onChange={setSecao} />

        <div className="w-full min-w-0 p-3 sm:p-6">
          {secao === "geral" && (
            <div role="tabpanel" className="space-y-6">
              <SecaoTitulo
                titulo="Visão geral"
                descricao="Resumo do período: indicadores principais, alertas e gráficos consolidados."
              />
              <RelatoriosAlertas alertas={data.alertas} />
              <RelatoriosKpiCards
                data={data.kpis}
                comparativo={data.comparativo}
              />
              <RelatoriosCharts
                serie={data.serieMensal}
                topVeiculos={data.rankings.topVeiculos}
                topClientes={data.rankings.topClientes}
                categorias={data.rankings.categorias}
                formasPagamento={data.formasPagamento}
              />
            </div>
          )}

          {secao === "financeiro" && (
            <div role="tabpanel" className="space-y-6">
              <SecaoTitulo
                titulo="Financeiro"
                descricao="Fluxo de caixa, categorias, formas de pagamento e previsão dos próximos 30 dias."
              />
              <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
                <Card>
                  <CardContent className="px-3 pt-4 pb-4 sm:pt-6">
                    <p className="text-xs text-muted-foreground">
                      Entradas previstas (30 dias)
                    </p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-500">
                      {formatCurrency(data.previsao.entradasPrevistas)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="px-3 pt-4 pb-4 sm:pt-6">
                    <p className="text-xs text-muted-foreground">
                      Saídas previstas (30 dias)
                    </p>
                    <p className="text-lg font-bold text-red-700 dark:text-red-500">
                      {formatCurrency(data.previsao.saidasPrevistas)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="px-3 pt-4 pb-4 sm:pt-6">
                    <p className="text-xs text-muted-foreground">Saldo previsto</p>
                    <p
                      className={`text-lg font-bold ${data.previsao.saldoPrevisto >= 0 ? "text-blue-700 dark:text-blue-500" : "text-red-700 dark:text-red-500"}`}
                    >
                      {formatCurrency(data.previsao.saldoPrevisto)}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <RelatoriosCharts
                serie={data.serieMensal}
                topVeiculos={[]}
                topClientes={[]}
                categorias={data.rankings.categorias}
                formasPagamento={data.formasPagamento}
              />
              <Card className="min-w-0">
                <CardContent className="space-y-3 px-3 pt-4 pb-4 sm:px-4 sm:pt-6">
                  <p className="text-sm font-medium">Lançamentos previstos</p>
                  {data.previsao.itens.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum lançamento previsto nos próximos 30 dias.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2 md:hidden">
                        {data.previsao.itens.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-lg border bg-muted/20 p-3 text-sm"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="min-w-0 font-medium">{item.descricao}</p>
                              <p
                                className={`shrink-0 font-semibold tabular-nums ${item.tipo === "parcela" ? "text-emerald-700 dark:text-emerald-500" : "text-red-700 dark:text-red-500"}`}
                              >
                                {formatCurrency(item.valor)}
                              </p>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.tipo === "parcela" ? "Parcela" : "Saída"} ·{" "}
                              {format(new Date(item.data), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Descrição</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.previsao.itens.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.descricao}</TableCell>
                                <TableCell>
                                  {item.tipo === "parcela" ? "Parcela" : "Saída"}
                                </TableCell>
                                <TableCell>
                                  {format(new Date(item.data), "dd/MM/yyyy", {
                                    locale: ptBR,
                                  })}
                                </TableCell>
                                <TableCell
                                  className={`text-right font-medium ${item.tipo === "parcela" ? "text-emerald-700 dark:text-emerald-500" : "text-red-700 dark:text-red-500"}`}
                                >
                                  {formatCurrency(item.valor)}
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
              <RelatoriosTabelasResumo
                topVeiculos={data.rankings.topVeiculos}
                topClientes={data.rankings.topClientes}
                categorias={data.rankings.categorias}
                serie={data.serieMensal}
              />
            </div>
          )}

          {secao === "frota" && (
            <div role="tabpanel" className="space-y-6">
              <SecaoTitulo
                titulo="Frota"
                descricao="Desempenho de cada veículo: ocupação, receita, custos e lucro no período."
              />
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Card>
                  <CardContent className="px-3 pt-4 pb-4 sm:pt-6">
                    <p className="text-xs text-muted-foreground">Taxa de ocupação (frota)</p>
                    <p className="text-2xl font-bold">
                      {data.kpis.taxaOcupacao.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="px-3 pt-4 pb-4 sm:pt-6">
                    <p className="text-xs text-muted-foreground">Custo manutenção</p>
                    <p className="text-xl font-bold sm:text-2xl">
                      {formatCurrency(data.kpis.custoManutencao)}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <RelatoriosFrotaTable frota={data.frota} />
            </div>
          )}

          {secao === "clientes" && (
            <div role="tabpanel" className="space-y-6">
              <SecaoTitulo
                titulo="Clientes"
                descricao="Base de clientes do período, inadimplência e ranking por receita."
              />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                <Card>
                  <CardContent className="px-3 pt-4 pb-4 sm:pt-6">
                    <p className="text-xs text-muted-foreground">Com locação no período</p>
                    <p className="text-2xl font-bold">
                      {data.clientes.totalComLocacao}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="px-3 pt-4 pb-4 sm:pt-6">
                    <p className="text-xs text-muted-foreground">Novos clientes</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-500">
                      {data.clientes.novos}
                    </p>
                  </CardContent>
                </Card>
                <Card className="col-span-2 sm:col-span-1">
                  <CardContent className="px-3 pt-4 pb-4 sm:pt-6">
                    <p className="text-xs text-muted-foreground">Recorrentes</p>
                    <p className="text-2xl font-bold">{data.clientes.recorrentes}</p>
                  </CardContent>
                </Card>
              </div>
              <RelatoriosInadimplencia itens={data.inadimplencia} />
              <RelatoriosTabelasResumo
                topVeiculos={[]}
                topClientes={data.rankings.topClientes}
                categorias={[]}
                serie={[]}
              />
            </div>
          )}

          {secao === "operacao" && (
            <div role="tabpanel" className="space-y-6">
              <SecaoTitulo
                titulo="Operação"
                descricao="Movimentação de locações e utilização da frota no período."
              />
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
                <Card>
                  <CardContent className="px-3 pt-4 pb-4 sm:pt-6">
                    <p className="text-xs text-muted-foreground">Locações iniciadas</p>
                    <p className="text-2xl font-bold">
                      {data.operacao.locacoesIniciadas}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="px-3 pt-4 pb-4 sm:pt-6">
                    <p className="text-xs text-muted-foreground">Locações finalizadas</p>
                    <p className="text-2xl font-bold">
                      {data.operacao.locacoesFinalizadas}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="px-3 pt-4 pb-4 sm:pt-6">
                    <p className="text-xs text-muted-foreground">Ativas / reservadas</p>
                    <p className="text-2xl font-bold">
                      {data.operacao.locacoesAtivasNoFim}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="px-3 pt-4 pb-4 sm:pt-6">
                    <p className="text-xs text-muted-foreground">Duração média (dias)</p>
                    <p className="text-2xl font-bold">
                      {data.operacao.diasMedioLocacao.toFixed(1)}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <RelatoriosFrotaTable frota={data.frota} />
            </div>
          )}

          {secao === "manutencao" && (
            <div role="tabpanel" className="space-y-6">
              <SecaoTitulo
                titulo="Manutenção"
                descricao="Serviços realizados e custos agrupados por tipo no período."
              />
              <Card className="min-w-0">
                <CardContent className="px-3 pt-4 pb-4 sm:px-4 sm:pt-6">
                  <p className="mb-3 text-xs text-muted-foreground">
                    Custo total no período:{" "}
                    <span className="font-semibold text-foreground">
                      {formatCurrency(data.kpis.custoManutencao)}
                    </span>
                  </p>
                  {data.manutencaoPorTipo.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Sem manutenções no período.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2 md:hidden">
                        {data.manutencaoPorTipo.map((m) => (
                          <div
                            key={m.tipo}
                            className="flex items-center justify-between gap-2 rounded-lg border bg-muted/20 p-3 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="font-medium">{m.tipo}</p>
                              <p className="text-xs text-muted-foreground">
                                {m.qtd} serviço{m.qtd !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <p className="shrink-0 font-semibold tabular-nums">
                              {formatCurrency(m.custo)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tipo de serviço</TableHead>
                              <TableHead className="text-right">Quantidade</TableHead>
                              <TableHead className="text-right">Custo total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.manutencaoPorTipo.map((m) => (
                              <TableRow key={m.tipo}>
                                <TableCell>{m.tipo}</TableCell>
                                <TableCell className="text-right">{m.qtd}</TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(m.custo)}
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
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
