import { getTiposManutencao } from "@/lib/actions/manutencoes";
import { TiposManutencaoGrid } from "@/components/manutencoes/tipos-manutencao-grid";
import { ManutencoesSection } from "@/components/manutencoes/manutencoes-section";

export default async function ManutencoesTiposPage() {
  const tipos = await getTiposManutencao();

  return (
    <ManutencoesSection>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Catálogo com {tipos.length} tipos de manutenção preventiva para hatch, sedan e
          compactos populares no Brasil (Onix, Gol, Argo, HB20, Polo, Kwid, Corolla, etc.).
        </p>
        <TiposManutencaoGrid tipos={tipos} />
      </div>
    </ManutencoesSection>
  );
}
