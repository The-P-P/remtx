import { prisma } from "@/lib/prisma";

export async function getConfiguracaoLocadora(locadoraId: string) {
  let cfg = await prisma.configuracaoLocadora.findUnique({
    where: { locadoraId },
  });

  if (!cfg) {
    cfg = await prisma.configuracaoLocadora.create({
      data: {
        id: locadoraId,
        locadoraId,
        razaoSocial: "",
        cpfCnpj: "",
        endereco: "",
        cidade: "São Luís",
        uf: "MA",
      },
    });
  }

  return cfg;
}
