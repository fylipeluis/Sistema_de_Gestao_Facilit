import { useState, useEffect } from "react";
import type { Fatura, Cobranca, ResultadoPagamento } from "../../../types/fatura";
import { fetchContratosPorCliente, marcarParcelaPaga } from "../../../api/faturaApi";
import "./ModalContratos.css";

interface Props {
  clienteId: number | null;
  nomeCliente?: string;
  onFechar: () => void;
  onClienteInativado?: () => void; // callback para atualizar lista quando cliente for inativado
}

export function ModalContratos({ clienteId, nomeCliente, onFechar, onClienteInativado }: Props) {
  const [contratos, setContratos] = useState<Fatura[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pagando, setPagando] = useState<number | null>(null); // id_cobranca sendo pago

  useEffect(() => {
    if (clienteId) carregarContratos();
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
      case "PAGO":      return "status-parcela pago";
      case "ATRASADO":  return "status-parcela atrasado";
      case "CANCELADO": return "status-parcela cancelado";
      default:          return "status-parcela pendente";
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
    <div className="modal-contratos">
      <div className="modal-content-contratos">
        <div className="modal-header-contratos">
          <h2>Contratos{nomeCliente ? ` — ${nomeCliente}` : ""}</h2>
          <span className="fechar-contratos" onClick={onFechar}>✕</span>
        </div>

        {carregando && <p className="carregando">Carregando contratos...</p>}
        {erro && <p className="erro">{erro}</p>}
        {!carregando && contratos.length === 0 && (
          <p className="sem-contratos">Nenhum contrato encontrado.</p>
        )}

        {!carregando &&
          contratos.map((contrato) => (
            <div key={contrato.id_fatura} className="contrato-card">
              <div className="contrato-header">
                <h3>Contrato #{contrato.id_fatura}</h3>
                <div className="contrato-info">
                  <span><strong>Valor Total:</strong> R$ {contrato.valor_emprestimo.toFixed(2)}</span>
                  <span><strong>Parcelas:</strong> {contrato.qtd_parcelas}</span>
                  <span><strong>Início:</strong> {formatarData(contrato.inicio_cobranca)}</span>
                </div>
              </div>

              <div className="parcelas-container">
                <table className="tabela-parcelas">
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
                              className="btn-pagar"
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