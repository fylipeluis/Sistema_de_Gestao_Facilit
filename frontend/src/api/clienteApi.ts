import type { Cliente, ClienteUpdatePayload } from "../types/cliente";

const BASE_URL = `${import.meta.env.VITE_API_URL ?? "https://facilitsolucoesfinanceiras1-production.up.railway.app"}/api/clientes`;

export async function fetchClientes(): Promise<Cliente[]> {
  const response = await fetch(`${BASE_URL}/`);
  if (!response.ok)
    throw new Error("Erro na requisição: " + response.statusText);
  return response.json();
}

export async function putCliente(
  id: number,
  dados: ClienteUpdatePayload
): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!response.ok) throw new Error("Erro ao atualizar cliente");
}

export async function deleteCliente(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Erro ao excluir cliente");
}

export interface AtivarClientePayload {
  valor_emprestimo: number;
  qtd_parcelas: number;
  inicio_cobranca: string;
  taxa_juros?: number;
}

export async function ativarClienteComFatura(
  id: number,
  dados: AtivarClientePayload
): Promise<{ id_fatura: number }> {
  const response = await fetch(`${BASE_URL}/${id}/ativar-com-fatura`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!response.ok) throw new Error("Erro ao ativar cliente com fatura");
  return response.json();
}

export interface ClienteDetalhe {
  id_cliente: number;
  nome_completo: string;
  documento: string;
  telefone: string;
  status_cliente: "ATIVO" | "INATIVO" | "PENDENTE";
}

export async function fetchClienteDetalhe(id: number): Promise<ClienteDetalhe> {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) throw new Error("Erro ao buscar detalhes do cliente");
  return response.json();
}