import { LocacoesSection } from "@/components/locacoes/locacoes-section";
import {
  AgendaCalendar,
  type AgendaEventoSerializado,
} from "@/components/locacoes/agenda-calendar";
import { getEventosAgendaMes } from "@/lib/agenda";
import { getVeiculosDisponiveisParaLocacao } from "@/lib/actions/locacoes";
import { getClientesParaSelect } from "@/lib/actions/clientes";
import { prisma } from "@/lib/prisma";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string; dia?: string; nova?: string }>;
}) {
  const params = await searchParams;
  const abrirNovaTarefa = params.nova === "tarefa";
  const agora = new Date();
  const ano = Number(params.ano) || agora.getFullYear();
  const mes =
    Number(params.mes) >= 1 && Number(params.mes) <= 12
      ? Number(params.mes)
      : agora.getMonth() + 1;
  const dia = params.dia ? Number(params.dia) : undefined;

  const [eventosRaw, veiculosLocacao, clientes, veiculosAgenda] =
    await Promise.all([
      getEventosAgendaMes(ano, mes),
      getVeiculosDisponiveisParaLocacao(),
      getClientesParaSelect(),
      prisma.veiculo.findMany({
        where: { status: { not: "INATIVO" } },
        orderBy: { placa: "asc" },
        select: { id: true, placa: true, marca: true, modelo: true },
      }),
    ]);

  const veiculos = veiculosAgenda.length > 0 ? veiculosAgenda : veiculosLocacao;
  const eventos: AgendaEventoSerializado[] = eventosRaw.map((e) => ({
    id: e.id,
    chave: e.chave,
    referenciaTipo: e.referenciaTipo,
    referenciaId: e.referenciaId,
    titulo: e.titulo,
    descricao: e.descricao,
    dataInicio: e.dataInicio.toISOString(),
    dataFim: e.dataFim?.toISOString() ?? null,
    tipo: e.tipo,
    href: e.href,
    meta: e.meta
      ? {
          ...e.meta,
          dataVencimentoContrato: e.meta.dataVencimentoContrato
            ?.toISOString(),
          dataPagamento: e.meta.dataPagamento?.toISOString(),
        }
      : undefined,
  }));

  return (
    <LocacoesSection>
      <AgendaCalendar
        eventos={eventos}
        ano={ano}
        mes={mes}
        diaSelecionado={dia}
        veiculos={veiculos}
        clientes={clientes}
        abrirNovaTarefa={abrirNovaTarefa}
      />
    </LocacoesSection>
  );
}
