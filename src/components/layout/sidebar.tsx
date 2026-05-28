"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Wrench,
  Users,
  Calendar,
  Wallet,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  allowCollapse?: boolean;
}

const SIDEBAR_COLLAPSED_KEY = "remtx.sidebar.collapsed";

export function Sidebar({
  className,
  onNavigate,
  allowCollapse = true,
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!allowCollapse) return;
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    setCollapsed(saved === "1");
  }, [allowCollapse]);

  useEffect(() => {
    if (!allowCollapse) return;
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed, allowCollapse]);

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-border/70 bg-card/95 shadow-xl shadow-black/5 backdrop-blur transition-all duration-300",
        allowCollapse && collapsed ? "w-[84px]" : "w-64",
        className
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-border/70",
          allowCollapse && collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            allowCollapse && collapsed && "justify-center"
          )}
        >
        <div className="rounded-xl bg-primary/15 p-1.5 ring-1 ring-primary/25">
          <Car className="size-5 text-primary" />
        </div>
          {(!allowCollapse || !collapsed) && (
            <div>
              <p className="text-lg font-bold tracking-tight">REMTX</p>
              <p className="text-xs text-muted-foreground">Locadora de veículos</p>
            </div>
          )}
        </div>
        {allowCollapse && (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Expandir menu lateral" : "Minimizar menu lateral"}
            title={collapsed ? "Expandir menu lateral" : "Minimizar menu lateral"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {(!allowCollapse || !collapsed) && (
          <p className="px-2 pb-2 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground/90 uppercase">
            Navegação
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={allowCollapse && collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200",
                allowCollapse && collapsed ? "justify-center px-2" : "gap-3 px-3",
                isActive
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:-translate-y-0.5 hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {(!allowCollapse || !collapsed) && item.label}
            </Link>
          );
        })}
      </nav>

      {(!allowCollapse || !collapsed) && (
        <div className="border-t border-border/70 p-4 text-xs text-muted-foreground">
          Fase 0 — Base do sistema
        </div>
      )}
    </aside>
  );
}
