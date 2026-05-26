import { notFound } from "next/navigation";
import {
  getTransacaoById,
  getCategoriasFinanceiras,
} from "@/lib/actions/financeiro";
import { parsePeriodoFinanceiro } from "@/lib/financeiro-periodo";
import { TransacaoForm } from "@/components/financeiro/transacao-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { submitEditarTransacao } from "@/lib/actions/form-actions";
import { financeiroQuery } from "@/lib/financeiro-periodo";

export default async function EditarTransacaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { ano, mes } = parsePeriodoFinanceiro(sp);

  const [transacao, categorias] = await Promise.all([
    getTransacaoById(id),
    getCategoriasFinanceiras(),
  ]);

  if (!transacao) notFound();

  const boundAction = submitEditarTransacao.bind(null, id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar lançamento"
        backHref={financeiroQuery(ano, mes)}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do lançamento</CardTitle>
        </CardHeader>
        <CardContent>
          <TransacaoForm
            action={boundAction}
            categorias={categorias}
            initial={{
              tipo: transacao.tipo,
              categoriaId: transacao.categoriaId,
              valor: Number(transacao.valor),
              descricao: transacao.descricao,
              data: transacao.data,
            }}
            submitLabel="Salvar"
            cancelHref={financeiroQuery(ano, mes)}
            redirectAno={ano}
            redirectMes={mes}
          />
        </CardContent>
      </Card>
    </div>
  );
}
