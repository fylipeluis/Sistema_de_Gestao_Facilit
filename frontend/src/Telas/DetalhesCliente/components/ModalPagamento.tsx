import { useState, useEffect } from "react";
import { gerarPix } from "../../../api/pixApi";

interface ModalPagamentoProps {
  parcelaId: number | null;
  valor: number;
  onFechar: () => void;
}

export function ModalPagamento({ parcelaId, valor, onFechar }: ModalPagamentoProps) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (parcelaId) gerarPixParaParcela();
  }, [parcelaId]);

  async function gerarPixParaParcela() {
    try {
      setCarregando(true);
      setErro(null);
      const resultado = await gerarPix(parcelaId!);
      setPixCode(resultado.pix_code);
      if (resultado.qr_code_base64) setQrCodeBase64(resultado.qr_code_base64);
    } catch (err: any) {
      setErro(err.message || "Erro ao gerar o código Pix. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleCopiar() {
    if (!pixCode) return;
    await navigator.clipboard.writeText(pixCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-pagamento" onClick={(e) => e.stopPropagation()}>
        <button className="modal-fechar" onClick={onFechar}>×</button>

        <h2>Pagar com Pix</h2>
        <p className="modal-desc">Parcela #{parcelaId}</p>

        <div className="valor-display">
          <span className="valor-label">Valor a Pagar:</span>
          <span className="valor-grande">R$ {valor.toFixed(2)}</span>
        </div>

        {carregando && (
          <p className="pix-status">Gerando seu código Pix...</p>
        )}

        {erro && (
          <div className="pix-erro">
            <p>{erro}</p>
            <button className="btn-tentar-novamente" onClick={gerarPixParaParcela}>
              Tentar novamente
            </button>
          </div>
        )}

        {!carregando && !erro && pixCode && (
          <>
            {qrCodeBase64 && (
              <div className="qrcode-container">
                <img
                  src={`data:image/png;base64,${qrCodeBase64}`}
                  alt="QR Code Pix"
                  className="qrcode-imagem"
                />
              </div>
            )}

            <div className="pix-copia-cola">
              <label>Ou copie o código Pix:</label>
              <div className="pix-code-box">
                <input type="text" readOnly value={pixCode} />
                <button className="btn-copiar" onClick={handleCopiar}>
                  {copiado ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>

            <p className="pix-instrucao">
              Abra o app do seu banco, escolha pagar com Pix e cole o código acima.
              O pagamento é confirmado automaticamente.
            </p>
          </>
        )}

        <div className="modal-buttons">
          <button className="btn-cancelar-modal" onClick={onFechar}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}