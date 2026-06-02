"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/auth";
import { requireTenant } from "@/lib/tenant";
import { clienteSchema } from "@/lib/validations/cliente";

import { zodFieldErrors } from "@/lib/form/state";
import type { ActionResult } from "@/lib/actions/action-result";
import { friendlyErrorMessage } from "@/lib/errors/friendly-message";

async function assertClienteAccess() {
  const tenant = await requireTenant();
  if (!hasPermission(tenant.role, "clientes")) {
    throw new Error("Sem permissão para gerenciar clientes");
  }
  return tenant;
}

export async function getClientes(busca?: string) {
  const { locadoraId } = await requireTenant();
  const termo = busca?.trim();
  return prisma.cliente.findMany({
    where: {
      locadoraId,
      ...(termo
        ? {
            OR: [
              { nome: { contains: termo, mode: "insensitive" } },
              { cpf: { contains: termo.replace(/\D/g, "") } },
              { telefone: { contains: termo } },
            ],
          }
        : {}),
    },
    orderBy: { nome: "asc" },
    include: {
      _count: { select: { locacoes: true } },
    },
  });
}

export async function getClientesParaSelect() {
  const { locadoraId } = await requireTenant();
  return prisma.cliente.findMany({
    where: { locadoraId },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, cpf: true, telefone: true },
  });
}

export async function getClienteById(id: string) {
  const { locadoraId } = await requireTenant();
  return prisma.cliente.findFirst({
    where: { id, locadoraId },
    include: {
      locacoes: {
        orderBy: { dataInicio: "desc" },
        include: {
          veiculo: { select: { placa: true, marca: true, modelo: true } },
        },
      },
    },
  });
}

export async function createCliente(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const tenant = await assertClienteAccess();
    const parsed = clienteSchema.safeParse({
      nome: formData.get("nome"),
      cpf: formData.get("cpf"),
      telefone: formData.get("telefone"),
      email: formData.get("email") || undefined,
      endereco: formData.get("endereco") || undefined,
      rg: formData.get("rg") || undefined,
      rgOrgao: formData.get("rgOrgao") || undefined,
      observacoes: formData.get("observacoes") || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }

    const cliente = await prisma.cliente.create({
      data: { ...parsed.data, locadoraId: tenant.locadoraId },
    });
    revalidatePath("/clientes");
    revalidatePath("/locacoes");
    return { success: true, data: { id: cliente.id } };
  } catch (e) {
    const msg = friendlyErrorMessage(e, "Erro ao criar cliente");
    if (msg.includes("Unique constraint")) {
      return { success: false, error: "CPF já cadastrado" };
    }
    return { success: false, error: msg };
  }
}

export async function updateCliente(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const tenant = await assertClienteAccess();
    const parsed = clienteSchema.safeParse({
      nome: formData.get("nome"),
      cpf: formData.get("cpf"),
      telefone: formData.get("telefone"),
      email: formData.get("email") || undefined,
      endereco: formData.get("endereco") || undefined,
      rg: formData.get("rg") || undefined,
      rgOrgao: formData.get("rgOrgao") || undefined,
      observacoes: formData.get("observacoes") || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }

    const existente = await prisma.cliente.findFirst({
      where: { id, locadoraId: tenant.locadoraId },
      select: { id: true },
    });
    if (!existente) {
      return { success: false, error: "Cliente não encontrado" };
    }

    await prisma.cliente.update({ where: { id }, data: parsed.data });
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    revalidatePath("/locacoes");
    return { success: true };
  } catch (e) {
    const msg = friendlyErrorMessage(e, "Erro ao atualizar cliente");
    if (msg.includes("Unique constraint")) {
      return { success: false, error: "CPF já cadastrado" };
    }
    return { success: false, error: msg };
  }
}

export async function deleteCliente(id: string): Promise<ActionResult> {
  try {
    const tenant = await assertClienteAccess();

    const existente = await prisma.cliente.findFirst({
      where: { id, locadoraId: tenant.locadoraId },
      select: { id: true },
    });
    if (!existente) {
      return { success: false, error: "Cliente não encontrado" };
    }

    const locacoesAtivas = await prisma.locacao.count({
      where: {
        locadoraId: tenant.locadoraId,
        clienteId: id,
        status: { in: ["ATIVA", "RESERVADA"] },
      },
    });
    if (locacoesAtivas > 0) {
      return {
        success: false,
        error: "Cliente com locação ativa ou reservada não pode ser excluído",
      };
    }

    const totalLocacoes = await prisma.locacao.count({
      where: { locadoraId: tenant.locadoraId, clienteId: id },
    });
    if (totalLocacoes > 0) {
      return {
        success: false,
        error:
          "Cliente com histórico de locações não pode ser excluído. Mantenha o cadastro para consulta dos contratos.",
      };
    }

    await prisma.cliente.delete({ where: { id } });
    revalidatePath("/clientes");
    revalidatePath("/locacoes");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao excluir cliente"),
    };
  }
}
