import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteForm } from "@/components/clientes/cliente-form";
import { PageHeader } from "@/components/shared/page-header";
import { submitNovoCliente } from "@/lib/actions/form-actions";

export default function NovoClientePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo cliente"
        description="Cadastro de cliente"
        backHref="/clientes"
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClienteForm
            action={submitNovoCliente}
            submitLabel="Cadastrar"
            cancelHref="/clientes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
