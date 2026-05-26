import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageActions } from "@/components/shared/page-actions";
import { FinanceiroNav } from "@/components/financeiro/financeiro-nav";
import { Button } from "@/components/ui/button";

export function FinanceiroSection({
  children,
  showNovaTransacao = true,
  novaTransacaoHref = "/financeiro/nova",
  exportButton,
}: {
  children: React.ReactNode;
  showNovaTransacao?: boolean;
  novaTransacaoHref?: string;
  exportButton?: React.ReactNode;
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Financeiro"
        description="Entradas, saídas e fluxo de caixa da locadora"
        action={
          showNovaTransacao || exportButton ? (
            <PageActions>
              {exportButton}
              {showNovaTransacao && (
                <Button
                  className="w-full sm:w-auto"
                  render={<Link href={novaTransacaoHref} />}
                >
                  <Plus className="size-4" />
                  Novo lançamento
                </Button>
              )}
            </PageActions>
          ) : undefined
        }
      />
      <FinanceiroNav />
      {children}
    </div>
  );
}
