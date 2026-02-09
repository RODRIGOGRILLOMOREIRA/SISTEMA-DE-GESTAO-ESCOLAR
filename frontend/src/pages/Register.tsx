import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, School } from 'lucide-react'
import { authAPI } from '../lib/api'
import './Auth.css'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cargo: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.register({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        cargo: formData.cargo || undefined,
      })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.usuario))
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Erro no cadastro:', error)
      setError(error.response?.data?.error || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="auth-logo">
            <School size={48} />
          </div>
          <h1>Criar Conta</h1>
          <p>Cadastre-se no sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nome">
              <User size={18} />
              Nome Completo
            </label>
            <input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Seu nome completo"
              required
              autoFocus
            />
          </div>

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
            />
          </div>

          <div className="form-group">
            <label htmlFor="cargo">
              <User size={18} />
              Cargo/Função
            </label>
            <select
              id="cargo"
              value={formData.cargo}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              required
            >
              <option value="">Selecione seu cargo</option>
              <option value="Professor">Professor</option>
              <option value="Funcionário">Funcionário</option>
              <option value="Diretor">Diretor</option>
              <option value="Vice-Diretor">Vice-Diretor</option>
              <option value="Coordenador">Coordenador</option>
              <option value="Secretário">Secretário</option>
              <option value="Outro">Outro</option>
            </select>
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
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">
              <Lock size={18} />
              Confirmar Senha
            </label>
            <input
              id="confirmarSenha"
              type="password"
              value={formData.confirmarSenha}
              onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
              placeholder="Digite a senha novamente"
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            <UserPlus size={20} />
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>

          <div className="auth-footer">
            Já tem uma conta?{' '}
            <Link to="/login">Entrar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
