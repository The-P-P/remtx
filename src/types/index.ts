import type { UserRole } from "@/types/prisma";

export type ClerkPublicMetadata = {
  role?: UserRole;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  ATENDENTE: "Atendente",
  FINANCEIRO: "Financeiro",
  MECANICO: "Mecânico",
};

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" as const },
  { href: "/veiculos", label: "Veículos", icon: "Car" as const },
  { href: "/manutencoes", label: "Manutenções", icon: "Wrench" as const },
  { href: "/clientes", label: "Clientes", icon: "Users" as const },
  { href: "/locacoes", label: "Agenda", icon: "Calendar" as const },
  { href: "/financeiro", label: "Financeiro", icon: "Wallet" as const },
  { href: "/relatorios", label: "Relatórios", icon: "BarChart3" as const },
] as const;
