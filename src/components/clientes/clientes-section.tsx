import { ClientesNav } from "@/components/clientes/clientes-nav";
import { PageHeader } from "@/components/shared/page-header";

export function ClientesSection({
  children,
  description = "Cadastro de clientes e contratos de locação",
  action,
}: {
  children: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Clientes"
        description={description}
        action={action}
      />
      <ClientesNav />
      {children}
    </div>
  );
}
