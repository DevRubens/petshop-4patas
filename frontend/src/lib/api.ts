import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8088/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.defaults.headers.common['Accept'] = 'application/json';

function getToken() {
  return localStorage.getItem('auth_token');
}

export function setToken(token?: string) {
  if (!token) { localStorage.removeItem('auth_token'); return; }
  localStorage.setItem('auth_token', token);
}

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

if (import.meta.env.DEV) {
  console.log('[API] baseURL =', baseURL);
}

export default api;
