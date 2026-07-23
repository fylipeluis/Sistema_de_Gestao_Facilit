import { useEffect, useState } from "react";
import { type AtivarClientePayload } from "../../../api/clienteApi";
import type { ClienteDetalhes, ClienteUpdatePayload } from "../../../types/cliente";

import "./ModalEditarClientes.css";

interface Props {
  cliente: ClienteDetalhes | null;
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
  });

  const [formFatura, setFormFatura] = useState<AtivarClientePayload>({
    valor_emprestimo: 0,
    qtd_parcelas: 0,
    inicio_cobranca: "",
    taxa_juros: undefined,
  });

  const [carregando, setCarregando] = useState(false);

  const valorTotal = (() => {
    const { valor_emprestimo, qtd_parcelas, taxa_juros } = formFatura;
    if (!valor_emprestimo || !qtd_parcelas) return 0;
    if (!taxa_juros) return valor_emprestimo;
    return valor_emprestimo * (1 + (taxa_juros / 100) * qtd_parcelas);
  })();

  const valorParcela =
    formFatura.qtd_parcelas > 0 ? valorTotal / formFatura.qtd_parcelas : 0;

  useEffect(() => {
    if (cliente) setFormBasico(cliente);
  }, [cliente]);

  useEffect(() => {
    if (!cliente) return;

    // Reseta o formFatura ao trocar de cliente, para PENDENTE e INATIVO
    if (cliente.status_cliente === "PENDENTE" || cliente.status_cliente === "INATIVO") {
      setFormFatura({
        valor_emprestimo: 0,
        qtd_parcelas: 0,
        inicio_cobranca: "",
        taxa_juros: undefined,
      });
    }
  }, [cliente]);

  if (!cliente) return null;

  const isPendente = cliente.status_cliente === "PENDENTE";
  const isInativo = cliente.status_cliente === "INATIVO";
  const podeAtivarComFatura = isPendente || isInativo;

  async function handleSalvar() {
    try {
      setCarregando(true);
      if (!cliente) return;

      if (podeAtivarComFatura) {
        await onAtivar(cliente.id_cliente, formFatura);
      } else {
        await onSalvar(cliente.id_cliente, formBasico);
      }

      onFechar();
    } catch {
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
        name === "inicio_cobranca"
          ? value
          : value === ""
            ? undefined
            : Number(value),
    });
  }

  return (
    <div className="modal" style={{ display: "flex" }}>
      <div className="modal-content">
        <span className="fechar" onClick={onFechar}>
          ×
        </span>

        <div className="client-form-container">
          <h2>{podeAtivarComFatura ? "Novo Contrato" : "Dados do Cliente"}</h2>
          <p style={{ color: "#666", fontSize: "0.9em", marginBottom: "15px" }}>
            Status: <strong>{cliente.status_cliente}</strong>
          </p>

          <div className="client-form">
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

            {podeAtivarComFatura && (
              <>
                <div className="form-group">
                  <label>Valor Emprestado (R$)</label>
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
                  <label>Taxa de Juros — opcional</label>
                  <input
                    name="taxa_juros"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formFatura.taxa_juros ?? ""}
                    onChange={handleChangeFatura}
                    placeholder="Ex: 5 para 5% ao mês"
                  />
                </div>

                {formFatura.valor_emprestimo > 0 &&
                  formFatura.qtd_parcelas > 0 && (
                    <div className="form-resumo">
                      <div className="resumo-linha">
                        <span>Valor total com juros:</span>
                        <strong>R$ {valorTotal.toFixed(2)}</strong>
                      </div>

                      <div className="resumo-linha">
                        <span>Valor por parcela:</span>
                        <strong>R$ {valorParcela.toFixed(2)}</strong>
                      </div>
                    </div>
                  )}

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
            {podeAtivarComFatura && (
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