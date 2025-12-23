import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Calendar as CalendarIcon, X, Save } from 'lucide-react'
import axios from 'axios'
import './CalendarioEscolar.css'
import '../pages/CommonPages.css'
import './Modal.css'

interface EventoCalendario {
  id: string
  tipo: string
  descricao?: string
  dataInicio: string
  dataFim?: string
}

interface Calendario {
  id: string
  ano: number
  eventos_calendario: EventoCalendario[]
}

const tiposEvento = [
  { value: 'INICIO_ANO_LETIVO', label: 'Início do Ano Letivo' },
  { value: 'FIM_ANO_LETIVO', label: 'Fim do Ano Letivo' },
  { value: 'DIA_LETIVO', label: 'Dia Letivo' },
  { value: 'DIA_NAO_LETIVO', label: 'Dia Não Letivo' },
  { value: 'PARADA_PEDAGOGICA', label: 'Parada Pedagógica' },
  { value: 'RECESSO', label: 'Recesso' },
  { value: 'SABADO_LETIVO', label: 'Sábado Letivo' },
  { value: 'FERIADO', label: 'Feriado' },
  { value: 'INICIO_TRIMESTRE', label: 'Início do Trimestre' },
  { value: 'FIM_TRIMESTRE', label: 'Fim do Trimestre' },
  { value: 'PERIODO_EAC', label: 'Período EAC' },
  { value: 'OUTRO', label: 'Outro' },
]

