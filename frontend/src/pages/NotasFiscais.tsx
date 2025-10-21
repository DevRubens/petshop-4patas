import { useEffect, useState } from "react";
import api from "../lib/api";
import { formatBRL } from "../lib/format";

type Nota = {
  id: string;
  numero: string;
  serie?: string | null;
  total: number;
  data_emissao: string;
};

export default function NotasFiscais() {
  const [list, setList] = useState<Nota[]>([]);
  const [form, setForm] = useState({ numero: "", serie: "", chave_acesso: "", xml_url: "", total: "", data_emissao: "" });
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function fetchNotas() {
    const { data } = await api.get("/notas-fiscais");
    setList(data?.data ?? data ?? []);
  }

  useEffect(() => { fetchNotas(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setOk(false);
    try {
      const payload: any = {
        numero: form.numero,
        total: Number(form.total),
        data_emissao: form.data_emissao,
      };
      if (form.serie) payload.serie = form.serie;
      if (form.chave_acesso) payload.chave_acesso = form.chave_acesso;
      if (form.xml_url) payload.xml_url = form.xml_url;
      await api.post("/notas-fiscais", payload);
      setOk(true); setForm({ numero: "", serie: "", chave_acesso: "", xml_url: "", total: "", data_emissao: "" });
      await fetchNotas();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Erro ao salvar nota fiscal");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Notas fiscais</h1>
        <p className="text-sm text-[#5b7a6b]">Registre a identificação da NF-e para referência.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-[#cfe2d7] bg-white/80 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium">Número
            <input required value={form.numero} onChange={(e)=>setForm({...form, numero:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Série
            <input value={form.serie} onChange={(e)=>setForm({...form, serie:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Total
            <input required type="number" step="0.01" value={form.total} onChange={(e)=>setForm({...form, total:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Data de emissão
            <input required type="date" value={form.data_emissao} onChange={(e)=>setForm({...form, data_emissao:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Chave de acesso
            <input value={form.chave_acesso} onChange={(e)=>setForm({...form, chave_acesso:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">XML (URL)
            <input type="url" value={form.xml_url} onChange={(e)=>setForm({...form, xml_url:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
        </div>
        {err && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}
        {ok && <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">Nota salva.</p>}
        <div className="flex justify-end">
          <button className="rounded-full bg-[#2f4d3f] px-6 py-2 text-sm font-semibold text-white">Salvar</button>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Últimas notas</h2>
        <ul className="divide-y divide-[#e0eee6] rounded-2xl border border-[#cfe2d7] bg-white/70">
          {list.map((n) => (
            <li key={n.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">NF {n.numero}{n.serie ? `/${n.serie}` : ""}</p>
                <p className="text-xs text-[#567666]">{new Date(n.data_emissao).toLocaleDateString()}</p>
              </div>
              <div className="text-sm text-[#567666]">{formatBRL(n.total)}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
