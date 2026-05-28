import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

export function RelatoriosSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Relatórios"
        description="Indicadores consolidados de operação, financeiro e desempenho"
        action={
          <div className="inline-flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
            <BarChart3 className="size-4" />
            Fase 4
          </div>
        }
      />
      {children}
    </div>
  );
}
