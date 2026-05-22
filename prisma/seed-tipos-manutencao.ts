/**
 * Seed dedicado: catálogo completo de tipos de manutenção preventiva.
 * Executar: npx tsx prisma/seed-tipos-manutencao.ts
 * Ou via: npm run db:seed:tipos
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { TIPOS_MANUTENCAO_PREVENTIVA } from "./data/tipos-manutencao-preventiva";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedTiposManutencao() {
  console.log(`📋 Cadastrando ${TIPOS_MANUTENCAO_PREVENTIVA.length} tipos de manutenção preventiva...`);

  let criados = 0;
  let atualizados = 0;

  for (const tipo of TIPOS_MANUTENCAO_PREVENTIVA) {
    const existente = await prisma.tipoManutencao.findUnique({
      where: { nome: tipo.nome },
    });

    if (existente) {
      await prisma.pecaPadraoTipo.deleteMany({
        where: { tipoManutencaoId: existente.id },
      });
      await prisma.tipoManutencao.update({
        where: { id: existente.id },
        data: {
          descricao: tipo.descricao,
          intervaloKm: tipo.intervaloKm,
          ativo: true,
          pecasPadrao: {
            create: tipo.pecas.map((p) => ({
              nome: p.nome,
              quantidade: p.quantidade,
            })),
          },
        },
      });
      atualizados++;
    } else {
      await prisma.tipoManutencao.create({
        data: {
          nome: tipo.nome,
          descricao: tipo.descricao,
          intervaloKm: tipo.intervaloKm,
          pecasPadrao: {
            create: tipo.pecas.map((p) => ({
              nome: p.nome,
              quantidade: p.quantidade,
            })),
          },
        },
      });
      criados++;
    }
  }

  console.log(`✅ Tipos: ${criados} criados, ${atualizados} atualizados.`);
  console.log(`   Total no catálogo: ${TIPOS_MANUTENCAO_PREVENTIVA.length}`);
}

seedTiposManutencao()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
