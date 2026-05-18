export function getStatusClass(status?: string): string {
  const statusLower = (status || "").toUpperCase();
  if (statusLower === "ATIVO") return "status-ativo";
  if (statusLower === "INATIVO") return "status-inativo";
  if (statusLower === "PAGO") return "status-pago";
  if (statusLower === "ADIANTADO") return "status-adiantado";
  if (statusLower === "ATRASADO") return "status-atrasado";
  if (statusLower === "PENDENTE") return "status-pendente";
  return "status-pendente";
}

export function getStatusTexto(status?: string): string {
  const statusLower = (status || "").toUpperCase();
  if (statusLower === "PAGO") return "Pago";
  if (statusLower === "ADIANTADO") return "Adiantado";
  if (statusLower === "ATRASADO") return "Atrasado";
  if (statusLower === "PENDENTE") return "Pendente";
  return "Pendente";
}
