import {
  getVeiculosParaSelect,
  getTiposManutencao,
} from "@/lib/actions/manutencoes";
import { PageHeader } from "@/components/shared/page-header";
import { ManutencaoForm } from "@/components/manutencoes/manutencao-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitNovaManutencao } from "@/lib/actions/form-actions";

export default async function NovaManutencaoPage({
  searchParams,
}: {
  searchParams: Promise<{ veiculoId?: string }>;
}) {
  const { veiculoId } = await searchParams;
  const [veiculos, tipos] = await Promise.all([
    getVeiculosParaSelect(),
    getTiposManutencao(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar manutenção"
        description="Atualiza km do veículo, gera alerta e inclui peças do tipo"
        backHref="/manutencoes"
      />
      <Card>
        <CardHeader>
          <CardTitle>Ordem de serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <ManutencaoForm
            action={submitNovaManutencao}
            veiculos={veiculos}
            tipos={tipos}
            veiculoIdPreselect={veiculoId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
