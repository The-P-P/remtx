import { RelatoriosSection } from "@/components/relatorios/relatorios-section";
import { RelatoriosFiltros } from "@/components/relatorios/relatorios-filtros";
import { RelatoriosDashboard } from "@/components/relatorios/relatorios-dashboard";
import { getRelatorioGeral } from "@/lib/relatorios";

function detectPreset(params: {
  de?: string;
  ate?: string;
  ano?: string;
  mes?: string;
}): string | undefined {
  if (params.de && params.ate) {
    const de = new Date(params.de);
    const ate = new Date(params.ate);
    const diff = Math.round((ate.getTime() - de.getTime()) / 86400000);
    if (diff >= 28 && diff <= 31) return "30d";
    if (diff >= 88 && diff <= 92) return "90d";
    return undefined;
  }
  const agora = new Date();
  if (
    params.ano === String(agora.getFullYear()) &&
    params.mes === String(agora.getMonth() + 1)
  ) {
    return "mes";
  }
  return undefined;
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{
    ano?: string;
    mes?: string;
    de?: string;
    ate?: string;
  }>;
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
        activePreset={detectPreset(params)}
      />
      <RelatoriosDashboard data={rel} />
    </RelatoriosSection>
  );
}