const CalendarioEscolar = () => {
  const [calendarios, setCalendarios] = useState<Calendario[]>([])
  const [anoSelecionado, setAnoSelecionado] = useState<number>(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvento, setEditingEvento] = useState<EventoCalendario | null>(null)
  const [formData, setFormData] = useState({
    tipo: 'DIA_LETIVO',
    descricao: '',
    dataInicio: '',
    dataFim: '',
  })

  const API_URL = 'http://localhost:3333/api/calendario'

  useEffect(() => {
    loadCalendario()
  }, [anoSelecionado])

  const loadCalendario = async () => {
    try {
      const response = await axios.get(`${API_URL}/ano/${anoSelecionado}`)
      if (response.data) {
        setCalendarios([response.data])
      } else {
        // Criar calendário vazio se não existir
        const novoCalendario = await axios.post(API_URL, { ano: anoSelecionado })
        setCalendarios([novoCalendario.data])
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Criar calendário se não existir
        try {
          const novoCalendario = await axios.post(API_URL, { ano: anoSelecionado })
          setCalendarios([novoCalendario.data])
        } catch (createError) {
          console.error('Erro ao criar calendário:', createError)
        }
      } else {
        console.error('Erro ao carregar calendário:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const openModal = (evento?: EventoCalendario) => {
    if (evento) {
      setEditingEvento(evento)
      setFormData({
        tipo: evento.tipo,
        descricao: evento.descricao || '',
        dataInicio: evento.dataInicio.split('T')[0],
        dataFim: evento.dataFim ? evento.dataFim.split('T')[0] : '',
      })
    } else {
      setEditingEvento(null)
      setFormData({
        tipo: 'DIA_LETIVO',
        descricao: '',
        dataInicio: '',
        dataFim: '',
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingEvento(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const calendario = calendarios[0]
      if (!calendario) return

      const eventoData = {
        ...formData,
        dataFim: formData.dataFim || undefined,
      }

      if (editingEvento) {
        await axios.put(`${API_URL}/eventos/${editingEvento.id}`, eventoData)
      } else {
        await axios.post(`${API_URL}/${calendario.id}/eventos`, eventoData)
      }

      closeModal()
      loadCalendario()
    } catch (error) {
      console.error('Erro ao salvar evento:', error)
      alert('Erro ao salvar evento')
    }
  }

  const handleDelete = async (eventoId: string) => {
    if (window.confirm('Deseja realmente excluir este evento?')) {
      try {
        await axios.delete(`${API_URL}/eventos/${eventoId}`)
        loadCalendario()
      } catch (error) {
        console.error('Erro ao deletar evento:', error)
      }
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getTipoLabel = (tipo: string) => {
    return tiposEvento.find(t => t.value === tipo)?.label || tipo
  }

  const getTipoColor = (tipo: string) => {
    const cores: { [key: string]: string } = {
      'INICIO_ANO_LETIVO': '#10b981',
      'FIM_ANO_LETIVO': '#ef4444',
      'DIA_LETIVO': '#3b82f6',
      'DIA_NAO_LETIVO': '#6b7280',
      'PARADA_PEDAGOGICA': '#8b5cf6',
      'RECESSO': '#f59e0b',
      'SABADO_LETIVO': '#06b6d4',
      'FERIADO': '#ec4899',
      'INICIO_TRIMESTRE': '#14b8a6',
      'FIM_TRIMESTRE': '#f97316',
      'PERIODO_EAC': '#a855f7',
      'OUTRO': '#64748b',
    }
    return cores[tipo] || '#64748b'
  }

  const agruparEventosPorCategoria = () => {
    if (!calendario?.eventos_calendario) return {}
    
    const categorias: { [key: string]: EventoCalendario[] } = {
      'Ano Letivo': [],
      'Trimestres': [],
      'Dias Especiais': [],
      'Feriados e Recessos': [],
      'Outros': []
    }

    calendario.eventos_calendario.forEach(evento => {
      if (['INICIO_ANO_LETIVO', 'FIM_ANO_LETIVO'].includes(evento.tipo)) {
        categorias['Ano Letivo'].push(evento)
      } else if (['INICIO_TRIMESTRE', 'FIM_TRIMESTRE', 'PERIODO_EAC'].includes(evento.tipo)) {
        categorias['Trimestres'].push(evento)
      } else if (['DIA_LETIVO', 'DIA_NAO_LETIVO', 'SABADO_LETIVO', 'PARADA_PEDAGOGICA'].includes(evento.tipo)) {
        categorias['Dias Especiais'].push(evento)
      } else if (['FERIADO', 'RECESSO'].includes(evento.tipo)) {
        categorias['Feriados e Recessos'].push(evento)
      } else {
        categorias['Outros'].push(evento)
      }
    })

    // Ordenar eventos dentro de cada categoria por data
    Object.keys(categorias).forEach(key => {
      categorias[key].sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
    })

    return categorias
  }

  if (loading) return <div className="loading">Carregando...</div>

  const calendario = calendarios[0]
  const eventosAgrupados = agruparEventosPorCategoria()

  return (
    <div className="page">
      <div className="page-header">
        <div className="ano-selector">
          <button className="btn-secondary" onClick={() => setAnoSelecionado(anoSelecionado - 1)}>
            ← {anoSelecionado - 1}
          </button>
          <h1>Calendário Escolar {anoSelecionado}</h1>
          <button className="btn-secondary" onClick={() => setAnoSelecionado(anoSelecionado + 1)}>
            {anoSelecionado + 1} →
          </button>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Adicionar Evento
        </button>
      </div>

      {calendario?.eventos_calendario && calendario.eventos_calendario.length > 0 ? (
        <div className="calendario-container">
          {Object.entries(eventosAgrupados).map(([categoria, eventos]) => {
            if (eventos.length === 0) return null
            
            return (
              <div key={categoria} className="categoria-eventos">
                <h2 className="categoria-titulo">{categoria}</h2>
                <div className="eventos-grid">
                  {eventos.map((evento) => (
                    <div 
                      key={evento.id} 
                      className="evento-card"
                      style={{ borderLeftColor: getTipoColor(evento.tipo) }}
                    >
                      <div className="evento-header">
                        <div 
                          className="evento-tipo-badge"
                          style={{ backgroundColor: getTipoColor(evento.tipo) }}
                        >
                          {getTipoLabel(evento.tipo)}
                        </div>
                        <div className="evento-acoes">
                          <button 
                            className="btn-icon-small" 
                            onClick={() => openModal(evento)}
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn-icon-small btn-danger" 
                            onClick={() => handleDelete(evento.id)}
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {evento.descricao && (
                        <div className="evento-descricao">{evento.descricao}</div>
                      )}
                      
                      <div className="evento-datas">
                        <div className="data-item">
                          <CalendarIcon size={14} />
                          <span>{formatDate(evento.dataInicio)}</span>
                        </div>
                        {evento.dataFim && (
                          <div className="data-item">
                            <span>até</span>
                            <span>{formatDate(evento.dataFim)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <CalendarIcon size={64} />
          <h3>Nenhum evento cadastrado</h3>
          <p>Adicione eventos para organizar o calendário escolar de {anoSelecionado}</p>
          <button className="btn-primary" onClick={() => openModal()}>
            <Plus size={20} />
            Adicionar Primeiro Evento
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingEvento ? 'Editar Evento' : 'Novo Evento'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tipo de Evento *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  required
                >
                  {tiposEvento.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {(formData.tipo === 'FERIADO' || formData.tipo === 'OUTRO') && (
                <div className="form-group">
                  <label>Descrição *</label>
                  <input
                    type="text"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    required
                    placeholder="Descrição do evento"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Data Início *</label>
                <input
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Data Fim (opcional)</label>
                <input
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingEvento ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarioEscolar
