import { notFound } from "next/navigation";
import {
  getManutencaoById,
  getVeiculosParaSelect,
  getTiposManutencao,
} from "@/lib/actions/manutencoes";
import { PageHeader } from "@/components/shared/page-header";
import { ManutencaoForm } from "@/components/manutencoes/manutencao-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitEditarManutencao } from "@/lib/actions/form-actions";
import { ManutencaoDeleteButton } from "@/components/manutencoes/manutencao-delete-button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function EditarManutencaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const manutencao = await getManutencaoById(id);
  if (!manutencao) notFound();

  const [veiculos, tipos] = await Promise.all([
    getVeiculosParaSelect(),
    getTiposManutencao({
      apenasAtivos: true,
      incluirId: manutencao.tipoManutencaoId,
    }),
  ]);

  const boundAction = submitEditarManutencao.bind(null, id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar manutenção"
        description={`${manutencao.veiculo.placa} — ${manutencao.tipoManutencao.nome}`}
        backHref="/manutencoes"
        action={
          <ManutencaoDeleteButton
            id={id}
            variant="button"
            descricao={`${manutencao.veiculo.placa} — ${manutencao.tipoManutencao.nome} (${format(manutencao.dataRealizada, "dd/MM/yyyy", { locale: ptBR })})`}
          />
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Ordem de serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <ManutencaoForm
            action={boundAction}
            veiculos={veiculos}
            tipos={tipos}
            mode="edit"
            initial={{
              veiculoId: manutencao.veiculoId,
              tipoManutencaoId: manutencao.tipoManutencaoId,
              dataRealizada: manutencao.dataRealizada,
              kmRealizada: manutencao.kmRealizada,
              kmProxima: manutencao.kmProxima,
              custo: manutencao.custo ? Number(manutencao.custo) : null,
              observacoes: manutencao.observacoes,
              pecas: manutencao.pecas.map((p) => ({
                nome: p.nome,
                quantidade: p.quantidade,
                valorUnitario: p.valorUnitario
                  ? Number(p.valorUnitario)
                  : undefined,
              })),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
