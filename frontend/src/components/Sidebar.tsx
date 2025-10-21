import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import NotificationBell from "./NotificationBell";

type NavItem = {
  label: string;
  to?: string;
  disabled?: boolean;
  adminOnly?: boolean;
  external?: boolean;
};

const baseItems: NavItem[] = [
  { label: "Iniciar venda", to: "/venda" },
  { label: "Cadastrar Clientes", to: "/clientes" },
  { label: "Cadastro de Produtos", to: "/produtos/cadastro", adminOnly: true },
  { label: "Estoque de Produtos", to: "/produtos/estoque", adminOnly: true },
  { label: "Notas Fiscais", to: "/notas" },
  { label: "Devoluções", to: "/devolucoes" },
  { label: "Resumo de Vendas", to: "/resumo" },
];

const adminItems: NavItem[] = [
  { label: "Funcionários", to: "/admin/funcionarios", adminOnly: true },
  { label: "Boletos a Pagar", to: "/boletos", adminOnly: true },
];

function isActive(pathname: string, target?: string) {
  if (!target) return false;
  if (target === "/venda") {
    return pathname.startsWith("/venda");
  }
  return pathname === target;
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const items = useMemo(() => {
    if (user?.role === "ADMIN") {
      return [...baseItems, ...adminItems];
    }
    return baseItems;
  }, [user?.role]);

  const photo = (user?.photo && String(user.photo).trim() !== "") ? (user.photo as string) : "/avatar-admin.svg";

  return (
    <aside className="sidebar-gradient flex w-full max-w-[280px] flex-col gap-6 px-6 py-8 text-white shadow-2xl shadow-[#1a2d22]/40 lg:max-w-[300px]">
      <div className="relative mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/60 bg-[#dbe9e1] shadow-2xl shadow-black/30"
          aria-label="Tela inicial"
        >
        <img
          src={photo}
          alt={user?.name || "Perfil"}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/logo-4patas.png";
          }}
        />
        </button>
        <div className="absolute -left-3 -top-3">
          <NotificationBell />
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold leading-tight">
          {user?.name ?? "Usuário"}
        </p>
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          {user?.role === "ADMIN" ? "Administrador" : "Funcionário"}
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-3">
        {items.map((item) => {
          if (item.adminOnly && user?.role !== "ADMIN") return null;
          const active = isActive(location.pathname, item.to);
          let classes =
            "w-full rounded-2xl px-5 py-3 text-left text-sm font-semibold transition-all";
          if (active) {
            classes += " bg-white text-[#2f4d3f] shadow-lg shadow-black/25";
          } else if (item.disabled) {
            classes += " bg-white/10 text-white/80 cursor-not-allowed";
          } else {
            classes += " bg-white/20 text-white hover:bg-white/30 cursor-pointer";
          }

          if (item.to && !item.disabled) {
            return (
              <Link key={item.label} to={item.to} className={classes}>
                {item.label}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              className={classes}
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled && item.to) navigate(item.to);
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-2xl bg-white/10 px-4 py-3 text-center text-xs leading-relaxed text-white/80">
          <p>Petshop 4 Patas</p>
          <p className="text-[10px] uppercase tracking-[0.25em]">
            Gestão de Vendas
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full rounded-full bg-white/15 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/25"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
