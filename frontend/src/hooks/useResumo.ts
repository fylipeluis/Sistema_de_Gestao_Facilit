import { useState, useEffect } from "react";
import { fetchResumo, type ResumoFaturas } from "../api/resumoApi";

export function useResumo() {
  const [resumo, setResumo] = useState<ResumoFaturas>({
    total_emprestado: 0,
    valor_em_aberto: 0,
    cobrancas_hoje: 0,
  });

  useEffect(() => {
    fetchResumo()
      .then(setResumo)
      .catch((err) => console.error("Erro ao buscar resumo:", err));
  }, []);

  return { resumo };
}