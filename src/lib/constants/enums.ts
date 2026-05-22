import type {
  StatusVeiculo,
  GravidadeProblema,
  AlertaManutencao,
} from "@/types/prisma";

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
