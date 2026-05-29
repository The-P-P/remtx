import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  dataFimParaParcelas,
  listarVencimentosSemanais,
} from "../src/lib/parcelas-semanais";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed REMTX...");

  const tipoRevisao = await prisma.tipoManutencao.upsert({
    where: { nome: "Revisão periódica" },
    update: { ativo: true, intervaloKm: 10000 },
    create: {
      nome: "Revisão periódica",
      descricao: "Tipo demo para manutenções de exemplo",
      intervaloKm: 10000,
    },
  });
  const tipoRevisaoId = tipoRevisao.id;

  const { ensureCategoriasFinanceirasPadrao } = await import(
    "@/lib/financeiro-categorias"
  );
  const categorias = await ensureCategoriasFinanceirasPadrao();

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const veiculos = await Promise.all([
    prisma.veiculo.upsert({
      where: { placa: "ABC1D23" },
      update: {},
      create: {
        placa: "ABC1D23",
        marca: "Volkswagen",
        modelo: "Gol",
        ano: 2022,
        cor: "Branco",
        kmAtual: 48500,
        kmProximaRevisao: 50000,
        status: "DISPONIVEL",
        ipvaVencimento: new Date(hoje.getFullYear(), 2, 15),
      },
    }),
    prisma.veiculo.upsert({
      where: { placa: "XYZ9E87" },
      update: {},
      create: {
        placa: "XYZ9E87",
        marca: "Fiat",
        modelo: "Argo",
        ano: 2023,
        cor: "Prata",
        kmAtual: 31200,
        kmProximaRevisao: 32000,
        status: "ALUGADO",
        ipvaVencimento: new Date(hoje.getFullYear(), 5, 20),
      },
    }),
    prisma.veiculo.upsert({
      where: { placa: "QWE4R56" },
      update: {},
      create: {
        placa: "QWE4R56",
        marca: "Chevrolet",
        modelo: "Onix",
        ano: 2021,
        cor: "Preto",
        kmAtual: 67800,
        kmProximaRevisao: 70000,
        status: "EM_MANUTENCAO",
      },
    }),
    prisma.veiculo.upsert({
      where: { placa: "HJK7L89" },
      update: {},
      create: {
        placa: "HJK7L89",
        marca: "Hyundai",
        modelo: "HB20",
        ano: 2020,
        cor: "Vermelho",
        kmAtual: 92100,
        kmProximaRevisao: 90000,
        status: "DISPONIVEL",
      },
    }),
  ]);

  const cliente = await prisma.cliente.upsert({
    where: { cpf: "12345678901" },
    update: {},
    create: {
      nome: "Maria Silva",
      cpf: "12345678901",
      telefone: "(11) 98765-4321",
      email: "maria@email.com",
    },
  });

  const problemaExistente = await prisma.problemaCronico.findFirst({
    where: { veiculoId: veiculos[3].id, descricao: { contains: "Ar-condicionado" } },
  });

  if (!problemaExistente) {
    await prisma.problemaCronico.create({
      data: {
        veiculoId: veiculos[3].id,
        descricao: "Ar-condicionado com vazamento intermitente",
        gravidade: "MEDIA",
        ativo: true,
      },
    });
  }

  const manutencaoCount = await prisma.manutencao.count();
  if (manutencaoCount === 0) {
    await prisma.manutencao.createMany({
      data: [
        {
          veiculoId: veiculos[0].id,
          tipoManutencaoId: tipoRevisaoId,
          dataRealizada: new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000),
          kmRealizada: 40000,
          kmProxima: 50000,
          alerta: "AMARELO",
          custo: 450,
        },
        {
          veiculoId: veiculos[3].id,
          tipoManutencaoId: tipoRevisaoId,
          dataRealizada: new Date(hoje.getTime() - 120 * 24 * 60 * 60 * 1000),
          kmRealizada: 80000,
          kmProxima: 90000,
          alerta: "VERMELHO",
          custo: 520,
        },
      ],
    });
  }

  const locacaoCount = await prisma.locacao.count();
  let locacaoAtivaId: string | null = null;
  if (locacaoCount === 0) {
    const locAtiva = await prisma.locacao.create({
      data: {
        veiculoId: veiculos[1].id,
        clienteId: cliente.id,
        dataInicio: new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000),
        dataFimPrevista: new Date(hoje.getTime() + 4 * 24 * 60 * 60 * 1000),
        kmInicio: 31000,
        valorDiaria: 350,
        status: "ATIVA",
      },
    });
    locacaoAtivaId = locAtiva.id;
    const fimAtiva = new Date(hoje.getTime() + 4 * 24 * 60 * 60 * 1000);
    const vencimentosAtiva = listarVencimentosSemanais(locAtiva.dataInicio, fimAtiva);
    await prisma.parcelaLocacao.createMany({
      data: vencimentosAtiva.map((dataVencimento, i) => ({
        locacaoId: locAtiva.id,
        valorBase: 350,
        valorJuros: 0,
        valor: 350,
        dataVencimento,
        dataVencimentoOriginal: dataVencimento,
        observacoes: `Semana ${i + 1}`,
      })),
    });

    const inicioFin = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fimFin = new Date(hoje.getTime() - 25 * 24 * 60 * 60 * 1000);
    const semanasFin = listarVencimentosSemanais(inicioFin, fimFin).length;
    await prisma.locacao.create({
      data: {
        veiculoId: veiculos[0].id,
        clienteId: cliente.id,
        dataInicio: inicioFin,
        dataFimPrevista: fimFin,
        dataFimReal: fimFin,
        kmInicio: 47000,
        kmFim: 48500,
        valorDiaria: 280,
        valorTotal: semanasFin * 280,
        status: "FINALIZADA",
      },
    });
  } else {
    const ativa = await prisma.locacao.findFirst({
      where: { status: "ATIVA" },
    });
    locacaoAtivaId = ativa?.id ?? null;
  }

  if (locacaoAtivaId) {
    const locAtivaExistente = await prisma.locacao.findUnique({
      where: { id: locacaoAtivaId },
    });
    const parcelaCount = await prisma.parcelaLocacao.count({
      where: { locacaoId: locacaoAtivaId },
    });
    if (parcelaCount === 0 && locAtivaExistente?.status === "ATIVA") {
      const vencimentos = listarVencimentosSemanais(
        locAtivaExistente.dataInicio,
        dataFimParaParcelas(
          locAtivaExistente.dataInicio,
          locAtivaExistente.dataFimPrevista
        )
      );
      const valorSem = Number(locAtivaExistente.valorDiaria);
      await prisma.parcelaLocacao.createMany({
        data: vencimentos.map((dataVencimento, i) => ({
          locacaoId: locacaoAtivaId,
          valorBase: valorSem,
          valorJuros: 0,
          valor: valorSem,
          dataVencimento,
          dataVencimentoOriginal: dataVencimento,
          observacoes: `Semana ${i + 1}`,
        })),
      });
    }
  }

  const eventoCount = await prisma.eventoAgenda.count();
  if (eventoCount === 0) {
    await prisma.eventoAgenda.createMany({
      data: [
        {
          titulo: "Revisão agendada — Oficina Centro",
          tipo: "MANUTENCAO_AGENDADA",
          dataInicio: new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000),
          veiculoId: veiculos[2].id,
        },
        {
          titulo: "Pagamento fornecedor pneus",
          tipo: "FINANCEIRO",
          dataInicio: new Date(hoje.getTime() + 10 * 24 * 60 * 60 * 1000),
          valor: 1500,
        },
      ],
    });
  }

  const transacaoCount = await prisma.transacaoFinanceira.count();
  if (transacaoCount === 0) {
    await prisma.transacaoFinanceira.createMany({
      data: [
        {
          categoriaId: categorias[0].id,
          tipo: "ENTRADA",
          valor: 2400,
          descricao: "Locações do mês",
          data: new Date(inicioMes.getTime() + 5 * 24 * 60 * 60 * 1000),
        },
        {
          categoriaId: categorias[0].id,
          tipo: "ENTRADA",
          valor: 850,
          descricao: "Locação HB20",
          data: new Date(inicioMes.getTime() + 12 * 24 * 60 * 60 * 1000),
        },
        {
          categoriaId: categorias[1].id,
          tipo: "SAIDA",
          valor: 970,
          descricao: "Manutenções preventivas",
          data: new Date(inicioMes.getTime() + 8 * 24 * 60 * 60 * 1000),
        },
        {
          categoriaId: categorias[2].id,
          tipo: "SAIDA",
          valor: 320,
          descricao: "Abastecimento frota",
          data: new Date(inicioMes.getTime() + 15 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }

  console.log("✅ Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
