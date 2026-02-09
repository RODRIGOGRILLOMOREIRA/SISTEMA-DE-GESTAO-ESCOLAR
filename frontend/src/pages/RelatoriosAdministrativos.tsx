import { useState } from 'react'
import { FileText, Download, Calendar, Users, Building } from 'lucide-react'
import BackButton from '../components/BackButton'
import './RelatoriosAdministrativos.css'

const RelatoriosAdministrativos = () => {
  const [loading, setLoading] = useState(false)

  const relatorios = [
    {
      id: 1,
      titulo: 'Relatório de Funcionários',
      descricao: 'Lista completa de funcionários ativos',
      icon: Users,
      tipo: 'funcionarios'
    },
    {
      id: 2,
      titulo: 'Relatório de Infraestrutura',
      descricao: 'Inventário de equipamentos e instalações',
      icon: Building,
      tipo: 'infraestrutura'
    },
    {
      id: 3,
      titulo: 'Relatório de Ponto',
      descricao: 'Controle de ponto e presença',
      icon: Calendar,
      tipo: 'ponto'
    },
    {
      id: 4,
      titulo: 'Relatório Financeiro',
      descricao: 'Resumo de receitas e despesas',
      icon: FileText,
      tipo: 'financeiro'
    },
  ]

  const handleGerarRelatorio = (tipo: string) => {
    setLoading(true)
    // Implementar lógica de geração de relatório
    setTimeout(() => {
      alert(`Gerando relatório: ${tipo}`)
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="page">
      <BackButton />
      <div className="page-header">
        <h1>Relatórios Administrativos</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>Gere e baixe relatórios administrativos da escola</p>
      </div>

      <div className="action-cards-grid relatorios-administrativos-grid">
        {relatorios.map((relatorio) => {
          const Icon = relatorio.icon
          return (
            <div 
              key={relatorio.id} 
              className="action-card main-button"
              onClick={() => handleGerarRelatorio(relatorio.tipo)}
              style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              <div className="action-card-content">
                <div className="action-icon">
                  <Icon size={48} strokeWidth={2} />
                </div>
                <h3 className="action-title">{relatorio.titulo.toUpperCase()}</h3>
                <p className="action-description">{relatorio.descricao}</p>
                <button
                  className="btn-download"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleGerarRelatorio(relatorio.tipo)
                  }}
                >
                  <Download size={20} />
                  Gerar
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RelatoriosAdministrativos
