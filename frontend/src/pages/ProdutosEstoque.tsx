import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuthStore } from "../stores/auth";

type Produto = {
  id: string;
  codigo: string;
  nome: string;
  quantidade_estoque: number;
};

export default function ProdutosEstoque() {
  const [list, setList] = useState<Produto[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const user = useAuthStore((s) => s.user);

  async function fetchProdutos(q?: string) {
    const { data } = await api.get("/produtos", { params: q ? { s: q } : undefined });
    setList(data?.data ?? data ?? []);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('s') ?? '';
    if (s) { setBusca(s); fetchProdutos(s); } else { fetchProdutos(); }
  }, []);

  async function atualizar(id: string, quantidade: number) {
    setErr(null);
    try {
      await api.put(`/produtos/${id}/estoque`, { quantidade_estoque: quantidade });
      await fetchProdutos();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Erro ao atualizar estoque");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Estoque de produtos</h1>
        <p className="text-sm text-[#5b7a6b]">Visualize e ajuste quantidades.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <input
          placeholder="Buscar produtos por nome ou código..."
          value={busca}
          onChange={(e)=>{ setBusca(e.target.value); fetchProdutos(e.target.value); }}
          className="flex-1 rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"
        />
      </div>

      {err && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}

      <ul className="divide-y divide-[#e0eee6] rounded-2xl border border-[#cfe2d7] bg-white/70">
        {list.map((p) => (
          <li key={p.id} className="grid grid-cols-1 items-center gap-3 px-4 py-3 md:grid-cols-4">
            <div className="md:col-span-2 min-w-0">
              <p className={`font-medium break-words ${p.quantidade_estoque <= 5 ? 'text-red-600' : ''}`}>{p.nome}</p>
              <p className="text-xs text-[#567666] break-words">{p.codigo}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>Atual:</span>
              <strong className={p.quantidade_estoque <= 5 ? 'text-red-600' : ''}>{p.quantidade_estoque}</strong>
              {p.quantidade_estoque <= 5 && (
                <span className="text-red-600" title={p.quantidade_estoque <= 0 ? 'Produto esgotado' : 'Estoque baixo'}>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-red-600 text-[10px]">i</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input type="number" min={0} defaultValue={p.quantidade_estoque}
                className="w-24 rounded-2xl border border-[#9fb7aa] bg-white/70 px-3 py-2"
                onBlur={(e) => {
                  const n = Number(e.currentTarget.value);
                  if (!Number.isNaN(n)) atualizar(p.id, n);
                }}
              />
              <button className="rounded-full bg-[#2f4d3f] px-4 py-2 text-xs font-semibold text-white"
                onClick={(e) => {
                  const input = (e.currentTarget.previousSibling as HTMLInputElement);
                  const n = Number(input.value);
                  if (!Number.isNaN(n)) atualizar(p.id, n);
                }}
              >Salvar</button>
              {user?.role === "ADMIN" && (
                <button className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white"
                  onClick={async ()=>{
                    if (!confirm(`Excluir produto ${p.nome}?`)) return;
                    await api.delete(`/produtos/${p.id}`);
                    await fetchProdutos(busca);
                  }}
                >Excluir</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
