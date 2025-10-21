import { useEffect, useState } from "react";
import api from "../lib/api";

type Produto = { id: string; nome: string };
type Devolucao = { id: string; produto_id: string; quantidade: number; data_hora: string; motivo?: string };

export default function Devolucoes() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [list, setList] = useState<Devolucao[]>([]);
  const [form, setForm] = useState({ produto_id: "", quantidade: 1, motivo: "" });
  const [err, setErr] = useState<string | null>(null);

  async function fetchAll() {
    const [p, d] = await Promise.all([api.get("/produtos"), api.get("/devolucoes")]);
    setProdutos((p.data?.data ?? p.data ?? []).map((r: any) => ({ id: r.id, nome: r.nome })));
    setList(d.data?.data ?? d.data ?? []);
  }

  useEffect(() => { fetchAll(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setErr(null);
    try {
      await api.post("/devolucoes", {
        produto_id: form.produto_id,
        quantidade: Number(form.quantidade),
        motivo: form.motivo || undefined,
      });
      setForm({ produto_id: "", quantidade: 1, motivo: "" });
      await fetchAll();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Erro ao registrar devolução");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Devoluções</h1>
        <p className="text-sm text-[#5b7a6b]">Registre devoluções e reponha o estoque automaticamente.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-[#cfe2d7] bg-white/80 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium">Produto
            <select required value={form.produto_id} onChange={(e)=>setForm({...form, produto_id:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5">
              <option value="">Selecione...</option>
              {produtos.map((p)=> <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">Quantidade
            <input type="number" min={1} value={form.quantidade}
              onChange={(e)=>setForm({...form, quantidade:Number(e.target.value)})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Motivo
            <input value={form.motivo} onChange={(e)=>setForm({...form, motivo:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
        </div>
        {err && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}
        <div className="flex justify-end">
          <button className="rounded-full bg-[#2f4d3f] px-6 py-2 text-sm font-semibold text-white">Registrar</button>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recentes</h2>
        <ul className="divide-y divide-[#e0eee6] rounded-2xl border border-[#cfe2d7] bg-white/70">
          {list.map((d)=> (
            <li key={d.id} className="flex items-center justify-between px-4 py-3">
              <div className="text-sm">
                <p className="font-medium">{d.produto_id}</p>
                <p className="text-xs text-[#567666]">{new Date(d.data_hora).toLocaleString()}</p>
              </div>
              <div className="text-sm">Qtd: <strong>{d.quantidade}</strong></div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

