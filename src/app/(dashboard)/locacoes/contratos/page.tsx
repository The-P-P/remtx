import { redirect } from "next/navigation";

export default async function ContratosRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const qs = status ? `?status=${status}` : "";
  redirect(`/clientes/contratos${qs}`);
}
