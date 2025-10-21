import { create } from "zustand";
import api, { setToken, uploadFile } from "../lib/api";

type Role = "ADMIN" | "FUNCIONARIO";
export type User = {
  id?: string;
  name: string;
  email?: string;
  role?: Role;
  photo?: string | null;
  ativo?: boolean;
};

type AuthState = {
  isAuthenticated: boolean;
  user?: User;
  login: (
    email: string,
    password: string,
    asAdmin?: boolean
  ) => Promise<{ ok: boolean; reason?: string }>;
  logout: () => void;
  setUserPhoto?: (url?: string | null) => void;
  updateMyPhoto?: (payload: { file?: File; url?: string | null }) => Promise<void>;
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
  updateAdminPassword: (payload: {
    senhaAtual: string;
    novaSenha: string;
    confirmacao: string;
  }) => Promise<void>;
  updateFuncionarioPassword: (
    id: string,
    payload: { novaSenha: string; confirmacao: string }
  ) => Promise<User>;
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
      const token: string | undefined = data?.token;
      const user = data?.user;

      if (!token || !user) return { ok: false, reason: "no-token" };

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

  async updateMyPhoto({ file, url }) {
    let finalUrl = url ?? null;
    if (file) {
      finalUrl = await uploadFile(file, "usuarios");
    }
    await api.put("/auth/me/foto", { foto_url: finalUrl });
    set((state) => {
      const user = state.user ? { ...state.user, photo: finalUrl } : undefined;
      if (user) localStorage.setItem("auth_user", JSON.stringify(user));
      return { user } as any;
    });
  },

  async registerFuncionario(payload) {
    const { data } = await api.post("/auth/funcionario/register", payload);
    return data?.usuario as User;
  },

  async registerAdminOpenOrAsAdmin(payload) {
    const { data } = await api.post("/auth/admin/register", payload);
    return data?.usuario as User;
  },

  async updateAdminPassword({ senhaAtual, novaSenha, confirmacao }) {
    await api.put("/auth/admin/password", {
      senha_atual: senhaAtual,
      nova_senha: novaSenha,
      nova_senha_confirmation: confirmacao,
    });
  },

  async updateFuncionarioPassword(id, { novaSenha, confirmacao }) {
    const { data } = await api.put(`/auth/funcionarios/${id}/password`, {
      nova_senha: novaSenha,
      nova_senha_confirmation: confirmacao,
    });
    return data?.usuario as User;
  },
}));
