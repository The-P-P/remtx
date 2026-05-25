"use server";

import { redirect } from "next/navigation";
import {
  createVeiculo,
  updateVeiculo,
  deleteVeiculo,
  createProblemaCronico,
} from "@/lib/actions/veiculos";
import {
  createManutencao,
  updateManutencao,
  deleteManutencao,
  createTipoManutencao,
  updateTipoManutencao,
  deleteTipoManutencao,
} from "@/lib/actions/manutencoes";
import {
  createCliente,
  updateCliente,
  deleteCliente,
} from "@/lib/actions/clientes";
import {
  createLocacao,
  updateLocacao,
  createParcela,
} from "@/lib/actions/locacoes";
import { createEventoAgenda } from "@/lib/actions/eventos-agenda";
import type { FormState } from "@/types/form";

export async function submitNovoVeiculo(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createVeiculo(formData);
  if (result.success && result.data) {
    redirect(`/veiculos/${result.data.id}`);
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao cadastrar",
  };
}

export async function submitEditarVeiculo(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await updateVeiculo(id, formData);
  if (result.success) {
    redirect(`/veiculos/${id}`);
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao salvar",
  };
}

export async function submitProblemaCronico(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createProblemaCronico(formData);
  if (result.success) return { success: true };
  return {
    success: false,
    error: !result.success ? result.error : "Erro",
  };
}

export async function submitNovaManutencao(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createManutencao(formData);
  if (result.success) {
    const veiculoId = formData.get("veiculoId");
    if (typeof veiculoId === "string" && veiculoId) {
      redirect(`/veiculos/${veiculoId}`);
    }
    redirect("/manutencoes");
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao registrar",
  };
}

export async function deleteVeiculoAction(id: string) {
  const result = await deleteVeiculo(id);
  if (result.success) {
    redirect("/veiculos");
  }
  throw new Error(!result.success ? result.error : "Erro ao excluir");
}

export async function deleteManutencaoAction(id: string) {
  const result = await deleteManutencao(id);
  if (result.success) {
    redirect("/manutencoes");
  }
  throw new Error(!result.success ? result.error : "Erro ao excluir");
}

export async function submitEditarManutencao(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await updateManutencao(id, formData);
  if (result.success) {
    redirect("/manutencoes");
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao salvar",
  };
}

export async function submitNovoTipoManutencao(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createTipoManutencao(formData);
  if (result.success) {
    redirect("/manutencoes/tipos");
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao criar tipo",
  };
}

export async function submitEditarTipoManutencao(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await updateTipoManutencao(id, formData);
  if (result.success) {
    redirect("/manutencoes/tipos");
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao atualizar tipo",
  };
}

export async function deleteTipoManutencaoAction(id: string) {
  const result = await deleteTipoManutencao(id);
  if (result.success) {
    redirect("/manutencoes/tipos");
  }
  throw new Error(!result.success ? result.error : "Erro ao excluir");
}

export async function submitNovoCliente(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createCliente(formData);
  if (result.success && result.data) {
    redirect(`/clientes/${result.data.id}`);
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao cadastrar",
  };
}

export async function submitEditarCliente(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await updateCliente(id, formData);
  if (result.success) {
    redirect(`/clientes/${id}`);
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao salvar",
  };
}

export async function deleteClienteAction(id: string) {
  const result = await deleteCliente(id);
  if (result.success) {
    redirect("/clientes");
  }
  throw new Error(!result.success ? result.error : "Erro ao excluir");
}

export async function submitNovaLocacao(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createLocacao(formData);
  if (result.success && result.data) {
    const retornoCliente = formData.get("retornoCliente") === "sim";
    const clienteId = formData.get("clienteId");
    if (retornoCliente && typeof clienteId === "string" && clienteId) {
      redirect(`/clientes/${clienteId}`);
    }
    redirect(`/locacoes/${result.data.id}`);
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao criar locação",
  };
}

export async function submitEditarLocacao(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await updateLocacao(id, formData);
  if (result.success) {
    redirect(`/locacoes/${id}`);
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao salvar",
  };
}

export async function submitNovoEventoAgenda(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createEventoAgenda(formData);
  if (result.success) {
    if (formData.get("semRedirect") === "sim") {
      return { success: true };
    }
    const ano = formData.get("redirectAno");
    const mes = formData.get("redirectMes");
    const dia = formData.get("redirectDia");
    if (ano && mes && dia) {
      redirect(`/locacoes?ano=${ano}&mes=${mes}&dia=${dia}`);
    }
    redirect("/locacoes");
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao criar tarefa",
  };
}

export async function submitNovaParcela(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const locacaoId = formData.get("locacaoId");
  const result = await createParcela(formData);
  if (result.success && typeof locacaoId === "string") {
    redirect(`/locacoes/${locacaoId}`);
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao criar parcela",
  };
}
