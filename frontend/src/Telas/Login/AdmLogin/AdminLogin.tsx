import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../../services/authService";
import "../PaginaDeLogin.css";
import "./AdminLogin.css";

export function AdminLogin() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  async function handleLogin() {
    setErro("");

    if (!usuario.trim() || !senha.trim()) {
      setErro("Preencha usuário e senha");
      return;
    }

    try {
      setCarregando(true);
      await loginAdmin(usuario, senha);
      navigate("/administrador");
    } catch (err: any) {
      setErro(err.message || "Erro ao fazer login");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="box-pagina-de-login">
        <div className="admin-login-badge">🔐 Área Administrativa</div>
        <h1>Acesso Restrito</h1>
        <p>Insira suas credenciais para continuar.</p>

        {erro && <div className="erro-mensagem">{erro}</div>}

        <div className="input-group">
          <label htmlFor="usuario">Usuário</label>
          <input
            type="text"
            id="usuario"
            placeholder="admin"
            value={usuario}
            onChange={(e) => { setUsuario(e.target.value); setErro(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <div className="input-group">
          <label htmlFor="senha">Senha</label>
          <input
            type="password"
            id="senha"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => { setSenha(e.target.value); setErro(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleLogin}
          disabled={carregando}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <div className="footer">Seus dados são protegidos 🔒</div>
      </div>
    </div>
  );
}