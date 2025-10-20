import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import Button from '../components/Button'
import { useAuthStore } from '../stores/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await login(email, password)
    if (!ok) {
      setError('Credenciais inválidas.')
      return
    }
    navigate('/')
  }

  return (
    <div
      className="min-h-[calc(100vh-64px)] grid place-items-center bg-cover bg-center"
      style={{ backgroundImage: 'url(/background.png)' }}
    >
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg border">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/logo-4patas.png" alt="logo" className="h-12" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}/>
          <h1 className="text-xl font-semibold">Acesso ao Sistema</h1>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
        <div className="text-center mt-4">
          <img src="/Login.png" className="mx-auto rounded-xl shadow max-h-40" alt="mock de login" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}/>
        </div>
      </div>
    </div>
  )
}
