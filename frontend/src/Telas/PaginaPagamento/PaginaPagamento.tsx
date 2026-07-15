import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Copy, CheckCircle2, QrCode } from "lucide-react";
import { gerarPix } from "../../api/pixApi";
import "./PaginaPagamento.css";

export function PaginaPagamento() {
  const { idCobranca } = useParams<{ idCobranca: string }>();

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (idCobranca) gerarPixParaParcela();
  }, [idCobranca]);

  async function gerarPixParaParcela() {
    try {
      setCarregando(true);
      setErro(null);

      const resultado = await gerarPix(Number(idCobranca));

      setPixCode(resultado.pix_code);

      if (resultado.qr_code_base64) {
        setQrCodeBase64(resultado.qr_code_base64);
      }
    } catch (err: any) {
      setErro(err.message || "Erro ao gerar o Pix.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleCopiar() {
    if (!pixCode) return;

    await navigator.clipboard.writeText(pixCode);

    setCopiado(true);

    setTimeout(() => {
      setCopiado(false);
    }, 2000);
  }

  if (!idCobranca) {
    return (
      <div className="pagina-pagamento pagina-pagamento--erro">
        Link inválido.
      </div>
    );
  }

  return (
    <div className="pagina-pagamento">

      <section className="painel-esquerdo">

        <div className="logo">
          FACILIT
        </div>

        <div className="qr-area">

          {carregando ? (

            <div className="loading">
              Gerando QR Code...
            </div>

          ) : qrCodeBase64 ? (

            <img
              src={`data:image/png;base64,${qrCodeBase64}`}
              alt="QR Code Pix"
              className="qrcode-imagem"
            />

          ) : (

            <div className="placeholder-qr">
              <QrCode size={90} />
              <span>QR Code</span>
            </div>

          )}

        </div>

        <p className="texto-qr">
          Escaneie o QR Code utilizando
          o aplicativo do seu banco.
        </p>

      </section>

      <section className="painel-direito">

        <div className="conteudo">

          <span className="tag-status">
            <CheckCircle2 size={18} />
            Pagamento via Pix
          </span>

          <h1>Parcela #{idCobranca}</h1>

          <p className="descricao">
            Utilize o QR Code ao lado ou copie
            o código Pix abaixo.
          </p>

          {erro && (

            <div className="erro-box">

              <p>{erro}</p>

              <button onClick={gerarPixParaParcela}>
                Tentar novamente
              </button>

            </div>

          )}

          {!carregando && !erro && pixCode && (

            <>
              <label>Código Pix</label>

              <div className="codigo-pix">

                <input
                  value={pixCode}
                  readOnly
                />

                <button
                  onClick={handleCopiar}
                >
                  <Copy size={18} />

                  {copiado ? "Copiado!" : "Copiar"}
                </button>

              </div>

              <div className="aviso">

                <strong>Pagamento automático</strong>

                <p>
                  Assim que o Pix for identificado,
                  a parcela será confirmada automaticamente.
                </p>

              </div>

            </>

          )}

        </div>

      </section>

    </div>
  );
}