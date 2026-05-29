import { useEffect, useState } from "react";
import {
  type AtivarClientePayload
} from "../../../api/clienteApi";
import type { Cliente, ClienteUpdatePayload } from "../../../types/cliente";
import "./ModalEditarClientes.css";

interface Props {
  cliente: Cliente | null;
  onSalvar: (id: number, dados: ClienteUpdatePayload) => Promise<void>;
  onAtivar: (id: number, dados: AtivarClientePayload) => Promise<void>;
  onFechar: () => void;
}

export function ModalEditarCliente({
  cliente,
  onSalvar,
  onAtivar,
  onFechar,
}: Props) {
  const [formBasico, setFormBasico] = useState<ClienteUpdatePayload>({
    nome_completo: "",
    documento: "",
    telefone: "",
    status_cliente: "PENDENTE",
  });

  const [formFatura, setFormFatura] = useState<AtivarClientePayload>({
    valor_emprestimo: 0,
    qtd_parcelas: 0,
    inicio_cobranca: "",
  });

  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (cliente) setFormBasico(cliente);
  }, [cliente]);

  if (!cliente) return null;

  const isPendente = cliente.status_cliente === "PENDENTE";

  async function handleSalvar() {
    try {
      setCarregando(true);
      if (!cliente) return;

      if (isPendente) {
        // Cliente PENDENTE: ativa com fatura
        await onAtivar(cliente.id_cliente, formFatura);
      } else {
        // Cliente ATIVO/INATIVO: apenas atualiza dados básicos
        await onSalvar(cliente.id_cliente, formBasico);
      }

      onFechar();
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
      alert("Erro ao salvar as informações");
    } finally {
      setCarregando(false);
    }
  }

  function handleChangeBasico(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setFormBasico({ ...formBasico, [e.target.name]: e.target.value });
  }

  function handleChangeFatura(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormFatura({
      ...formFatura,
      [name]:
        name === "valor_emprestimo" || name === "qtd_parcelas"
          ? Number(value)
          : value,
    });
  }

  return (
    <div className="modal" style={{ display: "flex" }}>
      <div className="modal-content">
        <span className="fechar" onClick={onFechar}>
          ×
        </span>

        <div className="client-form-container">
          <h2>{isPendente ? "Ativar Cliente" : "Dados do Cliente"}</h2>
          <p style={{ color: "#666", fontSize: "0.9em", marginBottom: "15px" }}>
            Status: <strong>{cliente.status_cliente}</strong>
          </p>

          <div className="client-form">
            {/* Dados Básicos */}
            <div className="form-group">
              <label>Nome</label>
              <input
                name="nome_completo"
                type="text"
                value={formBasico.nome_completo}
                onChange={handleChangeBasico}
              />
            </div>

            <div className="form-group">
              <label>CPF</label>
              <input
                name="documento"
                type="text"
                value={formBasico.documento}
                onChange={handleChangeBasico}
              />
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input
                name="telefone"
                type="text"
                value={formBasico.telefone}
                onChange={handleChangeBasico}
              />
            </div>

            {/* Dados de Fatura (apenas se PENDENTE) */}
            {isPendente && (
              <>
                <div className="form-group">
                  <label>Valor Emprestado</label>
                  <input
                    name="valor_emprestimo"
                    type="number"
                    step="0.01"
                    value={formFatura.valor_emprestimo || ""}
                    onChange={handleChangeFatura}
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Qtd. Parcelas</label>
                  <input
                    name="qtd_parcelas"
                    type="number"
                    min="1"
                    value={formFatura.qtd_parcelas || ""}
                    onChange={handleChangeFatura}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Data Início de Cobrança</label>
                  <input
                    name="inicio_cobranca"
                    type="date"
                    value={formFatura.inicio_cobranca}
                    onChange={handleChangeFatura}
                  />
                </div>
              </>
            )}
          </div>

          <div className="form-buttons">
            {isPendente && (
              <button
                className="btn-save"
                onClick={handleSalvar}
                disabled={
                  carregando ||
                  !formFatura.valor_emprestimo ||
                  !formFatura.qtd_parcelas ||
                  !formFatura.inicio_cobranca
                }
              >
                {carregando ? "Salvando..." : "Ativar Cliente"}
              </button>
            )}
            <button
              className="btn-cancel"
              onClick={onFechar}
              disabled={carregando}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
