import type { TipoModeloContrato } from "@/types/prisma";

export type DadosContratoSnapshot = {
  numero: string;
  modelo: TipoModeloContrato;
  geradoEm: string;
  locador: {
    razaoSocial: string;
    cpfCnpj: string;
    rg?: string | null;
    rgOrgao?: string | null;
    endereco: string;
    cidade: string;
    uf: string;
    cep?: string | null;
  };
  locatario: {
    nome: string;
    cpf: string;
    rg?: string | null;
    rgOrgao?: string | null;
    nacionalidade?: string | null;
    endereco?: string | null;
    telefone: string;
  };
  veiculo: {
    marca: string;
    modelo: string;
    ano: number;
    cor?: string | null;
    placa: string;
    renavam?: string | null;
  };
  locacao: {
    dataInicio: string;
    dataFimPrevista?: string | null;
    prazoIndeterminado: boolean;
    kmInicio: number;
    valorSemanalOuMensal: number;
    valorCaucao: number;
    periodicidade: "SEMANAL" | "MENSAL";
    planoConquistaMeses?: number | null;
    planoConquistaValorAdesao?: number | null;
    adesaoCronograma?: string | null;
  };
  clausulas: {
    multaRescisao: number;
    kmSemanalMax: number;
    valorKmExtra: number;
  };
};
