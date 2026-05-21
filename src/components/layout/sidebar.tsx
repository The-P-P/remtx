"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Wrench,
  Users,
  Calendar,
  Wallet,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/types";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Car,
  Wrench,
  Users,
  Calendar,
  Wallet,
  BarChart3,
};

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r bg-card",
        className
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Car className="size-7 text-primary" />
        <div>
          <p className="text-lg font-bold tracking-tight">REMTX</p>
          <p className="text-xs text-muted-foreground">Locadora de veículos</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 text-xs text-muted-foreground">
        Fase 0 — Base do sistema
      </div>
    </aside>
  );
}
