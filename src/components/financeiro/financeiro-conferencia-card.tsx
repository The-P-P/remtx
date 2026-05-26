import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Conferencia = Awaited<
  ReturnType<typeof import("@/lib/financeiro-conferencia").getConferenciaLocacaoPeriodo>
>;

export function FinanceiroConferenciaCard({
  conferencia,
}: {
  conferencia: Conferencia;
}) {
  const ok = conferencia.semLancamento === 0 && conferencia.diferenca === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conferência — locações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Parcelas pagas</p>
            <p className="font-semibold">{formatCurrency(conferencia.totalParcelas)}</p>
            <p className="text-xs text-muted-foreground">
              {conferencia.parcelasPagas} pagamento(s)
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">No financeiro</p>
            <p className="font-semibold">
              {formatCurrency(conferencia.totalFinanceiro)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Diferença</p>
            <p
              className={`font-semibold ${conferencia.diferenca === 0 ? "text-emerald-700 dark:text-emerald-500" : "text-amber-700 dark:text-amber-400"}`}
            >
              {formatCurrency(conferencia.diferenca)}
            </p>
          </div>
        </div>

        {ok ? (
          <p className="text-emerald-700 dark:text-emerald-400">
            Pagamentos de locação e lançamentos no financeiro estão alinhados no
            período.
          </p>
        ) : (
          <>
            {conferencia.semLancamento > 0 && (
              <p className="text-amber-800 dark:text-amber-200">
                {conferencia.semLancamento} parcela(s) paga(s) sem entrada no
                financeiro (check sem &quot;Registrar no financeiro&quot;).
              </p>
            )}
            {conferencia.exemplosSemLancamento.length > 0 && (
              <ul className="rounded-md border bg-muted/30 p-3 text-xs space-y-1">
                {conferencia.exemplosSemLancamento.map((e) => (
                  <li key={e.parcelaId}>
                    <Link
                      href={`/locacoes/${e.locacaoId}`}
                      className="underline"
                    >
                      {e.placa} — {e.cliente}
                    </Link>
                    : {formatCurrency(e.valor)}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
