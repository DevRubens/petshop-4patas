import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

function getToken() {
  return localStorage.getItem('auth_token');
}

export function setToken(token?: string) {
  if (!token) {
    localStorage.removeItem('auth_token');
    return;
  }
  localStorage.setItem('auth_token', token);
}

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

export default api;
