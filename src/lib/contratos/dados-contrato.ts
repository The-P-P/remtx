import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { parseDateInput } from "@/lib/utils";
import { getConfiguracaoLocadora } from "@/lib/contratos/config-locadora";
import type { DadosContratoSnapshot } from "@/lib/contratos/types";
import { formatCpfContrato } from "@/lib/format/cpf";

type Tx = Prisma.TransactionClient;

function fmtData(d: Date) {
  return format(parseDateInput(d), "dd/MM/yyyy", { locale: ptBR });
}

function fmtMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function montarDadosContrato(
  locacaoId: string,
  numero: string,
  tx?: Tx
): Promise<DadosContratoSnapshot> {
  const db = tx ?? prisma;
  const locacao = await db.locacao.findUniqueOrThrow({
    where: { id: locacaoId },
    include: {
      veiculo: true,
      cliente: true,
    },
  });

  const locador = await getConfiguracaoLocadora(locacao.locadoraId);
  const valor = Number(locacao.valorDiaria);
  const caucao = Number(locacao.valorCaucao);
  const isPlano = locacao.modeloContrato === "PLANO_CONQUISTA";
  const adesao = Number(
    locacao.planoConquistaValorAdesao ?? locacao.valorCaucao
  );

  let adesaoCronograma: string | null = null;
  if (isPlano && adesao > 0) {
    const inicio = parseDateInput(locacao.dataInicio);
    const p1 = adesao * 0.5;
    const p2 = adesao * 0.25;
    const p3 = adesao * 0.25;
    adesaoCronograma = [
      `${fmtMoeda(p1)} em ${format(inicio, "dd/MM/yyyy")}`,
      `${fmtMoeda(p2)} em ${format(addMonths(inicio, 1), "dd/MM/yyyy")}`,
      `${fmtMoeda(p3)} em ${format(addMonths(inicio, 2), "dd/MM/yyyy")}`,
    ].join("; ");
  }

  return {
    numero,
    modelo: locacao.modeloContrato,
    geradoEm: fmtData(new Date()),
    locador: {
      razaoSocial: locador.razaoSocial,
      cpfCnpj: formatCpfContrato(locador.cpfCnpj),
      rg: locador.rg,
      rgOrgao: locador.rgOrgao,
      endereco: locador.endereco,
      cidade: locador.cidade,
      uf: locador.uf,
      cep: locador.cep,
    },
    locatario: {
      nome: locacao.cliente.nome,
      cpf: formatCpfContrato(locacao.cliente.cpf),
      rg: locacao.cliente.rg,
      rgOrgao: locacao.cliente.rgOrgao,
      nacionalidade: locacao.cliente.nacionalidade,
      endereco: locacao.cliente.endereco,
      telefone: locacao.cliente.telefone,
    },
    veiculo: {
      marca: locacao.veiculo.marca,
      modelo: locacao.veiculo.modelo,
      ano: locacao.veiculo.ano,
      cor: locacao.veiculo.cor,
      placa: locacao.veiculo.placa,
      renavam: locacao.veiculo.renavam,
    },
    locacao: {
      dataInicio: fmtData(locacao.dataInicio),
      dataFimPrevista: locacao.dataFimPrevista
        ? fmtData(locacao.dataFimPrevista)
        : null,
      prazoIndeterminado: !locacao.dataFimPrevista,
      kmInicio: locacao.kmInicio,
      valorSemanalOuMensal: valor,
      valorCaucao: caucao,
      periodicidade: locacao.periodicidadePagamento,
      planoConquistaMeses: locacao.planoConquistaMeses,
      planoConquistaValorAdesao: isPlano ? adesao : null,
      adesaoCronograma,
    },
    clausulas: {
      multaRescisao: Number(locador.multaRescisao),
      kmSemanalMax: locador.kmSemanalMax,
      valorKmExtra: Number(locador.valorKmExtra),
    },
  };
}

export { fmtMoeda, fmtData };
