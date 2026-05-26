import { notFound } from "next/navigation";
import { getCategoriaById } from "@/lib/actions/financeiro";
import { CategoriaForm } from "@/components/financeiro/categoria-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { submitEditarCategoria } from "@/lib/actions/form-actions";

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoria = await getCategoriaById(id);
  if (!categoria) notFound();

  const boundAction = submitEditarCategoria.bind(null, id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar categoria"
        backHref="/financeiro/categorias"
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{categoria.nome}</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoriaForm
            action={boundAction}
            initial={{
              nome: categoria.nome,
              tipo: categoria.tipo,
              ativo: categoria.ativo,
            }}
            submitLabel="Salvar"
            cancelHref="/financeiro/categorias"
          />
        </CardContent>
      </Card>
    </div>
  );
}
