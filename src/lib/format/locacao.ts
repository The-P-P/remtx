import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function labelDataFimPrevista(dataFimPrevista: Date | null | undefined): string {
  if (!dataFimPrevista) return "Prazo indeterminado";
  return format(dataFimPrevista, "dd/MM/yyyy", { locale: ptBR });
}
