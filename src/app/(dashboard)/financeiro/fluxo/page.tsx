import { getFluxoMensalAno } from "@/lib/actions/financeiro";
import { FinanceiroSection } from "@/components/financeiro/financeiro-section";
import { FluxoCaixaTable } from "@/components/financeiro/fluxo-caixa-table";

export default async function FluxoCaixaPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string }>;
}) {
  const { ano } = await searchParams;
  const fluxo = await getFluxoMensalAno(ano);

  return (
    <FinanceiroSection showNovaTransacao={false}>
      <FluxoCaixaTable
        ano={fluxo.ano}
        meses={fluxo.meses}
        totalEntradas={fluxo.totalEntradas}
        totalSaidas={fluxo.totalSaidas}
        saldoAno={fluxo.saldoAno}
      />
    </FinanceiroSection>
  );
}
