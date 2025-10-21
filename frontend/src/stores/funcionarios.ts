import { create } from "zustand";
import api from "../lib/api";

export type Funcionario = {
  id: string;
  name: string;
  email?: string;
  photo?: string | null;
  ativo: boolean;
  created?: string | null;
};

type FuncionariosState = {
  funcionarios: Funcionario[];
  loading: boolean;
  fetchFuncionarios: () => Promise<Funcionario[]>;
  upsertFuncionario: (funcionario: Funcionario) => void;
  setFuncionarios: (lista: Funcionario[]) => void;
};

export const useFuncionariosStore = create<FuncionariosState>((set) => ({
  funcionarios: [],
  loading: false,

  async fetchFuncionarios() {
    set({ loading: true });
    try {
      const { data } = await api.get("/auth/funcionarios");
      const lista: Funcionario[] = (data?.funcionarios ?? []).map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        photo: item.photo ?? null,
        ativo: Boolean(item.ativo ?? true),
        created: item.created ?? null,
      }));
      set({ funcionarios: lista, loading: false });
      return lista;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  upsertFuncionario(funcionario) {
    set((state) => {
      const exists = state.funcionarios.some((f) => f.id === funcionario.id);
      if (exists) {
        return {
          funcionarios: state.funcionarios.map((f) =>
            f.id === funcionario.id ? { ...f, ...funcionario } : f
          ),
        };
      }
      return { funcionarios: [funcionario, ...state.funcionarios] };
    });
  },

  setFuncionarios(lista) {
    set({ funcionarios: lista });
  },
}));
