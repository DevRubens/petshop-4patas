import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home";
import Venda from "./pages/Venda";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/Sidebar";
import { useAuthStore } from "./stores/auth";
import AdminFuncionarios from "./pages/AdminFuncionarios";
import Clientes from "./pages/Clientes";
import ProdutosCadastro from "./pages/ProdutosCadastro";
import ProdutosEstoque from "./pages/ProdutosEstoque";
import NotasFiscais from "./pages/NotasFiscais";
import Devolucoes from "./pages/Devolucoes";
import ResumoVendas from "./pages/ResumoVendas";
import Boletos from "./pages/Boletos";

function RequireAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireAdmin() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return user?.role === "ADMIN" ? <Outlet /> : <Navigate to="/" replace />;
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#eaf3ee] text-[#2f4d3f]">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-0 bg-white/0 px-0 py-0 lg:flex-row">
        <Sidebar />
        <main className="relative flex-1 min-w-0 overflow-auto bg-gradient-to-br from-white/60 via-white/80 to-white/60">
          <div className="pointer-events-none absolute inset-0 bg-[url('/background.png')] bg-[length:420px] bg-center opacity-40 mix-blend-multiply" aria-hidden />
          <div className="relative min-h-screen p-6 sm:p-10 lg:p-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/admin/login"
        element={
          isAuthenticated ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <AdminLogin />
          )
        }
      />
      <Route
        path="/admin"
        element={<Navigate to={isAuthenticated ? "/admin/dashboard" : "/admin/login"} replace />}
      />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Home />} />
          <Route path="venda" element={<Venda />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="produtos/cadastro" element={<ProdutosCadastro />} />
          <Route path="produtos/estoque" element={<ProdutosEstoque />} />
          <Route path="notas" element={<NotasFiscais />} />
          <Route path="devolucoes" element={<Devolucoes />} />
          <Route path="resumo" element={<ResumoVendas />} />
          <Route element={<RequireAdmin />}>
            <Route path="admin/dashboard" element={<Home />} />
            <Route path="admin/funcionarios" element={<AdminFuncionarios />} />
            <Route path="boletos" element={<Boletos />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
