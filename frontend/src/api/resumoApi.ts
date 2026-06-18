const BASE_URL = `${import.meta.env.VITE_API_URL}/api/faturas`;

export interface ResumoFaturas {
  total_emprestado: number;
  valor_em_aberto: number;
  cobrancas_hoje: number;
}

export async function fetchResumo(): Promise<ResumoFaturas> {
  const response = await fetch(`${BASE_URL}/resumo`);
  if (!response.ok) throw new Error("Erro ao buscar resumo");
  return response.json();
}