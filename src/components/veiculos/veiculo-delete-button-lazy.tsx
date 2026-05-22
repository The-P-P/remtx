import { getVeiculoDeleteInfo } from "@/lib/actions/veiculos";
import { VeiculoDeleteButton } from "@/components/veiculos/veiculo-delete-button";

export async function VeiculoDeleteButtonServer({
  id,
  variant = "icon",
}: {
  id: string;
  variant?: "icon" | "button";
}) {
  const info = await getVeiculoDeleteInfo(id);
  if (!info) return null;

  const descricao = `${info.veiculo.placa} — ${info.veiculo.marca} ${info.veiculo.modelo}`;

  return (
    <VeiculoDeleteButton
      id={id}
      descricao={descricao}
      modoExclusao={info.modoExclusao}
      bloqueado={info.locacaoAtiva}
      motivoBloqueio={
        info.locacaoAtiva
          ? "Veículo com locação ativa ou reservada"
          : undefined
      }
      variant={variant}
    />
  );
}
