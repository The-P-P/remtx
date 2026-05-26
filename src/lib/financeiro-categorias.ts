import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

/** Categorias criadas automaticamente (upsert por nome). */
export const CATEGORIAS_PADRAO: { nome: string; tipo: "ENTRADA" | "SAIDA" }[] = [
  // —— Entradas ——
  { nome: "Locação de veículos", tipo: "ENTRADA" },
  { nome: "Juros e multas de atraso", tipo: "ENTRADA" },
  { nome: "Taxa de entrega e retirada", tipo: "ENTRADA" },
  { nome: "Caução e depósitos", tipo: "ENTRADA" },
  { nome: "Franquia e indenizações (cliente)", tipo: "ENTRADA" },
  { nome: "Multas repassadas ao cliente", tipo: "ENTRADA" },
  { nome: "Km excedente e adicionais", tipo: "ENTRADA" },
  { nome: "Venda de veículos", tipo: "ENTRADA" },
  { nome: "Reembolsos recebidos", tipo: "ENTRADA" },
  { nome: "Rendimentos financeiros", tipo: "ENTRADA" },
  { nome: "Outras receitas", tipo: "ENTRADA" },

  // —— Despesas operacionais da frota ——
  { nome: "Manutenção de frota", tipo: "SAIDA" },
  { nome: "Combustível", tipo: "SAIDA" },
  { nome: "Oficina e mão de obra", tipo: "SAIDA" },
  { nome: "Peças e acessórios", tipo: "SAIDA" },
  { nome: "Pneus e alinhamento", tipo: "SAIDA" },
  { nome: "Lavagem e higienização", tipo: "SAIDA" },
  { nome: "IPVA e licenciamento", tipo: "SAIDA" },
  { nome: "Seguro de veículos", tipo: "SAIDA" },
  { nome: "Documentação e vistoria", tipo: "SAIDA" },
  { nome: "Rastreador e telemetria", tipo: "SAIDA" },
  { nome: "Pedágio e estacionamento", tipo: "SAIDA" },
  { nome: "Multas da frota", tipo: "SAIDA" },
  { nome: "Sinistro e franquia paga", tipo: "SAIDA" },
  { nome: "Transporte e guincho", tipo: "SAIDA" },

  // —— Despesas administrativas e comerciais ——
  { nome: "Salários e encargos", tipo: "SAIDA" },
  { nome: "Aluguel do pátio", tipo: "SAIDA" },
  { nome: "Energia, água e internet", tipo: "SAIDA" },
  { nome: "Marketing e publicidade", tipo: "SAIDA" },
  { nome: "Comissões e parcerias", tipo: "SAIDA" },
  { nome: "Contabilidade e jurídico", tipo: "SAIDA" },
  { nome: "Software e sistemas", tipo: "SAIDA" },
  { nome: "Material de escritório", tipo: "SAIDA" },
  { nome: "Taxas bancárias", tipo: "SAIDA" },
  { nome: "Impostos e tributos", tipo: "SAIDA" },
  { nome: "EPI e uniformes", tipo: "SAIDA" },
  { nome: "Viagens e deslocamentos", tipo: "SAIDA" },
  { nome: "Treinamento e capacitação", tipo: "SAIDA" },
  { nome: "Outras despesas", tipo: "SAIDA" },
];

/** Nome fixo usado nos pagamentos de locação (agenda). */
export const CATEGORIA_LOCACAO_NOME = "Locação de veículos";

/** Garante categorias padrão no banco (idempotente). */
export async function ensureCategoriasFinanceirasPadrao(
  client: Tx | typeof prisma = prisma
) {
  const results = await Promise.all(
    CATEGORIAS_PADRAO.map((c) =>
      client.categoriaFinanceira.upsert({
        where: { nome: c.nome },
        update: { tipo: c.tipo },
        create: { nome: c.nome, tipo: c.tipo },
      })
    )
  );
  return results;
}

export async function getCategoriaLocacaoVeiculos(
  client: Tx | typeof prisma = prisma
) {
  const categorias = await ensureCategoriasFinanceirasPadrao(client);
  return (
    categorias.find((c) => c.nome === CATEGORIA_LOCACAO_NOME) ?? categorias[0]
  );
}
