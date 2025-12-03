import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, ArrowLeft, School, CheckCircle } from 'lucide-react'
import { authAPI } from '../lib/api'
import './Auth.css'

const ForgotPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  
  const [step, setStep] = useState<'request' | 'reset' | 'success'>(token ? 'reset' : 'request')
  const [email, setEmail] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetToken, setResetToken] = useState(token || '')

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.forgotPassword(email)
      // Em produção, o token viria por email
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken)
        setStep('reset')
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao solicitar reset')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem')
      return
    }

    if (novaSenha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoading(true)

    try {
      await authAPI.resetPassword(resetToken, novaSenha)
      setStep('success')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <div className="auth-logo success">
              <CheckCircle size={48} />
            </div>
            <h1>Senha Alterada!</h1>
            <p>Sua senha foi redefinida com sucesso</p>
          </div>

          <div className="auth-form">
            <button 
              onClick={() => navigate('/login')} 
              className="auth-btn"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'reset') {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <div className="auth-logo">
              <School size={48} />
            </div>
            <h1>Nova Senha</h1>
            <p>Digite sua nova senha</p>
          </div>

          <form onSubmit={handleResetPassword} className="auth-form">
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="novaSenha">
                <Lock size={18} />
                Nova Senha
              </label>
              <input
                id="novaSenha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                autoFocus
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
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Digite a senha novamente"
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>

            <Link to="/login" className="back-link">
              <ArrowLeft size={16} />
              Voltar para login
            </Link>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="auth-logo">
            <School size={48} />
          </div>
          <h1>Recuperar Senha</h1>
          <p>Digite seu e-mail para receber instruções</p>
        </div>

        <form onSubmit={handleRequestReset} className="auth-form">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </button>

          <Link to="/login" className="back-link">
            <ArrowLeft size={16} />
            Voltar para login
          </Link>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
