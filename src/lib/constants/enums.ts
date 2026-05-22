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
  DISPONIVEL: "bg-emerald-100 text-emerald-800",
  ALUGADO: "bg-amber-100 text-amber-800",
  EM_MANUTENCAO: "bg-red-100 text-red-800",
  INATIVO: "bg-slate-100 text-slate-600",
};

export const GRAVIDADE_LABEL: Record<GravidadeProblema, string> = {
  LEVE: "Leve",
  MEDIA: "Média",
  GRAVE: "Grave",
};

export const GRAVIDADE_STYLE: Record<GravidadeProblema, string> = {
  LEVE: "bg-slate-100 text-slate-700",
  MEDIA: "bg-amber-100 text-amber-800",
  GRAVE: "bg-red-100 text-red-800",
};

export const ALERTA_LABEL: Record<AlertaManutencao, string> = {
  VERDE: "Em dia",
  AMARELO: "Próximo",
  VERMELHO: "Vencido",
};
