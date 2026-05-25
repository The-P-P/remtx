import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteForm } from "@/components/clientes/cliente-form";
import { PageHeader } from "@/components/shared/page-header";
import { getClienteById } from "@/lib/actions/clientes";
import { submitEditarCliente } from "@/lib/actions/form-actions";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await getClienteById(id);
  if (!cliente) notFound();

  const boundAction = submitEditarCliente.bind(null, id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar cliente"
        description={cliente.nome}
        backHref={`/clientes/${id}`}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <ClienteForm
            action={boundAction}
            initial={{
              nome: cliente.nome,
              cpf: cliente.cpf,
              telefone: cliente.telefone,
              email: cliente.email,
              endereco: cliente.endereco,
              observacoes: cliente.observacoes,
            }}
            submitLabel="Salvar"
            cancelHref={`/clientes/${id}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
