import { inferirPorte } from "@/lib/porte-veiculo";
import type { PorteVeiculo } from "@/types/prisma";

export function resolverPorte(
  porte: PorteVeiculo | null | undefined,
  modelo: string
): PorteVeiculo {
  return porte ?? inferirPorte(modelo);
}
