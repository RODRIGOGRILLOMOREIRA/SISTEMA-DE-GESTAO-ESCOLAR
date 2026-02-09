import { useEffect, useState, useRef } from 'react'
import { Plus, Edit, Trash2, Calendar as CalendarIcon, X, Save, Upload, FileSpreadsheet } from 'lucide-react'
import { api } from '../lib/api'
import { useAnoLetivo } from '../contexts/AnoLetivoContext'
import SeletorAnoLetivo from './SeletorAnoLetivo'
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
  const { anoLetivo: anoLetivoGlobal } = useAnoLetivo()
  const [calendarios, setCalendarios] = useState<Calendario[]>([])
  const [anoSelecionado, setAnoSelecionado] = useState<number>(anoLetivoGlobal)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingEvento, setEditingEvento] = useState<EventoCalendario | null>(null)
  const [importando, setImportando] = useState(false)
  const [substituirEventos, setSubstituirEventos] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    tipo: 'DIA_LETIVO',
    descricao: '',
    dataInicio: '',
    dataFim: '',
  })

  useEffect(() => {
    loadCalendario()
  }, [anoSelecionado])

  const loadCalendario = async () => {
    try {
      const response = await api.get(`/calendario/ano/${anoSelecionado}`)
      if (response.data) {
        setCalendarios([response.data])
      } else {
        // Criar calendário vazio se não existir
        const novoCalendario = await api.post('/calendario', { ano: anoSelecionado })
        setCalendarios([novoCalendario.data])
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Criar calendário se não existir
        try {
          const novoCalendario = await api.post('/calendario', { ano: anoSelecionado })
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

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!validTypes.includes(file.type)) {
      alert('Por favor, selecione um arquivo Excel (.xls ou .xlsx)')
      return
    }

    setImportando(true)
    
    try {
      const formData = new FormData()
      formData.append('arquivo', file)
      formData.append('ano', String(anoSelecionado))
      formData.append('substituir', String(substituirEventos))

      console.log('📤 Enviando arquivo:', file.name, 'Ano:', anoSelecionado, 'Substituir:', substituirEventos)

      const response = await api.post('/calendario/importar-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('📥 Resposta da importação:', response.data)
      console.log('📊 Total importado:', response.data.eventosImportados, 'eventos')
      console.log('📋 Calendário completo:', response.data.calendario)

      alert(`✅ ${response.data.message}\n\n📊 Total de eventos: ${response.data.eventosTotal}`)
      setShowImportModal(false)
      setSubstituirEventos(false)
      
      // Recarregar calendário
      setTimeout(() => {
        loadCalendario()
      }, 500)
      
    } catch (error: any) {
      console.error('❌ Erro ao importar Excel:', error)
      console.error('📋 Detalhes do erro:', error.response?.data)
      const mensagemErro = error.response?.data?.detalhes || error.response?.data?.error || 'Erro ao importar arquivo'
      alert(`❌ Erro ao importar Excel:\n\n${mensagemErro}`)
    } finally {
      setImportando(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
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
        await api.put(`/calendario/eventos/${editingEvento.id}`, eventoData)
      } else {
        await api.post(`/calendario/${calendario.id}/eventos`, eventoData)
      }

      closeModal()
      // Forçar recarregamento
      setTimeout(() => {
        loadCalendario()
      }, 500)
    } catch (error) {
      console.error('Erro ao salvar evento:', error)
      alert('Erro ao salvar evento')
    }
  }

  const handleDelete = async (eventoId: string) => {
    if (window.confirm('Deseja realmente excluir este evento?')) {
      try {
        await api.delete(`/calendario/eventos/${eventoId}`)
        // Forçar recarregamento
        setTimeout(() => {
          loadCalendario()
        }, 500)
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
        <div style={{ width: '100%', textAlign: 'center' }}>
          <h1 className="calendario-titulo">Calendário Escolar</h1>
          
          <SeletorAnoLetivo
            anoSelecionado={anoSelecionado}
            onAnoChange={setAnoSelecionado}
            showImportButton={true}
            onImport={() => setShowImportModal(true)}
          />
          
          <div className="calendario-acoes">
            <button className="btn-primary btn-add-evento" onClick={() => openModal()}>
              <Plus size={20} />
              Adicionar Evento
            </button>
          </div>
        </div>
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
                          title={getTipoLabel(evento.tipo)}
                        >
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
                      
                      <div className="evento-titulo">
                        {evento.descricao || getTipoLabel(evento.tipo)}
                      </div>
                      
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
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingEvento ? 'Editar Evento' : 'Adicionar Evento'}</h2>
            
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

      {/* Modal de Importação Excel */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              <FileSpreadsheet size={24} />
              Importar Eventos do Excel
            </h2>
            
            <div className="import-info">
              <p><strong>📊 Formato esperado do Excel:</strong></p>
              <ul style={{ textAlign: 'left', marginLeft: '20px' }}>
                <li><strong>Coluna 1:</strong> Data (formato: DD/MM/YYYY ou numérico do Excel)</li>
                <li><strong>Coluna 2:</strong> Tipo do Evento (ex: Feriado, Recesso, Dia Letivo, etc.)</li>
                <li><strong>Coluna 3:</strong> Descrição (opcional)</li>
              </ul>
              
              <div className="import-tipos-aceitos">
                <p><strong>📝 Tipos aceitos:</strong></p>
                <div style={{ fontSize: '0.85em', lineHeight: '1.6' }}>
                  Início Ano Letivo, Fim Ano Letivo, Dia Letivo, Dia Não Letivo,
                  Parada Pedagógica, Recesso, Férias, Sábado Letivo, Feriado,
                  Início Trimestre, Fim Trimestre, Período EAC, ou qualquer outro texto
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={substituirEventos}
                    onChange={(e) => setSubstituirEventos(e.target.checked)}
                  />
                  <span>Substituir eventos existentes do ano {anoSelecionado}</span>
                </label>
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Se desmarcado, os eventos serão adicionados aos existentes
                </small>
              </div>
            </div>

            <div className="upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx"
                onChange={handleImportExcel}
                style={{ display: 'none' }}
                disabled={importando}
              />
              
              <button
                type="button"
                className="btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={importando}
                style={{ 
                  width: '100%', 
                  padding: '20px',
                  fontSize: '1.1em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {importando ? (
                  <>
                    <div className="spinner"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload size={24} />
                    Selecionar Arquivo Excel
                  </>
                )}
              </button>
            </div>

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => {
                  setShowImportModal(false)
                  setSubstituirEventos(false)
                }}
                disabled={importando}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarioEscolar
