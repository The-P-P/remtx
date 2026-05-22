import { PageHeader } from "@/components/shared/page-header";
import { VeiculoForm } from "@/components/veiculos/veiculo-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitNovoVeiculo } from "@/lib/actions/form-actions";

export default function NovoVeiculoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo veículo"
        description="Cadastre um veículo na frota"
        backHref="/veiculos"
      />
      <Card>
        <CardHeader>
          <CardTitle>Dados do veículo</CardTitle>
        </CardHeader>
        <CardContent>
          <VeiculoForm
            action={submitNovoVeiculo}
            submitLabel="Cadastrar veículo"
            cancelHref="/veiculos"
          />
        </CardContent>
      </Card>
    </div>
  );
}
