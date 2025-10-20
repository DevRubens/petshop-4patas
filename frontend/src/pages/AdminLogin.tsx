import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      // TODO: integrar com sua API /admin/login
      if (!email || !senha) throw new Error("Preencha email e senha.");
      console.log("Login admin:", { email, senha });
      // nav("/admin/dashboard");
    } catch (err: any) {
      setErro(err?.message ?? "Falha ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <img
          src="/logo-4patas.png"
          alt="4 patas"
          className="login-logo"
          draggable={false}
        />

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">Email</label>
          <input
            className="login-input"
            type="email"
            placeholder="admin@4patas.local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />

          <label className="login-label">Senha</label>
          <input
            className="login-input"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            autoComplete="current-password"
          />

          {erro && <div className="login-error">{erro}</div>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="login-actions">
          <button
            className="login-btn ghost"
            type="button"
            onClick={() => nav("/")}
            title="Voltar ao login"
          >
            Voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
}
