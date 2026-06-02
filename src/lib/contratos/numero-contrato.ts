import { prisma } from "@/lib/prisma";

/** Gera número sequencial CON-AAAA-NNNN */
export async function gerarNumeroContrato(locadoraId: string): Promise<string> {
  const ano = new Date().getFullYear();
  const prefixo = `CON-${ano}-`;

  const ultimo = await prisma.contratoLocacao.findFirst({
    where: { locadoraId, numero: { startsWith: prefixo } },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });

  let seq = 1;
  if (ultimo?.numero) {
    const parte = ultimo.numero.slice(prefixo.length);
    const n = parseInt(parte, 10);
    if (!Number.isNaN(n)) seq = n + 1;
  }

  return `${prefixo}${String(seq).padStart(4, "0")}`;
}
