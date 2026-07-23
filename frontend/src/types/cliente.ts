// Dados exibidos na tabela de clientes
export interface Cliente {
  id_cliente: number;
  nome_completo: string;
  status_cliente: StatusCliente;

  valor_emprestado: number;
  valor_em_aberto: number;
  parcelas_em_aberto: number;
}

// Dados completos de um cliente
// Utilizado em telas de detalhes e no modal de contratos
export interface ClienteDetalhes extends Cliente {
  nome_completo: string;
  documento: string;
  telefone: string;
}

// Dados enviados ao editar um cliente
export interface ClienteUpdatePayload {
  nome_completo: string;
  documento: string;
  telefone: string;
}

// Dados enviados ao criar um cliente
export interface ClienteCreatePayload {
  nome_completo: string;
  documento: string;
  telefone: string;
}

// Tipo compartilhado para evitar repetição
export type StatusCliente =
  | "ATIVO"
  | "INATIVO"
  | "PENDENTE";