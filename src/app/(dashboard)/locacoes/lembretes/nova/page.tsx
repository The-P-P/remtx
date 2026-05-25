import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventoAgendaForm } from "@/components/locacoes/evento-agenda-form";
import { LocacoesSection } from "@/components/locacoes/locacoes-section";
import { submitNovoEventoAgenda } from "@/lib/actions/form-actions";
import { getClientesParaSelect } from "@/lib/actions/clientes";
import { prisma } from "@/lib/prisma";

export default async function NovoLembretePage() {
  const [clientes, veiculos] = await Promise.all([
    getClientesParaSelect(),
    prisma.veiculo.findMany({
      where: { status: { not: "INATIVO" } },
      orderBy: { placa: "asc" },
      select: { id: true, placa: true, marca: true, modelo: true },
    }),
  ]);

  return (
    <LocacoesSection>
      <Card>
        <CardHeader>
          <CardTitle>Novo lembrete na agenda</CardTitle>
        </CardHeader>
        <CardContent>
          <EventoAgendaForm
            action={submitNovoEventoAgenda}
            veiculos={veiculos}
            clientes={clientes}
          />
        </CardContent>
      </Card>
    </LocacoesSection>
  );
}
