import Link from "next/link";
import { Plus } from "lucide-react";
import { getClientes } from "@/lib/actions/clientes";
import { PageHeader } from "@/components/shared/page-header";
import { PageActions } from "@/components/shared/page-actions";
import { Button } from "@/components/ui/button";
import { ClientesList } from "@/components/clientes/clientes-list";
import { Input } from "@/components/ui/input";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clientes = await getClientes(q);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Clientes"
        description="Cadastro de clientes da locadora"
        action={
          <PageActions>
            <Button className="w-full sm:w-auto" render={<Link href="/clientes/novo" />}>
              <Plus className="size-4" />
              Novo cliente
            </Button>
          </PageActions>
        }
      />

      <form method="get" className="flex max-w-md gap-2">
        <Input
          name="q"
          placeholder="Buscar nome, CPF ou telefone..."
          defaultValue={q ?? ""}
        />
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      <ClientesList clientes={clientes} />
    </div>
  );
}
