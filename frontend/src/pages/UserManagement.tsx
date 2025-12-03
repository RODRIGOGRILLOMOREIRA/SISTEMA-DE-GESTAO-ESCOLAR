import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Key, Users, ArrowLeft, Mail, Lock, User, Save, RefreshCw } from 'lucide-react'
import { authAPI, configuracoesAPI, Configuracao } from '../lib/api'
import './Auth.css'

const UserManagement = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'register' | 'reset'>('register')
  const [config, setConfig] = useState<Configuracao | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Formulário de registro
  const [registerData, setRegisterData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  })

  // Formulário de reset
  const [resetData, setResetData] = useState({
    email: '',
    novaSenha: '',
    confirmarNovaSenha: '',
  })

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (registerData.senha !== registerData.confirmarSenha) {
      setError('As senhas não coincidem')
      return
    }

    if (registerData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      await authAPI.register({
        nome: registerData.nome,
        email: registerData.email,
        senha: registerData.senha,
      })
      setSuccess('Usuário cadastrado com sucesso! Você já pode fazer login.')
      setRegisterData({ nome: '', email: '', senha: '', confirmarSenha: '' })
      setTimeout(() => navigate('/login'), 2000)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao cadastrar usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (resetData.novaSenha !== resetData.confirmarNovaSenha) {
      setError('As senhas não coincidem')
      return
    }

    if (resetData.novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      // Chamada direta ao backend para resetar senha sem token
      await authAPI.resetPasswordDirect({
        email: resetData.email,
        novaSenha: resetData.novaSenha,
      })
      setSuccess('Senha redefinida com sucesso! Você já pode fazer login.')
      setResetData({ email: '', novaSenha: '', confirmarNovaSenha: '' })
      setTimeout(() => navigate('/login'), 2000)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box" style={{ maxWidth: '560px' }}>
        <div className="auth-header">
          <div className="auth-logo">
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt="Logo da Escola" className="auth-school-logo" />
            ) : (
              <Users size={48} />
            )}
          </div>
          <h1>{config?.nomeEscola || 'Sistema de Gestão Escolar'}</h1>
          <p>Gerenciamento de Usuários</p>
        </div>

        {/* Tabs */}
        <div className="user-tabs">
          <button
            className={`user-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('register')
              setError('')
              setSuccess('')
            }}
          >
            <UserPlus size={20} />
            Novo Usuário
          </button>
          <button
            className={`user-tab ${activeTab === 'reset' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('reset')
              setError('')
              setSuccess('')
            }}
          >
            <Key size={20} />
            Redefinir Senha
          </button>
        </div>

        {/* Mensagens */}
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {/* Formulário de Cadastro */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label htmlFor="nome">
                <User size={18} />
                Nome Completo
              </label>
              <input
                id="nome"
                type="text"
                value={registerData.nome}
                onChange={(e) => setRegisterData({ ...registerData, nome: e.target.value })}
                placeholder="Digite o nome completo"
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
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                placeholder="usuario@email.com"
                required
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
                value={registerData.senha}
                onChange={(e) => setRegisterData({ ...registerData, senha: e.target.value })}
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
                value={registerData.confirmarSenha}
                onChange={(e) => setRegisterData({ ...registerData, confirmarSenha: e.target.value })}
                placeholder="Digite a senha novamente"
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              <Save size={20} />
              {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
            </button>
          </form>
        )}

        {/* Formulário de Redefinição */}
        {activeTab === 'reset' && (
          <form onSubmit={handleReset} className="auth-form">
            <div className="form-group">
              <label htmlFor="resetEmail">
                <Mail size={18} />
                E-mail do Usuário
              </label>
              <input
                id="resetEmail"
                type="email"
                value={resetData.email}
                onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                placeholder="usuario@email.com"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="novaSenha">
                <Lock size={18} />
                Nova Senha
              </label>
              <input
                id="novaSenha"
                type="password"
                value={resetData.novaSenha}
                onChange={(e) => setResetData({ ...resetData, novaSenha: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmarNovaSenha">
                <Lock size={18} />
                Confirmar Nova Senha
              </label>
              <input
                id="confirmarNovaSenha"
                type="password"
                value={resetData.confirmarNovaSenha}
                onChange={(e) => setResetData({ ...resetData, confirmarNovaSenha: e.target.value })}
                placeholder="Digite a senha novamente"
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              <RefreshCw size={20} />
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        )}

        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/login')}
          className="back-to-login-btn"
        >
          <ArrowLeft size={18} />
          Voltar para Login
        </button>
      </div>
    </div>
  )
}

export default UserManagement
