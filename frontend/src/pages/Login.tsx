import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

export default function Login() {
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
      const result = await login(email, senha);

      if (!result.ok) {
        switch (result.reason) {
          case "credentials":
            throw new Error("Email ou senha inválidos.");
          case "network":
            throw new Error("Falha de rede. Tente novamente.");
          case "no-token":
            throw new Error("Resposta inválida da API.");
          default:
            throw new Error("Não foi possível entrar. Tente novamente.");
        }
      }
      nav("/dashboard");
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
            placeholder="seuemail@exemplo.com"
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
            className="login-btn admin"
            type="button"
            onClick={() => nav("/admin")}
            title="Acesso do administrador"
          >
            Acesso do administrador
          </button>
        </div>
      </div>
    </div>
  );
}
