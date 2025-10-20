import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const loc = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <img src="/logo-4patas.png" className="h-10 w-auto" alt="logo 4 patas" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}/>
        <div className="font-bold text-lg">Petshop 4 Patas</div>

        <nav className="ml-6 flex items-center gap-4 text-sm">
          <Link className={loc.pathname === '/' ? 'text-sky-600 font-semibold' : ''} to="/">Início</Link>
          <Link className={loc.pathname === '/venda' ? 'text-sky-600 font-semibold' : ''} to="/venda">Venda</Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">Olá, {user?.name}</span>
              <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg bg-sky-500 text-white hover:bg-sky-600 text-sm">
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className="px-3 py-1.5 rounded-lg bg-sky-500 text-white hover:bg-sky-600 text-sm">Entrar</Link>
          )}
        </div>
      </div>
    </header>
  )
}
