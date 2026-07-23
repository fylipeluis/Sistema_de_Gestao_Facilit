// Dados exibidos na tabela de clientes
export interface Cliente {
  id_cliente: number;
  nome_completo: string;
  status_cliente: "ATIVO" | "INATIVO" | "PENDENTE";
  valor_emprestado: number;
  valor_em_aberto: number;
  parcelas_em_aberto: number;
}


export interface ClienteDetalhes {
  id_cliente: number;
  nome_completo: string;
  documento: string;
  telefone: string;
  status_cliente: "ATIVO" | "INATIVO" | "PENDENTE";
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