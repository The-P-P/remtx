import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { montarDadosContrato } from "@/lib/contratos/dados-contrato";
import { gerarNumeroContrato } from "@/lib/contratos/numero-contrato";
import { criarPlanoConquistaParaLocacao } from "@/lib/contratos/plano-conquista";
import { sincronizarParcelasMensais } from "@/lib/parcelas-mensais";
import { sincronizarParcelasSemanais } from "@/lib/parcelas-semanais";
import { parseDateInput } from "@/lib/utils";

type Tx = Prisma.TransactionClient;

/** Cria número, documento e plano (se aplicável) para uma locação. */
export async function provisionarContratoLocacao(
  locacaoId: string,
  tx?: Tx
) {
  const run = async (client: Tx) => {
    const locacao = await client.locacao.findUniqueOrThrow({
      where: { id: locacaoId },
    });

    const numero =
      locacao.numeroContrato ??
      (await gerarNumeroContrato(locacao.locadoraId));

    await client.locacao.update({
      where: { id: locacaoId },
      data: { numeroContrato: numero },
    });

    const dados = await montarDadosContrato(locacaoId, numero, client);

    await client.contratoLocacao.upsert({
      where: { locacaoId },
      create: {
        locadoraId: locacao.locadoraId,
        locacaoId,
        numero,
        modelo: locacao.modeloContrato,
        status: "GERADO",
        dadosSnapshot: dados as object,
        geradoEm: new Date(),
      },
      update: {
        numero,
        modelo: locacao.modeloContrato,
        dadosSnapshot: dados as object,
        geradoEm: new Date(),
        versao: { increment: 1 },
      },
    });

    if (locacao.status === "ATIVA") {
      const dataInicio = parseDateInput(locacao.dataInicio);
      if (locacao.periodicidadePagamento === "MENSAL") {
        const meses = locacao.planoConquistaMeses ?? 24;
        await sincronizarParcelasMensais(
          client,
          locacaoId,
          dataInicio,
          meses,
          Number(locacao.valorDiaria)
        );
      } else {
        await sincronizarParcelasSemanais(
          client,
          locacaoId,
          dataInicio,
          locacao.dataFimPrevista,
          Number(locacao.valorDiaria)
        );
      }
    }

    if (locacao.modeloContrato === "PLANO_CONQUISTA") {
      await criarPlanoConquistaParaLocacao(client, locacaoId);
    }

    return { numero, dados };
  };

  if (tx) return run(tx);
  return prisma.$transaction(run);
}
