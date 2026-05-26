import type {
  StatusVeiculo,
  StatusLocacao,
  TipoEventoAgenda,
  TipoTransacao,
  FormaPagamento,
  GravidadeProblema,
  AlertaManutencao,
} from "@/types/prisma";

export const TIPO_TRANSACAO_LABEL: Record<TipoTransacao, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
};

export const TIPO_TRANSACAO_STYLE: Record<TipoTransacao, string> = {
  ENTRADA:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200",
  SAIDA:
    "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-200",
};

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  PIX: "PIX",
  DINHEIRO: "Dinheiro",
  CARTAO_DEBITO: "Cartão débito",
  CARTAO_CREDITO: "Cartão crédito",
  TRANSFERENCIA: "Transferência",
  BOLETO: "Boleto",
  OUTRO: "Outro",
};

export const FORMAS_PAGAMENTO_OPTIONS = (
  Object.entries(FORMA_PAGAMENTO_LABEL) as [FormaPagamento, string][]
).map(([value, label]) => ({ value, label }));

export const STATUS_VEICULO_LABEL: Record<StatusVeiculo, string> = {
  DISPONIVEL: "Disponível",
  ALUGADO: "Alugado",
  EM_MANUTENCAO: "Em manutenção",
  INATIVO: "Inativo",
};

export const STATUS_VEICULO_STYLE: Record<StatusVeiculo, string> = {
  DISPONIVEL:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200",
  ALUGADO:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200",
  EM_MANUTENCAO:
    "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-200",
  INATIVO:
    "bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-200",
};

export const GRAVIDADE_LABEL: Record<GravidadeProblema, string> = {
  LEVE: "Leve",
  MEDIA: "Média",
  GRAVE: "Grave",
};

export const GRAVIDADE_STYLE: Record<GravidadeProblema, string> = {
  LEVE:
    "bg-slate-100 text-slate-700 dark:border dark:border-slate-500/40 dark:bg-slate-500/10 dark:text-slate-400",
  MEDIA:
    "bg-amber-100 text-amber-800 dark:border dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-500",
  GRAVE:
    "bg-red-100 text-red-800 dark:border dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-500",
};

export const ALERTA_LABEL: Record<AlertaManutencao, string> = {
  VERDE: "Em dia",
  AMARELO: "Próximo",
  VERMELHO: "Vencido",
};

export const STATUS_LOCACAO_LABEL: Record<StatusLocacao, string> = {
  RESERVADA: "Reservada",
  ATIVA: "Ativa",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
};

export const STATUS_LOCACAO_STYLE: Record<StatusLocacao, string> = {
  RESERVADA:
    "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-200",
  ATIVA:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200",
  FINALIZADA:
    "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-200",
  CANCELADA:
    "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-200",
};

export const TIPO_EVENTO_AGENDA_LABEL: Record<TipoEventoAgenda, string> = {
  LOCACAO_INICIO: "Retirada (contrato)",
  LOCACAO_FIM_PREVISTO: "Devolução prevista",
  LOCACAO_FIM_REAL: "Devolução",
  PAGAMENTO_CLIENTE: "Pagamento cliente",
  ENTREGA_VEICULO: "Entrega de veículo",
  RETIRADA_VEICULO: "Buscar / retirar veículo",
  OFICINA_SERVICO: "Oficina / serviço",
  MANUTENCAO_AGENDADA: "Manutenção agendada",
  IPVA: "IPVA",
  LEMBRETE: "Lembrete",
  FINANCEIRO: "Financeiro",
};

export const TIPO_EVENTO_AGENDA_STYLE: Record<TipoEventoAgenda, string> = {
  LOCACAO_INICIO:
    "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  LOCACAO_FIM_PREVISTO:
    "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  LOCACAO_FIM_REAL:
    "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  PAGAMENTO_CLIENTE:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  ENTREGA_VEICULO:
    "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30",
  RETIRADA_VEICULO:
    "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30",
  OFICINA_SERVICO:
    "bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30",
  MANUTENCAO_AGENDADA:
    "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  IPVA:
    "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
  LEMBRETE:
    "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
  FINANCEIRO:
    "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
};

/** Tipos que o usuário pode criar manualmente na agenda. */
export const TIPO_EVENTO_AGENDA_FORM: {
  value: TipoEventoAgenda;
  label: string;
  tituloPadrao: string;
}[] = [
  { value: "ENTREGA_VEICULO", label: "Entrega de veículo ao cliente", tituloPadrao: "Entrega de veículo" },
  { value: "RETIRADA_VEICULO", label: "Buscar / retirar veículo", tituloPadrao: "Buscar veículo" },
  { value: "OFICINA_SERVICO", label: "Levar à oficina / serviço", tituloPadrao: "Veículo na oficina" },
  { value: "MANUTENCAO_AGENDADA", label: "Manutenção agendada", tituloPadrao: "Manutenção agendada" },
  { value: "LEMBRETE", label: "Outro lembrete", tituloPadrao: "Tarefa" },
  { value: "IPVA", label: "IPVA / imposto", tituloPadrao: "IPVA" },
  { value: "FINANCEIRO", label: "Conta / pagamento empresa", tituloPadrao: "Pagamento" },
];
