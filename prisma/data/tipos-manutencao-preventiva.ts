/**
 * Catálogo de tipos de manutenção preventiva da frota.
 */

export type PecaPadraoSeed = { nome: string; quantidade: number };

export type TipoManutencaoSeed = {
  nome: string;
  descricao: string;
  intervaloKm: number;
  pecas: PecaPadraoSeed[];
};

export const TIPOS_MANUTENCAO_PREVENTIVA: TipoManutencaoSeed[] = [
  {
    nome: "Troca de óleo e filtro de óleo",
    descricao: "Troca do lubrificante do motor e filtro de óleo.",
    intervaloKm: 10000,
    pecas: [
      { nome: "Óleo lubrificante do motor", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Anel de vedação do cárter", quantidade: 1 },
    ],
  },
  {
    nome: "Filtro de ar do motor",
    descricao: "Substituição do filtro de ar da admissão.",
    intervaloKm: 15000,
    pecas: [{ nome: "Filtro de ar do motor", quantidade: 1 }],
  },
  {
    nome: "Filtro de ar-condicionado",
    descricao: "Substituição do filtro de cabine (ar-condicionado).",
    intervaloKm: 15000,
    pecas: [{ nome: "Filtro de ar-condicionado (cabine)", quantidade: 1 }],
  },
  {
    nome: "Velas de ignição",
    descricao: "Troca do jogo de velas de ignição.",
    intervaloKm: 30000,
    pecas: [{ nome: "Jogo de velas de ignição", quantidade: 1 }],
  },
  {
    nome: "Correia dentada",
    descricao: "Troca da correia dentada e inspeção dos tensionadores.",
    intervaloKm: 60000,
    pecas: [
      { nome: "Kit correia dentada", quantidade: 1 },
      { nome: "Tensor da correia dentada", quantidade: 1 },
    ],
  },
  {
    nome: "Fluido de freio",
    descricao: "Substituição do fluido do sistema de freio.",
    intervaloKm: 30000,
    pecas: [{ nome: "Fluido de freio DOT 4", quantidade: 1 }],
  },
  {
    nome: "Líquido de arrefecimento",
    descricao: "Troca ou reposição do líquido de arrefecimento do motor.",
    intervaloKm: 40000,
    pecas: [{ nome: "Líquido de arrefecimento", quantidade: 1 }],
  },
  {
    nome: "Pastilhas e discos de freio",
    descricao: "Inspeção e substituição de pastilhas e discos de freio.",
    intervaloKm: 40000,
    pecas: [
      { nome: "Pastilhas de freio (eixo dianteiro)", quantidade: 1 },
      { nome: "Pastilhas de freio (eixo traseiro)", quantidade: 1 },
      { nome: "Discos de freio (se necessário)", quantidade: 1 },
    ],
  },
  {
    nome: "Alinhamento e balanceamento",
    descricao: "Alinhamento de direção e balanceamento das rodas.",
    intervaloKm: 10000,
    pecas: [],
  },
  {
    nome: "Pneus (rodízio)",
    descricao: "Rodízio dos pneus para desgaste uniforme.",
    intervaloKm: 10000,
    pecas: [],
  },
  {
    nome: "Fluido da caixa de câmbio",
    descricao: "Troca do fluido da transmissão (manual ou automática).",
    intervaloKm: 40000,
    pecas: [{ nome: "Fluido da caixa de câmbio", quantidade: 1 }],
  },
  {
    nome: "Amortecedores",
    descricao: "Inspeção e substituição de amortecedores e componentes da suspensão.",
    intervaloKm: 60000,
    pecas: [
      { nome: "Amortecedor dianteiro", quantidade: 2 },
      { nome: "Amortecedor traseiro", quantidade: 2 },
      { nome: "Kit batente/coifa (se necessário)", quantidade: 1 },
    ],
  },
];
