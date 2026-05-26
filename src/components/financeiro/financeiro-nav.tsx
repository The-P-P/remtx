"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/financeiro", label: "Lançamentos", match: (p: string) => p === "/financeiro" || (p.startsWith("/financeiro/") && !p.startsWith("/financeiro/fluxo") && !p.startsWith("/financeiro/categorias")) },
  { href: "/financeiro/fluxo", label: "Fluxo de caixa", match: (p: string) => p.startsWith("/financeiro/fluxo") },
  { href: "/financeiro/categorias", label: "Categorias", match: (p: string) => p.startsWith("/financeiro/categorias") },
] as const;

export function FinanceiroNav() {
  const pathname = usePathname();

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
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
