import { prisma } from "../src/lib/prisma";

async function main() {
  const [
    veiculos,
    clientes,
    locacoes,
    parcelas,
    eventosAgenda,
    conclusoesAgenda,
    categorias,
    transacoes,
    migrations,
  ] = await Promise.all([
    prisma.veiculo.count(),
    prisma.cliente.count(),
    prisma.locacao.count(),
    prisma.parcelaLocacao.count(),
    prisma.eventoAgenda.count(),
    prisma.conclusaoAgenda.count(),
    prisma.categoriaFinanceira.count(),
    prisma.transacaoFinanceira.count(),
    prisma.$queryRaw<
      { migration_name: string; finished_at: Date | null }[]
    >`SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY finished_at`,
  ]);

  const veiculoComIpva = await prisma.veiculo.count({
    where: { ipvaVencimento: { not: null } },
  });

  const categoriasNomes = await prisma.categoriaFinanceira.findMany({
    select: { nome: true, tipo: true },
    orderBy: { nome: "asc" },
  });

  console.log("=== REMTX — verificação do banco ===\n");
  console.log("Conexão: OK\n");
  console.log("Migrations aplicadas:");
  for (const m of migrations) {
    console.log(
      `  - ${m.migration_name} (${m.finished_at ? new Date(m.finished_at).toISOString() : "pendente"})`
    );
  }
  console.log("\nContagens:");
  console.log(`  Veículos:           ${veiculos} (${veiculoComIpva} com IPVA)`);
  console.log(`  Clientes:           ${clientes}`);
  console.log(`  Locações:           ${locacoes}`);
  console.log(`  Parcelas:           ${parcelas}`);
  console.log(`  Eventos agenda:     ${eventosAgenda}`);
  console.log(`  Conclusões agenda:  ${conclusoesAgenda}`);
  console.log(`  Categorias fin.:    ${categorias}`);
  console.log(`  Transações fin.:    ${transacoes}`);
  console.log("\nCategorias financeiras:");
  for (const c of categoriasNomes) {
    console.log(`  - ${c.nome} (${c.tipo})`);
  }

  const { CATEGORIA_LOCACAO_NOME, CATEGORIAS_PADRAO } = await import(
    "../src/lib/financeiro-categorias"
  );
  if (!categoriasNomes.some((c) => c.nome === CATEGORIA_LOCACAO_NOME)) {
    console.error(`\n⚠ Categoria obrigatória faltando: ${CATEGORIA_LOCACAO_NOME}`);
    process.exit(1);
  }
  if (categorias < CATEGORIAS_PADRAO.length) {
    console.log(
      `\nℹ Rode o app ou seed para criar ${CATEGORIAS_PADRAO.length - categorias} categoria(s) padrão faltante(s).`
    );
  }

  if (migrations.length < 2) {
    console.error("\n⚠ Esperado pelo menos 2 migrations aplicadas.");
    process.exit(1);
  }

  console.log("\n✅ Banco consistente com Fase 2.");
}

main()
  .catch((e) => {
    console.error("\n❌ Erro ao verificar banco:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
