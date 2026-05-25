import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocacaoForm } from "@/components/locacoes/locacao-form";
import { PageHeader } from "@/components/shared/page-header";
import { submitNovaLocacao } from "@/lib/actions/form-actions";
import { getVeiculosDisponiveisParaLocacao } from "@/lib/actions/locacoes";
import { getClientesParaSelect } from "@/lib/actions/clientes";

export default async function ClientesNovaLocacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ veiculoId?: string; clienteId?: string }>;
}) {
  const { veiculoId, clienteId } = await searchParams;
  const [veiculos, clientes] = await Promise.all([
    getVeiculosDisponiveisParaLocacao(),
    getClientesParaSelect(),
  ]);

  const cancelHref = clienteId
    ? `/clientes/${clienteId}`
    : "/clientes";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova locação"
        description="Registrar aluguel para um cliente"
        backHref={cancelHref}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do contrato</CardTitle>
        </CardHeader>
        <CardContent>
          {clientes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Cadastre um cliente antes de criar a locação.{" "}
              <Link href="/clientes/novo" className="underline">
                Novo cliente
              </Link>
            </p>
          ) : (
            <LocacaoForm
              action={submitNovaLocacao}
              veiculos={veiculos}
              clientes={clientes}
              veiculoIdPreselect={veiculoId}
              clienteIdPreselect={clienteId}
              cancelHref={cancelHref}
              retornoCliente
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
