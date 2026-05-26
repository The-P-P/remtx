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
}: {
  children: React.ReactNode;
  showNovaTransacao?: boolean;
  novaTransacaoHref?: string;
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Financeiro"
        description="Entradas, saídas e fluxo de caixa da locadora"
        action={
          showNovaTransacao ? (
            <PageActions>
              <Button
                className="w-full sm:w-auto"
                render={<Link href={novaTransacaoHref} />}
              >
                <Plus className="size-4" />
                Novo lançamento
              </Button>
            </PageActions>
          ) : undefined
        }
      />
      <FinanceiroNav />
      {children}
    </div>
  );
}
