"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/clientes", label: "Cadastro", exact: true },
  { href: "/clientes/contratos", label: "Contratos", exact: false },
] as const;

function isCadastroTab(pathname: string) {
  if (pathname === "/clientes") return true;
  if (pathname.startsWith("/clientes/contratos")) return false;
  if (pathname.startsWith("/clientes/locacoes")) return false;
  return (
    pathname.startsWith("/clientes/") &&
    !pathname.startsWith("/clientes/contratos")
  );
}

export function ClientesNav() {
  const pathname = usePathname();

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {TABS.map((tab) => {
        const active = tab.href === "/clientes/contratos"
          ? pathname.startsWith("/clientes/contratos") ||
            pathname.startsWith("/clientes/locacoes")
          : isCadastroTab(pathname);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
