import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FrotaCards } from "@/components/dashboard/frota-cards";
import { AlertasManutencao } from "@/components/dashboard/alertas-manutencao";
import { ProblemasCronicos } from "@/components/dashboard/problemas-cronicos";
import { ResumoFinanceiro } from "@/components/dashboard/resumo-financeiro";
import {
  UltimasLocacoes,
  UltimasTransacoes,
} from "@/components/dashboard/ultimas-atividades";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const hoje = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground capitalize">{hoje}</p>
      </div>

      <FrotaCards
        total={data.frota.totalVeiculos}
        disponiveis={data.frota.disponiveis}
        alugados={data.frota.alugados}
        emManutencao={data.frota.emManutencao}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AlertasManutencao
          alertas={data.alertasManutencao}
          contagem={data.contagemAlertas}
        />
        <ProblemasCronicos problemas={data.problemasCronicos} />
      </div>

      <ResumoFinanceiro
        entradas={data.financeiro.entradas}
        saidas={data.financeiro.saidas}
        saldo={data.financeiro.saldo}
        periodo={data.periodo}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <UltimasLocacoes locacoes={data.ultimasLocacoes} />
        <UltimasTransacoes transacoes={data.ultimasTransacoes} />
      </div>
    </div>
  );
}
