import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash2, Calendar } from "lucide-react";
import { getClienteById } from "@/lib/actions/clientes";
import { deleteClienteAction } from "@/lib/actions/form-actions";
import { PageHeader } from "@/components/shared/page-header";
import { PageActions } from "@/components/shared/page-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocacaoStatusBadge } from "@/components/locacoes/locacao-status-badge";

import { formatCpfDisplay, formatTelefoneDisplay } from "@/lib/format/br";

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await getClienteById(id);
  if (!cliente) notFound();

  const podeExcluirCliente = cliente.locacoes.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={cliente.nome}
        description={formatCpfDisplay(cliente.cpf)}
        backHref="/clientes"
        action={
          <PageActions>
            <Button
              variant="outline"
              render={<Link href={`/clientes/${id}/editar`} />}
            >
              <Pencil className="size-4" />
              Editar
            </Button>
            <Button
              render={<Link href={`/clientes/${id}/locacoes/nova`} />}
            >
              <Calendar className="size-4" />
              Nova locação
            </Button>
            {podeExcluirCliente && (
              <form action={deleteClienteAction.bind(null, id)}>
                <Button
                  type="submit"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="size-4" />
                  Excluir
                </Button>
              </form>
            )}
          </PageActions>
        }
      />

      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Telefone</p>
            <p className="font-medium">{formatTelefoneDisplay(cliente.telefone)}</p>
          </div>
          {cliente.email && (
            <div>
              <p className="text-xs text-muted-foreground">E-mail</p>
              <p className="font-medium">{cliente.email}</p>
            </div>
          )}
          {cliente.endereco && (
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Endereço</p>
              <p className="font-medium">{cliente.endereco}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Histórico de locações</CardTitle>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/clientes/${id}/locacoes/nova`} />}
          >
            <Calendar className="size-4" />
            Nova
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {cliente.locacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma locação.{" "}
              <Link
                href={`/clientes/${id}/locacoes/nova`}
                className="underline"
              >
                Criar primeira locação
              </Link>
            </p>
          ) : (
            cliente.locacoes.map((l) => (
              <Link
                key={l.id}
                href={`/locacoes/${l.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">
                    {l.veiculo.placa} — {l.veiculo.modelo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(l.dataInicio, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <LocacaoStatusBadge status={l.status} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
