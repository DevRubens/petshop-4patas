import { useEffect, useState } from "react";
import api, { uploadFile } from "../lib/api";
import { formatBRL } from "../lib/format";

type Produto = {
  id: string;
  codigo: string;
  nome: string;
  quantidade_estoque: number;
  valor_venda: number;
};

export default function ProdutosCadastro() {
  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    data_entrada: "",
    validade: "",
    valor_compra: "",
    valor_venda: "",
    quantidade_estoque: 0,
    foto: undefined as File | undefined,
  });
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  async function fetchProdutos() {
    const { data } = await api.get("/produtos");
    setProdutos(data?.data ?? data ?? []);
  }

  useEffect(() => { fetchProdutos(); }, []);

  function parseCurrencyBR(v: string): number {
    if (!v) return 0;
    // Remove espaços e símbolos, converte 1.582,00 -> 1582.00
    const s = v.replace(/[^0-9.,]/g, "").replace(/\./g, "").replace(/,/, ".");
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOk(false);
    try {
      const payload: any = {
        codigo: form.codigo,
        nome: form.nome,
        valor_venda: parseCurrencyBR(form.valor_venda),
        quantidade_estoque: Number(form.quantidade_estoque),
      };
      if (form.data_entrada) payload.data_entrada = form.data_entrada;
      if (form.validade) payload.validade = form.validade;
      if (form.valor_compra) payload.valor_compra = parseCurrencyBR(form.valor_compra);
      if (form.foto) {
        try {
          const url = await uploadFile(form.foto, "produtos");
          payload.foto_url = url;
        } catch (e: any) {
          setErr("Falha no upload da foto do produto");
          return;
        }
      }
      await api.post("/produtos", payload);
      setOk(true);
      setForm({ codigo: "", nome: "", data_entrada: "", validade: "", valor_compra: "", valor_venda: "", quantidade_estoque: 0, foto: undefined });
      await fetchProdutos();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Erro ao cadastrar produto");
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Cadastro de produtos</h1>
        <p className="text-sm text-[#5b7a6b]">Crie produtos e defina estoque inicial.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-[#cfe2d7] bg-white/80 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">Código
            <input required value={form.codigo} onChange={(e)=>setForm({...form, codigo:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Nome
            <input required value={form.nome} onChange={(e)=>setForm({...form, nome:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Entrada
            <input type="date" value={form.data_entrada} onChange={(e)=>setForm({...form, data_entrada:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Validade
            <input type="date" value={form.validade} onChange={(e)=>setForm({...form, validade:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Valor compra
            <input inputMode="decimal" value={form.valor_compra} onChange={(e)=>setForm({...form, valor_compra:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Valor venda
            <input inputMode="decimal" required value={form.valor_venda} onChange={(e)=>setForm({...form, valor_venda:e.target.value})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Estoque inicial
            <input type="number" min={0} required value={form.quantidade_estoque}
              onChange={(e)=>setForm({...form, quantidade_estoque:Number(e.target.value)})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
          <label className="text-sm font-medium">Foto do produto
            <input type="file" accept="image/*" onChange={(e)=>setForm({...form, foto: e.currentTarget.files?.[0]})}
              className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"/>
          </label>
        </div>

        {err && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}
        {ok && <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">Produto criado.</p>}

        <div className="flex justify-end">
          <button className="rounded-full bg-[#2f4d3f] px-6 py-2 text-sm font-semibold text-white">Salvar</button>
        </div>
      </form>

      {/* Import fixado logo abaixo do formulário */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Importar produtos (SQL/CSV)</h2>
        <div className="rounded-2xl border border-[#cfe2d7] bg-white/80 p-4">
          <input type="file" accept=".sql,.csv,.txt" onChange={async (e)=>{
            const f = e.currentTarget.files?.[0]; if (!f) return; setImportStatus("Importando...");
            try {
              const form = new FormData(); form.append('file', f);
              const { data } = await api.post('/import/produtos', form, { headers: { 'Content-Type':'multipart/form-data' } });
              setImportStatus(`Importados: ${data?.importados ?? 0}`);
              await fetchProdutos();
            } catch (err: any) {
              setImportStatus(err?.response?.data?.message || 'Falha ao importar');
            }
          }} />
          {importStatus && <p className="mt-2 text-sm text-[#567666]">{importStatus}</p>}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Produtos recentes</h2>
        <ul className="divide-y divide-[#e0eee6] rounded-2xl border border-[#cfe2d7] bg-white/70">
          {produtos.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{p.nome}</p>
                <p className="text-xs text-[#567666]">{p.codigo}</p>
              </div>
              <div className="text-right text-sm text-[#567666]">
                <p>{formatBRL(p.valor_venda)}</p>
                <p>Estoque: {p.quantidade_estoque}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      
    </div>
  );
}
