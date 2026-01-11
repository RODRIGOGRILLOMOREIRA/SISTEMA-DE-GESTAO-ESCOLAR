import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, ClipboardCheck, FileBarChart, Settings } from 'lucide-react'
import { useState } from 'react'
import './BottomNav.css'

interface NavItem {
  path?: string
  icon: any
  label: string
  badge?: number
  openDrawer?: boolean
}

interface BottomNavProps {
  onOpenDrawer?: (type: 'gestao' | 'registros') => void
}

const BottomNav = ({ onOpenDrawer }: BottomNavProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeItem, setActiveItem] = useState<string>('')

  const navItems: NavItem[] = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Início' },
    { icon: FolderOpen, label: 'Gestão', openDrawer: true },
    { icon: ClipboardCheck, label: 'Registros', openDrawer: true },
    { path: '/notificacoes', icon: FileBarChart, label: 'Relatórios', badge: 3 },
    { path: '/configuracoes', icon: Settings, label: 'Config' },
  ]

  const handleNavClick = (item: NavItem) => {
    if (item.openDrawer) {
      const drawerType = item.label === 'Gestão' ? 'gestao' : 'registros'
      onOpenDrawer?.(drawerType)
      setActiveItem(item.label)
    } else if (item.path) {
      navigate(item.path)
      setActiveItem(item.label)
    }
  }

  const isActive = (item: NavItem) => {
    if (item.path) {
      return location.pathname === item.path
    }
    return activeItem === item.label
  }

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const active = isActive(item)
          
          return (
            <button
              key={index}
              className={`bottom-nav-item ${active ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              <div className="bottom-nav-icon-wrapper">
                <Icon size={22} />
                {item.badge && item.badge > 0 && (
                  <span className="bottom-nav-badge">{item.badge}</span>
                )}
              </div>
              <span className="bottom-nav-label">{item.label}</span>
              {active && <div className="bottom-nav-indicator" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
