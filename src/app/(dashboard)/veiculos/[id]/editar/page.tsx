import { notFound } from "next/navigation";
import { getVeiculoById } from "@/lib/actions/veiculos";
import { PageHeader } from "@/components/shared/page-header";
import { VeiculoForm } from "@/components/veiculos/veiculo-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitEditarVeiculo } from "@/lib/actions/form-actions";
import { VeiculoDeleteButtonServer } from "@/components/veiculos/veiculo-delete-button-lazy";
import { PageActions } from "@/components/shared/page-actions";

export default async function EditarVeiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const veiculo = await getVeiculoById(id);
  if (!veiculo) notFound();

  const boundAction = submitEditarVeiculo.bind(null, id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar ${veiculo.placa}`}
        backHref={`/veiculos/${id}`}
        action={
          <PageActions>
            <VeiculoDeleteButtonServer id={id} variant="button" />
          </PageActions>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Dados do veículo</CardTitle>
        </CardHeader>
        <CardContent>
          <VeiculoForm
            action={boundAction}
            initial={veiculo}
            submitLabel="Salvar alterações"
            cancelHref={`/veiculos/${id}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
