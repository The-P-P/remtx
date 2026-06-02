import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export type TenantContext = {
  userId: string;
  locadoraId: string;
  role: Awaited<ReturnType<typeof requireAuth>>["role"];
  nome: string;
};

export async function requireTenant(): Promise<TenantContext> {
  const user = await requireAuth();
  if (!user.locadoraId) {
    throw new Error("Conta sem locadora vinculada. Faça login novamente.");
  }
  return {
    userId: user.id,
    locadoraId: user.locadoraId,
    role: user.role,
    nome: user.nome,
  };
}

/** Garante que o registro pertence à locadora do usuário logado. */
export async function assertVeiculoDaLocadora(
  veiculoId: string,
  locadoraId: string
) {
  const v = await prisma.veiculo.findFirst({
    where: { id: veiculoId, locadoraId },
    select: { id: true },
  });
  if (!v) throw new Error("Veículo não encontrado");
}

export async function assertClienteDaLocadora(
  clienteId: string,
  locadoraId: string
) {
  const c = await prisma.cliente.findFirst({
    where: { id: clienteId, locadoraId },
    select: { id: true },
  });
  if (!c) throw new Error("Cliente não encontrado");
}

export async function assertLocacaoDaLocadora(
  locacaoId: string,
  locadoraId: string
) {
  const l = await prisma.locacao.findFirst({
    where: { id: locacaoId, locadoraId },
    select: { id: true },
  });
  if (!l) throw new Error("Locação não encontrada");
}
