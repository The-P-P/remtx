"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/locacoes", label: "Agenda", exact: true },
  { href: "/locacoes/contratos", label: "Contratos", exact: false },
] as const;

export function LocacoesNav() {
  const pathname = usePathname();

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {TABS.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
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
