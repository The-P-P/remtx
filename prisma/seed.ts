import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed REMTX...");

  const tiposManutencao = await Promise.all([
    prisma.tipoManutencao.upsert({
      where: { nome: "Revisão 10.000 km" },
      update: {},
      create: {
        nome: "Revisão 10.000 km",
        descricao: "Revisão periódica completa",
        intervaloKm: 10000,
        pecasPadrao: {
          create: [
            { nome: "Óleo do motor", quantidade: 1 },
            { nome: "Filtro de óleo", quantidade: 1 },
            { nome: "Filtro de ar", quantidade: 1 },
          ],
        },
      },
    }),
    prisma.tipoManutencao.upsert({
      where: { nome: "Troca de pastilhas de freio" },
      update: {},
      create: {
        nome: "Troca de pastilhas de freio",
        intervaloKm: 40000,
        pecasPadrao: {
          create: [
            { nome: "Pastilhas dianteiras", quantidade: 1 },
            { nome: "Pastilhas traseiras", quantidade: 1 },
            { nome: "Fluido de freio", quantidade: 1 },
          ],
        },
      },
    }),
  ]);

  const categorias = await Promise.all([
    prisma.categoriaFinanceira.upsert({
      where: { nome: "Locação de veículos" },
      update: {},
      create: { nome: "Locação de veículos", tipo: "ENTRADA" },
    }),
    prisma.categoriaFinanceira.upsert({
      where: { nome: "Manutenção de frota" },
      update: {},
      create: { nome: "Manutenção de frota", tipo: "SAIDA" },
    }),
    prisma.categoriaFinanceira.upsert({
      where: { nome: "Combustível" },
      update: {},
      create: { nome: "Combustível", tipo: "SAIDA" },
    }),
  ]);

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

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const manutencaoCount = await prisma.manutencao.count();
  if (manutencaoCount === 0) {
    await prisma.manutencao.createMany({
      data: [
        {
          veiculoId: veiculos[0].id,
          tipoManutencaoId: tiposManutencao[0].id,
          dataRealizada: new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000),
          kmRealizada: 40000,
          kmProxima: 50000,
          alerta: "AMARELO",
          custo: 450,
        },
        {
          veiculoId: veiculos[3].id,
          tipoManutencaoId: tiposManutencao[0].id,
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
  if (locacaoCount === 0) {
    await prisma.locacao.createMany({
      data: [
        {
          veiculoId: veiculos[1].id,
          clienteId: cliente.id,
          dataInicio: new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000),
          dataFimPrevista: new Date(hoje.getTime() + 4 * 24 * 60 * 60 * 1000),
          kmInicio: 31000,
          valorDiaria: 120,
          status: "ATIVA",
        },
        {
          veiculoId: veiculos[0].id,
          clienteId: cliente.id,
          dataInicio: new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000),
          dataFimPrevista: new Date(hoje.getTime() - 25 * 24 * 60 * 60 * 1000),
          dataFimReal: new Date(hoje.getTime() - 25 * 24 * 60 * 60 * 1000),
          kmInicio: 47000,
          kmFim: 48500,
          valorDiaria: 95,
          valorTotal: 475,
          status: "FINALIZADA",
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
