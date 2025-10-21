import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8088/api";

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.defaults.headers.common["Accept"] = "application/json";

function getToken() {
  return localStorage.getItem("auth_token");
}

export function setToken(token?: string) {
  if (!token) {
    localStorage.removeItem("auth_token");
    delete api.defaults.headers.common.Authorization;
    return;
  }

  localStorage.setItem("auth_token", token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

const initialToken = getToken();
if (initialToken) {
  api.defaults.headers.common.Authorization = `Bearer ${initialToken}`;
}

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    if (err?.response?.status === 401) {
      setToken(undefined);
      try {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      } catch {}
    }
    return Promise.reject(err);
  }
);

if (import.meta.env.DEV) {
  console.log("[API] baseURL =", baseURL);
}

export default api;

export async function uploadFile(file: File, folder?: string): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  if (folder) form.append("folder", folder);
  const { data } = await api.post("/uploads", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data?.url as string;
}
