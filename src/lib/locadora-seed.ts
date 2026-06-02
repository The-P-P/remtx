import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { TIPOS_MANUTENCAO_PREVENTIVA } from "../../prisma/data/tipos-manutencao-preventiva";

type Tx = Prisma.TransactionClient;

/** Dados iniciais de uma locadora nova: só tipos de manutenção + config para contratos. */
export async function seedLocadoraInicial(
  locadoraId: string,
  nomeLocadora: string,
  client: Tx | typeof prisma = prisma
) {
  await client.configuracaoLocadora.create({
    data: {
      id: locadoraId,
      locadoraId,
      razaoSocial: nomeLocadora,
      cpfCnpj: "",
      endereco: "",
      cidade: "São Luís",
      uf: "MA",
    },
  });

  for (const tipo of TIPOS_MANUTENCAO_PREVENTIVA) {
    await client.tipoManutencao.create({
      data: {
        locadoraId,
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
  }
}
