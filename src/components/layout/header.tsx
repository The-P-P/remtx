"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { ROLE_LABELS } from "@/types";
import type { UserRole } from "@/types/prisma";

interface HeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  userRole?: UserRole;
}

export function Header({ title, subtitle, userName, userRole }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center justify-between gap-2 border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65 md:px-6 relative">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Sheet>
          <SheetTrigger
            className="md:hidden"
            render={
              <Button variant="ghost" size="icon" type="button" aria-label="Abrir menu" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Sidebar className="border-0" allowCollapse={false} />
          </SheetContent>
        </Sheet>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground md:text-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeSwitcher />
        <div className="hidden rounded-xl border border-border/70 bg-card/70 px-3 py-1.5 text-right shadow-sm sm:block">
          <p className="text-sm font-medium">{userName ?? "Usuário"}</p>
          {userRole && (
            <p className="text-xs text-muted-foreground">
              {ROLE_LABELS[userRole]}
            </p>
          )}
        </div>
        <UserButton />
      </div>
    </header>
  );
}
