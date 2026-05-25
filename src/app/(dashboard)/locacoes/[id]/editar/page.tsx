import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocacaoEditForm } from "@/components/locacoes/locacao-edit-form";
import { PageHeader } from "@/components/shared/page-header";
import { getLocacaoById } from "@/lib/actions/locacoes";
import { submitEditarLocacao } from "@/lib/actions/form-actions";

export default async function EditarLocacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locacao = await getLocacaoById(id);
  if (!locacao) notFound();

  if (!["RESERVADA", "ATIVA"].includes(locacao.status)) {
    redirect(`/locacoes/${id}`);
  }

  const boundAction = submitEditarLocacao.bind(null, id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar locação"
        description={`${locacao.veiculo.placa} — ${locacao.cliente.nome}`}
        backHref={`/locacoes/${id}`}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <LocacaoEditForm
            action={boundAction}
            locacaoId={id}
            initial={{
              dataFimPrevista: locacao.dataFimPrevista,
              valorDiaria: Number(locacao.valorDiaria),
              observacoes: locacao.observacoes,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
