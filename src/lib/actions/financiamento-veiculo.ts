"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/auth";
import { requireTenant } from "@/lib/tenant";
import { gerarParcelasFinanciamento } from "@/lib/financiamento-parcelas";
import {
  financiamentoVeiculoSchema,
  type FinanciamentoVeiculoFormData,
} from "@/lib/validations/financiamento-veiculo";
import { getCategoriaFinanciamentoVeiculo } from "@/lib/financeiro-categorias";
import { criarLancamentoFinanceiro } from "@/lib/financeiro-lancamento";
import type { FormaPagamento } from "@/types/prisma";
import type { ActionResult } from "@/lib/actions/action-result";
import { friendlyErrorMessage } from "@/lib/errors/friendly-message";

async function assertVeiculoAccess() {
  const tenant = await requireTenant();
  if (!hasPermission(tenant.role, "veiculos")) {
    throw new Error("Sem permissão para gerenciar veículos");
  }
  return tenant;
}

export async function criarFinanciamentoVeiculo(
  veiculoId: string,
  dados: FinanciamentoVeiculoFormData
) {
  const parcelasGeradas = gerarParcelasFinanciamento({
    totalParcelas: dados.totalParcelas,
    valorParcela: dados.valorParcela,
    saldoDevedor: dados.saldoDevedor,
    dataPrimeiraParcela: dados.dataPrimeiraParcela,
    diaVencimento: dados.diaVencimento,
  });

  return prisma.$transaction(async (tx) => {
    const financiamento = await tx.financiamentoVeiculo.create({
      data: {
        veiculoId,
        instituicao: dados.instituicao?.trim() || null,
        valorFinanciado: dados.valorFinanciado,
        valorEntrada: dados.valorEntrada,
        saldoDevedor: dados.saldoDevedor,
        valorParcela: dados.valorParcela,
        totalParcelas: dados.totalParcelas,
        diaVencimento: dados.diaVencimento,
        dataPrimeiraParcela: dados.dataPrimeiraParcela,
        observacoes: dados.observacoes?.trim() || null,
        parcelas: {
          create: parcelasGeradas.map((p) => ({
            numero: p.numero,
            valor: p.valor,
            dataVencimento: p.dataVencimento,
          })),
        },
      },
    });

    return financiamento;
  });
}

export async function atualizarFinanciamentoBasico(
  financiamentoId: string,
  veiculoId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const tenant = await assertVeiculoAccess();

    const fin = await prisma.financiamentoVeiculo.findFirst({
      where: {
        id: financiamentoId,
        veiculoId,
        veiculo: { locadoraId: tenant.locadoraId },
      },
      include: { parcelas: { where: { dataPagamento: { not: null } }, take: 1 } },
    });
    if (!fin) return { success: false, error: "Financiamento não encontrado" };

    const instituicao = (formData.get("financiamentoInstituicao") as string) || null;
    const observacoes = (formData.get("financiamentoObservacoes") as string) || null;

    if (fin.parcelas.length > 0) {
      await prisma.financiamentoVeiculo.update({
        where: { id: financiamentoId },
        data: {
          instituicao: instituicao?.trim() || null,
          observacoes: observacoes?.trim() || null,
        },
      });
    } else {
      const parsed = financiamentoVeiculoSchema.safeParse({
        instituicao: instituicao || undefined,
        valorFinanciado: formData.get("financiamentoValorFinanciado"),
        valorEntrada: formData.get("financiamentoValorEntrada") || 0,
        saldoDevedor: formData.get("financiamentoSaldoDevedor"),
        valorParcela: formData.get("financiamentoValorParcela"),
        totalParcelas: formData.get("financiamentoTotalParcelas"),
        diaVencimento: formData.get("financiamentoDiaVencimento"),
        dataPrimeiraParcela: formData.get("financiamentoDataPrimeiraParcela"),
        observacoes: observacoes || undefined,
      });

      if (!parsed.success) {
        return {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Dados inválidos",
        };
      }

      const dados = parsed.data;
      const parcelasGeradas = gerarParcelasFinanciamento({
        totalParcelas: dados.totalParcelas,
        valorParcela: dados.valorParcela,
        saldoDevedor: dados.saldoDevedor,
        dataPrimeiraParcela: dados.dataPrimeiraParcela,
        diaVencimento: dados.diaVencimento,
      });

      await prisma.$transaction(async (tx) => {
        await tx.parcelaFinanciamento.deleteMany({
          where: { financiamentoId },
        });
        await tx.financiamentoVeiculo.update({
          where: { id: financiamentoId },
          data: {
            instituicao: dados.instituicao?.trim() || null,
            valorFinanciado: dados.valorFinanciado,
            valorEntrada: dados.valorEntrada,
            saldoDevedor: dados.saldoDevedor,
            valorParcela: dados.valorParcela,
            totalParcelas: dados.totalParcelas,
            diaVencimento: dados.diaVencimento,
            dataPrimeiraParcela: dados.dataPrimeiraParcela,
            observacoes: dados.observacoes?.trim() || null,
            ativo: true,
            quitadoEm: null,
            parcelas: {
              create: parcelasGeradas.map((p) => ({
                numero: p.numero,
                valor: p.valor,
                dataVencimento: p.dataVencimento,
              })),
            },
          },
        });
      });
    }

    revalidatePath(`/veiculos/${veiculoId}`);
    revalidatePath(`/veiculos/${veiculoId}/editar`);
    revalidatePath("/veiculos");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao atualizar financiamento"),
    };
  }
}

