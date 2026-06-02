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
        className="flex w-full gap-0 overflow-x-auto overscroll-x-contain px-1 pb-px [-webkit-overflow-scrolling:touch] sm:px-4"
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
                "shrink-0 snap-start border-b-2 px-2.5 py-2.5 text-xs font-medium transition-colors sm:px-4 sm:py-3 sm:text-sm",
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
