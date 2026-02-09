import { useEffect, useState } from 'react'
import { Plus, Edit, Save, X, Calendar, ArrowLeft } from 'lucide-react'
import { api } from '../lib/api'
import './GradeHoraria.css'
import '../components/Modal.css'
import '../pages/CommonPages.css'

interface Professor {
  id: string
  nome: string
}

interface Disciplina {
  id: string
  nome: string
  professorId?: string
  professor?: Professor
}

interface Turma {
  id: string
  nome: string
  ano: number
  periodo: string
  disciplinas?: Array<{
    id: string
    nome: string
    professorId?: string
    professor?: Professor
  }>
}

interface HorarioAula {
  id?: string
  diaSemana: 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO'
  periodo: 'MANHA' | 'TARDE'
  ordem: number
  horaInicio: string
  horaFim: string
  disciplinaId: string
  professorId: string
  disciplinas?: Disciplina
  professores?: Professor
}

interface GradeHoraria {
  id: string
  turmaId: string
  horarios_aula: HorarioAula[]
}

type Periodo = 'MANHA' | 'TARDE' | null
type NivelEnsino = 'INICIAIS' | 'FINAIS' | null

const diasSemana = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO']
const diasLabel = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const horariosPadrao = {
  MANHA: [
    { ordem: 1, horaInicio: '07:30', horaFim: '08:15' },
    { ordem: 2, horaInicio: '08:15', horaFim: '09:00' },
    { ordem: 3, horaInicio: '09:00', horaFim: '09:45' },
    { ordem: 4, horaInicio: '09:45', horaFim: '10:00', isRecreiro: true },
    { ordem: 5, horaInicio: '10:00', horaFim: '10:45' },
    { ordem: 6, horaInicio: '10:45', horaFim: '11:30' },
  ],
  TARDE: [
    { ordem: 1, horaInicio: '13:00', horaFim: '13:45' },
    { ordem: 2, horaInicio: '13:45', horaFim: '14:30' },
    { ordem: 3, horaInicio: '14:30', horaFim: '15:15' },
    { ordem: 4, horaInicio: '15:15', horaFim: '15:30', isRecreiro: true },
    { ordem: 5, horaInicio: '15:30', horaFim: '16:15' },
    { ordem: 6, horaInicio: '16:15', horaFim: '17:00' },
  ]
}

