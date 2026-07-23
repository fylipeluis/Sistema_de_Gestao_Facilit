import { useState, useEffect } from "react";
import type { Fatura, Cobranca, ResultadoPagamento } from "../../../types/fatura";
import { fetchContratosPorCliente, marcarParcelaPaga } from "../../../api/faturaApi";
import { fetchClienteDetalhe, type ClienteDetalhe } from "../../../api/clienteApi";
import "./ModalContratos.css";

interface Props {
  clienteId: number | null;
  nomeCliente?: string;
  onFechar: () => void;
  onClienteInativado?: () => void; // callback para atualizar lista quando cliente for inativado
}

export function ModalContratos({ clienteId, nomeCliente, onFechar, onClienteInativado }: Props) {
  const [contratos, setContratos] = useState<Fatura[]>([]);
  const [detalheCliente, setDetalheCliente] = useState<ClienteDetalhe | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pagando, setPagando] = useState<number | null>(null); // id_cobranca sendo pago

  useEffect(() => {
    if (clienteId) {
      carregarContratos();
      carregarDetalheCliente();
    }
  }, [clienteId]);

  async function carregarContratos() {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await fetchContratosPorCliente(clienteId!);
      setContratos(dados);
    } catch {
      setErro("Erro ao carregar contratos");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarDetalheCliente() {
    try {
      const dados = await fetchClienteDetalhe(clienteId!);
      setDetalheCliente(dados);
    } catch {
      // Não bloqueia a exibição dos contratos se isso falhar --
      // CPF/telefone são informação complementar, não essencial pra tela funcionar.
      setDetalheCliente(null);
    }
  }

  async function handlePagar(idCobranca: number) {
    try {
      setPagando(idCobranca);
      const resultado = await marcarParcelaPaga(idCobranca) as ResultadoPagamento;

      // Se o cliente foi inativado, avisa o componente pai
      if (resultado?.cliente_inativado) {
        onClienteInativado?.();
        onFechar();
        return;
      }

      // Recarrega os contratos para refletir o novo status
      await carregarContratos();
    } catch (err: any) {
      alert(err.message || "Erro ao marcar parcela como paga");
    } finally {
      setPagando(null);
    }
  }

  function getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case "PAGO":      return "contratos-modal__status contratos-modal__status--pago";
      case "ATRASADO":  return "contratos-modal__status contratos-modal__status--atrasado";
      case "CANCELADO": return "contratos-modal__status contratos-modal__status--cancelado";
      default:          return "contratos-modal__status contratos-modal__status--pendente";
    }
  }

  function formatarData(data: string | null): string {
    if (!data) return "—";
    return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }

  function ordenarParcelas(parcelas: Cobranca[]) {
    const ordem: Record<string, number> = {
      ATRASADO: 0,
      PENDENTE: 1,
      PAGO: 2,
      CANCELADO: 3,
    };
    return [...parcelas].sort((a, b) => {
      const diff = (ordem[a.status?.toUpperCase()] ?? 1) - (ordem[b.status?.toUpperCase()] ?? 1);
      return diff !== 0 ? diff : a.numero_parcela - b.numero_parcela;
    });
  }

  if (!clienteId) return null;

  return (
    <div className="contratos-modal-overlay">
      <div className="contratos-modal">
        <div className="contratos-modal__header">
          <h2>Contratos{nomeCliente ? ` — ${nomeCliente}` : ""}</h2>
          <span className="contratos-modal__fechar" onClick={onFechar}>✕</span>
        </div>

        {detalheCliente && (
          <div className="contratos-modal__dados-cliente">
            <span><strong>CPF:</strong> {detalheCliente.documento}</span>
            <span><strong>Telefone:</strong> {detalheCliente.telefone}</span>
          </div>
        )}

        {carregando && <p className="contratos-modal__estado">Carregando contratos...</p>}
        {erro && <p className="contratos-modal__erro">{erro}</p>}
        {!carregando && contratos.length === 0 && (
          <p className="contratos-modal__vazio">Nenhum contrato encontrado.</p>
        )}

        {!carregando &&
          contratos.map((contrato) => (
            <div key={contrato.id_fatura} className="contratos-modal__card">
              <div className="contratos-modal__card-header">
                <h3>Contrato #{contrato.id_fatura}</h3>
                <div className="contratos-modal__card-info">
                  <span><strong>Valor Total:</strong> R$ {contrato.valor_emprestimo.toFixed(2)}</span>
                  <span><strong>Parcelas:</strong> {contrato.qtd_parcelas}</span>
                  <span><strong>Início:</strong> {formatarData(contrato.inicio_cobranca)}</span>
                </div>
              </div>

              <div className="contratos-modal__tabela-wrap">
                <table className="contratos-modal__tabela">
                  <thead>
                    <tr>
                      <th>Parcela</th>
                      <th>Vencimento</th>
                      <th>Valor</th>
                      <th>Último Envio</th>
                      <th>Status</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenarParcelas(contrato.parcelas).map((parcela) => (
                      <tr key={parcela.id_cobranca}>
                        <td>#{parcela.numero_parcela}</td>
                        <td>{formatarData(parcela.data_vencimento)}</td>
                        <td>R$ {parcela.valor_cobranca.toFixed(2)}</td>
                        <td>{formatarData(parcela.ultima_mensagem)}</td>
                        <td>
                          <span className={getStatusClass(parcela.status)}>
                            {parcela.status || "PENDENTE"}
                          </span>
                        </td>
                        <td>
                          {parcela.status?.toUpperCase() !== "PAGO" &&
                          parcela.status?.toUpperCase() !== "CANCELADO" && (
                            <button
                              className="contratos-modal__btn-pagar"
                              onClick={() => handlePagar(parcela.id_cobranca)}
                              disabled={pagando === parcela.id_cobranca}
                            >
                              {pagando === parcela.id_cobranca ? "..." : "Pago"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}