import { useEffect, useState } from "react";
import api from "../lib/api";
import { formatBRL, paymentLabel } from "../lib/format";

type VendaDia = { id: string; data_hora: string; total: number; tipo_pagamento: string; funcionario: string; cliente?: string };
type PorFunc = { funcionario_id: string; funcionario: string; qtd_vendas: number; total_vendido: number };

export default function ResumoVendas() {
  const [dia, setDia] = useState<VendaDia[]>([]);
  const [porFunc, setPorFunc] = useState<PorFunc[]>([]);
  const [detalhe, setDetalhe] = useState<any[]>([]);
  const [filtroQ, setFiltroQ] = useState("");
  const [filtroPg, setFiltroPg] = useState<string>("");

  async function fetchAll() {
    const [d, f] = await Promise.all([
      api.get("/relatorios/vendas/dia"),
      api.get("/relatorios/vendas/por-funcionario"),
    ]);
    setDia(d.data ?? []);
    setPorFunc(f.data ?? []);
  }

  useEffect(() => { fetchAll(); }, []);

  async function fetchDetalhado() {
    const { data } = await api.get("/relatorios/vendas/dia-detalhado", {
      params: {
        q: filtroQ || undefined,
        pagamento: filtroPg || undefined,
      },
    });
    setDetalhe(data ?? []);
  }

  function baixarDetalhadoPDF() {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Relatório do Dia</title>
      <style>body{font-family:Arial,sans-serif;padding:24px} h1{font-size:18px} table{width:100%;border-collapse:collapse;margin-top:12px} th,td{border:1px solid #ccc;padding:6px;font-size:12px}</style>
    </head><body>
      <h1>Relatório do dia</h1>
      <table><thead><tr><th>Data/Hora</th><th>Cliente</th><th>Telefone</th><th>Endereço</th><th>Pagamento</th><th>Total</th><th>Itens</th></tr></thead><tbody>
      ${detalhe.map(r=>`<tr><td>${new Date(r.data_hora).toLocaleString()}</td><td>${r.cliente_nome??""}</td><td>${r.telefone??""}</td><td>${r.endereco??""}</td><td>${r.tipo_pagamento}</td><td>${formatBRL(r.total)}</td><td>${r.itens??""}</td></tr>`).join('')}
      </tbody></table>
      <script>window.onload=()=>window.print()</script>
    </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  }

  function baixarPDF() {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Resumo de Vendas</title>
      <style>body{font-family:Arial,sans-serif;padding:24px} h1{font-size:18px} table{width:100%;border-collapse:collapse;margin-top:12px} th,td{border:1px solid #ccc;padding:6px;font-size:12px}</style>
    </head><body>
      <h1>Vendas do dia</h1>
      <table><thead><tr><th>Data/Hora</th><th>Funcionário</th><th>Cliente</th><th>Pagamento</th><th>Total</th></tr></thead><tbody>
      ${dia.map(v=>`<tr><td>${new Date(v.data_hora).toLocaleString()}</td><td>${v.funcionario}</td><td>${v.cliente??""}</td><td>${v.tipo_pagamento}</td><td>${formatBRL(v.total)}</td></tr>`).join('')}
      </tbody></table>
      <h1 style="margin-top:24px">Por funcionário</h1>
      <table><thead><tr><th>Funcionário</th><th>Qtd Vendas</th><th>Total</th></tr></thead><tbody>
      ${porFunc.map(r=>`<tr><td>${r.funcionario}</td><td>${r.qtd_vendas}</td><td>${formatBRL(r.total_vendido)}</td></tr>`).join('')}
      </tbody></table>
      <script>window.onload=()=>window.print()</script>
    </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Resumo de vendas</h1>
        <p className="text-sm text-[#5b7a6b]">Vendas do dia e ranking por funcionário.</p>
        <div className="mt-3">
          <button onClick={baixarPDF} className="rounded-full bg-[#2f4d3f] px-4 py-2 text-sm font-semibold text-white">Baixar PDF</button>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Vendas de hoje</h2>
        <ul className="divide-y divide-[#e0eee6] rounded-2xl border border-[#cfe2d7] bg-white/70">
          {dia.map((v) => (
            <li key={v.id} className="grid grid-cols-1 items-center gap-3 px-4 py-3 md:grid-cols-4">
              <div>
                <p className="font-medium">{new Date(v.data_hora).toLocaleString()}</p>
                <p className="text-xs text-[#567666]">{v.funcionario}{v.cliente ? ` • ${v.cliente}` : ""}</p>
              </div>
              <div className="text-sm">{paymentLabel(v.tipo_pagamento)}</div>
              <div className="text-right md:col-span-2">{formatBRL(v.total)}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Relatório detalhado do dia</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">Buscar
            <input className="mt-1 rounded-2xl border px-3 py-2" value={filtroQ} onChange={(e)=> setFiltroQ(e.target.value)} placeholder="nome, telefone, endereço" />
          </label>
          <label className="text-sm">Pagamento
            <select className="mt-1 rounded-2xl border px-3 py-2" value={filtroPg} onChange={(e)=> setFiltroPg(e.target.value)}>
              <option value="">Todos</option>
              <option value="DINHEIRO">DINHEIRO</option>
              <option value="PIX">PIX</option>
              <option value="CARTAO_DEBITO">CARTÃO DÉBITO</option>
              <option value="CARTAO_CREDITO">CARTÃO CRÉDITO</option>
              <option value="CREDITO_CLIENTE">CRÉDITO CLIENTE</option>
            </select>
          </label>
          <button className="rounded-full bg-[#2f4d3f] px-4 py-2 text-sm font-semibold text-white" onClick={fetchDetalhado}>Gerar</button>
          {detalhe.length > 0 && (
            <button className="rounded-full bg-[#2f4d3f] px-4 py-2 text-sm font-semibold text-white" onClick={baixarDetalhadoPDF}>Baixar PDF</button>
          )}
        </div>
        {detalhe.length > 0 && (
          <ul className="divide-y divide-[#e0eee6] rounded-2xl border border-[#cfe2d7] bg-white/70">
            {detalhe.map((r:any) => (
              <li key={r.id} className="grid grid-cols-1 gap-2 px-4 py-3 md:grid-cols-6">
                <div className="md:col-span-2">
                  <div className="font-medium">{r.cliente_nome || '—'}</div>
                  <div className="text-xs text-[#567666]">{r.endereco || '—'}</div>
                  <div className="text-xs text-[#567666]">{r.telefone || '—'}</div>
                </div>
                <div className="text-sm">{new Date(r.data_hora).toLocaleString()}</div>
                <div className="text-sm">{paymentLabel(r.tipo_pagamento)}</div>
                <div className="text-right text-sm">{formatBRL(r.total)}</div>
                <div className="md:col-span-2 text-xs text-[#567666]">{r.itens}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Por funcionário</h2>
        <ul className="divide-y divide-[#e0eee6] rounded-2xl border border-[#cfe2d7] bg-white/70">
          {porFunc.map((r) => (
            <li key={r.funcionario_id} className="grid grid-cols-1 items-center gap-3 px-4 py-3 md:grid-cols-3">
              <div className="font-medium">{r.funcionario}</div>
              <div className="text-sm">Vendas: {r.qtd_vendas}</div>
              <div className="text-right">{formatBRL(r.total_vendido)}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
