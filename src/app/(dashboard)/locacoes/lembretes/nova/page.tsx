import { redirect } from "next/navigation";

/** Fluxo unificado: tarefas são criadas na agenda pelo calendário. */
export default function NovoLembreteRedirectPage() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth() + 1;
  const dia = hoje.getDate();
  redirect(`/locacoes?ano=${ano}&mes=${mes}&dia=${dia}&nova=tarefa`);
}
