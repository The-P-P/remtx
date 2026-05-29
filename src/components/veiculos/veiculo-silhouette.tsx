import { cn } from "@/lib/utils";
import { estiloCorVeiculo } from "@/lib/porte-veiculo";
import { PORTE_VEICULO_LABEL } from "@/lib/constants/enums";
import { PorteVeiculoIcon } from "@/components/veiculos/porte-veiculo-icon";
import type { PorteVeiculo } from "@/types/prisma";

type VeiculoVisualBannerProps = {
  porte?: PorteVeiculo;
  cor?: string;
  className?: string;
  compact?: boolean;
  corLabel?: string | null;
};

export function VeiculoSilhouette({
  porte = "SEDAN",
  cor = "#64748b",
  className,
  compact = false,
  corLabel,
}: VeiculoVisualBannerProps) {
  const estilo = estiloCorVeiculo(cor);

  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-border/50 bg-muted/20",
        compact ? "h-[80px]" : "h-[120px]",
        className
      )}
      style={{ background: estilo.gradiente }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 py-3">
        <PorteVeiculoIcon
          porte={porte}
          cor={estilo.hex}
          className={cn(
            "drop-shadow-sm",
            compact ? "max-h-12 max-w-[140px]" : "max-h-[4.5rem] max-w-[220px]"
          )}
        />
      </div>

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-background/90 to-transparent",
          compact ? "px-3 pb-2 pt-6" : "px-4 pb-3 pt-8"
        )}
      >
        <span
          className={cn(
            "shrink-0 rounded-full ring-2 ring-background/90",
            compact ? "size-2.5" : "size-3"
          )}
          style={{
            backgroundColor: estilo.hex,
            boxShadow: estilo.clara
              ? "inset 0 0 0 1px rgba(15,23,42,0.12)"
              : undefined,
          }}
        />
        <span className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {PORTE_VEICULO_LABEL[porte]}
          {corLabel ? ` · ${corLabel}` : ""}
        </span>
      </div>
    </div>
  );
}
