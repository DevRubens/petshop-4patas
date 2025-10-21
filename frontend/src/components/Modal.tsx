import { ReactNode } from "react";

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: ()=>void; title?: string; children: ReactNode; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 m-4 w-full max-w-xl rounded-2xl bg-white p-4 text-[#2f4d3f] shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#2f4d3f]">{title ?? ""}</h3>
          <button className="rounded-full bg-[#d7e6dc] px-3 py-1 text-sm font-semibold text-[#2f4d3f]" onClick={onClose}>Fechar</button>
        </div>
        <div className="max-h-[60vh] overflow-auto">{children}</div>
      </div>
    </div>
  );
}
