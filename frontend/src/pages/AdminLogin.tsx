import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const result = await login(email, senha, true);

      if (!result.ok) {
        switch (result.reason) {
          case "credentials":
            throw new Error("Email ou senha inválidos.");
          case "network":
            throw new Error("Falha de rede. Tente novamente.");
          case "no-token":
            throw new Error("Resposta inválida da API.");
          case "http-403":
            throw new Error("Acesso negado.");
          default:
            throw new Error("Não foi possível entrar. Tente novamente.");
        }
      }

      nav("/admin/dashboard");
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
