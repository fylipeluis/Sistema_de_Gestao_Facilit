import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, ArrowRight } from "lucide-react";
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
      setErro("Preencha usuário e senha.");
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
    <main className="login-page login-page--admin">
      <div className="login-backdrop" aria-hidden="true" />

      <section className="login-card">
        <span className="hazard-stripe" aria-hidden="true" />
        <span className="card-corner card-corner--br" aria-hidden="true" />

        <div className="login-mark">
          <div className="mark-icon">
            <Lock size={22} />
          </div>

          <div>
            <span className="mark-title">FACILIT</span>
            <span className="mark-sub">Painel Administrativo</span>
          </div>
        </div>

        <div className="badge-login">
          <ShieldCheck size={16} />
          Acesso Restrito
        </div>

        <h2>Login administrativo</h2>

        <p className="descricao-login">
          Insira suas credenciais para continuar.
        </p>

        {erro && <div className="erro-mensagem">{erro}</div>}

        <div className="input-group">
          <label htmlFor="usuario">Usuário</label>
          <input
            type="text"
            id="usuario"
            placeholder="admin"
            value={usuario}
            onChange={(e) => {
              setUsuario(e.target.value);
              setErro("");
            }}
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
            onChange={(e) => {
              setSenha(e.target.value);
              setErro("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleLogin}
          disabled={carregando}
        >
          {carregando ? "Entrando..." : "Entrar"}
          {!carregando && <ArrowRight size={18} />}
        </button>

        <footer className="footer">
          Seus dados são protegidos e criptografados.
        </footer>
      </section>
    </main>
  );
}