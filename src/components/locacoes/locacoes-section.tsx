import Link from "next/link";
import { Bell } from "lucide-react";
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
        description="Acompanhe vencimentos, pagamentos e tarefas — marque como feito ou reagende"
        action={
          <PageActions>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              render={<Link href="/locacoes/lembretes/nova" />}
            >
              <Bell className="size-4" />
              Novo lembrete / tarefa
            </Button>
          </PageActions>
        }
      />
      <LocacoesNav />
      {children}
    </div>
  );
}
