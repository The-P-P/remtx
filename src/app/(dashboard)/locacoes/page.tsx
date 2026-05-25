import { LocacoesSection } from "@/components/locacoes/locacoes-section";
import {
  AgendaCalendar,
  type AgendaEventoSerializado,
} from "@/components/locacoes/agenda-calendar";
import { getEventosAgendaMes } from "@/lib/agenda";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string; dia?: string }>;
}) {
  const params = await searchParams;
  const agora = new Date();
  const ano = Number(params.ano) || agora.getFullYear();
  const mes =
    Number(params.mes) >= 1 && Number(params.mes) <= 12
      ? Number(params.mes)
      : agora.getMonth() + 1;
  const dia = params.dia ? Number(params.dia) : undefined;

  const eventosRaw = await getEventosAgendaMes(ano, mes);
  const eventos: AgendaEventoSerializado[] = eventosRaw.map((e) => ({
    id: e.id,
    chave: e.chave,
    referenciaTipo: e.referenciaTipo,
    referenciaId: e.referenciaId,
    titulo: e.titulo,
    descricao: e.descricao,
    dataInicio: e.dataInicio.toISOString(),
    tipo: e.tipo,
    href: e.href,
    meta: e.meta,
  }));

  return (
    <LocacoesSection>
      <AgendaCalendar
        eventos={eventos}
        ano={ano}
        mes={mes}
        diaSelecionado={dia}
      />
    </LocacoesSection>
  );
}
