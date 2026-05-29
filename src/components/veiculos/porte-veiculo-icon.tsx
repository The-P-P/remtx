import { cn } from "@/lib/utils";
import { PORTE_VEICULO_IMAGEM } from "@/lib/porte-veiculo";
import type { PorteVeiculo } from "@/types/prisma";

type PorteVeiculoIconProps = {
  porte: PorteVeiculo;
  cor?: string;
  className?: string;
};

export function PorteVeiculoIcon({
  porte,
  cor = "#64748b",
  className,
}: PorteVeiculoIconProps) {
  const mask = `url(${PORTE_VEICULO_IMAGEM[porte]})`;

  return (
    <div
      role="img"
      aria-hidden
      className={cn("aspect-[2/1] w-full bg-center bg-no-repeat", className)}
      style={{
        backgroundColor: cor,
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
