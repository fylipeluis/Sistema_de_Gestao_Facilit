import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Cliente } from "../../../types/cliente";
import type { Fatura } from "../../../types/fatura";
import { fetchClientes } from "../../../api/clienteApi";
import { fetchContratosPorCliente } from "../../../api/faturaApi";

export function useClienteData() {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const cpfSalvo = localStorage.getItem("cpfCliente");
    if (!cpfSalvo) {
      navigate("/login");
      return;
    }

    carregarDados(cpfSalvo);
  }, [navigate]);

  async function carregarDados(cpf: string) {
    try {
      setCarregando(true);
      setErro(null);

      const clientes = await fetchClientes();
      const clienteEncontrado = clientes.find((c) => c.documento === cpf);

      if (!clienteEncontrado) {
        setErro("Cliente não encontrado");
        return;
      }

      setCliente(clienteEncontrado);

      const faturasCliente = await fetchContratosPorCliente(
        clienteEncontrado.id_cliente,
      );
      setFaturas(faturasCliente);
    } catch (erro) {
      console.error("Erro ao carregar dados:", erro);
      setErro("Erro ao carregar os dados do cliente");
    } finally {
      setCarregando(false);
    }
  }

  return { cliente, faturas, carregando, erro };
}
