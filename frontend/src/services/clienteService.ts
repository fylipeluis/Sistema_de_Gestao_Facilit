import type { Cliente } from "../types/cliente";

export function filtrarClientes(
  clientes: Cliente[],
  termo: string
): Cliente[] {
  const t = termo.trim().toLowerCase();

  if (!t) return clientes;

  return clientes.filter(({ nome_completo }) =>
    nome_completo.toLowerCase().includes(t)
  );
}

export function getStatusClass(
  status: Cliente["status_cliente"]
): string {
  const map: Record<Cliente["status_cliente"], string> = {
    ATIVO: "status-ativo",
    INATIVO: "status-inativo",
    PENDENTE: "status-pendente",
  };

  return map[status];
}