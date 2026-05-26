import { getCategoriasFinanceiras } from "@/lib/actions/financeiro";
import { parsePeriodoFinanceiro } from "@/lib/financeiro-periodo";
import { TransacaoForm } from "@/components/financeiro/transacao-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { submitNovaTransacao } from "@/lib/actions/form-actions";
import { financeiroQuery } from "@/lib/financeiro-periodo";

export default async function NovaTransacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const params = await searchParams;
  const { ano, mes } = parsePeriodoFinanceiro(params);
  const categorias = await getCategoriasFinanceiras(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo lançamento"
        description="Entrada ou saída manual"
        backHref={financeiroQuery(ano, mes)}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do lançamento</CardTitle>
        </CardHeader>
        <CardContent>
          <TransacaoForm
            action={submitNovaTransacao}
            categorias={categorias}
            submitLabel="Registrar"
            cancelHref={financeiroQuery(ano, mes)}
            redirectAno={ano}
            redirectMes={mes}
          />
        </CardContent>
      </Card>
    </div>
  );
}
