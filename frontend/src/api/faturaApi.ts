import type { Fatura } from "../types/fatura";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/faturas`;

export async function fetchContratosPorCliente(
  idCliente: number
): Promise<Fatura[]> {
  const response = await fetch(`${BASE_URL}/cliente/${idCliente}`);

  if (!response.ok)
    throw new Error("Erro ao buscar contratos: " + response.statusText);

  return response.json();
}

export async function marcarParcelaPaga(
  idCobranca: number
): Promise<{ status: string; mensagem: string; cliente_inativado: boolean }> {
  const response = await fetch(`${BASE_URL}/parcelas/${idCobranca}/pagar`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.detail || "Erro ao marcar parcela como paga");
  }

  return response.json();
}