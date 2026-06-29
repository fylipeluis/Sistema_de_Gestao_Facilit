const BASE_URL = `${import.meta.env.VITE_API_URL}/api/faturas`;

export interface PixGerado {
  status: string;
  pix_code: string;
  qr_code_base64?: string;
  reaproveitado: boolean;
}

export async function gerarPix(idCobranca: number): Promise<PixGerado> {
  const response = await fetch(`${BASE_URL}/parcelas/${idCobranca}/gerar-pix`, {
    method: "POST",
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.detail || "Erro ao gerar Pix");
  }

  return response.json();
}