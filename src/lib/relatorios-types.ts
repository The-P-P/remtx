import type { FormaPagamento } from "@/types/prisma";
import type { PeriodoFinanceiro } from "@/lib/financeiro-periodo";

export type RelatorioFiltros = {
  ano?: string;
  mes?: string;
  de?: string;
  ate?: string;
  periodoTipo?: string;
  dataRef?: string;
};

export type RelatorioKpis = {
  receita: number;
  despesa: number;
  lucro: number;
  custoManutencao: number;
  receitaLocacao: number;
  ticketMedio: number;
  taxaOcupacao: number;
  inadimplencia: number;
  parcelasAtrasadas: number;
  valorAtrasado: number;
};

export type RelatorioComparativo = {
  receita: number | null;
  despesa: number | null;
  lucro: number | null;
  taxaOcupacao: number | null;
  inadimplencia: number | null;
};

export type TopVeiculo = {
  veiculoId: string;
  placa: string;
  modelo: string;
  receita: number;
  qtd: number;
};

export type TopCliente = {
  clienteId: string;
  nome: string;
  receita: number;
  qtd: number;
};

export type CategoriaResumo = {
  nome: string;
  tipo: "ENTRADA" | "SAIDA";
  total: number;
};

export type SerieMes = {
  ano: number;
  mes: number;
  entradas: number;
  saidas: number;
  lucro: number;
};

export type FrotaVeiculoRelatorio = {
  veiculoId: string;
  placa: string;
  modelo: string;
  status: string;
  diasLocados: number;
  diasParados: number;
  taxaOcupacao: number;
  receita: number;
  custoManutencao: number;
  custoFinanciamento: number;
  lucro: number;
  qtdLocacoes: number;
};

export type InadimplenciaItem = {
  parcelaId: string;
  locacaoId: string;
  clienteNome: string;
  veiculoPlaca: string;
  valor: number;
  dataVencimento: string;
  diasAtraso: number;
};

export type FormaPagamentoResumo = {
  forma: FormaPagamento;
  label: string;
  total: number;
  qtd: number;
};

export type ManutencaoTipoResumo = {
  tipo: string;
  qtd: number;
  custo: number;
};

export type PrevisaoItem = {
  id: string;
  tipo: "parcela" | "saida";
  descricao: string;
  valor: number;
  data: string;
};

export type AlertaRelatorio = {
  nivel: "info" | "warning" | "danger";
  titulo: string;
  descricao: string;
};

export type RelatorioGeralData = {
  periodo: PeriodoFinanceiro;
  periodoAnterior: { inicio: string; fim: string; label: string };
  kpis: RelatorioKpis;
  comparativo: RelatorioComparativo;
  rankings: {
    topVeiculos: TopVeiculo[];
    topClientes: TopCliente[];
    categorias: CategoriaResumo[];
  };
  serieMensal: SerieMes[];
  frota: FrotaVeiculoRelatorio[];
  inadimplencia: InadimplenciaItem[];
  formasPagamento: FormaPagamentoResumo[];
  manutencaoPorTipo: ManutencaoTipoResumo[];
  previsao: {
    entradasPrevistas: number;
    saidasPrevistas: number;
    saldoPrevisto: number;
    itens: PrevisaoItem[];
  };
  operacao: {
    locacoesIniciadas: number;
    locacoesFinalizadas: number;
    locacoesAtivasNoFim: number;
    diasMedioLocacao: number;
  };
  clientes: {
    novos: number;
    recorrentes: number;
    totalComLocacao: number;
  };
  alertas: AlertaRelatorio[];
};
