import { useState } from "react";

interface ModalPagamentoProps {
  parcelaId: number | null;
  valor: number;
  onFechar: () => void;
}

export function ModalPagamento({
  parcelaId,
  valor,
  onFechar,
}: ModalPagamentoProps) {
  const [metodoPagamento, setMetodoPagamento] = useState<
    "pix" | "boleto" | "credito"
  >("pix");

  function handlePagarAgora() {
    alert(
      `Pagamento de R$ ${valor.toFixed(2)} via ${metodoPagamento.toUpperCase()} será processado em breve.`,
    );
    onFechar();
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-pagamento" onClick={(e) => e.stopPropagation()}>
        <button className="modal-fechar" onClick={onFechar}>
          ×
        </button>

        <h2>Confirmar Pagamento</h2>
        <p className="modal-desc">Parcela #{parcelaId}</p>

        <div className="valor-display">
          <span className="valor-label">Valor a Pagar:</span>
          <span className="valor-grande">R$ {valor.toFixed(2)}</span>
        </div>

        <div className="metodos-pagamento">
          <label className="metodo-item">
            <input
              type="radio"
              name="metodo"
              value="pix"
              checked={metodoPagamento === "pix"}
              onChange={(e) => setMetodoPagamento(e.target.value as "pix")}
            />
            <span className="metodo-label">
              <strong>PIX</strong>
              <small>Instantâneo e seguro</small>
            </span>
          </label>

          <label className="metodo-item">
            <input
              type="radio"
              name="metodo"
              value="boleto"
              checked={metodoPagamento === "boleto"}
              onChange={(e) => setMetodoPagamento(e.target.value as "boleto")}
            />
            <span className="metodo-label">
              <strong>Boleto</strong>
              <small>Prazo de até 2 dias</small>
            </span>
          </label>

          <label className="metodo-item">
            <input
              type="radio"
              name="metodo"
              value="credito"
              checked={metodoPagamento === "credito"}
              onChange={(e) => setMetodoPagamento(e.target.value as "credito")}
            />
            <span className="metodo-label">
              <strong>Cartão de Crédito</strong>
              <small>Em até 12 parcelas</small>
            </span>
          </label>
        </div>

        <div className="modal-buttons">
          <button className="btn-pagar-agora" onClick={handlePagarAgora}>
            Pagar Agora
          </button>
          <button className="btn-cancelar-modal" onClick={onFechar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
