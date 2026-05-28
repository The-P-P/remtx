import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RelatoriosSection } from "@/components/relatorios/relatorios-section";
import { RelatoriosFiltros } from "@/components/relatorios/relatorios-filtros";
import { RelatoriosKpiCards } from "@/components/relatorios/relatorios-kpi-cards";
import { RelatoriosRankings } from "@/components/relatorios/relatorios-rankings";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { getRelatorioGeral } from "@/lib/relatorios";

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string; de?: string; ate?: string }>;
}) {
  const params = await searchParams;
  const rel = await getRelatorioGeral(params);

  return (
    <RelatoriosSection>
      <RelatoriosFiltros
        ano={rel.periodo.ano}
        mes={rel.periodo.mes}
        de={params.de}
        ate={params.ate}
      />

      <Card className="bg-muted/20">
        <CardContent className="pt-4 text-sm">
          <span className="text-muted-foreground">Período analisado:</span>{" "}
          <strong>
            {format(rel.periodo.inicio, "dd/MM/yyyy", { locale: ptBR })} até{" "}
            {format(rel.periodo.fim, "dd/MM/yyyy", { locale: ptBR })}
          </strong>
          <span className="ml-2 text-muted-foreground">
            • Atrasadas: {rel.kpis.parcelasAtrasadas} parcela(s) ({formatCurrency(rel.kpis.valorAtrasado)})
          </span>
        </CardContent>
      </Card>

      <RelatoriosKpiCards data={rel.kpis} />

      <RelatoriosRankings
        topVeiculos={rel.rankings.topVeiculos}
        topClientes={rel.rankings.topClientes}
        categorias={rel.rankings.categorias}
        serie={rel.serieMensal}
      />
    </RelatoriosSection>
  );
}
