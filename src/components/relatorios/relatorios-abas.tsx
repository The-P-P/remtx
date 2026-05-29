"use client";

import { cn } from "@/lib/utils";

export const RELATORIO_SECOES = [
  { id: "geral", label: "Visão geral" },
  { id: "financeiro", label: "Financeiro" },
  { id: "frota", label: "Frota" },
  { id: "clientes", label: "Clientes" },
  { id: "operacao", label: "Operação" },
  { id: "manutencao", label: "Manutenção" },
] as const;

export type RelatorioSecaoId = (typeof RELATORIO_SECOES)[number]["id"];

export function RelatoriosAbas({
  ativa,
  onChange,
}: {
  ativa: RelatorioSecaoId;
  onChange: (id: RelatorioSecaoId) => void;
}) {
  return (
    <div className="w-full border-b border-border/60 bg-muted/20">
      <nav
        className="flex w-full gap-0 overflow-x-auto px-2 sm:px-4"
        role="tablist"
        aria-label="Seções do relatório"
      >
        {RELATORIO_SECOES.map((secao) => {
          const selecionada = ativa === secao.id;

          return (
            <button
              key={secao.id}
              type="button"
              role="tab"
              aria-selected={selecionada}
              onClick={() => onChange(secao.id)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4",
                selecionada
                  ? "border-primary bg-background text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-background/60 hover:text-foreground"
              )}
            >
              {secao.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
