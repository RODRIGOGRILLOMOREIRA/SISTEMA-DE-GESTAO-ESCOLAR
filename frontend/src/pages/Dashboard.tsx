import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, GraduationCap, School, BookOpen, 
  Briefcase, GraduationCapIcon, Calendar, 
  Grid, FileText, UserCog, ClipboardList, Award, ArrowLeft
} from 'lucide-react'
import { alunosAPI, professoresAPI, turmasAPI, disciplinasAPI, configuracoesAPI } from '../lib/api'
import './Dashboard.css'

type ViewType = 'indicators' | 'equipe' | 'administrativa' | 'pedagogica' | 'registros-pedagogicos'

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    alunos: 0,
    professores: 0,
    turmas: 0,
    disciplinas: 0,
  })
  const [nomeEscola, setNomeEscola] = useState('SGE')
  const [activeView, setActiveView] = useState<ViewType>('indicators')

  useEffect(() => {
    loadStats()
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await configuracoesAPI.get()
      setNomeEscola(response.data.nomeEscola || 'SGE')
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const loadStats = async () => {
    try {
      const [alunos, professores, turmas, disciplinas] = await Promise.all([
        alunosAPI.getAll(),
        professoresAPI.getAll(),
        turmasAPI.getAll(),
        disciplinasAPI.getAll(),
      ])

      setStats({
        alunos: alunos.data.length,
        professores: professores.data.length,
        turmas: turmas.data.length,
        disciplinas: disciplinas.data.length,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const statsCards = [
    { title: 'Disciplinas', value: stats.disciplinas, icon: BookOpen, color: '#f59e0b' },
    { title: 'Professores', value: stats.professores, icon: GraduationCap, color: '#8b5cf6' },
    { title: 'Turmas', value: stats.turmas, icon: School, color: '#10b981' },
    { title: 'Alunos', value: stats.alunos, icon: Users, color: '#3b82f6' },
  ]

  // Nível 1: Botões principais (4 botões)
  const mainButtons = [
    { title: 'Equipe', view: 'equipe' as ViewType, icon: UserCog, color: '#8b5cf6', description: 'Gestão de pessoas' },
    { title: 'Gestão Administrativa', view: 'administrativa' as ViewType, icon: Briefcase, color: '#06b6d4', description: 'Recursos e infraestrutura' },
    { title: 'Gestão Pedagógica', view: 'pedagogica' as ViewType, icon: GraduationCapIcon, color: '#10b981', description: 'Ensino e aprendizagem' },
  ]

  // Nível 2: Cards de Equipe
  const equipeCards = [
    { title: 'Equipe Gestora', route: '/equipe-diretiva', icon: UserCog, color: '#8b5cf6', description: 'Direção e coordenação' },
    { title: 'Professores', route: '/professores', icon: GraduationCap, color: '#3b82f6', description: 'Corpo docente' },
    { title: 'Funcionários', route: '/funcionarios', icon: Users, color: '#10b981', description: 'Equipe de apoio' },
  ]

  // Nível 2: Cards de Gestão Administrativa
  const administrativaCards = [
    { title: 'Calendário Escolar', route: '/calendario-escolar', icon: Calendar, color: '#06b6d4', description: 'Eventos e datas' },
    { title: 'Grade de Horários', route: '/grade-horaria', icon: Grid, color: '#ec4899', description: 'Horários das aulas' },
    { title: 'Relatórios Administrativos', route: '/relatorios-administrativos', icon: FileText, color: '#f59e0b', description: 'Documentos administrativos' },
    { title: 'Relatórios Pedagógicos', route: '/relatorios', icon: ClipboardList, color: '#8b5cf6', description: 'Relatórios de ensino' },
  ]

  // Nível 2: Cards de Gestão Pedagógica
  const pedagogicaCards = [
    { title: 'Disciplinas', route: '/disciplinas', icon: BookOpen, color: '#f59e0b', description: 'Matérias e conteúdos' },
    { title: 'Turmas', route: '/turmas', icon: School, color: '#10b981', description: 'Classes e períodos' },
    { title: 'Alunos', route: '/alunos', icon: Users, color: '#3b82f6', description: 'Estudantes matriculados' },
    { title: 'Registros Pedagógicos', view: 'registros-pedagogicos' as ViewType, icon: ClipboardList, color: '#8b5cf6', description: 'Acompanhamento escolar', isSubMenu: true },
  ]

  // Nível 3: Cards de Registros Pedagógicos
  const registrosPedagogicosCards = [
    { title: 'Frequência', route: '/frequencia', icon: Users, color: '#3b82f6', description: 'Controle de presença' },
    { title: 'Notas e Avaliações', route: '/notas', icon: FileText, color: '#f59e0b', description: 'Lançamento de notas' },
    { title: 'Registro de Habilidades', route: '/habilidades', icon: Award, color: '#ec4899', description: 'Competências e habilidades' },
    { title: 'Boletim de Desempenho', route: '/boletim', icon: GraduationCapIcon, color: '#10b981', description: 'Desempenho acadêmico' },
  ]

  const handleCardClick = (route?: string, view?: ViewType) => {
    if (route) {
      navigate(route)
    } else if (view) {
      setActiveView(view)
    }
  }

  const handleBackToMain = () => {
    if (activeView === 'registros-pedagogicos') {
      setActiveView('pedagogica')
    } else {
      setActiveView('indicators')
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="escola-info">
          <h2 className="escola-nome">{nomeEscola}</h2>
          <h1 className="sistema-titulo">SISTEMA DE GESTÃO ESCOLAR</h1>
        </div>
      </div>

      {/* Botões Principais (Tela Inicial) */}
      {activeView === 'indicators' && (
        <>
          <div className="action-cards-grid main-buttons">
            {mainButtons.map((button) => {
              const Icon = button.icon
              return (
                <div 
                  key={button.title} 
                  className="action-card main-button"
                  onClick={() => setActiveView(button.view)}
                >
                  <div className="action-card-content">
                    <div className="action-icon">
                      <Icon size={48} strokeWidth={2} />
                    </div>
                    <h3 className="action-title">{button.title.toUpperCase()}</h3>
                    <p className="action-description">{button.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Equipe */}
      {activeView === 'equipe' && (
        <>
          <button className="back-button" onClick={handleBackToMain}>
            <ArrowLeft className="back-arrow-desktop" size={24} />
            <span className="back-text-mobile">Voltar</span>
          </button>
          <div className="action-cards-grid equipe-grid">
            {equipeCards.map((card) => {
              const Icon = card.icon
              return (
                <div 
                  key={card.title} 
                  className="action-card main-button"
                  onClick={() => handleCardClick(card.route)}
                >
                  <div className="action-card-content">
                    <div className="action-icon">
                      <Icon size={48} strokeWidth={2} />
                    </div>
                    <h3 className="action-title">{card.title.toUpperCase()}</h3>
                    <p className="action-description">{card.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Gestão Administrativa */}
      {activeView === 'administrativa' && (
        <>
          <button className="back-button" onClick={handleBackToMain}>
            <ArrowLeft className="back-arrow-desktop" size={24} />
            <span className="back-text-mobile">Voltar</span>
          </button>
          <div className="action-cards-grid administrativa-grid">
            {administrativaCards.map((card) => {
              const Icon = card.icon
              return (
                <div 
                  key={card.title} 
                  className="action-card main-button"
                  onClick={() => handleCardClick(card.route)}
                >
                  <div className="action-card-content">
                    <div className="action-icon">
                      <Icon size={48} strokeWidth={2} />
                    </div>
                    <h3 className="action-title">{card.title.toUpperCase()}</h3>
                    <p className="action-description">{card.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Gestão Pedagógica */}
      {activeView === 'pedagogica' && (
        <>
          <button className="back-button" onClick={handleBackToMain}>
            <ArrowLeft className="back-arrow-desktop" size={24} />
            <span className="back-text-mobile">Voltar</span>
          </button>
          <div className="action-cards-grid pedagogica-grid">
            {pedagogicaCards.map((card) => {
              const Icon = card.icon
              return (
                <div 
                  key={card.title} 
                  className="action-card main-button"
                  onClick={() => card.isSubMenu ? setActiveView('registros-pedagogicos') : handleCardClick(card.route)}
                >
                  <div className="action-card-content">
                    <div className="action-icon">
                      <Icon size={48} strokeWidth={2} />
                    </div>
                    <h3 className="action-title">{card.title.toUpperCase()}</h3>
                    <p className="action-description">{card.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Registros Pedagógicos */}
      {activeView === 'registros-pedagogicos' && (
        <>
          <button className="back-button" onClick={handleBackToMain}>
            <ArrowLeft className="back-arrow-desktop" size={24} />
            <span className="back-text-mobile">Voltar</span>
          </button>
          <div className="action-cards-grid registros-grid">
            {registrosPedagogicosCards.map((card) => {
              const Icon = card.icon
              return (
                <div 
                  key={card.title} 
                  className="action-card main-button"
                  onClick={() => handleCardClick(card.route)}
                >
                  <div className="action-card-content">
                    <div className="action-icon">
                      <Icon size={48} strokeWidth={2} />
                    </div>
                    <h3 className="action-title">{card.title.toUpperCase()}</h3>
                    <p className="action-description">{card.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
