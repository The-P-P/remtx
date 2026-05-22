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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <div className="flex items-center gap-3">
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
            <Sidebar className="border-0" />
          </SheetContent>
        </Sheet>
        <div>
          <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground md:text-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeSwitcher />
        <div className="hidden text-right sm:block">
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
