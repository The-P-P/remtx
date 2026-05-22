"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/manutencoes",
    label: "Histórico",
    isActive: (pathname: string) =>
      pathname === "/manutencoes" ||
      (pathname.startsWith("/manutencoes/") &&
        !pathname.startsWith("/manutencoes/tipos")),
  },
  {
    href: "/manutencoes/tipos",
    label: "Tipos e peças",
    isActive: (pathname: string) => pathname.startsWith("/manutencoes/tipos"),
  },
] as const;

export function ManutencoesNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b pb-px"
      aria-label="Seções de manutenções"
    >
      {NAV_ITEMS.map((item) => {
        const active = item.isActive(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
