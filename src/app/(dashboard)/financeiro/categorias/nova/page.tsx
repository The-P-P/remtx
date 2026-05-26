import { CategoriaForm } from "@/components/financeiro/categoria-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { submitNovaCategoria } from "@/lib/actions/form-actions";

export default function NovaCategoriaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova categoria"
        description="Classificação para entradas ou saídas"
        backHref="/financeiro/categorias"
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoriaForm
            action={submitNovaCategoria}
            submitLabel="Cadastrar"
            cancelHref="/financeiro/categorias"
          />
        </CardContent>
      </Card>
    </div>
  );
}
