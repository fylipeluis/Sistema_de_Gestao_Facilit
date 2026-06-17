import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaginaDeLogin.css";

export function PaginaDeLogin() {
  const [documento, setDocumento] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  function handleAcessar() {
    setErro("");

    if (!documento.trim()) {
      setErro("Por favor, preencha o documento");
      return;
    }

    localStorage.setItem("cpfCliente", documento);
    navigate("/cliente");
  }

  return (
    <div className="login-page">
      <div className="box-pagina-de-login">
        <h1>Acessar plataforma</h1>
        <p>Selecione o tipo de acesso para continuar.</p>

        {erro && <div className="erro-mensagem">{erro}</div>}

        <div className="input-group">
          <label htmlFor="documento">CPF ou CNPJ</label>
          <input
            type="text"
            id="documento"
            placeholder="000.000.000-00 / 00.000.000/0000-00"
            value={documento}
            onChange={(e) => { setDocumento(e.target.value); setErro(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleAcessar()}
          />
        </div>

        <button className="btn-primary" onClick={handleAcessar}>
          Entrar
        </button>

        <div className="footer">Seus dados são protegidos 🔒</div>
      </div>
    </div>
  );
}