import { auth, currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import type { UserRole } from "@/types/prisma";
import { prisma } from "@/lib/prisma";
import { seedLocadoraInicial } from "@/lib/locadora-seed";
import type { ClerkPublicMetadata } from "@/types";

const VALID_ROLES: UserRole[] = [
  "ADMIN",
  "ATENDENTE",
  "FINANCEIRO",
  "MECANICO",
];

function normalizeRole(role: unknown, isNewLocadora: boolean): UserRole {
  if (isNewLocadora) return "ADMIN";
  const value = String(role ?? "ATENDENTE").toUpperCase();
  return VALID_ROLES.includes(value as UserRole)
    ? (value as UserRole)
    : "ATENDENTE";
}

async function criarLocadoraParaUsuario(
  clerkUserId: string,
  nome: string,
  email: string
) {
  return prisma.$transaction(async (tx) => {
    const locadora = await tx.locadora.create({
      data: { nome: nome || "Minha locadora" },
    });
    await seedLocadoraInicial(locadora.id, locadora.nome, tx);
    const user = await tx.user.create({
      data: {
        id: clerkUserId,
        locadoraId: locadora.id,
        email,
        nome,
        role: "ADMIN",
      },
    });
    return { user, locadoraId: locadora.id };
  });
}

export async function getCurrentUser() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const metadata = clerkUser.publicMetadata as ClerkPublicMetadata;
    const email =
      clerkUser.emailAddresses[0]?.emailAddress ?? "sem-email@remtx.local";
    const nome =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      email;

    const existente = await prisma.user.findUnique({
      where: { id: clerkUser.id },
    });

    if (!existente) {
      const { user, locadoraId } = await criarLocadoraParaUsuario(
        clerkUser.id,
        nome,
        email
      );
      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(clerkUser.id, {
          publicMetadata: {
            role: "ADMIN",
            locadoraId,
          },
        });
      } catch {
        /* metadata opcional */
      }
      return user;
    }

    const role = normalizeRole(metadata.role, false);

    const user = await prisma.user.update({
      where: { id: clerkUser.id },
      data: { email, nome, role },
    });

    return user;
  } catch (error) {
    console.error("[getCurrentUser]", error);
    return null;
  }
}

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Não autenticado");
  }
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Usuário não encontrado");
  }
  return user;
}

const PERMISSIONS: Record<string, UserRole[]> = {
  veiculos: ["ADMIN", "MECANICO", "ATENDENTE"],
  manutencoes: ["ADMIN", "MECANICO"],
  clientes: ["ADMIN", "ATENDENTE"],
  locacoes: ["ADMIN", "ATENDENTE"],
  financeiro: ["ADMIN", "FINANCEIRO"],
  relatorios: ["ADMIN", "FINANCEIRO", "ATENDENTE"],
};

export function hasPermission(role: UserRole, module: string): boolean {
  const allowed = PERMISSIONS[module];
  if (!allowed) return role === "ADMIN";
  return allowed.includes(role) || role === "ADMIN";
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (role === "ADMIN") return true;
  if (pathname.startsWith("/veiculos")) return hasPermission(role, "veiculos");
  if (pathname.startsWith("/manutencoes"))
    return hasPermission(role, "manutencoes");
  if (pathname.startsWith("/clientes")) return hasPermission(role, "clientes");
  if (pathname.startsWith("/locacoes")) return hasPermission(role, "locacoes");
  if (pathname.startsWith("/financeiro"))
    return hasPermission(role, "financeiro");
  if (pathname.startsWith("/relatorios"))
    return hasPermission(role, "relatorios");
  return true;
}
