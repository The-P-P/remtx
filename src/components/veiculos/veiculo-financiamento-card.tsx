import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { resumoFinanciamento } from "@/lib/financiamento-parcelas";
import { ParcelaFinanciamentoPagarDialog } from "@/components/veiculos/parcela-financiamento-pagar-dialog";
import { ParcelaFinanciamentoEstornarButton } from "@/components/veiculos/parcela-financiamento-estornar-button";
import { startOfDay } from "date-fns";

type FinanciamentoPayload = {
  id: string;
  instituicao: string | null;
  valorFinanciado: unknown;
  valorEntrada: unknown;
  saldoDevedor: unknown;
  valorParcela: unknown;
  totalParcelas: number;
  diaVencimento: number;
  dataPrimeiraParcela: Date;
  ativo: boolean;
  quitadoEm: Date | null;
  observacoes: string | null;
  parcelas: {
    id: string;
    numero: number;
    valor: unknown;
    dataVencimento: Date;
    dataPagamento: Date | null;
  }[];
};

export function VeiculoFinanciamentoCard({
  financiamento,
}: {
  financiamento: FinanciamentoPayload;
}) {
  const resumo = resumoFinanciamento(financiamento.parcelas);
  const proxima = financiamento.parcelas.find((p) => !p.dataPagamento);
  const hoje = startOfDay(new Date());

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>Financiamento</CardTitle>
        {resumo.quitado ? (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200">
            Quitado
          </Badge>
        ) : financiamento.ativo ? (
          <Badge variant="outline">Em andamento</Badge>
        ) : (
          <Badge variant="outline">Inativo</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Saldo devedor</p>
            <p className="text-lg font-bold tabular-nums text-red-700 dark:text-red-500">
              {formatCurrency(Number(financiamento.saldoDevedor))}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Parcela mensal</p>
            <p className="font-semibold tabular-nums">
              {formatCurrency(Number(financiamento.valorParcela))}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Parcelas restantes</p>
            <p className="font-semibold">
              {resumo.parcelasRestantes} de {financiamento.totalParcelas}
            </p>
            <p className="text-xs text-muted-foreground">
              {resumo.parcelasPagas} paga(s)
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vencimento</p>
            <p className="font-semibold">Dia {financiamento.diaVencimento}</p>
            {financiamento.instituicao && (
              <p className="text-xs text-muted-foreground">
                {financiamento.instituicao}
              </p>
            )}
          </div>
        </div>

        {financiamento.observacoes && (
          <p className="text-sm text-muted-foreground">{financiamento.observacoes}</p>
        )}

        {proxima && !resumo.quitado && (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="font-medium">Próxima parcela</p>
            <p className="text-muted-foreground">
              {proxima.numero}ª · vence em{" "}
              {format(proxima.dataVencimento, "dd/MM/yyyy", { locale: ptBR })} ·{" "}
              {formatCurrency(Number(proxima.valor))}
            </p>
          </div>
        )}

        <div className="max-h-72 overflow-y-auto rounded-lg border">
          <ul className="divide-y">
            {financiamento.parcelas.map((p) => {
              const paga = !!p.dataPagamento;
              const atrasada =
                !paga && startOfDay(p.dataVencimento) < hoje;
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
                >
                  <div>
                    <span className="font-medium">{p.numero}ª parcela</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span className="tabular-nums">{formatCurrency(Number(p.valor))}</span>
                    <p className="text-xs text-muted-foreground">
                      Venc. {format(p.dataVencimento, "dd/MM/yyyy", { locale: ptBR })}
                      {paga &&
                        p.dataPagamento &&
                        ` · Pago em ${format(p.dataPagamento, "dd/MM/yyyy", { locale: ptBR })}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {paga ? (
                      <>
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200">
                          Paga
                        </Badge>
                        <ParcelaFinanciamentoEstornarButton parcelaId={p.id} />
                      </>
                    ) : (
                      <>
                        {atrasada && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-200">
                            Atrasada
                          </Badge>
                        )}
                        <ParcelaFinanciamentoPagarDialog
                          parcelaId={p.id}
                          numero={p.numero}
                          totalParcelas={financiamento.totalParcelas}
                          valor={Number(p.valor)}
                          dataVencimento={p.dataVencimento}
                        />
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          Valor financiado: {formatCurrency(Number(financiamento.valorFinanciado))}
          {Number(financiamento.valorEntrada) > 0 &&
            ` · Entrada: ${formatCurrency(Number(financiamento.valorEntrada))}`}
        </p>
      </CardContent>
    </Card>
  );
}
