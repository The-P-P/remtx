import { getTiposManutencao } from "@/lib/actions/manutencoes";
import { TiposManutencaoGrid } from "@/components/manutencoes/tipos-manutencao-grid";
import { ManutencoesSection } from "@/components/manutencoes/manutencoes-section";

export default async function ManutencoesTiposPage() {
  const tipos = await getTiposManutencao({ apenasAtivos: true });

  return (
    <ManutencoesSection>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Cadastre os tipos de manutenção e peças padrão da sua frota.
        </p>
        <TiposManutencaoGrid tipos={tipos} />
      </div>
    </ManutencoesSection>
  );
}
