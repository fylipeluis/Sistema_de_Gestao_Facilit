import { useState, useEffect } from "react";
import type { Fatura } from "../types/fatura";
import { fetchContratosPorCliente } from "../api/faturaApi";
import type { Cliente } from "../types/cliente";

export function useFaturas(clientes: Cliente[]) {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clientesAtivos = clientes.filter(
      (c) => c.status_cliente === "ATIVO"
    );

    if (clientesAtivos.length === 0) return;

    async function buscarFaturas() {
      try {
        setLoading(true);
        const resultados: Fatura[][] = await Promise.all(
          clientesAtivos.map((c) => fetchContratosPorCliente(c.id_cliente))
        );
        const todasFaturas: Fatura[] = resultados.flat();
        setFaturas(todasFaturas);
      } catch (err) {
        console.error("Erro ao buscar faturas:", err);
      } finally {
        setLoading(false);
      }
    }

    buscarFaturas();
  }, [clientes]);

  return { faturas, loading };
}