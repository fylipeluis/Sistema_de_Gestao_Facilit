export interface Cobranca {
  id_cobranca: number;
  numero_parcela: number;
  valor_cobranca: number;
  status: string;
  data_vencimento: string | null;
  ultima_mensagem: string | null;
}

export interface Fatura {
  id_fatura: number;
  id_cliente: number;
  valor_emprestimo: number;
  qtd_parcelas: number;
  inicio_cobranca: string;
  parcelas: Cobranca[];
}

export interface ResultadoPagamento {
  status: string;
  mensagem: string;
  cliente_inativado: boolean;
}