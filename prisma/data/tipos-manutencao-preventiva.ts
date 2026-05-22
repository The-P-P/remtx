/**
 * Catálogo de manutenção preventiva — carros populares BR
 * Referências: manuais GM (Onix), Fiat (Argo/Mobi), VW (Gol/Polo),
 * Hyundai (HB20), Renault (Kwid/Sandero), Honda/Toyota (compactos/sedans).
 * Intervalos típicos para hatch, sedan e compacto — uso urbano.
 */

export type PecaPadraoSeed = { nome: string; quantidade: number };

export type TipoManutencaoSeed = {
  nome: string;
  descricao: string;
  intervaloKm: number;
  pecas: PecaPadraoSeed[];
};

export const TIPOS_MANUTENCAO_PREVENTIVA: TipoManutencaoSeed[] = [
  // --- Revisões periódicas (padrão montadoras BR: 10.000 km) ---
  {
    nome: "Revisão 10.000 km — Básica",
    descricao:
      "Revisão básica padrão (Onix, Gol, Argo, HB20, Polo, Mobi, Kwid, Sandero). Primeira revisão oficial da maioria das montadoras.",
    intervaloKm: 10000,
    pecas: [
      { nome: "Óleo lubrificante do motor (sintético/semi)", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Anel de vedação do cárter", quantidade: 1 },
    ],
  },
  {
    nome: "Revisão 20.000 km — Intermediária",
    descricao: "Segunda revisão. Inclui itens da básica + filtros e inspeções ampliadas.",
    intervaloKm: 20000,
    pecas: [
      { nome: "Óleo do motor", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Filtro de ar do motor", quantidade: 1 },
      { nome: "Filtro de cabine (ar-condicionado)", quantidade: 1 },
    ],
  },
  {
    nome: "Revisão 30.000 km",
    descricao:
      "Terceira revisão. Comum incluir velas (motores flex aspirados) e fluido de freio.",
    intervaloKm: 30000,
    pecas: [
      { nome: "Óleo do motor", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Filtro de ar", quantidade: 1 },
      { nome: "Filtro de cabine", quantidade: 1 },
      { nome: "Velas de ignição", quantidade: 4 },
      { nome: "Fluido de freio DOT 4", quantidade: 1 },
    ],
  },
  {
    nome: "Revisão 40.000 km",
    descricao: "Quarta revisão. Reforço em freios e filtros.",
    intervaloKm: 40000,
    pecas: [
      { nome: "Óleo do motor", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Filtro de ar", quantidade: 1 },
      { nome: "Filtro de combustível", quantidade: 1 },
      { nome: "Pastilhas de freio dianteiras", quantidade: 1 },
    ],
  },
  {
    nome: "Revisão 50.000 km",
    descricao: "Quinta revisão preventiva.",
    intervaloKm: 50000,
    pecas: [
      { nome: "Óleo do motor", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Filtro de ar", quantidade: 1 },
      { nome: "Filtro de cabine", quantidade: 1 },
      { nome: "Velas de ignição", quantidade: 4 },
    ],
  },
  {
    nome: "Revisão 60.000 km — Completa",
    descricao:
      "Revisão maior. Correia dentada em Argo 1.3, Gol 1.0 12v, etc. (verificar manual do veículo).",
    intervaloKm: 60000,
    pecas: [
      { nome: "Óleo do motor", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Filtro de ar", quantidade: 1 },
      { nome: "Filtro de cabine", quantidade: 1 },
      { nome: "Filtro de combustível", quantidade: 1 },
      { nome: "Velas de ignição", quantidade: 4 },
      { nome: "Fluido de freio DOT 4", quantidade: 1 },
      { nome: "Correia dentada (kit)", quantidade: 1 },
      { nome: "Tensor da correia dentada", quantidade: 1 },
      { nome: "Correia do alternador", quantidade: 1 },
      { nome: "Pastilhas de freio dianteiras", quantidade: 1 },
      { nome: "Pastilhas de freio traseiras", quantidade: 1 },
    ],
  },
  {
    nome: "Revisão 80.000 km",
    descricao: "Revisão intermediária alta km.",
    intervaloKm: 80000,
    pecas: [
      { nome: "Óleo do motor", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Filtro de ar", quantidade: 1 },
      { nome: "Filtro de cabine", quantidade: 1 },
      { nome: "Velas de ignição", quantidade: 4 },
    ],
  },
  {
    nome: "Revisão 90.000 km",
    descricao:
      "Alguns manuais (VW TSI, Onix turbo) preveem revisões ampliadas nesta faixa.",
    intervaloKm: 90000,
    pecas: [
      { nome: "Óleo do motor", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Filtro de ar", quantidade: 1 },
      { nome: "Filtro de combustível", quantidade: 1 },
      { nome: "Fluido de arrefecimento (longa vida)", quantidade: 1 },
    ],
  },
  {
    nome: "Revisão 100.000 km — Grande revisão",
    descricao:
      "Grande revisão. Troca de correia, discos, fluidos. Sedans (Corolla, City) similares.",
    intervaloKm: 100000,
    pecas: [
      { nome: "Óleo do motor", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Filtro de ar", quantidade: 1 },
      { nome: "Filtro de cabine", quantidade: 1 },
      { nome: "Filtro de combustível", quantidade: 1 },
      { nome: "Velas de ignição", quantidade: 4 },
      { nome: "Correia dentada (kit completo)", quantidade: 1 },
      { nome: "Discos de freio dianteiros", quantidade: 2 },
      { nome: "Pastilhas de freio (kit completo)", quantidade: 1 },
      { nome: "Fluido de freio", quantidade: 1 },
      { nome: "Fluido de arrefecimento", quantidade: 1 },
    ],
  },

  // --- Lubrificantes e filtros (itens isolados) ---
  {
    nome: "Troca de óleo do motor",
    descricao:
      "Troca de óleo isolada. Intervalo: 10.000 km ou 12 meses (Onix, Gol, HB20, Argo, Polo). Uso severo: 7.500 km.",
    intervaloKm: 10000,
    pecas: [
      { nome: "Óleo lubrificante 5W30/5W40 (conforme manual)", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Anel de vedação", quantidade: 1 },
    ],
  },
  {
    nome: "Filtro de ar do motor",
    descricao: "Troca do filtro de ar. Intervalo médio: 15.000 km (GM, Fiat, VW).",
    intervaloKm: 15000,
    pecas: [{ nome: "Filtro de ar do motor", quantidade: 1 }],
  },
  {
    nome: "Filtro de cabine (ar-condicionado)",
    descricao:
      "Filtro de pólen/cabine. Importante em locadoras. Intervalo: 15.000 km ou 12 meses.",
    intervaloKm: 15000,
    pecas: [{ nome: "Filtro de cabine", quantidade: 1 }],
  },
  {
    nome: "Filtro de combustível",
    descricao:
      "Onix/Argo: ~30.000 km. Alguns modelos com filtro interno ao tanque: 40.000–60.000 km.",
    intervaloKm: 30000,
    pecas: [{ nome: "Filtro de combustível", quantidade: 1 }],
  },
  {
    nome: "Velas de ignição",
    descricao:
      "Motores flex aspirados (1.0–1.6): 30.000–40.000 km. Turbo (Onix Plus): verificar manual (~40.000 km).",
    intervaloKm: 30000,
    pecas: [
      { nome: "Velas de ignição (jogo)", quantidade: 4 },
      { nome: "Anéis de vedação das velas", quantidade: 4 },
    ],
  },

  // --- Sistema de freios ---
  {
    nome: "Troca de pastilhas de freio — Dianteiras",
    descricao:
      "Pastilhas dianteiras. Vida útil média: 30.000–40.000 km (uso urbano — frota locadora).",
    intervaloKm: 35000,
    pecas: [{ nome: "Pastilhas de freio dianteiras", quantidade: 1 }],
  },
  {
    nome: "Troca de pastilhas de freio — Traseiras",
    descricao: "Pastilhas traseiras (freio a tambor ou disco). Intervalo: 40.000–50.000 km.",
    intervaloKm: 45000,
    pecas: [{ nome: "Pastilhas de freio traseiras", quantidade: 1 }],
  },
  {
    nome: "Troca de discos de freio — Dianteiros",
    descricao: "Discos dianteiros. Intervalo médio: 60.000–80.000 km ou com empenamento.",
    intervaloKm: 60000,
    pecas: [
      { nome: "Disco de freio dianteiro", quantidade: 2 },
      { nome: "Pastilhas de freio dianteiras", quantidade: 1 },
    ],
  },
  {
    nome: "Fluido de freio",
    descricao:
      "Troca do fluido DOT 4. Recomendado: 2 anos ou 30.000 km (ABNT/manuais GM, VW, Hyundai).",
    intervaloKm: 30000,
    pecas: [{ nome: "Fluido de freio DOT 4", quantidade: 1 }],
  },

  // --- Correias e motor ---
  {
    nome: "Kit correia dentada",
    descricao:
      "Fiat Argo 1.3: 60.000 km ou 5 anos. VW Gol 1.0 12v: 60.000 km. Sempre trocar tensor junto.",
    intervaloKm: 60000,
    pecas: [
      { nome: "Correia dentada", quantidade: 1 },
      { nome: "Tensor automático", quantidade: 1 },
      { nome: "Bomba d'água (quando acoplada)", quantidade: 1 },
    ],
  },
  {
    nome: "Correia do alternador / acessórios",
    descricao:
      "Correia poly-V. Intervalo: 60.000 km ou inspeção a cada 20.000 km.",
    intervaloKm: 60000,
    pecas: [{ nome: "Correia do alternador (poly-V)", quantidade: 1 }],
  },
  {
    nome: "Fluido de arrefecimento",
    descricao:
      "Troca do líquido de arrefecimento. Longa vida: 5 anos/100.000 km; convencional: 40.000 km.",
    intervaloKm: 40000,
    pecas: [
      { nome: "Aditivo/arrefecimento concentrado", quantidade: 1 },
      { nome: "Água desmineralizada", quantidade: 1 },
    ],
  },

  // --- Transmissão e direção ---
  {
    nome: "Óleo da transmissão automática / CVT",
    descricao:
      "Onix automático, HB20 automático, CVT. Intervalo típico: 40.000–60.000 km (verificar manual).",
    intervaloKm: 40000,
    pecas: [
      { nome: "Fluido ATF/CVT (especificação do fabricante)", quantidade: 1 },
      { nome: "Filtro da transmissão (se aplicável)", quantidade: 1 },
    ],
  },
  {
    nome: "Óleo da caixa manual",
    descricao:
      "Gol, Argo, Onix manual. Intervalo: 40.000–60.000 km em uso severo de frota.",
    intervaloKm: 50000,
    pecas: [{ nome: "Óleo da transmissão manual 75W80/80W90", quantidade: 1 }],
  },
  {
    nome: "Fluido de direção hidráulica",
    descricao:
      "Veículos com direção hidráulica (gerações anteriores). Modelos novos: direção elétrica — não aplicável.",
    intervaloKm: 40000,
    pecas: [{ nome: "Fluido de direção hidráulica", quantidade: 1 }],
  },
  {
    nome: "Kit embreagem",
    descricao:
      "Troca de embreagem (cidade/trânsito locadora). Intervalo variável: 70.000–100.000 km.",
    intervaloKm: 80000,
    pecas: [
      { nome: "Kit embreagem (disco + platô + rolamento)", quantidade: 1 },
      { nome: "Cabo de embreagem (se necessário)", quantidade: 1 },
    ],
  },

  // --- Pneus, rodas e suspensão ---
  {
    nome: "Alinhamento e balanceamento",
    descricao:
      "Alinhamento geométrico + balanceamento das 4 rodas. Recomendado: 10.000 km ou após impacto.",
    intervaloKm: 10000,
    pecas: [],
  },
  {
    nome: "Rodízio de pneus",
    descricao:
      "Rodízio em cruz para desgaste uniforme. A cada 10.000 km (frota de locação).",
    intervaloKm: 10000,
    pecas: [],
  },
  {
    nome: "Troca de pneus (jogo completo)",
    descricao:
      "Vida útil média pneus: 40.000–50.000 km. Locadoras: inspeção de sulco a cada revisão.",
    intervaloKm: 45000,
    pecas: [{ nome: "Pneu 185/65 R15 ou medida do veículo", quantidade: 4 }],
  },
  {
    nome: "Amortecedores dianteiros",
    descricao:
      "Troca de amortecedores dianteiros. Intervalo médio: 60.000–80.000 km (vias urbanas ruins).",
    intervaloKm: 70000,
    pecas: [
      { nome: "Amortecedor dianteiro", quantidade: 2 },
      { nome: "Coifas e batentes", quantidade: 2 },
    ],
  },
  {
    nome: "Amortecedores traseiros",
    descricao: "Troca de amortecedores traseiros. Intervalo: 70.000–90.000 km.",
    intervaloKm: 80000,
    pecas: [
      { nome: "Amortecedor traseiro", quantidade: 2 },
      { nome: "Coifas e batentes", quantidade: 2 },
    ],
  },
  {
    nome: "Buchas e pivôs de suspensão",
    descricao: "Inspeção/troca de buchas. Comum em HB20, Gol, Sandero com alta km de frota.",
    intervaloKm: 60000,
    pecas: [
      { nome: "Kit buchas bandeja", quantidade: 1 },
      { nome: "Pivô de suspensão (se necessário)", quantidade: 2 },
    ],
  },

  // --- Elétrica e ignição ---
  {
    nome: "Bateria automotiva",
    descricao:
      "Vida útil média: 24–36 meses em frota. Equivalente ~30.000 km uso intenso urbano.",
    intervaloKm: 30000,
    pecas: [{ nome: "Bateria 60Ah (conforme manual)", quantidade: 1 }],
  },
  {
    nome: "Bobina de ignição / cabos",
    descricao: "Inspeção/troca de bobinas e cabos de vela. Intervalo: 60.000–80.000 km.",
    intervaloKm: 60000,
    pecas: [
      { nome: "Bobina de ignição", quantidade: 1 },
      { nome: "Cabo de vela (jogo)", quantidade: 1 },
    ],
  },

  // --- Injeção e combustível ---
  {
    nome: "Limpeza de bicos injetores",
    descricao:
      "Limpeza ultrassônica ou aditivo. Recomendado: 30.000 km em motores flex (etanol frequente).",
    intervaloKm: 30000,
    pecas: [{ nome: "Aditivo limpeza bicos / fluido", quantidade: 1 }],
  },
  {
    nome: "Limpeza da borboleta (TBI)",
    descricao: "Limpeza do corpo de borboleta. Sintoma comum em Kwid, Mobi, Gol 1.0 em frota.",
    intervaloKm: 40000,
    pecas: [{ nome: "Spray limpeza borboleta", quantidade: 1 }],
  },

  // --- Ar-condicionado (essencial locadora) ---
  {
    nome: "Higienização do ar-condicionado",
    descricao:
      "Limpeza evaporador + troca filtro cabine. Recomendado: 12 meses ou 15.000 km (frota).",
    intervaloKm: 15000,
    pecas: [
      { nome: "Filtro de cabine", quantidade: 1 },
      { nome: "Spray bactericida A/C", quantidade: 1 },
    ],
  },
  {
    nome: "Recarga de gás A/C (R134a/R1234yf)",
    descricao:
      "Recarga ou conversão do sistema. Quando perda de refrigeração — inspeção semestral em locadora.",
    intervaloKm: 40000,
    pecas: [
      { nome: "Gás refrigerante (conforme manual)", quantidade: 1 },
      { nome: "Óleo PAG para compressor", quantidade: 1 },
    ],
  },

  // --- Itens de desgaste rápido ---
  {
    nome: "Palhetas do para-brisa",
    descricao: "Troca das palhetas dianteiras e traseira. Intervalo: 12 meses ou 12.000 km.",
    intervaloKm: 12000,
    pecas: [
      { nome: "Palheta para-brisa dianteira", quantidade: 2 },
      { nome: "Palheta traseira", quantidade: 1 },
    ],
  },
  {
    nome: "Lâmpadas externas",
    descricao: "Inspeção e troca de lâmpadas queimadas (farol, lanterna, freio).",
    intervaloKm: 20000,
    pecas: [
      { nome: "Lâmpada H4/H7 (conforme farol)", quantidade: 2 },
      { nome: "Lâmpada lanterna/traseira", quantidade: 2 },
    ],
  },

  // --- Modelos específicos (referência rápida na descrição) ---
  {
    nome: "Onix / Onix Plus — Revisão programada",
    descricao:
      "Chevrolet Onix e Onix Plus (hatch/sedan). Plano GM: revisões a cada 10.000 km no concessionário.",
    intervaloKm: 10000,
    pecas: [
      { nome: "Óleo dexos1/dexos2", quantidade: 1 },
      { nome: "Filtro de óleo GM", quantidade: 1 },
      { nome: "Filtro de ar", quantidade: 1 },
    ],
  },
  {
    nome: "Fiat Argo / Mobi — Revisão programada",
    descricao: "Fiat Argo (hatch) e Mobi (compacto). Intervalo Fiat: 10.000 km ou 12 meses.",
    intervaloKm: 10000,
    pecas: [
      { nome: "Óleo Selenia/Fluido Fiat", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Filtro de ar", quantidade: 1 },
    ],
  },
  {
    nome: "VW Gol / Polo — Revisão programada",
    descricao: "Volkswagen Gol e Polo. Plano de revisão VW a cada 15.000 km (alguns 10.000 km).",
    intervaloKm: 15000,
    pecas: [
      { nome: "Óleo VW 502.00/504.00", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Filtro de ar", quantidade: 1 },
      { nome: "Filtro de cabine", quantidade: 1 },
    ],
  },
  {
    nome: "Hyundai HB20 — Revisão programada",
    descricao: "Hyundai HB20 hatch. Plano Hyundai: 10.000 km. Garantia vinculada à revisão na rede.",
    intervaloKm: 10000,
    pecas: [
      { nome: "Óleo Hyundai/Kia spec", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Filtro de ar", quantidade: 1 },
    ],
  },
  {
    nome: "Renault Kwid / Sandero — Revisão programada",
    descricao: "Renault Kwid (compacto) e Sandero (hatch). Intervalo Renault: 10.000 km.",
    intervaloKm: 10000,
    pecas: [
      { nome: "Óleo 5W30 Renault spec", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Filtro de ar", quantidade: 1 },
    ],
  },
  {
    nome: "Toyota Corolla / Honda City — Sedan médio",
    descricao:
      "Sedans (Corolla, City, Cronos). Revisão a cada 10.000 km; óleo sintético 0W20 em motores novos.",
    intervaloKm: 10000,
    pecas: [
      { nome: "Óleo sintético 0W20/5W30", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Filtro de ar", quantidade: 1 },
      { nome: "Filtro de cabine", quantidade: 1 },
    ],
  },
  {
    nome: "Chevrolet Tracker / SUV compacto",
    descricao:
      "SUV compacto (Tracker). Intervalo revisão: 10.000 km. Pneus e fluidos com maior volume.",
    intervaloKm: 10000,
    pecas: [
      { nome: "Óleo do motor", quantidade: 1 },
      { nome: "Filtro de óleo", quantidade: 1 },
      { nome: "Filtro de ar", quantidade: 1 },
      { nome: "Filtro de cabine", quantidade: 1 },
    ],
  },
];
