import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  School, 
  ClipboardCheck,
  UserCheck,
  Settings,
  LogOut,
  User
} from 'lucide-react'
import { configuracoesAPI, Configuracao } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [config, setConfig] = useState<Configuracao | null>(null)

  useEffect(() => {
    loadConfig()
    
    // Listener para atualizar quando as configurações mudarem
    const handleConfigUpdate = () => {
      loadConfig()
    }
    
    window.addEventListener('configUpdated', handleConfigUpdate)
    
    return () => {
      window.removeEventListener('configUpdated', handleConfigUpdate)
    }
  }, [])

  const loadConfig = async () => {
    try {
      const response = await configuracoesAPI.get()
      setConfig(response.data)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/disciplinas', icon: BookOpen, label: 'Disciplinas' },
    { path: '/professores', icon: GraduationCap, label: 'Professores' },
    { path: '/turmas', icon: School, label: 'Turmas' },
    { path: '/alunos', icon: Users, label: 'Alunos' },
    { path: '/notas', icon: ClipboardCheck, label: 'Notas' },
    { path: '/frequencia', icon: UserCheck, label: 'Frequência' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ]

  return (
    <div className="layout">
      <aside className="sidebar">
        {/* Área de Logo e Nome da Escola */}
        <div className="sidebar-header">
          <div className="logo-container">
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt="Logo da Escola" className="school-logo" />
            ) : (
              <div className="logo-placeholder">
                <School size={48} />
              </div>
            )}
          </div>
          <h1 className="school-name">{config?.nomeEscola || 'Sistema de Gestão Escolar'}</h1>
          {config?.redeEscolar && (
            <p className="school-network">{config.redeEscolar}</p>
          )}
        </div>

        {/* Menu de Navegação */}
        <nav className="menu">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Área de Usuário e Logout */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-details">
              <span className="user-name">{user?.nome}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button 
            className="logout-btn" 
            onClick={() => {
              logout()
              navigate('/login')
            }}
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