export async function confirmarPagamentoParcelaFinanciamento(
  parcelaId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const tenant = await assertVeiculoAccess();

    const registrarFinanceiro = formData.get("registrarFinanceiro") === "on";
    const formaPagamento = (formData.get("formaPagamento") as FormaPagamento) || null;
    const dataPagamentoStr = formData.get("dataPagamento") as string;
    const dataPagamento = dataPagamentoStr
      ? new Date(dataPagamentoStr + "T12:00:00")
      : new Date();

    const parcela = await prisma.parcelaFinanciamento.findFirst({
      where: {
        id: parcelaId,
        financiamento: { veiculo: { locadoraId: tenant.locadoraId } },
      },
      include: {
        financiamento: {
          include: { veiculo: { select: { id: true, placa: true } } },
        },
      },
    });

    if (!parcela) return { success: false, error: "Parcela não encontrada" };
    if (parcela.dataPagamento) {
      return { success: false, error: "Parcela já foi paga" };
    }

    const valorPago = Number(parcela.valor);
    const veiculoId = parcela.financiamento.veiculoId;
    const placa = parcela.financiamento.veiculo.placa;

    await prisma.$transaction(async (tx) => {
      await tx.parcelaFinanciamento.update({
        where: { id: parcelaId },
        data: { dataPagamento },
      });

      const pagas = await tx.parcelaFinanciamento.count({
        where: {
          financiamentoId: parcela.financiamentoId,
          dataPagamento: { not: null },
        },
      });

      const novoSaldo = Math.max(
        0,
        Math.round((Number(parcela.financiamento.saldoDevedor) - valorPago) * 100) /
          100
      );

      const quitado = pagas >= parcela.financiamento.totalParcelas;

      await tx.financiamentoVeiculo.update({
        where: { id: parcela.financiamentoId },
        data: {
          saldoDevedor: quitado ? 0 : novoSaldo,
          ativo: !quitado,
          quitadoEm: quitado ? dataPagamento : null,
        },
      });

      if (registrarFinanceiro) {
        const categoria = await getCategoriaFinanciamentoVeiculo(
          tenant.locadoraId,
          tx
        );
        await criarLancamentoFinanceiro(tx, {
          categoriaId: categoria.id,
          tipo: "SAIDA",
          valor: valorPago,
          descricao: `Financiamento ${placa} — parcela ${parcela.numero}/${parcela.financiamento.totalParcelas}`,
          data: dataPagamento,
          formaPagamento,
          parcelaFinanciamentoId: parcelaId,
        });
      }
    });

    revalidatePath(`/veiculos/${veiculoId}`);
    revalidatePath("/veiculos");
    revalidatePath("/financeiro");
    revalidatePath("/locacoes");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao registrar pagamento"),
    };
  }
}

export async function estornarPagamentoParcelaFinanciamento(
  parcelaId: string
): Promise<ActionResult> {
  try {
    const tenant = await assertVeiculoAccess();

    const parcela = await prisma.parcelaFinanciamento.findFirst({
      where: {
        id: parcelaId,
        financiamento: { veiculo: { locadoraId: tenant.locadoraId } },
      },
      include: {
        financiamento: true,
        transacaoFinanceira: { select: { id: true } },
      },
    });

    if (!parcela?.dataPagamento) {
      return { success: false, error: "Parcela não está paga" };
    }

    const valorPago = Number(parcela.valor);
    const veiculoId = parcela.financiamento.veiculoId;

    await prisma.$transaction(async (tx) => {
      if (parcela.transacaoFinanceira) {
        await tx.transacaoFinanceira.delete({
          where: { id: parcela.transacaoFinanceira.id },
        });
      }

      await tx.parcelaFinanciamento.update({
        where: { id: parcelaId },
        data: { dataPagamento: null },
      });

      await tx.financiamentoVeiculo.update({
        where: { id: parcela.financiamentoId },
        data: {
          saldoDevedor: Number(parcela.financiamento.saldoDevedor) + valorPago,
          ativo: true,
          quitadoEm: null,
        },
      });
    });

    revalidatePath(`/veiculos/${veiculoId}`);
    revalidatePath("/veiculos");
    revalidatePath("/financeiro");
    revalidatePath("/locacoes");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao estornar pagamento"),
    };
  }
}
