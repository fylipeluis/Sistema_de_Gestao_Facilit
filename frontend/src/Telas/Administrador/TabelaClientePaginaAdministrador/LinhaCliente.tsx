import { useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";
import { getStatusClass } from "../../../services/clienteService";
import type { Cliente } from "../../../types/cliente";
import "./BotoesDeAcoes.css";
import "./LinhaCliente.css";

interface Props {
  cliente: Cliente;
  onExcluir: (id: number) => Promise<void>;
  onEditar: () => void;
  onVerContratos: () => void;
}

export function LinhaCliente({
  cliente,
  onExcluir,
  onEditar,
  onVerContratos,
}: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAtivo = cliente.status_cliente === "ATIVO";
  const IsPendente = cliente.status_cliente === "PENDENTE";
  const IsInativo = cliente.status_cliente === "INATIVO";

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  async function handleExcluir() {
    try {
      setExcluindo(true);
      await onExcluir(cliente.id_cliente);
    } catch {
      alert("Erro ao excluir cliente");
    } finally {
      setExcluindo(false);
      setConfirmando(false);
    }
  }

  return (
    <tr>
      <td>{cliente.nome_completo}</td>
      <td>{cliente.documento}</td>
      <td>{cliente.telefone}</td>

      <td>
        <span className={getStatusClass(cliente.status_cliente)}>
          {cliente.status_cliente}
        </span>
      </td>

      <td className="btn-actions">
        {confirmando ? (
          <>
            <span>Confirmar?</span>
            <button
              className="btn-confirmar-delete"
              onClick={handleExcluir}
              disabled={excluindo}
            >
              {excluindo ? "Excluindo..." : "Sim"}
            </button>
            <button
              className="btn-cancelar-delete"
              onClick={() => setConfirmando(false)}
            >
              Cancelar
            </button>
          </>
        ) : (
          <div className="acoes-cell">
            {IsPendente || IsInativo ? (
              <button className="btn-edit" onClick={onEditar}>
                Novo Contrato
              </button>
            ) : null}

            {isAtivo && (
              <button className="btn-contract" onClick={onVerContratos}>
                <FileText size={16} />
                Contrato
              </button>
            )}

            <div className="menu-acoes" ref={menuRef}>
              <button
                className="btn-kebab"
                onClick={() => setMenuAberto((v) => !v)}
                aria-label="Mais ações"
              >
                ⋮
              </button>

              {menuAberto && (
                <div className="dropdown-menu">
                  <button
                    className="dropdown-item dropdown-item-danger"
                    onClick={() => {
                      setConfirmando(true);
                      setMenuAberto(false);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}