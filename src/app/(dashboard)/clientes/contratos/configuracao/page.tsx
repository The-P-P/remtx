import { getConfiguracaoLocadoraAction } from "@/lib/actions/contratos";
import { ClientesSection } from "@/components/clientes/clientes-section";
import { ContratosNav } from "@/components/clientes/contratos-nav";
import { ConfigLocadoraForm } from "@/components/clientes/config-locadora-form";

export default async function ContratosConfiguracaoPage() {
  const config = await getConfiguracaoLocadoraAction();

  return (
    <ClientesSection description="Perfil do locador — nome, CPF, endereço e cláusulas usados automaticamente nos contratos">
      <ContratosNav />
      <ConfigLocadoraForm config={config} />
    </ClientesSection>
  );
}