const GradeHoraria = () => {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [nivelEnsino, setNivelEnsino] = useState<NivelEnsino>(null)
  const [turmaId, setTurmaId] = useState<string>('')
  const [gradeHoraria, setGradeHoraria] = useState<GradeHoraria | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ dia: string; ordem: number } | null>(null)
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTurmas()
  }, [])

  useEffect(() => {
    if (turmaId) {
      loadGradeHoraria()
    }
  }, [turmaId])

  const loadTurmas = async () => {
    try {
      const response = await api.get('/turmas')
      console.log('TURMAS CARREGADAS:', response.data.length, response.data)
      setTurmas(response.data)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
    }
  }

  const loadGradeHoraria = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/grade-horaria/turma/${turmaId}`)
      console.log('Grade horária recebida:', response.data)
      console.log('Horários aula:', response.data.horarios_aula)
      setGradeHoraria(response.data)
    } catch (error) {
      console.error('Erro ao carregar grade horária:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHorarioForCell = (dia: string, ordem: number, periodo: Periodo) => {
    if (!gradeHoraria || !periodo) return null
    return gradeHoraria.horarios_aula.find(
      h => h.diaSemana === dia && h.ordem === ordem && h.periodo === periodo
    )
  }

  const turmaSelecionada = turmas.find(t => t.id === turmaId)
  
  // Normalizar o período da turma para o formato esperado
  const normalizarPeriodo = (periodo?: string): Periodo => {
    if (!periodo) return null
    const periodoUpper = periodo.toUpperCase()
    if (periodoUpper.includes('MANH') || periodoUpper === 'M') return 'MANHA'
    if (periodoUpper.includes('TARD') || periodoUpper === 'T') return 'TARDE'
    return null
  }
  
  const periodoAtivo: Periodo = normalizarPeriodo(turmaSelecionada?.periodo)
  
  // Debug
  if (turmaId && turmaSelecionada) {
    console.log('Turma selecionada:', turmaSelecionada)
    console.log('Período original:', turmaSelecionada.periodo)
    console.log('Período normalizado:', periodoAtivo)
  }

  const openModalForCell = (dia: string, ordem: number) => {
    if (!periodoAtivo) {
      alert('Esta turma não possui um turno definido. Por favor, edite a turma e defina o turno (Manhã ou Tarde).')
      return
    }
    
    const horarioPadrao = horariosPadrao[periodoAtivo].find(h => h.ordem === ordem)
    if (horarioPadrao?.isRecreiro) {
      return // Não permite editar recreio
    }
    
    setSelectedCell({ dia, ordem })
    const horarioExistente = getHorarioForCell(dia, ordem, periodoAtivo)
    setSelectedDisciplina(horarioExistente?.disciplinaId || '')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedCell(null)
    setSelectedDisciplina('')
  }

  const handleSaveDisciplina = async () => {
    if (!selectedCell || !selectedDisciplina || !periodoAtivo) return

    try {
      const disciplina = turmaSelecionada?.disciplinas?.find(d => d.id === selectedDisciplina)
      
      if (!disciplina) {
        alert('Disciplina não encontrada')
        return
      }

      const professorId = disciplina.professorId || disciplina.professor?.id
      
      if (!professorId) {
        alert('Esta disciplina não possui professor atribuído. Por favor, atribua um professor à disciplina antes de adicioná-la à grade.')
        return
      }

      const horarioPadrao = horariosPadrao[periodoAtivo].find(h => h.ordem === selectedCell.ordem)
      if (!horarioPadrao || horarioPadrao.isRecreiro) {
        alert('Não é possível adicionar disciplina neste horário')
        return
      }

      const novoHorario: HorarioAula = {
        diaSemana: selectedCell.dia as any,
        periodo: periodoAtivo,
        ordem: selectedCell.ordem,
        horaInicio: horarioPadrao.horaInicio,
        horaFim: horarioPadrao.horaFim,
        disciplinaId: selectedDisciplina,
        professorId: professorId,
      }

      // Atualizar grade completa
      const horariosAtualizados = gradeHoraria?.horarios_aula.filter(
        h => !(h.diaSemana === selectedCell.dia && h.ordem === selectedCell.ordem && h.periodo === periodoAtivo)
      ) || []

      horariosAtualizados.push(novoHorario)

      await api.put(`/grade-horaria/turma/${turmaId}`, {
        horarios: horariosAtualizados
      })

      setTimeout(() => loadGradeHoraria(), 500)
      closeModal()
    } catch (error: any) {
      console.error('Erro ao salvar horário:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao salvar horário'
      alert(`Erro ao salvar: ${errorMessage}`)
    }
  }

  const handleRemoveDisciplina = async (dia: string, ordem: number) => {
    if (!periodoAtivo || !window.confirm('Deseja remover esta disciplina?')) return

    try {
      const horariosAtualizados = gradeHoraria?.horarios_aula.filter(
        h => !(h.diaSemana === dia && h.ordem === ordem && h.periodo === periodoAtivo)
      ) || []

      await api.put(`/grade-horaria/turma/${turmaId}`, {
        horarios: horariosAtualizados
      })

      setTimeout(() => loadGradeHoraria(), 500)
    } catch (error) {
      console.error('Erro ao remover horário:', error)
    }
  }

  const turmasFiltradas = turmas
    .filter(t => {
      if (!nivelEnsino) return false
      // Converter ano para número para garantir compatibilidade
      const ano = typeof t.ano === 'string' ? parseInt(t.ano) : t.ano
      if (nivelEnsino === 'INICIAIS') return ano >= 1 && ano <= 5
      return ano >= 6 && ano <= 9
    })
    .sort((a, b) => {
      const anoA = typeof a.ano === 'string' ? parseInt(a.ano) : a.ano
      const anoB = typeof b.ano === 'string' ? parseInt(b.ano) : b.ano
      return anoA - anoB || a.nome.localeCompare(b.nome)
    })

  // Debug para celular
  useEffect(() => {
    if (nivelEnsino) {
      console.log('=== GRADE HORARIA DEBUG ===')
      console.log('nivelEnsino:', nivelEnsino)
      console.log('Total turmas:', turmas.length)
      console.log('Turmas:', turmas)
      console.log('turmasFiltradas:', turmasFiltradas.length)
      console.log('turmasFiltradas array:', turmasFiltradas)
    }
  }, [nivelEnsino, turmas])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Grade Horária</h1>
      </div>

      {/* Seleção de Nível de Ensino */}
      {!nivelEnsino && (
        <div className="selection-section">
          <div className="selection-header">
            <Calendar size={24} className="selection-icon" />
            <h2>Selecione a Categoria</h2>
          </div>
          <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '600px', margin: '0 auto' }}>
            <button
              className="selection-btn"
              onClick={() => setNivelEnsino('INICIAIS')}
            >
              <div className="selection-btn-content">
                <span className="selection-btn-title">Anos Iniciais</span>
              </div>
            </button>
            <button
              className="selection-btn"
              onClick={() => setNivelEnsino('FINAIS')}
            >
              <div className="selection-btn-content">
                <span className="selection-btn-title">Anos Finais</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Seleção de Turma */}
      {nivelEnsino && !turmaId && (
        <div className="selection-section">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-start', 
            alignItems: 'center',
            marginBottom: '16px',
            padding: '12px 0',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={24} className="selection-icon" />
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Selecione a Turma - {nivelEnsino === 'INICIAIS' ? 'Anos Iniciais' : 'Anos Finais'}
              </h2>
            </div>
          </div>
          <div className="selection-grid" style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '12px' 
          }}>
            {turmasFiltradas.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                <p>Nenhuma turma cadastrada para {nivelEnsino === 'INICIAIS' ? 'Anos Iniciais (1º ao 5º ano)' : 'Anos Finais (6º ao 9º ano)'}.</p>
              </div>
            ) : (
              turmasFiltradas.map(turma => (
                <button
                  key={turma.id}
                  className="selection-btn"
                  onClick={() => setTurmaId(turma.id)}
                  style={{ 
                    padding: '12px 16px',
                    minHeight: 'auto'
                  }}
                >
                  <div className="selection-btn-content">
                    <span className="selection-btn-title" style={{ fontSize: '0.875rem' }}>
                      {turma.nome}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Grade Horária */}
      {turmaId && !periodoAtivo && (
        <div className="empty-state">
          <Calendar size={64} />
          <h3>Turno não definido</h3>
          <p>Esta turma ({turmaSelecionada?.nome}) não possui um turno cadastrado.</p>
          <p>Por favor, edite a turma na aba "Turmas" e defina o turno (Manhã ou Tarde).</p>
        </div>
      )}

      {turmaId && periodoAtivo && (
        <div className="grade-container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px' 
          }}>
            <button
              className="selection-btn active"
              style={{
                cursor: 'default',
                padding: '12px 24px',
                minHeight: 'auto',
                minWidth: '180px'
              }}
            >
              <div className="selection-btn-content">
                <span className="selection-btn-title" style={{ fontSize: '0.95rem' }}>
                  {turmaSelecionada?.nome} - Turno {periodoAtivo === 'MANHA' ? 'da Manhã' : 'da Tarde'}
                </span>
              </div>
            </button>
          </div>

          {/* Versão Desktop - Tabela */}
          <div className="table-container desktop-only">
            <table className="grade-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  {diasLabel.map((dia, idx) => (
                    <th key={idx}>{dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horariosPadrao[periodoAtivo].map((horario) => (
                  <tr key={horario.ordem}>
                    <td className="horario-cell">
                      {horario.isRecreiro ? (
                        <strong>RECREIO</strong>
                      ) : (
                        <>{horario.horaInicio} - {horario.horaFim}</>
                      )}
                    </td>
                    {diasSemana.map((dia, idx) => {
                      if (horario.isRecreiro) {
                        return (
                          <td key={idx} className="recreio-cell" colSpan={1}>
                            Recreio
                          </td>
                        )
                      }
                      
                      const horarioAula = getHorarioForCell(dia, horario.ordem, periodoAtivo)
                      
                      return (
                        <td
                          key={idx}
                          className={`aula-cell ${horarioAula ? 'has-content' : ''}`}
                          onClick={() => openModalForCell(dia, horario.ordem)}
                        >
                          {horarioAula ? (
                            <div className="aula-info">
                              <strong>{horarioAula.disciplinas?.nome || 'Sem disciplina'}</strong>
                              <small>{horarioAula.professores?.nome || ''}</small>
                              <button
                                className="btn-remove"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveDisciplina(dia, horario.ordem)
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="aula-empty">
                              <Plus size={20} />
                              <span>Adicionar</span>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Versão Mobile - Cards por Dia */}
          <div className="mobile-grade-container mobile-only">
            {diasSemana.map((dia, diaIdx) => (
              <div key={dia} className="dia-card">
                <div className="dia-header">
                  <Calendar size={20} />
                  <h3>{diasLabel[diaIdx]}</h3>
                </div>
                <div className="horarios-list">
                  {horariosPadrao[periodoAtivo].map((horario) => {
                    if (horario.isRecreiro) {
                      return (
                        <div key={horario.ordem} className="horario-item recreio">
                          <div className="horario-info">
                            <span className="horario-label">RECREIO</span>
                          </div>
                        </div>
                      )
                    }

                    const horarioAula = getHorarioForCell(dia, horario.ordem, periodoAtivo)
                    
                    return (
                      <div 
                        key={horario.ordem} 
                        className={`horario-item ${horarioAula ? 'has-aula' : 'empty'}`}
                        onClick={() => openModalForCell(dia, horario.ordem)}
                      >
                        <div className="horario-info">
                          <span className="horario-label">
                            {horario.horaInicio} - {horario.horaFim}
                          </span>
                        </div>
                        <div className="aula-info-mobile">
                          {horarioAula ? (
                            <>
                              <div className="disciplina-nome">
                                {horarioAula.disciplinas?.nome || 'Sem disciplina'}
                              </div>
                              <div className="professor-nome">
                                {horarioAula.professores?.nome || ''}
                              </div>
                              <button
                                className="btn-remove-mobile"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveDisciplina(dia, horario.ordem)
                                }}
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <div className="add-aula">
                              <Plus size={18} />
                              <span>Adicionar Aula</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para seleção de disciplina */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Selecionar Disciplina</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Disciplina:</label>
                <select
                  value={selectedDisciplina}
                  onChange={(e) => setSelectedDisciplina(e.target.value)}
                  className="form-control"
                  autoFocus
                >
                  <option value="">Selecione uma disciplina</option>
                  {turmaSelecionada?.disciplinas?.map(disciplina => (
                    <option key={disciplina.id} value={disciplina.id}>
                      {disciplina.nome} - Prof. {disciplina.professor?.nome || 'Sem professor'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSaveDisciplina}
                disabled={!selectedDisciplina}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GradeHoraria
