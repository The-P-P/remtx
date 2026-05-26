"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasPermission } from "@/lib/auth";
import { clienteSchema } from "@/lib/validations/cliente";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function assertClienteAccess() {
  const user = await requireAuth();
  if (!hasPermission(user.role, "clientes")) {
    throw new Error("Sem permissão para gerenciar clientes");
  }
  return user;
}

export async function getClientes(busca?: string) {
  const termo = busca?.trim();
  return prisma.cliente.findMany({
    where: termo
      ? {
          OR: [
            { nome: { contains: termo, mode: "insensitive" } },
            { cpf: { contains: termo.replace(/\D/g, "") } },
            { telefone: { contains: termo } },
          ],
        }
      : undefined,
    orderBy: { nome: "asc" },
    include: {
      _count: { select: { locacoes: true } },
    },
  });
}

export async function getClientesParaSelect() {
  return prisma.cliente.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, cpf: true, telefone: true },
  });
}

export async function getClienteById(id: string) {
  return prisma.cliente.findUnique({
    where: { id },
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
    await assertClienteAccess();
    const parsed = clienteSchema.safeParse({
      nome: formData.get("nome"),
      cpf: formData.get("cpf"),
      telefone: formData.get("telefone"),
      email: formData.get("email") || undefined,
      endereco: formData.get("endereco") || undefined,
      observacoes: formData.get("observacoes") || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    const cliente = await prisma.cliente.create({ data: parsed.data });
    revalidatePath("/clientes");
    revalidatePath("/locacoes");
    return { success: true, data: { id: cliente.id } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar cliente";
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
    await assertClienteAccess();
    const parsed = clienteSchema.safeParse({
      nome: formData.get("nome"),
      cpf: formData.get("cpf"),
      telefone: formData.get("telefone"),
      email: formData.get("email") || undefined,
      endereco: formData.get("endereco") || undefined,
      observacoes: formData.get("observacoes") || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    await prisma.cliente.update({ where: { id }, data: parsed.data });
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    revalidatePath("/locacoes");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao atualizar cliente";
    if (msg.includes("Unique constraint")) {
      return { success: false, error: "CPF já cadastrado" };
    }
    return { success: false, error: msg };
  }
}

export async function deleteCliente(id: string): Promise<ActionResult> {
  try {
    await assertClienteAccess();

    const locacoesAtivas = await prisma.locacao.count({
      where: {
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

    const totalLocacoes = await prisma.locacao.count({ where: { clienteId: id } });
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
      error: e instanceof Error ? e.message : "Erro ao excluir cliente",
    };
  }
}
