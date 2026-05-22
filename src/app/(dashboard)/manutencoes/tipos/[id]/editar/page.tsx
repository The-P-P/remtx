import { notFound } from "next/navigation";
import { getTipoManutencaoById } from "@/lib/actions/manutencoes";
import { PageHeader } from "@/components/shared/page-header";
import { TipoManutencaoForm } from "@/components/manutencoes/tipo-manutencao-form";
import { TipoManutencaoDeleteButton } from "@/components/manutencoes/tipo-manutencao-delete-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { submitEditarTipoManutencao } from "@/lib/actions/form-actions";

export default async function EditarTipoManutencaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tipo = await getTipoManutencaoById(id);
  if (!tipo) notFound();

  const boundAction = submitEditarTipoManutencao.bind(null, id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar ${tipo.nome}`}
        description="Altere intervalo, descrição e peças padrão deste tipo"
        backHref="/manutencoes"
        action={
          <TipoManutencaoDeleteButton
            id={id}
            nome={tipo.nome}
            totalManutencoes={tipo._count.manutencoes}
            variant="button"
          />
        }
      />

      {!tipo.ativo && (
        <Badge variant="secondary" className="w-fit">
          Tipo inativo
        </Badge>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tipo e peças padrão</CardTitle>
        </CardHeader>
        <CardContent>
          <TipoManutencaoForm
            action={boundAction}
            initial={tipo}
            submitLabel="Salvar alterações"
            cancelHref="/manutencoes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
