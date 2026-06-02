/**
 * Remove todos os tipos de manutenção do catálogo.
 * Manutenções existentes são reassociadas a um tipo genérico.
 * Executar: npx tsx prisma/clear-tipos-manutencao.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const LOCADORA_SEED_ID = "locadora-legado";
const TIPO_GENERICO = "Manutenção geral";

async function main() {
  const totalTipos = await prisma.tipoManutencao.count();
  if (totalTipos === 0) {
    console.log("Nenhum tipo de manutenção para remover.");
    return;
  }

  const totalManutencoes = await prisma.manutencao.count();
  let fallbackId: string | null = null;

  if (totalManutencoes > 0) {
    const fallback = await prisma.tipoManutencao.upsert({
      where: {
        locadoraId_nome: {
          locadoraId: LOCADORA_SEED_ID,
          nome: TIPO_GENERICO,
        },
      },
      update: { ativo: true, intervaloKm: 10000 },
      create: {
        locadoraId: LOCADORA_SEED_ID,
        nome: TIPO_GENERICO,
        descricao: "Tipo genérico para manutenções já registradas",
        intervaloKm: 10000,
        ativo: true,
      },
    });
    fallbackId = fallback.id;

    await prisma.manutencao.updateMany({
      data: { tipoManutencaoId: fallbackId },
    });
  }

  await prisma.pecaPadraoTipo.deleteMany({});

  const removidos = await prisma.tipoManutencao.deleteMany({
    where: fallbackId ? { id: { not: fallbackId } } : {},
  });

  console.log(
    `✅ ${removidos.count} tipo(s) removido(s).` +
      (fallbackId
        ? ` Manutenções existentes vinculadas a "${TIPO_GENERICO}".`
        : "")
  );
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
