import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuthStore } from "../stores/auth";

type Cliente = {
  id: string;
  nome: string;
  telefone?: string | null;
  endereco?: string | null;
  referencia?: string | null;
  especial?: boolean;
};

export default function Clientes() {
  const [list, setList] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    referencia: "",
    especial: false,
  });
  const [busca, setBusca] = useState("");

  async function fetchClientes(q?: string) {
    setLoading(true);
    try {
      const { data } = await api.get("/clientes", { params: q ? { s: q } : undefined });
      setList(data?.data ?? data ?? []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Falha ao carregar clientes";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClientes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const payload = {
        nome: form.nome,
        telefone: form.telefone || undefined,
        endereco: form.endereco || undefined,
        referencia: form.referencia || undefined,
        especial: Boolean(form.especial),
      };
      await api.post("/clientes", payload);
      setForm({ nome: "", telefone: "", endereco: "", referencia: "", especial: false });
      await fetchClientes();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Erro ao cadastrar cliente");
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Cadastrar novo cliente</h1>
        <p className="text-sm text-[#5b7a6b]">Registre clientes para facilitar vendas a prazo e histórico.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <input
          placeholder="Buscar clientes por nome, telefone ou endereço..."
          value={busca}
          onChange={(e)=>{ setBusca(e.target.value); fetchClientes(e.target.value); }}
          className="flex-1 rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"
        />
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-[#cfe2d7] bg-white/80 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Nome
            <input className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5" required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </label>
          <label className="text-sm font-medium">
            Telefone
            <input className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
          </label>
          <label className="text-sm font-medium">
            Endereço
            <input className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"
              value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
            />
          </label>
          <label className="text-sm font-medium">
            Referência
            <input className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"
              value={form.referencia}
              onChange={(e) => setForm({ ...form, referencia: e.target.value })}
            />
          </label>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.especial} onChange={(e) => setForm({ ...form, especial: e.target.checked })} />
          Cliente especial (fiado)
        </label>

        {err && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}

        <div className="flex justify-end">
          <button className="rounded-full bg-[#2f4d3f] px-6 py-2 text-sm font-semibold text-white">Cadastrar</button>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Clientes</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <ul className="divide-y divide-[#e0eee6] rounded-2xl border border-[#cfe2d7] bg-white/70">
            {list.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium break-words">{c.nome}</p>
                  <p className="text-xs text-[#567666] break-words">{c.telefone || "-"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.especial && (
                    <span className="rounded-full bg-[#daf0e2] px-3 py-1 text-xs font-semibold text-[#2f4d3f]">Especial</span>
                  )}
                  {user?.role === "ADMIN" && (
                    <button
                      className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white"
                      onClick={async ()=>{
                        if (!confirm(`Excluir cliente ${c.nome}?`)) return;
                        await api.delete(`/clientes/${c.id}`);
                        await fetchClientes(busca);
                      }}
                    >Excluir</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
