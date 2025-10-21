import { useEffect, useState } from "react";
import api from "../lib/api";
import { formatBRL } from "../lib/format";

type Boleto = {
  id: string;
  descricao: string;
  fornecedor?: string | null;
  valor: number;
  vencimento: string;
  pago: boolean;
};

export default function Boletos() {
  const [list, setList] = useState<Boleto[]>([]);
  const [form, setForm] = useState({ descricao: "", fornecedor: "", valor: "", vencimento: "" });
  const [err, setErr] = useState<string | null>(null);

  async function fetchAll() {
    const { data } = await api.get("/boletos", { params: { pendentes: true } });
    setList(data?.data ?? data ?? []);
  }

  useEffect(()=>{ fetchAll(); }, []);

  function parseCurrencyBR(v: string): number {
    const s = v.replace(/[^0-9.,]/g, "").replace(/\./g, "").replace(/,/, ".");
    const n = Number(s); return Number.isFinite(n) ? n : 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setErr(null);
    try {
      await api.post("/boletos", {
        descricao: form.descricao,
        fornecedor: form.fornecedor || undefined,
        valor: parseCurrencyBR(form.valor),
        vencimento: form.vencimento,
      });
      setForm({ descricao: "", fornecedor: "", valor: "", vencimento: "" });
      await fetchAll();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Erro ao cadastrar boleto");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Boletos a pagar</h1>
        <p className="text-sm text-[#5b7a6b]">Cadastre e acompanhe contas a pagar. O sininho alerta próximos ao vencimento.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-[#cfe2d7] bg-white/80 p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="text-sm font-medium">Descrição
            <input required value={form.descricao} onChange={(e)=>setForm({...form, descricao:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Fornecedor
            <input value={form.fornecedor} onChange={(e)=>setForm({...form, fornecedor:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Valor
            <input inputMode="decimal" required value={form.valor} onChange={(e)=>setForm({...form, valor:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Vencimento
            <input type="date" required value={form.vencimento} onChange={(e)=>setForm({...form, vencimento:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
        </div>
        {err && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}
        <div className="flex justify-end">
          <button className="rounded-full bg-[#2f4d3f] px-6 py-2 text-sm font-semibold text-white">Adicionar</button>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Pendentes</h2>
        <ul className="divide-y divide-[#e0eee6] rounded-2xl border border-[#cfe2d7] bg-white/70">
          {list.map((b) => (
            <li key={b.id} className="grid grid-cols-1 items-center gap-3 px-4 py-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <p className="font-medium">{b.descricao}</p>
                <p className="text-xs text-[#567666]">{b.fornecedor || "-"}</p>
              </div>
              <div>{formatBRL(b.valor)}</div>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-sm">{new Date(b.vencimento).toLocaleDateString()}</span>
                <button className="rounded-full bg-[#2f4d3f] px-3 py-1 text-xs font-semibold text-white" onClick={async()=>{ await api.put(`/boletos/${b.id}/pagar`); await fetchAll(); }}>Pagar</button>
                <button className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white" onClick={async()=>{ if (!confirm('Excluir boleto?')) return; await api.delete(`/boletos/${b.id}`); await fetchAll(); }}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
