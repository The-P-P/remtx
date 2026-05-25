import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocacaoForm } from "@/components/locacoes/locacao-form";
import { PageHeader } from "@/components/shared/page-header";
import { submitNovaLocacao } from "@/lib/actions/form-actions";
import { getVeiculosDisponiveisParaLocacao } from "@/lib/actions/locacoes";
import { getClienteById, getClientesParaSelect } from "@/lib/actions/clientes";

export default async function ClienteNovaLocacaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ veiculoId?: string }>;
}) {
  const { id } = await params;
  const { veiculoId } = await searchParams;
  const cliente = await getClienteById(id);
  if (!cliente) notFound();

  const [veiculos, clientes] = await Promise.all([
    getVeiculosDisponiveisParaLocacao(),
    getClientesParaSelect(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova locação"
        description={cliente.nome}
        backHref={`/clientes/${id}`}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contrato para {cliente.nome}</CardTitle>
        </CardHeader>
        <CardContent>
          <LocacaoForm
            action={submitNovaLocacao}
            veiculos={veiculos}
            clientes={clientes}
            veiculoIdPreselect={veiculoId}
            clienteIdPreselect={id}
            cancelHref={`/clientes/${id}`}
            retornoCliente
            clienteIdFixo={id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
