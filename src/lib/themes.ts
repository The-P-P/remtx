export const THEMES = [
  {
    id: "light",
    label: "Claro",
    description: "Tema padrão, fundo claro",
  },
  {
    id: "dark",
    label: "Escuro",
    description: "Alto contraste para ambientes escuros",
  },
  {
    id: "dracula",
    label: "Drácula",
    description: "Azul profundo inspirado no Dracula",
  },
  {
    id: "lavanda",
    label: "Lavanda",
    description: "Roxo e rosa suaves",
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const THEME_STORAGE_KEY = "remtx-theme";

export const DEFAULT_THEME: ThemeId = "light";

export function isThemeId(value: string): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}

/** Temas escuros usam variantes `dark:` do Tailwind */
export const DARK_THEMES: ThemeId[] = ["dark", "dracula"];

export function isDarkTheme(theme: ThemeId): boolean {
  return DARK_THEMES.includes(theme);
}
