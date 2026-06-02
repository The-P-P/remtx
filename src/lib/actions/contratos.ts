"use server";

import { friendlyErrorMessage } from "@/lib/errors/friendly-message";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/auth";
import { requireTenant } from "@/lib/tenant";
import { montarDadosContrato } from "@/lib/contratos/dados-contrato";
import { getConfiguracaoLocadora } from "@/lib/contratos/config-locadora";
import { provisionarContratoLocacao } from "@/lib/contratos/provisionar";
import { sincronizarContratosLegados } from "@/lib/contratos/sync-legados";
import { z } from "zod";
import type { FormState } from "@/types/form";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function assertContratoAccess() {
  const tenant = await requireTenant();
  if (!hasPermission(tenant.role, "locacoes")) {
    throw new Error("Sem permissão");
  }
  return tenant;
}

export async function sincronizarContratosLegadosAction(): Promise<
  ActionResult<{ gerados: number }>
> {
  try {
    const tenant = await assertContratoAccess();
    const { gerados } = await sincronizarContratosLegados(tenant.locadoraId);
    revalidatePath("/clientes/contratos");
    revalidatePath("/clientes/contratos/planos-conquista");
    return { success: true, data: { gerados } };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro na sincronização"),
    };
  }
}

export async function getContratosComDocumento(status?: string) {
  const { locadoraId } = await requireTenant();
  return prisma.locacao.findMany({
    where: {
      locadoraId,
      ...(status ? { status: status as never } : {}),
    },
    orderBy: { dataInicio: "desc" },
    include: {
      veiculo: { select: { placa: true, marca: true, modelo: true } },
      cliente: { select: { id: true, nome: true, telefone: true } },
      contrato: { select: { numero: true, modelo: true, geradoEm: true } },
      planoConquista: {
        select: {
          status: true,
          mesesPagos: true,
          totalMeses: true,
          adesaoPaga: true,
        },
      },
    },
  });
}

export async function getPlanosConquista(status?: string) {
  const { locadoraId } = await requireTenant();
  return prisma.planoConquista.findMany({
    where: {
      cliente: { locadoraId },
      ...(status ? { status: status as never } : {}),
    },
    orderBy: { dataInicio: "desc" },
    include: {
      cliente: { select: { id: true, nome: true, cpf: true } },
      locacao: {
        select: {
          id: true,
          status: true,
          numeroContrato: true,
          veiculo: { select: { placa: true, marca: true, modelo: true } },
        },
      },
    },
  });
}

export async function getPlanoConquistaByCliente(clienteId: string) {
  const { locadoraId } = await requireTenant();
  return prisma.planoConquista.findMany({
    where: { clienteId, cliente: { locadoraId } },
    orderBy: { dataInicio: "desc" },
    include: {
      locacao: {
        select: {
          id: true,
          status: true,
          numeroContrato: true,
          veiculo: { select: { placa: true } },
        },
      },
      registros: { orderBy: { mesNumero: "asc" } },
    },
  });
}

export async function getConfiguracaoLocadoraAction() {
  const tenant = await assertContratoAccess();
  return getConfiguracaoLocadora(tenant.locadoraId);
}

const configSchema = z.object({
  razaoSocial: z.string().min(2),
  cpfCnpj: z.string().min(11),
  rg: z.string().optional(),
  rgOrgao: z.string().optional(),
  endereco: z.string().min(5),
  cidade: z.string().min(2),
  uf: z.string().length(2),
  cep: z.string().optional(),
  multaRescisao: z.coerce.number().positive(),
  kmSemanalMax: z.coerce.number().int().positive(),
  valorKmExtra: z.coerce.number().positive(),
});

export async function updateConfiguracaoLocadora(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const tenant = await assertContratoAccess();
    const parsed = configSchema.safeParse({
      razaoSocial: formData.get("razaoSocial"),
      cpfCnpj: formData.get("cpfCnpj"),
      rg: formData.get("rg") || undefined,
      rgOrgao: formData.get("rgOrgao") || undefined,
      endereco: formData.get("endereco"),
      cidade: formData.get("cidade"),
      uf: formData.get("uf"),
      cep: formData.get("cep") || undefined,
      multaRescisao: formData.get("multaRescisao"),
      kmSemanalMax: formData.get("kmSemanalMax"),
      valorKmExtra: formData.get("valorKmExtra"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    await prisma.configuracaoLocadora.upsert({
      where: { locadoraId: tenant.locadoraId },
      create: {
        id: tenant.locadoraId,
        locadoraId: tenant.locadoraId,
        ...parsed.data,
      },
      update: parsed.data,
    });

    revalidatePath("/clientes/contratos");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao salvar"),
    };
  }
}

export async function regenerarContratoLocacao(
  locacaoId: string
): Promise<ActionResult<{ numero: string }>> {
  try {
    const tenant = await assertContratoAccess();
    const locacao = await prisma.locacao.findFirst({
      where: { id: locacaoId, locadoraId: tenant.locadoraId },
      select: { id: true },
    });
    if (!locacao) {
      return { success: false, error: "Locação não encontrada" };
    }
    const { numero } = await provisionarContratoLocacao(locacaoId);
    revalidatePath(`/locacoes/${locacaoId}`);
    revalidatePath("/clientes/contratos");
    return { success: true, data: { numero } };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao gerar contrato"),
    };
  }
}

export async function getDadosContratoParaPdf(locacaoId: string) {
  const { locadoraId } = await requireTenant();
  const contrato = await prisma.contratoLocacao.findFirst({
    where: { locacaoId, locadoraId },
  });
  if (contrato?.dadosSnapshot) {
    return contrato.dadosSnapshot as object;
  }
  const locacao = await prisma.locacao.findFirst({
    where: { id: locacaoId, locadoraId },
    select: { numeroContrato: true },
  });
  const numero = locacao?.numeroContrato ?? "RASCUNHO";
  return montarDadosContrato(locacaoId, numero);
}
