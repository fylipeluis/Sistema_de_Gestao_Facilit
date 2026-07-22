import { useState } from "react";
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

    const isAtivo = cliente.status_cliente === "ATIVO";
    const IsPendente = cliente.status_cliente === "PENDENTE";
    const IsInativo = cliente.status_cliente === "INATIVO";


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
          <>

          {IsPendente || IsInativo ? (
            <button className="btn-edit" onClick={onEditar}>
              Novo Contrato
            </button>
          ) : null}

            {isAtivo && (
              <button className="btn-contract" onClick={onVerContratos}>
                Contrato
              </button>
            )}
            
            <button className="btn-delete" onClick={() => setConfirmando(true)}>
              Excluir
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
