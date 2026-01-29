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
  FileBarChart,
  Settings,
  LogOut,
  User,
  Crown,
  Briefcase,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Menu,
  X,
  Bell,
  Activity,
  Shield,
  Server,
  TrendingDown,
  MessageSquare // FASE 5: Central de Comunicação
} from 'lucide-react'
import { configuracoesAPI, Configuracao } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useAnoLetivo } from '../contexts/AnoLetivoContext'
import Topbar from './Topbar'
import BottomNav from './BottomNav'
import RateLimitWarning from './RateLimitWarning'
import './Layout.css'

interface MenuItem {
  path?: string
  icon: any
  label: string
  subItems?: MenuItem[]
}

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { anoLetivo } = useAnoLetivo()
  const [config, setConfig] = useState<Configuracao | null>(null)
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [desktopMenuCollapsed, setDesktopMenuCollapsed] = useState(false)
  const [showRateLimitWarning, setShowRateLimitWarning] = useState(false)
  const [rateLimitData, setRateLimitData] = useState({ remaining: 0, resetTime: 0 })
  
  // Proteção contra usuário não autenticado
  useEffect(() => {
    if (!user) {
      console.warn('Layout: Usuário não autenticado, redirecionando para login')
      navigate('/login', { replace: true })
      return
    }
  }, [user, navigate])
  
  useEffect(() => {
    loadConfig()
    
    // Listener para atualizar quando as configurações mudarem
    const handleConfigUpdate = () => {
      loadConfig()
    }
    
    // Listener para rate limit warnings
    const handleRateLimitWarning = (event: Event) => {
      const customEvent = event as CustomEvent
      const { remaining, resetTime } = customEvent.detail
      setRateLimitData({ remaining, resetTime })
      setShowRateLimitWarning(true)
    }

    const handleRateLimitExceeded = (event: Event) => {
      const customEvent = event as CustomEvent
      const { resetTime } = customEvent.detail
      setRateLimitData({ remaining: 0, resetTime })
      setShowRateLimitWarning(true)
      
      // Mostrar alerta adicional
      alert('⚠️ Limite de requisições excedido! Por favor, aguarde alguns minutos antes de continuar.')
    }
    
    window.addEventListener('configUpdated', handleConfigUpdate)
    window.addEventListener('rateLimitWarning', handleRateLimitWarning)
    window.addEventListener('rateLimitExceeded', handleRateLimitExceeded)
    
    return () => {
      window.removeEventListener('configUpdated', handleConfigUpdate)
      window.removeEventListener('rateLimitWarning', handleRateLimitWarning)
      window.removeEventListener('rateLimitExceeded', handleRateLimitExceeded)
    }
  }, [])

  useEffect(() => {
    // Auto-expandir dropdown se uma subrota estiver ativa
    const autoExpandDropdowns = () => {
      const newOpenDropdowns: string[] = []
      menuItems.forEach(item => {
        if (item.subItems) {
          const hasActiveChild = item.subItems.some(sub => sub.path === location.pathname)
          if (hasActiveChild) {
            newOpenDropdowns.push(item.label)
          }
        }
      })
      setOpenDropdowns(newOpenDropdowns)
    }
    autoExpandDropdowns()
  }, [location.pathname])

  const loadConfig = async () => {
    try {
      console.log('🔍 Carregando configurações...')
      const response = await configuracoesAPI.get()
      console.log('✅ Configurações recebidas:', response.data)
      setConfig(response.data)
    } catch (error: any) {
      console.error('❌ Erro ao carregar configurações:', error)
      // Usar configuração padrão se houver erro
      setConfig({
        id: '',
        nomeEscola: 'SGE',
        redeEscolar: '',
        endereco: '',
        telefone: '',
        email: '',
        logoUrl: '',
        temaModo: 'light',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
  }

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const handleOpenDrawer = (type: 'gestao' | 'registros') => {
    // Quando o usuário clica em Gestão ou Registros no bottom nav
    // Abre o menu lateral com a seção apropriada expandida
    setOpenDropdowns([type === 'gestao' ? 'Gestão' : 'Registros'])
    setMobileMenuOpen(true)
  }

  const handleNotificationClick = () => {
    navigate('/notificacoes')
  }

  const menuItems: MenuItem[] = [
    { path: '/dashboard', icon: LayoutDashboard, label: config?.nomeEscola ? `SGE - ${config.nomeEscola}` : 'SGE' },
    { 
      icon: FolderOpen, 
      label: 'Gestão',
      subItems: [
        { path: '/equipe-diretiva', icon: Crown, label: 'Equipe Diretiva' },
        { path: '/funcionarios', icon: Briefcase, label: 'Funcionários' },
        { path: '/professores', icon: GraduationCap, label: 'Professores' },
        { path: '/registro-ponto', icon: Clock, label: 'Registro de Ponto' },
        { path: '/turmas', icon: School, label: 'Turmas' },
        { path: '/alunos', icon: Users, label: 'Alunos' },
        { path: '/disciplinas', icon: BookOpen, label: 'Disciplinas' },
        { path: '/calendario-escolar', icon: Calendar, label: 'Calendário Escolar' },
        { path: '/grade-horaria', icon: Clock, label: 'Grade Horária' },
      ]
    },
    {
      icon: ClipboardCheck,
      label: 'Registros',
      subItems: [
        { path: '/frequencia', icon: UserCheck, label: 'Frequência' },
        { path: '/notas', icon: ClipboardCheck, label: 'Notas e Avaliações' },
        { path: '/habilidades', icon: ClipboardCheck, label: 'Registro de Habilidades' },
        { path: '/boletim', icon: FileBarChart, label: 'Boletim de Desempenho' },
        { path: '/relatorios', icon: FileBarChart, label: 'Relatórios Pedagógicos' },
        { path: '/predicao-evasao', icon: TrendingDown, label: 'Predição de Evasão' },
        { path: '/relatorios-administrativos', icon: FileBarChart, label: 'Relatórios Administrativos' },
      ]
    },
    {
      icon: MessageSquare,
      label: 'Central de Comunicação',
      subItems: [
        { path: '/central-comunicacao', icon: MessageSquare, label: 'Central de Comunicação' },
        { path: '/notificacoes', icon: Bell, label: 'Notificações' },
      ]
    },
    {
      icon: Settings,
      label: 'Configurações',
      subItems: [
        { path: '/configuracoes', icon: Settings, label: 'Configurações Gerais' },
        ...(user?.tipo === 'ADMIN' || user?.tipo === 'GESTOR' ? [
          { path: '/monitoramento', icon: Activity, label: 'Observabilidade' },
          { path: '/auditoria', icon: Shield, label: 'Logs de Auditoria' },
          { path: '/two-factor', icon: Shield, label: 'Autenticação 2FA' },
          { path: '/rbac', icon: Shield, label: 'Permissões (RBAC)' },
          { path: '/infraestrutura', icon: Server, label: 'Backup e Cache' },
        ] : []),
      ]
    },
  ]

  return (
    <div className="layout">
      {/* Rate Limit Warning */}
      <RateLimitWarning
        remainingRequests={rateLimitData.remaining}
        resetTime={rateLimitData.resetTime}
        show={showRateLimitWarning}
        onClose={() => setShowRateLimitWarning(false)}
      />

      {/* Topbar - Desktop e Tablet */}
      <Topbar 
        onNotificationClick={handleNotificationClick}
        notificationCount={0}
      />

      {/* Botão Hambúrguer para Mobile */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para fechar menu ao clicar fora */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''} ${desktopMenuCollapsed ? 'collapsed' : ''}`}>
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
            const isOpen = openDropdowns.includes(item.label)
            
            // Se tem subitens, renderiza como dropdown
            if (item.subItems) {
              const hasActiveChild = item.subItems.some(sub => sub.path === location.pathname)
              
              return (
                <div key={item.label} className="menu-dropdown">
                  <button
                    className={`menu-item dropdown-toggle ${hasActiveChild ? 'active' : ''}`}
                    onClick={() => toggleDropdown(item.label)}
                  >
                    <div className="menu-item-content">
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  
                  {isOpen && (
                    <div className="dropdown-content">
                      {item.subItems.map((subItem) => {
                        const SubIcon = subItem.icon
                        const isActive = location.pathname === subItem.path
                        
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path!}
                            className={`menu-item sub-item ${isActive ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <SubIcon size={18} />
                            <span>{subItem.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }
            
            // Item normal sem subitens
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path!}
                className={`menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Botão Toggle Desktop */}
      <button 
        className="desktop-menu-toggle"
        onClick={() => setDesktopMenuCollapsed(!desktopMenuCollapsed)}
        aria-label="Toggle Menu Desktop"
        title={desktopMenuCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        {desktopMenuCollapsed ? <Menu size={24} /> : <X size={24} />}
      </button>

      <main className={`content ${desktopMenuCollapsed ? 'expanded' : ''}`}>
        {/* Indicador de Ano Letivo - Apenas Mobile */}
        <div className="ano-letivo-indicator">
          <Calendar size={16} />
          <span>Ano Letivo: <strong>{anoLetivo}</strong></span>
          <button 
            className="btn-alterar-ano"
            onClick={() => navigate('/configuracoes')}
            title="Alterar ano letivo em Configurações"
          >
            <Settings size={14} />
            Alterar
          </button>
        </div>
        
        <Outlet />
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav onOpenDrawer={handleOpenDrawer} />
    </div>
  )
}

export default Layout
