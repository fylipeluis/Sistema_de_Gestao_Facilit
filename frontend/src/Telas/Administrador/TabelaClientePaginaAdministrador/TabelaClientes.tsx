import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useClientes } from "../../../hooks/useClientes";
import { LinhaCliente } from "./LinhaCliente";
import { ModalEditarCliente } from "./ModalEditarClientes";
import { ModalContratos } from "./ModalContratos";
import type { Cliente } from "../../../types/cliente";
import "./TabelaClientes.css";

const OPCOES_POR_PAGINA = [10, 20, 50];

function getPaginas(atual: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (atual <= 3) return [1, 2, 3, "...", total];
  if (atual >= total - 2) return [1, "...", total - 2, total - 1, total];
  return [1, "...", atual, "...", total];
}

export default function TabelaClientes() {
  const { clientes, loading, erro, excluir, atualizar, ativar } = useClientes();
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [clienteContratos, setClienteContratos] = useState<number | null>(null);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  const clientesFiltrados = ordenarClientes(
    filtrarClientes(clientes, termoPesquisa),
  );

  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);

  const clientesDaPagina = clientesFiltrados.slice(
    (paginaAtual - 1) * porPagina,
    paginaAtual * porPagina,
  );

  const inicio = clientesFiltrados.length === 0 ? 0 : (paginaAtual - 1) * porPagina + 1;
  const fim = Math.min(paginaAtual * porPagina, clientesFiltrados.length);

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
            onChange={(e) => {
              setTermoPesquisa(e.target.value);
              setPagina(1);
            }}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="table-container">
        <div className="table-scroll">
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
              {clientesDaPagina.map((cliente) => (
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
        </div>

        <div className="clientes-footer">
          <span className="clientes-contagem">
            Mostrando {inicio} a {fim} de {clientesFiltrados.length} clientes
          </span>

          <div className="clientes-paginacao">
            <button
              type="button"
              className="btn-pagina-icon"
              disabled={paginaAtual === 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>

            {getPaginas(paginaAtual, totalPaginas).map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="pagina-reticencias">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`btn-pagina${p === paginaAtual ? " btn-pagina-ativa" : ""}`}
                  onClick={() => setPagina(p)}
                >
                  {p}
                </button>
              ),
            )}

            <button
              type="button"
              className="btn-pagina-icon"
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <select
            className="select-por-pagina"
            value={porPagina}
            onChange={(e) => {
              setPorPagina(Number(e.target.value));
              setPagina(1);
            }}
          >
            {OPCOES_POR_PAGINA.map((n) => (
              <option key={n} value={n}>
                {n} por página
              </option>
            ))}
          </select>
        </div>

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