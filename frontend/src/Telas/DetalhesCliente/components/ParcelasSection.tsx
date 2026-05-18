import type { Fatura } from "../../../types/fatura";
import { getStatusClass, getStatusTexto } from "../utils/statusUtils";

interface ParcelasSectionProps {
  faturas: Fatura[];
  onPagar: (id_parcela: number) => void;
}

export function ParcelasSection({ faturas, onPagar }: ParcelasSectionProps) {
  if (faturas.length === 0) {
    return (
      <section className="parcelas-section">
        <div className="section-header">
          <h2>Minhas Parcelas</h2>
          <p className="section-desc">Acompanhe o status de cada parcela</p>
        </div>
        <div className="sem-parcelas">
          <p>
            Você ainda não possui parcelas. Quando forem cadastradas aparecerão
            aqui.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="parcelas-section">
      <div className="section-header">
        <h2>Minhas Parcelas</h2>
        <p className="section-desc">Acompanhe o status de cada parcela</p>
      </div>

      <div className="parcelas-container">
        {faturas.map((fatura) => (
          <div key={fatura.id_fatura} className="fatura-bloco">
            <div className="fatura-header">
              <h3>Contrato #{fatura.id_fatura}</h3>
              <p className="fatura-info">
                Valor: <strong>R$ {fatura.valor_emprestimo.toFixed(2)}</strong>{" "}
                | Parcelas: <strong>{fatura.qtd_parcelas}x</strong>
              </p>
            </div>

            <div className="tabela-parcelas">
              <table>
                <thead>
                  <tr>
                    <th>Parcela</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {fatura.parcelas.map((parcela) => (
                    <tr key={parcela.id_cobranca}>
                      <td className="parcela-numero">
                        #{parcela.numero_parcela}
                      </td>
                      <td className="parcela-valor">
                        R$ {parcela.valor_cobranca.toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(parcela.status_cobranca)}`}
                        >
                          {getStatusTexto(parcela.status_cobranca)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-pagar"
                          onClick={() => onPagar(parcela.id_cobranca)}
                          disabled={
                            (parcela.status_cobranca || "").toUpperCase() ===
                            "PAGO"
                          }
                        >
                          {(parcela.status_cobranca || "").toUpperCase() ===
                          "PAGO"
                            ? "Pago"
                            : "Pagar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
