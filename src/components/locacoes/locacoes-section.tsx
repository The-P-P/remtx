import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageActions } from "@/components/shared/page-actions";
import { LocacoesNav } from "@/components/locacoes/locacoes-nav";
import { Button } from "@/components/ui/button";

function agendaNovaTarefaHref() {
  const hoje = new Date();
  return `/locacoes?ano=${hoje.getFullYear()}&mes=${hoje.getMonth() + 1}&dia=${hoje.getDate()}&nova=tarefa`;
}

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
              render={<Link href={agendaNovaTarefaHref()} />}
            >
              <Plus className="size-4" />
              Nova tarefa
            </Button>
          </PageActions>
        }
      />
      <LocacoesNav />
      {children}
    </div>
  );
}
