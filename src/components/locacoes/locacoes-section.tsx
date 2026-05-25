import Link from "next/link";
import { Plus, Bell } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageActions } from "@/components/shared/page-actions";
import { LocacoesNav } from "@/components/locacoes/locacoes-nav";
import { Button } from "@/components/ui/button";

export function LocacoesSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Agenda"
        description="Calendário de locações, pagamentos, manutenções e lembretes do negócio"
        action={
          <PageActions>
            <Button
              className="w-full sm:w-auto"
              render={<Link href="/locacoes/nova" />}
            >
              <Plus className="size-4" />
              Nova locação
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              render={<Link href="/locacoes/lembretes/nova" />}
            >
              <Bell className="size-4" />
              Lembrete
            </Button>
          </PageActions>
        }
      />
      <LocacoesNav />
      {children}
    </div>
  );
}
