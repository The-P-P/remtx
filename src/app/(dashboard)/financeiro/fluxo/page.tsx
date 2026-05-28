import { getFluxoAno } from "@/lib/actions/financeiro";
import { FinanceiroSection } from "@/components/financeiro/financeiro-section";
import { FluxoCaixaTable } from "@/components/financeiro/fluxo-caixa-table";

export default async function FluxoCaixaPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; granularidade?: string }>;
}) {
  const { ano, granularidade } = await searchParams;
  const gran =
    granularidade === "diario" || granularidade === "semanal"
      ? granularidade
      : "mensal";
  const fluxo = await getFluxoAno(ano, gran);

  return (
    <FinanceiroSection showNovaTransacao={false}>
      <FluxoCaixaTable
        ano={fluxo.ano}
        granularidade={fluxo.granularidade}
        periodos={fluxo.periodos}
        totalEntradas={fluxo.totalEntradas}
        totalSaidas={fluxo.totalSaidas}
        saldoAno={fluxo.saldoAno}
      />
    </FinanceiroSection>
  );
}
