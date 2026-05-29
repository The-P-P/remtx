import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { AlertaRelatorio } from "@/lib/relatorios-types";
import { cn } from "@/lib/utils";

const estilos = {
  danger: {
    icon: AlertCircle,
    box: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
    text: "text-red-800 dark:text-red-200",
  },
  warning: {
    icon: AlertTriangle,
    box: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
    text: "text-amber-900 dark:text-amber-200",
  },
  info: {
    icon: Info,
    box: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40",
    text: "text-blue-900 dark:text-blue-200",
  },
};

export function RelatoriosAlertas({ alertas }: { alertas: AlertaRelatorio[] }) {
  if (alertas.length === 0) return null;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {alertas.map((a, i) => {
        const s = estilos[a.nivel];
        const Icon = s.icon;
        return (
          <div
            key={`${a.titulo}-${i}`}
            className={cn("flex gap-3 rounded-lg border p-3", s.box)}
          >
            <Icon className={cn("mt-0.5 size-4 shrink-0", s.text)} />
            <div className="min-w-0">
              <p className={cn("text-sm font-medium", s.text)}>{a.titulo}</p>
              <p className={cn("text-xs opacity-90", s.text)}>{a.descricao}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
