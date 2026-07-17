import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, Building2 } from "lucide-react";
import "./PaginaDeLogin.css";

function formatarDocumento(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 14);

  if (digitos.length <= 11) {
    // CPF: 000.000.000-00
    return digitos
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  // CNPJ: 00.000.000/0000-00
  return digitos
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function PaginaDeLogin() {
  const [documento, setDocumento] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  function handleAcessar() {
    setErro("");

    if (!documento.trim()) {
      setErro("Por favor, preencha o documento.");
      return;
    }

    localStorage.setItem("cpfCliente", documento);
    navigate("/cliente");
  }

  return (
    <main className="login-page">
      {/* Fundo: grade sutil + marca d'água */}
      <div className="login-backdrop" aria-hidden="true" />

      <section className="login-card">
        <span className="card-corner card-corner--tl" aria-hidden="true" />
        <span className="card-corner card-corner--br" aria-hidden="true" />

        <div className="login-mark">
          <div className="mark-icon">
            <Building2 size={24} />
          </div>

          <div>
            <span className="mark-title">FACILITY</span>
            <span className="mark-sub">Gestão Financeira</span>
          </div>
        </div>

        <div className="badge-login">
          <ShieldCheck size={16} />
          Ambiente Seguro
        </div>

        <h2>Acessar plataforma</h2>

        <p className="descricao-login">
          Informe seu CPF ou CNPJ para consultar seus contratos.
        </p>

        {erro && <div className="erro-mensagem">{erro}</div>}

        <div className="input-group">
          <label htmlFor="documento">CPF ou CNPJ</label>

          <input
            type="text"
            id="documento"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={documento}
            onChange={(e) => {
              setDocumento(formatarDocumento(e.target.value));
              setErro("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAcessar()}
          />
        </div>

        <button className="btn-primary" onClick={handleAcessar}>
          Entrar
          <ArrowRight size={18} />
        </button>

        <footer className="footer">
          Seus dados são protegidos e criptografados.
        </footer>
      </section>
    </main>
  );
}