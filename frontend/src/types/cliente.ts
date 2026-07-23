export interface Cliente {
  id_cliente: number;
  nome_completo: string;
  status_cliente: "ATIVO" | "INATIVO" | "PENDENTE";
  valor_emprestado: number;
  valor_em_aberto: number;
  parcelas_em_aberto: number;
}

export type ClienteUpdatePayload = {
  nome_completo: string;
  documento: string;
  telefone: string;
};