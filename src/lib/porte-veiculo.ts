import type { PorteVeiculo } from "@/types/prisma";

export const PORTE_VEICULO_LABEL: Record<PorteVeiculo, string> = {
  HATCH: "Hatch",
  SEDAN: "Sedan",
  SUV: "SUV",
  PICAPE: "Picape",
};

export const PORTE_VEICULO_OPTIONS: { value: PorteVeiculo; label: string }[] = [
  { value: "PICAPE", label: PORTE_VEICULO_LABEL.PICAPE },
  { value: "SUV", label: PORTE_VEICULO_LABEL.SUV },
  { value: "HATCH", label: PORTE_VEICULO_LABEL.HATCH },
  { value: "SEDAN", label: PORTE_VEICULO_LABEL.SEDAN },
];

export const PORTE_VEICULO_VALUES = [
  "HATCH",
  "SEDAN",
  "SUV",
  "PICAPE",
] as const satisfies readonly PorteVeiculo[];

export const PORTE_VEICULO_IMAGEM: Record<PorteVeiculo, string> = {
  PICAPE: "/veiculos/portes/picape.png",
  SUV: "/veiculos/portes/suv.png",
  HATCH: "/veiculos/portes/hatch.png",
  SEDAN: "/veiculos/portes/sedan.png",
};

export const CORES_VEICULO_PRESET: { nome: string; hex: string }[] = [
  { nome: "Branco", hex: "#f1f5f9" },
  { nome: "Preto", hex: "#1e293b" },
  { nome: "Prata", hex: "#94a3b8" },
  { nome: "Cinza", hex: "#64748b" },
  { nome: "Vermelho", hex: "#dc2626" },
  { nome: "Azul", hex: "#2563eb" },
  { nome: "Verde", hex: "#16a34a" },
  { nome: "Amarelo", hex: "#eab308" },
  { nome: "Laranja", hex: "#ea580c" },
  { nome: "Bege", hex: "#d6c4a8" },
  { nome: "Marrom", hex: "#78350f" },
  { nome: "Roxo", hex: "#7c3aed" },
];

const CORES_HEX: Record<string, string> = {
  branco: "#f1f5f9",
  branca: "#f1f5f9",
  white: "#f1f5f9",
  preto: "#1e293b",
  preta: "#1e293b",
  black: "#1e293b",
  prata: "#94a3b8",
  silver: "#94a3b8",
  cinza: "#64748b",
  gray: "#64748b",
  grey: "#64748b",
  vermelho: "#dc2626",
  vermelha: "#dc2626",
  red: "#dc2626",
  azul: "#2563eb",
  blue: "#2563eb",
  verde: "#16a34a",
  green: "#16a34a",
  amarelo: "#eab308",
  yellow: "#eab308",
  laranja: "#ea580c",
  orange: "#ea580c",
  bege: "#d6c4a8",
  beige: "#d6c4a8",
  marrom: "#78350f",
  brown: "#78350f",
  dourado: "#b45309",
  gold: "#b45309",
  roxo: "#7c3aed",
  purple: "#7c3aed",
};

export function corParaHex(cor?: string | null): string {
  if (!cor?.trim()) return "#64748b";

  const normalizada = cor.toLowerCase().trim();
  if (/^#[0-9a-f]{6}$/i.test(normalizada)) return normalizada;

  for (const [nome, hex] of Object.entries(CORES_HEX)) {
    if (normalizada.includes(nome)) return hex;
  }

  for (const preset of CORES_VEICULO_PRESET) {
    if (normalizada.includes(preset.nome.toLowerCase())) return preset.hex;
  }

  return "#64748b";
}

export function inferirPorte(modelo: string): PorteVeiculo {
  const m = modelo.toLowerCase();

  if (
    /strada|saveiro|toro|ranger|s10|montana|frontier|amarok|hilux|f-150|f150|l200|oroch|titano/.test(
      m
    )
  ) {
    return "PICAPE";
  }

  if (
    /tracker|creta|t-cross|t cross|kicks|renegade|compass|hb20s|nivus|pulse|duster|ecosport|tiggo|haval|corolla cross|air cross|commander|crossover/.test(
      m
    )
  ) {
    return "SUV";
  }

  if (
    /gol|argo|mobi|kwid|onix|polo|hb20|sandero|up!|up |ka|fiesta|208|207|march|fit|celta|palio|uno|fox|clio|virtus|city hatch|yaris hatch/.test(
      m
    )
  ) {
    return "HATCH";
  }

  return "SEDAN";
}

function luminanciaHex(hex: string): number {
  const n = hex.replace("#", "");
  if (n.length !== 6) return 0.5;
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function estiloCorVeiculo(hex: string) {
  const clara = luminanciaHex(hex) > 0.72;
  const alpha = clara ? "38" : "2e";

  return {
    hex,
    clara,
    gradiente: `linear-gradient(145deg, ${hex}${alpha} 0%, transparent 62%)`,
    faixa: hex,
    bolha: `${hex}${clara ? "55" : "40"}`,
  };
}
