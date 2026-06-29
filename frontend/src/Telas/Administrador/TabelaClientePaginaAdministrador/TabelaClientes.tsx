import { useState } from "react";
import { useClientes } from "../../../hooks/useClientes";
import { LinhaCliente } from "./LinhaCliente";
import { ModalEditarCliente } from "./ModalEditarClientes";
import { ModalContratos } from "./ModalContratos";
import type { Cliente } from "../../../types/cliente";
import "./TabelaClientes.css";

export default function TabelaClientes() {
  const { clientes, loading, erro, excluir, atualizar, ativar } = useClientes();
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [clienteContratos, setClienteContratos] = useState<number | null>(null);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const clientesFiltrados = ordenarClientes(
    filtrarClientes(clientes, termoPesquisa),
  );

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div className="clientes-wrapper">
      <div className="clientes-header">
        <div className="clientes-title-section">
          <h2 className="clientes-title">Clientes</h2>
          <p className="clientes-description">
            Gerencie todos os clientes da operação.
          </p>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por cliente ou ID..."
            className="search-input"
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((cliente) => (
              <LinhaCliente
                key={cliente.id_cliente}
                cliente={cliente}
                onExcluir={excluir}
                onEditar={() => setClienteEditando(cliente)}
                onVerContratos={() => setClienteContratos(cliente.id_cliente)}
              />
            ))}
          </tbody>
        </table>

        <ModalEditarCliente
          cliente={clienteEditando}
          onSalvar={atualizar}
          onAtivar={ativar}
          onFechar={() => setClienteEditando(null)}
        />

        <ModalContratos
          clienteId={clienteContratos}
          onFechar={() => setClienteContratos(null)}
        />
      </div>
    </div>
  );
}

function filtrarClientes(clientes: Cliente[], termo: string): Cliente[] {
  if (!termo) return clientes;
  return clientes.filter((cliente) =>
    cliente.nome_completo.toLowerCase().includes(termo.toLowerCase()),
  );
}

function ordenarClientes(clientes: Cliente[]): Cliente[] {
  const ordem: Record<string, number> = {
    PENDENTE: 0,
    ATIVO: 1,
    INATIVO: 2,
  };

  return [...clientes].sort((a, b) => {
    const ordemA = ordem[a.status_cliente] ?? 1;
    const ordemB = ordem[b.status_cliente] ?? 1;
    return ordemA - ordemB;
  });
}
