import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getTransacoesParaExport } from "@/lib/actions/financeiro";
import { transacoesParaCsv } from "@/lib/financeiro-export";
import { parsePeriodoFinanceiro } from "@/lib/financeiro-periodo";
import { format } from "date-fns";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "financeiro")) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const url = new URL(request.url);
  const params = {
    ano: url.searchParams.get("ano") ?? undefined,
    mes: url.searchParams.get("mes") ?? undefined,
    de: url.searchParams.get("de") ?? undefined,
    ate: url.searchParams.get("ate") ?? undefined,
    tipo: url.searchParams.get("tipo") ?? undefined,
    categoriaId: url.searchParams.get("categoriaId") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
  };

  const periodo = parsePeriodoFinanceiro(params);
  const rows = await getTransacoesParaExport(params);
  const csv = transacoesParaCsv(rows);

  const nomeArquivo =
    periodo.modo === "intervalo"
      ? `lancamentos-${format(periodo.inicio, "yyyy-MM-dd")}-${format(periodo.fim, "yyyy-MM-dd")}.csv`
      : `lancamentos-${periodo.ano}-${String(periodo.mes).padStart(2, "0")}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
