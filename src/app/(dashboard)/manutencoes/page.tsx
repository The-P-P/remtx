import { getManutencoes } from "@/lib/actions/manutencoes";
import { Card, CardContent } from "@/components/ui/card";
import { ManutencoesHistoricoList } from "@/components/manutencoes/manutencoes-historico-list";
import { ManutencoesSection } from "@/components/manutencoes/manutencoes-section";

export default async function ManutencoesHistoricoPage() {
  const manutencoes = await getManutencoes();

  return (
    <ManutencoesSection>
      <Card>
        <CardContent className="p-0">
          <ManutencoesHistoricoList manutencoes={manutencoes} />
        </CardContent>
      </Card>
    </ManutencoesSection>
  );
}
