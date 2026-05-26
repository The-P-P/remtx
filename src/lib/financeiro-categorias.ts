import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

const CATEGORIAS_PADRAO: { nome: string; tipo: "ENTRADA" | "SAIDA" }[] = [
  { nome: "Locação de veículos", tipo: "ENTRADA" },
  { nome: "Manutenção de frota", tipo: "SAIDA" },
  { nome: "Combustível", tipo: "SAIDA" },
];

/** Garante categorias usadas pelo seed e pelos pagamentos de locação. */
export async function ensureCategoriasFinanceirasPadrao(client: Tx | typeof prisma = prisma) {
  const results = await Promise.all(
    CATEGORIAS_PADRAO.map((c) =>
      client.categoriaFinanceira.upsert({
        where: { nome: c.nome },
        update: {},
        create: { nome: c.nome, tipo: c.tipo },
      })
    )
  );
  return results;
}

export async function getCategoriaLocacaoVeiculos(client: Tx | typeof prisma = prisma) {
  const categorias = await ensureCategoriasFinanceirasPadrao(client);
  return categorias.find((c) => c.nome === "Locação de veículos") ?? categorias[0];
}
