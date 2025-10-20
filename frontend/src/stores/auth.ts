import { create } from 'zustand';
import api, { setToken } from '../lib/api';

type User = { id?: number | string; name: string; email?: string };

type AuthState = {
  isAuthenticated: boolean;
  user?: User;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('auth_token'),
  user: localStorage.getItem('auth_user')
    ? JSON.parse(localStorage.getItem('auth_user') as string)
    : undefined,

  async login(email: string, password: string) {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token: string = data?.token;
      const user: User = data?.user ?? { name: email };

      if (!token) {
        return false;
      }

      setToken(token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ isAuthenticated: true, user });
      return true;
    } catch (err) {
      setToken(undefined);
      localStorage.removeItem('auth_user');
      set({ isAuthenticated: false, user: undefined });
      return false;
    }
  },

  logout() {
    setToken(undefined);
    localStorage.removeItem('auth_user');
    set({ isAuthenticated: false, user: undefined });
  },
}));
