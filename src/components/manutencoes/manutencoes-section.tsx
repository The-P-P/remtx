import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageActions } from "@/components/shared/page-actions";
import { ManutencoesNav } from "@/components/manutencoes/manutencoes-nav";
import { Button } from "@/components/ui/button";

export function ManutencoesSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Manutenções"
        description="Registro de manutenções, peças por revisão e alertas automáticos"
        action={
          <PageActions>
            <Button
              className="w-full sm:w-auto"
              render={<Link href="/manutencoes/nova" />}
            >
              <Plus className="size-4" />
              Nova manutenção
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              render={<Link href="/manutencoes/tipos/nova" />}
            >
              <Settings className="size-4" />
              Novo tipo
            </Button>
          </PageActions>
        }
      />
      <ManutencoesNav />
      {children}
    </div>
  );
}
