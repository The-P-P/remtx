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
import {
  createEventoAgenda,
  updateEventoAgenda,
} from "@/lib/actions/eventos-agenda";
import {
  createTransacao,
  updateTransacao,
  deleteTransacao,
  duplicateTransacao,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "@/lib/actions/financeiro";
import { financeiroQuery } from "@/lib/financeiro-periodo";
import { failFormState } from "@/lib/form/state";
import type { FormState } from "@/types/form";

type FailResult = {
  success: false;
  error: string;
  fieldErrors?: Record<string, string>;
};

function fail(
  formData: FormData,
  result: FailResult | { success: true },
  fallback: string
): FormState {
  if (result.success) {
    return failFormState(fallback, formData);
  }
  return failFormState(result.error, formData, result.fieldErrors);
}

export async function submitNovoVeiculo(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createVeiculo(formData);
  if (result.success && result.data) {
    redirect(`/veiculos/${result.data.id}`);
  }
  return fail(formData, result as FailResult, "Erro ao cadastrar");
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
  return fail(formData, result as FailResult, "Erro ao salvar");
}

export async function submitProblemaCronico(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createProblemaCronico(formData);
  if (result.success) return { success: true };
  return fail(formData, result as FailResult, "Erro");
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
  return fail(formData, result as FailResult, "Erro ao registrar");
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
  return fail(formData, result as FailResult, "Erro ao salvar");
}

export async function submitNovoTipoManutencao(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createTipoManutencao(formData);
  if (result.success) {
    redirect("/manutencoes/tipos");
  }
  return fail(formData, result as FailResult, "Erro ao criar tipo");
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
  return fail(formData, result as FailResult, "Erro ao atualizar tipo");
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
  return fail(formData, result as FailResult, "Erro ao cadastrar");
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
  return fail(formData, result as FailResult, "Erro ao salvar");
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
  return fail(formData, result as FailResult, "Erro ao criar locação");
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
  return fail(formData, result as FailResult, "Erro ao salvar");
}

export async function submitNovoEventoAgenda(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const eventoId = formData.get("eventoId");
  const result =
    typeof eventoId === "string" && eventoId.length > 0
      ? await updateEventoAgenda(eventoId, formData)
      : await createEventoAgenda(formData);

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
  return fail(formData, result as FailResult, "Erro ao salvar tarefa");
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
  return fail(formData, result as FailResult, "Erro ao criar parcela");
}

function redirectFinanceiro(formData: FormData) {
  const ano = Number(formData.get("redirectAno")) || new Date().getFullYear();
  const mes = Number(formData.get("redirectMes")) || new Date().getMonth() + 1;
  redirect(financeiroQuery(ano, mes));
}

export async function submitNovaTransacao(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createTransacao(formData);
  if (result.success) {
    redirectFinanceiro(formData);
  }
  return fail(formData, result as FailResult, "Erro ao criar lançamento");
}

export async function submitEditarTransacao(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await updateTransacao(id, formData);
  if (result.success) {
    redirectFinanceiro(formData);
  }
  return fail(formData, result as FailResult, "Erro ao salvar lançamento");
}

export async function deleteTransacaoAction(
  id: string,
  ano: number,
  mes: number
) {
  const result = await deleteTransacao(id);
  if (result.success) {
    redirect(financeiroQuery(ano, mes));
  }
  throw new Error(!result.success ? result.error : "Erro ao excluir");
}

export async function duplicateTransacaoAction(
  id: string,
  ano: number,
  mes: number
) {
  const result = await duplicateTransacao(id);
  if (result.success) {
    redirect(financeiroQuery(ano, mes));
  }
  throw new Error(!result.success ? result.error : "Erro ao duplicar");
}

export async function submitNovaCategoria(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createCategoria(formData);
  if (result.success) {
    redirect("/financeiro/categorias");
  }
  return fail(formData, result as FailResult, "Erro ao criar categoria");
}

export async function submitEditarCategoria(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await updateCategoria(id, formData);
  if (result.success) {
    redirect("/financeiro/categorias");
  }
  return fail(formData, result as FailResult, "Erro ao salvar categoria");
}

export async function deleteCategoriaAction(id: string) {
  const result = await deleteCategoria(id);
  if (result.success) {
    redirect("/financeiro/categorias");
  }
  throw new Error(!result.success ? result.error : "Erro ao excluir");
}
