import { useEffect, useState } from "react";
import api from "../lib/api";
import Modal from "./Modal";
import { useNavigate } from "react-router-dom";

type Alertas = {
  boletosVencendo: number;
  produtosVencendo: number;
  produtosBaixoEstoque: number;
  total: number;
};

type Detalhes = {
  boletos?: Array<{ id: string; descricao: string; vencimento: string; valor: number }>;
  produtos_validade?: Array<{ id: string; nome: string; validade: string; codigo: string }>;
  produtos_baixo_estoque?: Array<{ id: string; nome: string; quantidade_estoque: number; codigo: string }>;
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [tooltip, setTooltip] = useState("");
  const [open, setOpen] = useState(false);
  const [lista, setLista] = useState<Detalhes | null>(null);

  async function load() {
    try {
      const { data } = await api.get<Alertas>("/alertas");
      setCount(data?.total ?? 0);
      setTooltip(
        `Boletos: ${data.boletosVencendo} • Validade: ${data.produtosVencendo} • Estoque: ${data.produtosBaixoEstoque}`
      );
    } catch {}
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  async function openModal() {
    try {
      const { data } = await api.get("/alertas", { params: { detalhes: 1 } });
      setLista(data);
    } catch {}
    setOpen(true);
  }

  return (
    <div title={tooltip} className="relative inline-flex items-center justify-center">
      <button onClick={openModal} className="inline-flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C10.343 2 9 3.343 9 5V6.126C6.718 6.571 5 8.594 5 10.914V15L3.293 16.707C2.902 17.098 3.179 17.75 3.707 17.75H20.293C20.821 17.75 21.098 17.098 20.707 16.707L19 15V10.914C19 8.594 17.282 6.571 15 6.126V5C15 3.343 13.657 2 12 2Z" fill="currentColor" opacity="0.85"/>
        <path d="M9.5 19C10.163 20.165 11.493 21 13 21C14.507 21 15.837 20.165 16.5 19H9.5Z" fill="currentColor"/>
      </svg>
      </button>
      {count > 0 && (
        <span className="absolute -right-2 -top-1 rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
          {count}
        </span>
      )}

      <Modal open={open} onClose={()=> setOpen(false)} title="Alertas">
        {!lista ? (
          <p className="text-sm text-[#567666]">Carregando...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold">Boletos próximos do vencimento</h4>
              <ul className="divide-y rounded-xl border">
                {(lista.boletos ?? []).map((b: any) => (
                  <li key={b.id} className="cursor-pointer px-3 py-2 text-sm hover:bg-[#eef6f1]" onClick={()=>{ setOpen(false); navigate('/boletos'); }}>
                    {b.descricao} — {new Date(b.vencimento).toLocaleDateString()} (R$ {Number(b.valor).toFixed(2)})
                  </li>
                ))}
                {(lista.boletos ?? []).length === 0 && <li className="px-3 py-2 text-sm text-[#567666]">Nenhum boleto próximo.</li>}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Produtos próximos da validade</h4>
              <ul className="divide-y rounded-xl border">
                {(lista.produtos_validade ?? []).map((p: any) => (
                  <li key={p.id} className="cursor-pointer px-3 py-2 text-sm hover:bg-[#eef6f1]" onClick={()=>{ setOpen(false); navigate('/produtos/estoque?s=' + encodeURIComponent(p.nome)); }}>
                    {p.nome} — {new Date(p.validade).toLocaleDateString()}
                  </li>
                ))}
                {(lista.produtos_validade ?? []).length === 0 && <li className="px-3 py-2 text-sm text-[#567666]">Nenhum produto próximo do vencimento.</li>}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Produtos com baixo estoque</h4>
              <ul className="divide-y rounded-xl border">
                {(lista.produtos_baixo_estoque ?? []).map((p: any) => (
                  <li key={p.id} className="cursor-pointer px-3 py-2 text-sm hover:bg-[#eef6f1]" onClick={()=>{ setOpen(false); navigate('/produtos/estoque?s=' + encodeURIComponent(p.nome)); }}>
                    {p.nome} — Estoque: {p.quantidade_estoque}
                  </li>
                ))}
                {(lista.produtos_baixo_estoque ?? []).length === 0 && <li className="px-3 py-2 text-sm text-[#567666]">Nenhum item crítico.</li>}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
