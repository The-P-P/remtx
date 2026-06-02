import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

export function RelatoriosSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 max-w-full space-y-4 sm:space-y-6">
      <PageHeader
        title="Relatórios"
        description="Indicadores consolidados de operação, financeiro e desempenho da frota"
        action={
          <div className="inline-flex w-full items-center justify-center gap-2 rounded-lg border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground sm:w-auto sm:justify-start">
            <BarChart3 className="size-4 shrink-0" />
            <span className="truncate">Atualizado em tempo real</span>
          </div>
        }
      />
      {children}
    </div>
  );
}
