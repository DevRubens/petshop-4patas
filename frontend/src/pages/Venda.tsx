import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { formatBRL, paymentLabel } from "../lib/format";

type Produto = { id: string; nome: string; codigo: string; valor_venda: number; foto_url?: string | null };
type Cliente = { id: string; nome: string; especial?: boolean };
type CartItem = { produto: Produto; quantidade: number; valor_unitario: number };

export default function Venda() {
  const navigate = useNavigate();
  const [buscaCliente, setBuscaCliente] = useState("");
  const [buscaProduto, setBuscaProduto] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clienteSel, setClienteSel] = useState<Cliente | null>(null);
  const [produtoSel, setProdutoSel] = useState<Produto | null>(null);
  const [qtd, setQtd] = useState(1);
  const [carrinho, setCarrinho] = useState<CartItem[]>([]);
  const [pagamento, setPagamento] = useState("DINHEIRO");
  const [entrega, setEntrega] = useState(false);
  const [valorPago, setValorPago] = useState("");
  const total = useMemo(() => carrinho.reduce((s, i) => s + i.quantidade * i.valor_unitario, 0), [carrinho]);
  const [msg, setMsg] = useState<string | null>(null);

  // Imagem de preview no painel lateral: usa a do selecionado, senão a do primeiro resultado da busca
  const previewImagem = useMemo(() => {
    if (produtoSel?.foto_url) return produtoSel.foto_url || undefined;
    if (buscaProduto.trim().length > 0 && produtos.length > 0) {
      const first = (produtos[0] as any);
      return first?.foto_url || undefined;
    }
    return undefined;
  }, [produtoSel, buscaProduto, produtos]);

  async function fetchClientes(q?: string) {
    const { data } = await api.get("/clientes", { params: q ? { s: q } : undefined });
    setClientes(data?.data ?? data ?? []);
  }
  async function fetchProdutos(q?: string) {
    const { data } = await api.get("/produtos", { params: q ? { s: q } : undefined });
    setProdutos(data?.data ?? data ?? []);
  }

  useEffect(() => {
    fetchClientes();
    fetchProdutos();
  }, []);

  function addItem() {
    if (!produtoSel || qtd <= 0) return;
    const valor = Number((produtoSel as any).valor_venda);
    setCarrinho((prev) => [
      ...prev,
      { produto: produtoSel, quantidade: qtd, valor_unitario: Number.isFinite(valor) ? valor : 0 },
    ]);
    setProdutoSel(null);
    setBuscaProduto("");
    setQtd(1);
    setMsg(null);
  }

  async function finalizarVenda() {
    setMsg(null);
    if (carrinho.length === 0) {
      setMsg("Adicione itens ao carrinho");
      return;
    }
    if (pagamento === "CREDITO_CLIENTE" && !clienteSel) {
      setMsg("Selecione um cliente para venda a prazo");
      return;
    }
    try {
      const obs: string[] = [];
      if (entrega) obs.push("Entrega: Sim");
      if (pagamento === "DINHEIRO") {
        const pago = parseMoedaBR(valorPago);
        const troco = Math.max(0, pago - total);
        obs.push(`Pagará R$ ${pago.toFixed(2)} | Troco R$ ${troco.toFixed(2)}`);
      }
      const payload: any = {
        cliente_id: clienteSel?.id ?? undefined,
        tipo_pagamento: pagamento,
        observacao: obs.length ? obs.join(" | ") : undefined,
        itens: carrinho.map((i) => ({
          produto_id: i.produto.id,
          quantidade: i.quantidade,
          valor_unitario: i.valor_unitario,
        })),
      };
      await api.post("/vendas", payload);
      setCarrinho([]);
      setClienteSel(null);
      setBuscaCliente("");
      setMsg("Venda registrada com sucesso!");
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Falha ao registrar venda");
    }
  }

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 rounded-full bg-[#d7e6dc] px-5 py-2 text-sm font-semibold text-[#315245] transition hover:bg-[#c5d9cd]"
      >
        Voltar
      </button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
        <section className="rounded-[46px] bg-white/85 p-8 shadow-2xl shadow-[#c0d3c9]/50">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold text-[#2f4d3f]">Iniciar venda</h1>
            <p className="mt-1 text-sm text-[#5b7a6b]">Selecione cliente, adicione itens e finalize.</p>
          </header>

          <div className="grid gap-6">
            <div>
              <label className="text-sm font-semibold text-[#2f4d3f]">Cliente</label>
              <input
                className="mt-1.5 h-11 w-full rounded-[16px] border border-[#9fb7aa] bg-white/70 px-4 text-sm"
                value={buscaCliente}
                onChange={async (e) => {
                  setBuscaCliente(e.target.value);
                  await fetchClientes(e.target.value);
                }}
                placeholder="Nome do cliente"
              />
              {clienteSel ? (
                <p className="mt-1 text-sm">
                  Selecionado: <strong>{clienteSel.nome}</strong> {clienteSel.especial ? "(especial)" : ""}
                  <button className="ml-2 text-red-600" onClick={() => setClienteSel(null)}>
                    trocar
                  </button>
                </p>
              ) : (
                buscaCliente.trim().length > 0 && clientes.length > 0 && (
                  <ul className="mt-2 max-h-40 overflow-auto rounded-2xl border bg-white/70">
                    {(clientes as any[]).map((c: any) => (
                      <li
                        key={c.id}
                        className="cursor-pointer px-4 py-2 hover:bg-[#eef6f1]"
                        onClick={() => {
                          setClienteSel({ id: c.id, nome: c.nome, especial: c.especial });
                          setBuscaCliente(c.nome);
                        }}
                      >
                        {c.nome}
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-[#2f4d3f]">Produto</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr),120px,140px]">
                <div>
                  <input
                    className="mt-1.5 h-11 w-full rounded-[16px] border border-[#9fb7aa] bg-white/70 px-4 text-sm"
                    value={buscaProduto}
                    onChange={async (e) => {
                      setBuscaProduto(e.target.value);
                      await fetchProdutos(e.target.value);
                    }}
                    placeholder="Nome do produto"
                  />
                  {!produtoSel && buscaProduto.trim().length > 0 && produtos.length > 0 && (
                    <ul className="mt-2 max-h-40 overflow-auto rounded-2xl border bg-white/70">
                      {produtos.map((p) => (
                        <li
                          key={p.id}
                          className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#eef6f1]"
                          onClick={() => {
                            setProdutoSel(p);
                            setBuscaProduto(`${p.nome}`);
                          }}
                        >
                          {p.foto_url && (
                            <img src={p.foto_url} className="h-8 w-8 flex-none rounded object-cover" alt="" />
                          )}
                          <span className={`truncate ${((p as any).quantidade_estoque ?? 0) <= 5 ? 'text-red-600' : ''}`}>{p.nome}</span>
                          <span className="text-xs text-[#567666]">({p.codigo})</span>
                          {(((p as any).quantidade_estoque ?? 0) <= 5) && (
                            <span
                              className="ml-auto flex items-center text-red-600"
                              title={(((p as any).quantidade_estoque ?? 0) <= 0) ? 'Produto esgotado' : 'Estoque baixo'}
                            >
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-red-600 text-[10px]">i</span>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <input
                  type="number"
                  min={1}
                  className="mt-1.5 h-11 rounded-[16px] border border-[#9fb7aa] bg-white/70 px-4 text-sm"
                  value={qtd}
                  onChange={(e) => setQtd(Number(e.target.value))}
                />
                <button
                  type="button"
                  className="mt-1.5 h-11 rounded-full bg-[#2f4d3f] px-6 text-sm font-semibold text-white disabled:bg-gray-400"
                  disabled={!produtoSel}
                  onClick={addItem}
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#cfe2d7] bg-white/80 p-4">
              <h3 className="mb-2 font-semibold">Carrinho</h3>
              <ul className="divide-y">
                {carrinho.map((i, idx) => (
                  <li key={idx} className="flex items-center justify-between py-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {i.produto.foto_url && (
                          <img src={i.produto.foto_url} className="h-8 w-8 flex-none rounded object-cover" alt="" />
                        )}
                        <p className="font-medium break-words">{i.produto.nome}</p>
                      </div>
                      <p className="text-xs text-[#567666]">Qtd {i.quantidade} - {formatBRL(i.valor_unitario)}</p>
                    </div>
                    <button
                      className="text-red-600"
                      onClick={() => setCarrinho((prev) => prev.filter((_, j) => j !== idx))}
                    >
                      remover
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-right font-semibold">Total: {formatBRL(total)}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-[#2f4d3f]">
                Forma de pagamento
                <select
                  className="mt-1.5 h-11 w-full rounded-[16px] border border-[#9fb7aa] bg-white/70 px-4 text-sm"
                  value={pagamento}
                  onChange={(e) => setPagamento(e.target.value)}
                >
                  <option value="DINHEIRO">DINHEIRO</option>
                  <option value="PIX">PIX</option>
                  <option value="CARTAO_DEBITO">CARTÃO DÉBITO</option>
                  <option value="CARTAO_CREDITO">CARTÃO CRÉDITO</option>
                  <option value="CREDITO_CLIENTE">CRÉDITO CLIENTE</option>
                </select>
              </label>
            </div>

            {/* Entrada de troco foi movida para o resumo lateral */}

            {msg && (
              <p className="rounded-2xl border border-[#c9ddcf] bg-[#f4fbf7] px-5 py-3 text-sm">{msg}</p>
            )}

            <div className="flex justify-end">
              <button
                className="rounded-full bg-[#2f4d3f] px-10 py-3 text-sm font-semibold text-white"
                onClick={finalizarVenda}
              >
                Finalizar venda
              </button>
            </div>
          </div>
        </section>

        <ResumoLateral
          imagem={previewImagem}
          nomeProduto={buscaProduto.trim() || undefined}
          total={total}
          pagamento={pagamento}
          entrega={entrega}
          valorPago={valorPago}
          setValorPago={setValorPago}
        />
      </div>
    </div>
  );
}

function parseMoedaBR(v: string): number {
  const s = v.replace(/[^0-9.,]/g, "").replace(/\./g, "").replace(/,/, ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function ResumoLateral({ imagem, nomeProduto, total, pagamento, entrega, valorPago, setValorPago }: { imagem?: string; nomeProduto?: string; total: number; pagamento: string; entrega: boolean; valorPago: string; setValorPago: (v: string)=>void; }) {
  const pago = parseMoedaBR(valorPago);
  const troco = Math.max(0, pago - total);
  return (
    <aside className="flex flex-col justify-between gap-4 rounded-[46px] bg-white/85 p-6 text-[#2f4d3f] shadow-2xl shadow-[#c0d3c9]/40">
      <div className="overflow-hidden rounded-[36px] border-4 border-white/60 bg-[#e4efe8]">
        <img
          src={imagem || "/produto-destaque.svg"}
          alt="Produto"
          className="h-64 w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/produto-destaque.svg";
          }}
        />
      </div>
      {nomeProduto && (
        <div className="rounded-2xl bg-white/70 px-4 py-2 text-center text-sm font-medium">{nomeProduto}</div>
      )}
      <div className="space-y-1 rounded-2xl bg-white/70 px-4 py-3 text-sm">
        <div className="flex items-center justify-between">
          <span>Total</span>
          <span className="font-semibold">{formatBRL(total)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Pagamento</span>
          <span className="font-semibold">{paymentLabel(pagamento)}</span>
        </div>
        {pagamento === 'DINHEIRO' && (
          <div className="flex items-center justify-between">
            <span>Troco</span>
            <span className="font-semibold">{formatBRL(troco)}</span>
          </div>
        )}
      </div>
      {pagamento === 'DINHEIRO' && (
        <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm space-y-2">
          <label className="block">Quanto o cliente vai pagar (R$)
            <input value={valorPago} onChange={(e)=> setValorPago(e.target.value)} inputMode="decimal" placeholder="0,00" className="mt-1 h-11 w-full rounded-[16px] border border-[#9fb7aa] bg-white/70 px-4 text-sm" />
          </label>
          <p className="text-right text-sm">Troco devido: <strong>{formatBRL(troco)}</strong></p>
          <label className="mt-1 inline-flex items-center gap-2"><input type="checkbox" checked={entrega} onChange={(e)=> setEntrega(e.target.checked)} /> Entrega</label>
        </div>
      )}
    </aside>
  );
}













