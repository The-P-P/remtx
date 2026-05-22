"use client";

import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme/theme-provider";
import { THEMES } from "@/lib/themes";
import { cn } from "@/lib/utils";

const THEME_SWATCH: Record<string, string> = {
  light: "bg-gradient-to-br from-white to-slate-200 ring-slate-300",
  dark: "bg-gradient-to-br from-zinc-800 to-zinc-950 ring-zinc-600",
  dracula: "bg-gradient-to-br from-[#1e2a4a] to-[#0f1729] ring-cyan-600/50",
  lavanda: "bg-gradient-to-br from-fuchsia-100 to-purple-200 ring-fuchsia-300",
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-label="Trocar tema de cores"
            title="Tema de cores"
          />
        }
      >
        <Palette className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Tema de cores</DropdownMenuLabel>
          {THEMES.map((t) => (
            <DropdownMenuItem
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="flex cursor-pointer items-center gap-3 py-2"
            >
              <span
                className={cn(
                  "size-6 shrink-0 rounded-full ring-2",
                  THEME_SWATCH[t.id]
                )}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{t.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {t.description}
                </span>
              </span>
              {theme === t.id && (
                <Check className="size-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
