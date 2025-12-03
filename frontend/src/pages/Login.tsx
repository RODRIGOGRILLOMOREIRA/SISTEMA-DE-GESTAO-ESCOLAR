import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Mail, Lock, School } from 'lucide-react'
import { authAPI, configuracoesAPI, Configuracao } from '../lib/api'
import './Auth.css'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [config, setConfig] = useState<Configuracao | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await configuracoesAPI.get()
      setConfig(response.data)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.login(formData)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.usuario))
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Erro no login:', error)
      setError(error.response?.data?.error || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="auth-logo">
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt="Logo da Escola" className="auth-school-logo" />
            ) : (
              <School size={48} />
            )}
          </div>
          <h1>{config?.nomeEscola || 'Sistema de Gestão Escolar'}</h1>
          <p>Entre com suas credenciais</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} />
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">
              <Lock size={18} />
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            <LogIn size={20} />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="auth-footer">
            <Link to="/user-management">Cadastrar ou Redefinir Senha</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
