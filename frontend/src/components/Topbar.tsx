import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, Search, Settings, User, Calendar, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAnoLetivo } from '../contexts/AnoLetivoContext'
import { useWebSocket } from '../contexts/WebSocketContext'
import { ThemeToggle } from './ThemeToggle'
import { useState, useEffect } from 'react'
import './Topbar.css'

interface TopbarProps {
  onNotificationClick?: () => void
  notificationCount?: number
}

const Topbar = ({ onNotificationClick }: TopbarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { anoLetivo } = useAnoLetivo()
  const { notificationCount, markNotificationsAsRead, connected } = useWebSocket()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick()
    }
    markNotificationsAsRead()
  }

  useEffect(() => {
    // Gerar breadcrumbs baseado na rota atual
    const path = location.pathname
    const segments = path.split('/').filter(Boolean)
    
    const breadcrumbMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'alunos': 'Alunos',
      'professores': 'Professores',
      'turmas': 'Turmas',
      'disciplinas': 'Disciplinas',
      'frequencia': 'Frequência',
      'notas': 'Notas',
      'configuracoes': 'Configurações',
      'notificacoes': 'Notificações',
      'equipe-diretiva': 'Equipe Diretiva',
      'funcionarios': 'Funcionários',
      'registro-ponto': 'Registro de Ponto',
      'calendario-escolar': 'Calendário Escolar',
      'grade-horaria': 'Grade Horária',
      'boletim': 'Boletim',
      'relatorios': 'Relatórios',
      'habilidades': 'Habilidades'
    }

    const breadcrumbLabels = segments.map(seg => breadcrumbMap[seg] || seg)
    setBreadcrumbs(breadcrumbLabels)
  }, [location.pathname])

  return (
    <div className="topbar">
      <div className="topbar-left">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <span className="breadcrumb-home" onClick={() => navigate('/dashboard')}>
            Home
          </span>
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="breadcrumb-item">
              <ChevronRight size={14} />
              <span>{crumb}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="topbar-right">
        {/* Indicador de Ano Letivo */}
        <div className="ano-letivo-badge">
          <Calendar size={20} />
          <span>{anoLetivo}</span>
        </div>

        {/* Search Button */}
        <button 
          className="topbar-icon-btn"
          onClick={() => setShowSearch(!showSearch)}
          title="Pesquisar"
        >
          <Search size={28} />
        </button>

        {/* Notificações */}
        <button 
          className="topbar-icon-btn notification-btn"
          onClick={handleNotificationClick}
          title={`Notificações${connected ? ' (conectado)' : ' (desconectado)'}`}
        >
          <Bell size={28} />
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
          {connected && <span className="connection-indicator" />}
        </button>

        {/* Configurações rápidas */}
        <button 
          className="topbar-icon-btn"
          onClick={() => navigate('/configuracoes')}
          title="Configurações"
        >
          <Settings size={28} />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Logout */}
        <button 
          className="topbar-icon-btn logout-btn"
          onClick={() => {
            logout()
            navigate('/login')
          }}
          title="Sair"
        >
          <LogOut size={28} />
        </button>

        {/* Perfil do Usuário */}
        <div className="profile-container">
          <button 
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">
              <User size={24} />
            </div>
            <div className="profile-info">
              <span className="profile-name">{user?.nome}</span>
              <span className="profile-role">Usuário</span>
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div 
                className="profile-menu-overlay"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="profile-menu">
                <div className="profile-menu-header">
                  <div className="profile-avatar-large">
                    <User size={24} />
                  </div>
                  <div>
                    <div className="profile-menu-name">{user?.nome}</div>
                    <div className="profile-menu-email">{user?.email}</div>
                  </div>
                </div>
                <div className="profile-menu-divider" />
                <button 
                  className="profile-menu-item"
                  onClick={() => {
                    navigate('/perfil')
                    setShowProfileMenu(false)
                  }}
                >
                  <User size={16} />
                  Meu Perfil
                </button>
                <button 
                  className="profile-menu-item"
                  onClick={() => {
                    navigate('/configuracoes')
                    setShowProfileMenu(false)
                  }}
                >
                  <Settings size={16} />
                  Configurações
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search Overlay */}
      {showSearch && (
        <div className="search-overlay">
          <div className="search-container">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar no sistema..."
              autoFocus
            />
            <button onClick={() => setShowSearch(false)}>ESC</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Topbar
