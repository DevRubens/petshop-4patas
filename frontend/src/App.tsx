import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
