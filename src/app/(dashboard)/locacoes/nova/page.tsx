import { redirect } from "next/navigation";

/** Locações são criadas pela aba Clientes; agenda só acompanha. */
export default async function LocacoesNovaRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ veiculoId?: string; clienteId?: string }>;
}) {
  const { veiculoId, clienteId } = await searchParams;
  const params = new URLSearchParams();
  if (veiculoId) params.set("veiculoId", veiculoId);
  if (clienteId) params.set("clienteId", clienteId);

  const qs = params.toString();
  if (clienteId) {
    redirect(
      `/clientes/${clienteId}/locacoes/nova${veiculoId ? `?veiculoId=${veiculoId}` : ""}`
    );
  }
  redirect(`/clientes/locacoes/nova${qs ? `?${qs}` : ""}`);
}
