import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocacaoForm } from "@/components/locacoes/locacao-form";
import { LocacoesSection } from "@/components/locacoes/locacoes-section";
import { submitNovaLocacao } from "@/lib/actions/form-actions";
import {
  getVeiculosDisponiveisParaLocacao,
} from "@/lib/actions/locacoes";
import { getClientesParaSelect } from "@/lib/actions/clientes";

export default async function NovaLocacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ veiculoId?: string; clienteId?: string }>;
}) {
  const { veiculoId, clienteId } = await searchParams;
  const [veiculos, clientes] = await Promise.all([
    getVeiculosDisponiveisParaLocacao(),
    getClientesParaSelect(),
  ]);

  return (
    <LocacoesSection>
      <Card>
        <CardHeader>
          <CardTitle>Nova locação</CardTitle>
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
            />
          )}
        </CardContent>
      </Card>
    </LocacoesSection>
  );
}
