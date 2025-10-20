import { create } from "zustand";
import api, { setToken } from "../lib/api";

type Role = "ADMIN" | "FUNCIONARIO";
type User = { id?: string; name: string; email?: string; role?: Role };

type AuthState = {
  isAuthenticated: boolean;
  user?: User;
  login: (
    email: string,
    password: string,
    asAdmin?: boolean
  ) => Promise<{ ok: boolean; reason?: string }>;
  logout: () => void;
  registerFuncionario: (payload: {
    nome: string;
    email: string;
    senha: string;
    foto?: string;
    ativo?: boolean;
  }) => Promise<User>;
  registerAdminOpenOrAsAdmin: (payload: {
    nome: string;
    email: string;
    senha: string;
    foto?: string;
    ativo?: boolean;
  }) => Promise<User>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem("auth_token"),
  user: localStorage.getItem("auth_user")
    ? JSON.parse(localStorage.getItem("auth_user") as string)
    : undefined,

  async login(email: string, password: string, asAdmin: boolean = false) {
    try {
      const url = asAdmin ? "/auth/admin/login" : "/auth/funcionario/login";
      const { data } = await api.post(url, { email, senha: password });
      const token: string = data?.token;
      const user = data?.user;

      if (!token) return { ok: false, reason: "no-token" };

      setToken(token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      set({ isAuthenticated: true, user });
      return { ok: true };
    } catch (e: any) {
      setToken(undefined);
      localStorage.removeItem("auth_user");
      set({ isAuthenticated: false, user: undefined });

      if (!e?.response) return { ok: false, reason: "network" };
      if (e.response.status === 401)
        return { ok: false, reason: "credentials" };
      return { ok: false, reason: `http-${e.response.status}` };
    }
  },

  logout() {
    setToken(undefined);
    localStorage.removeItem("auth_user");
    set({ isAuthenticated: false, user: undefined });
  },

  async registerFuncionario(payload) {
    const { data } = await api.post("/auth/funcionario/register", payload);
    return data?.usuario as User;
  },

  async registerAdminOpenOrAsAdmin(payload) {
    const { data } = await api.post("/auth/admin/register", payload);
    return data?.usuario as User;
  },
}));
