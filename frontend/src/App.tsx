import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Venda from './pages/Venda'
import NotFound from './pages/NotFound'
import { useAuthStore } from './stores/auth'
import Header from './components/Header'

function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuth = useAuthStore(s => s.isAuthenticated)
  return isAuth ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={
            <PrivateRoute><Home /></PrivateRoute>
          } />
          <Route path="/venda" element={
            <PrivateRoute><Venda /></PrivateRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  )
}
