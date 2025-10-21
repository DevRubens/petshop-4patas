import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";

import Home from "./pages/Home";
import Venda from "./pages/Venda";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import { useAuthStore } from "./stores/auth";

function RequireAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="py-6">
        <Outlet />
      </main>
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
        path="/admin"
        element={isAuthenticated ? <Navigate to="/" replace /> : <AdminLogin />}
      />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Home />} />
          <Route path="admin/dashboard" element={<Home />} />
          <Route path="venda" element={<Venda />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
