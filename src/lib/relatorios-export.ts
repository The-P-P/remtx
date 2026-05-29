import type { RelatorioGeralData } from "@/lib/relatorios-types";

function csvEscape(value: string | number) {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCsv(rows: (string | number)[][]) {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\n");
}

export function downloadRelatorioCsv(data: RelatorioGeralData) {
  const sections: string[] = [];

  sections.push("RELATÓRIO REMTX");
  const inicio =
    data.periodo.inicio instanceof Date
      ? data.periodo.inicio
      : new Date(data.periodo.inicio);
  const fim =
    data.periodo.fim instanceof Date ? data.periodo.fim : new Date(data.periodo.fim);
  sections.push(`Período,${inicio.toISOString().slice(0, 10)},${fim.toISOString().slice(0, 10)}`);
  sections.push("");

  sections.push("KPIs");
  sections.push(
    rowsToCsv([
      ["Indicador", "Valor"],
      ["Receita", data.kpis.receita],
      ["Despesa", data.kpis.despesa],
      ["Lucro", data.kpis.lucro],
      ["Receita locação", data.kpis.receitaLocacao],
      ["Custo manutenção", data.kpis.custoManutencao],
      ["Ticket médio", data.kpis.ticketMedio],
      ["Taxa ocupação %", data.kpis.taxaOcupacao],
      ["Inadimplência %", data.kpis.inadimplencia],
    ])
  );
  sections.push("");

  sections.push("Frota por veículo");
  sections.push(
    rowsToCsv([
      ["Placa", "Modelo", "Dias locados", "Dias parados", "Ocupação %", "Receita", "Manutenção", "Financiamento", "Lucro"],
      ...data.frota.map((v) => [
        v.placa,
        v.modelo,
        v.diasLocados,
        v.diasParados,
        v.taxaOcupacao,
        v.receita,
        v.custoManutencao,
        v.custoFinanciamento,
        v.lucro,
      ]),
    ])
  );
  sections.push("");

  sections.push("Inadimplência");
  sections.push(
    rowsToCsv([
      ["Cliente", "Placa", "Vencimento", "Dias atraso", "Valor"],
      ...data.inadimplencia.map((i) => [
        i.clienteNome,
        i.veiculoPlaca,
        i.dataVencimento.slice(0, 10),
        i.diasAtraso,
        i.valor,
      ]),
    ])
  );
  sections.push("");

  sections.push("Top veículos");
  sections.push(
    rowsToCsv([
      ["Placa", "Modelo", "Pagamentos", "Receita"],
      ...data.rankings.topVeiculos.map((v) => [v.placa, v.modelo, v.qtd, v.receita]),
    ])
  );
  sections.push("");

  sections.push("Top clientes");
  sections.push(
    rowsToCsv([
      ["Cliente", "Pagamentos", "Receita"],
      ...data.rankings.topClientes.map((c) => [c.nome, c.qtd, c.receita]),
    ])
  );

  const blob = new Blob(["\uFEFF" + sections.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio-remtx-${inicio.toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
