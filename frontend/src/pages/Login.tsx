import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuthStore } from "../stores/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [asAdmin, setAsAdmin] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await login(email.trim(), password, asAdmin);
    if (res.ok) {
      navigate("/");
    } else {
      if (res.reason === "network")
        setError("Falha de conexão com a API. Verifique a URL.");
      else if (res.reason === "credentials") setError("Credenciais inválidas.");
      else setError("Erro ao autenticar. (" + res.reason + ")");
    }
  }

  return (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center flex items-center justify-center">
      <div className="relative w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8 backdrop-blur-md">
        <div className="absolute top-4 right-4">
          <button onClick={() => setAsAdmin((v) => !v)}>
            {asAdmin ? "Acesso de funcionário" : "Acesso de admin"}
          </button>
        </div>
        <span>{asAdmin ? "Modo: Admin" : "Modo: Funcionário"}</span>

        <div className="flex items-center justify-center mb-6">
          <img
            src="/logo-4patas.png"
            alt="4 Patas"
            className="h-12 mr-2"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <h1 className="text-2xl font-semibold text-slate-800">
            Acesso ao Sistema
          </h1>
        </div>

        <div className="mb-4 text-center">
          <span className="inline-block text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {asAdmin ? "Modo: Admin" : "Modo: Funcionário"}
          </span>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>

        <div className="text-center mt-4">
          <img
            src="/Login.png"
            className="mx-auto rounded-xl shadow"
            alt="Login"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>
    </div>
  );
}
