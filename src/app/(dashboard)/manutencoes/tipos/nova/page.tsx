import { PageHeader } from "@/components/shared/page-header";
import { TipoManutencaoForm } from "@/components/manutencoes/tipo-manutencao-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitNovoTipoManutencao } from "@/lib/actions/form-actions";

export default function NovoTipoManutencaoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo tipo de manutenção"
        description="Define intervalo em km e lista de peças padrão por revisão"
        backHref="/manutencoes"
      />
      <Card>
        <CardHeader>
          <CardTitle>Tipo e peças padrão</CardTitle>
        </CardHeader>
        <CardContent>
          <TipoManutencaoForm action={submitNovoTipoManutencao} />
        </CardContent>
      </Card>
    </div>
  );
}
