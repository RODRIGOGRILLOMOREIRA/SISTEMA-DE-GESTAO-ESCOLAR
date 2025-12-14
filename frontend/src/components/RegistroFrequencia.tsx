import { useEffect, useState } from 'react'
import { Save, X, Calendar, TrendingUp, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import './RegistroFrequencia.css'
import '../pages/CommonPages.css'

interface Aluno {
  id: string
  nome: string
  matricula: string
}

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
  alunos?: Aluno[]
  disciplinas?: Disciplina[]
}

interface PresencaRegistro {
  alunoId: string
  presencas: boolean[] // Array de presenças por aula [aula1, aula2, aula3...]
}

interface HorarioAula {
  id: string
  diaSemana: 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO'
  periodo: 'MANHA' | 'TARDE'
  ordem: number
  disciplinaId?: string
}

const API_URL = 'http://localhost:3333/api'

type NivelEnsino = 'INICIAIS' | 'FINAIS' | null
type Periodo = 'MANHA' | 'TARDE' | null

const RegistroFrequencia = () => {
  const [nivelEnsino, setNivelEnsino] = useState<NivelEnsino>(null)
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turmaId, setTurmaId] = useState<string>('')
  const [periodoAtivo, setPeriodoAtivo] = useState<Periodo>(null)
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<string>('')
  const [dataSelecionada, setDataSelecionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [presencas, setPresencas] = useState<PresencaRegistro[]>([])
  const [numeroAulasPadrao, setNumeroAulasPadrao] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [disciplinasDoDia, setDisciplinasDoDia] = useState<Disciplina[]>([])

  const diasSemana = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO']

  useEffect(() => {
    loadTurmas()
  }, [])

  useEffect(() => {
    if (turmaId && periodoAtivo && dataSelecionada) {
      loadNumeroAulasDoDia()
    }
  }, [turmaId, periodoAtivo, dataSelecionada])

  useEffect(() => {
    if (turmaId && disciplinaSelecionada && numeroAulasPadrao > 0) {
      loadRegistroExistente()
    }
  }, [turmaId, disciplinaSelecionada, numeroAulasPadrao, dataSelecionada, periodoAtivo])

  // Recarregar dashboard após salvar registro
  const handleSalvarRegistro = async () => {
    if (!turmaId || !disciplinaSelecionada || !dataSelecionada || !periodoAtivo) {
      alert('Preencha todos os campos necessários')
      return
    }

    try {
      setLoading(true)

      const registroData = {
        turmaId,
        data: dataSelecionada,
        periodo: periodoAtivo,
        disciplinaId: disciplinaSelecionada,
        presencas,
      }

      await axios.post(`${API_URL}/registro-frequencia`, registroData)
      
      alert('Registro salvo com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar registro:', error)
      alert(error.response?.data?.error || 'Erro ao salvar registro')
    } finally {
      setLoading(false)
    }
  }

  const loadTurmas = async () => {
    try {
      const response = await axios.get(`${API_URL}/turmas`)
      setTurmas(response.data)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
    }
  }

  const loadNumeroAulasDoDia = async () => {
    try {
      const diaSemanaAtual = getDiaSemanaFromData(dataSelecionada)
      const response = await axios.get(`${API_URL}/grade-horaria/turma/${turmaId}`)
      
      if (response.data) {
        const horariosDoDia = response.data.horarios_aula.filter(
          (h: HorarioAula) => 
            h.diaSemana === diaSemanaAtual && 
            h.periodo === periodoAtivo &&
            h.disciplinaId
        )
        
        // Contar aulas por disciplina
        const disciplinasMap = new Map<string, number>()
        horariosDoDia.forEach((h: HorarioAula) => {
          const count = disciplinasMap.get(h.disciplinaId!) || 0
          disciplinasMap.set(h.disciplinaId!, count + 1)
        })
        
        // Filtrar disciplinas da turma que têm aula neste dia
        const turma = turmas.find(t => t.id === turmaId)
        const disciplinasDisponiveis = turma?.disciplinas?.filter(
          d => disciplinasMap.has(d.id)
        ) || []
        
        setDisciplinasDoDia(disciplinasDisponiveis)
        
        // Se a disciplina selecionada não está disponível neste dia, limpar
        if (disciplinaSelecionada && !disciplinasMap.has(disciplinaSelecionada)) {
          setDisciplinaSelecionada('')
        }
        
        // Definir número de aulas da disciplina selecionada
        if (disciplinaSelecionada) {
          const numAulas = disciplinasMap.get(disciplinaSelecionada) || 1
          setNumeroAulasPadrao(Math.min(numAulas, 5))
        } else {
          setNumeroAulasPadrao(1)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar grade horária:', error)
      setNumeroAulasPadrao(1)
      setDisciplinasDoDia([])
    }
  }

  const getDiaSemanaFromData = (data: string): string => {
    const date = new Date(data + 'T12:00:00')
    const dia = date.getDay()
    const mapping: { [key: number]: string } = {
      1: 'SEGUNDA',
      2: 'TERCA',
      3: 'QUARTA',
      4: 'QUINTA',
      5: 'SEXTA',
      6: 'SABADO',
      0: 'SEGUNDA'
    }
    return mapping[dia] || 'SEGUNDA'
  }

  const initPresencas = () => {
    const turma = turmas.find(t => t.id === turmaId)
    if (turma?.alunos) {
      const presencasIniciais = turma.alunos.map(aluno => ({
        alunoId: aluno.id,
        presencas: Array(numeroAulasPadrao).fill(true) // Todas presenças inicialmente
      }))
      setPresencas(presencasIniciais)
    }
  }

  const loadRegistroExistente = async () => {
    if (!turmaId || !disciplinaSelecionada || !dataSelecionada || !periodoAtivo) {
      initPresencas()
      return
    }

    try {
      const response = await axios.get(
        `${API_URL}/registro-frequencia/dia/${turmaId}`,
        {
          params: {
            data: dataSelecionada,
            periodo: periodoAtivo,
            disciplinaId: disciplinaSelecionada
          }
        }
      )

      if (response.data && response.data.presenca_aluno) {
        // Carregar presenças existentes
        const turma = turmas.find(t => t.id === turmaId)
        if (turma?.alunos) {
          const presencasCarregadas = turma.alunos.map(aluno => {
            // Buscar todas as presenças deste aluno neste registro
            const presencasAluno = response.data.presenca_aluno.filter(
              (p: any) => p.alunoId === aluno.id
            )
            
            // Criar array de presenças por aula
            const presencasPorAula = Array(numeroAulasPadrao).fill(true)
            presencasAluno.forEach((p: any) => {
              if (p.aulaIndex < numeroAulasPadrao) {
                presencasPorAula[p.aulaIndex] = p.presente
              }
            })
            
            return {
              alunoId: aluno.id,
              presencas: presencasPorAula
            }
          })
          setPresencas(presencasCarregadas)
        }
      } else {
        // Não há registro existente, inicializar com todas presenças
        initPresencas()
      }
    } catch (error) {
      console.error('Erro ao carregar registro existente:', error)
      initPresencas()
    }
  }

  const handlePresencaAulaChange = (alunoId: string, aulaIndex: number, presente: boolean) => {
    setPresencas(prev =>
      prev.map(p => {
        if (p.alunoId === alunoId) {
          const novasPresencas = [...p.presencas]
          novasPresencas[aulaIndex] = presente
          return { ...p, presencas: novasPresencas }
        }
        return p
      })
    )
  }

  const handleVoltar = () => {
    if (periodoAtivo) {
      setPeriodoAtivo(null)
      setVisualizacao('dia')
    } else if (turmaId) {
      setTurmaId('')
    } else if (nivelEnsino) {
      setNivelEnsino(null)
    }
  }

  const turmasFiltradas = turmas
    .filter(t => {
      if (nivelEnsino === 'INICIAIS') return t.ano >= 1 && t.ano <= 5
      if (nivelEnsino === 'FINAIS') return t.ano >= 6 && t.ano <= 9
      return false
    })
    .sort((a, b) => a.ano - b.ano || a.nome.localeCompare(b.nome))

  const turmaSelecionada = turmas.find(t => t.id === turmaId)

  // Nível 1: Seleção Anos Iniciais/Finais
  if (!nivelEnsino) {
    return (
      <div className="frequencia-container">
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
      </div>
    )
  }

  // Nível 2: Seleção de Turma
  if (!turmaId) {
    return (
      <div className="frequencia-container">
        <div className="selection-section">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
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
            <button className="btn-voltar" onClick={handleVoltar}>
              <ArrowLeft size={16} />
              Voltar
            </button>
          </div>
          <div className="selection-grid" style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '12px' 
          }}>
            {turmasFiltradas.map(turma => (
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
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Nível 3: Seleção de Período
  if (!periodoAtivo) {
    return (
      <div className="frequencia-container">
        <div className="grade-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button className="selection-btn" style={{ margin: '0' }}>
            <div className="selection-btn-content">
              <span className="selection-btn-title">
                {turmaSelecionada?.ano}º ANO
              </span>
            </div>
          </button>

          <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <button
              className="selection-btn"
              onClick={() => setPeriodoAtivo('MANHA')}
              style={{ padding: '12px 16px', minHeight: 'auto' }}
            >
              <div className="selection-btn-content">
                <span className="selection-btn-title" style={{ fontSize: '0.875rem' }}>
                  Turno da Manhã
                </span>
              </div>
            </button>
            <button
              className="selection-btn"
              onClick={() => setPeriodoAtivo('TARDE')}
              style={{ padding: '12px 16px', minHeight: 'auto' }}
            >
              <div className="selection-btn-content">
                <span className="selection-btn-title" style={{ fontSize: '0.875rem' }}>
                  Turno da Tarde
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Nível 4: Registro de Frequência
  return (
    <div className="frequencia-container">
      <div className="frequencia-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2>{turmaSelecionada?.ano}º ANO - {periodoAtivo === 'MANHA' ? 'Manhã' : 'Tarde'}</h2>
        
          <div className="info-section">
            <div className="info-cards">
              <div className="info-card">
                <label>Data</label>
                <input
                  type="date"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  className="date-control"
                />
              </div>

              <div className="info-card">
                <label>Disciplina</label>
                <select
                  value={disciplinaSelecionada}
                  onChange={(e) => setDisciplinaSelecionada(e.target.value)}
                  className="select-control"
                >
                  <option value="">Selecione a disciplina</option>
                  {disciplinasDoDia.map(disc => (
                    <option key={disc.id} value={disc.id}>
                      {disc.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="info-card">
                <label>Professor</label>
                <div className="info-value">
                  {disciplinaSelecionada 
                    ? turmaSelecionada?.disciplinas?.find(d => d.id === disciplinaSelecionada)?.professor?.nome || 'Sem professor'
                    : '-'}
                </div>
              </div>

              <div className="info-card">
                <label>Nº Aulas</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={numeroAulasPadrao}
                  onChange={(e) => {
                    const valor = Math.min(5, Math.max(1, parseInt(e.target.value) || 1))
                    setNumeroAulasPadrao(valor)
                  }}
                  className="number-control"
                  disabled={!disciplinaSelecionada}
                />
              </div>
            </div>
          </div>
        </div>
        <button className="btn-voltar" onClick={handleVoltar} style={{ marginTop: '8px' }}>
          <ArrowLeft size={16} />
          Voltar
        </button>
      </div>

      <div className="table-container">
        <table className="frequencia-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Nº</th>
              <th>Aluno</th>
              <th colSpan={numeroAulasPadrao} style={{ textAlign: 'center' }}>
                Presenças ({numeroAulasPadrao} {numeroAulasPadrao === 1 ? 'aula' : 'aulas'})
              </th>
              <th colSpan={numeroAulasPadrao} style={{ textAlign: 'center' }}>
                Faltas ({numeroAulasPadrao} {numeroAulasPadrao === 1 ? 'aula' : 'aulas'})
              </th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              {Array.from({ length: numeroAulasPadrao }, (_, i) => (
                <th key={`p-${i}`} style={{ width: '60px' }}>{i + 1}ª</th>
              ))}
              {Array.from({ length: numeroAulasPadrao }, (_, i) => (
                <th key={`f-${i}`} style={{ width: '60px' }}>{i + 1}ª</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {turmaSelecionada?.alunos?.map((aluno, index) => {
              const presencaAluno = presencas.find(p => p.alunoId === aluno.id)
              return (
                <tr key={aluno.id}>
                  <td className="numero-cell">{index + 1}</td>
                  <td className="aluno-nome">{aluno.nome}</td>
                  
                  {/* Botões de Presença para cada aula */}
                  {Array.from({ length: numeroAulasPadrao }, (_, aulaIndex) => (
                    <td key={`p-${aulaIndex}`} className="presenca-cell">
                      <button
                        className={`btn-presenca-mini ${presencaAluno?.presencas[aulaIndex] ? 'active' : ''}`}
                        onClick={() => handlePresencaAulaChange(aluno.id, aulaIndex, true)}
                        title={`Marcar presença na ${aulaIndex + 1}ª aula`}
                      >
                        P
                      </button>
                    </td>
                  ))}
                  
                  {/* Botões de Falta para cada aula */}
                  {Array.from({ length: numeroAulasPadrao }, (_, aulaIndex) => (
                    <td key={`f-${aulaIndex}`} className="falta-cell">
                      <button
                        className={`btn-falta-mini ${!presencaAluno?.presencas[aulaIndex] ? 'active' : ''}`}
                        onClick={() => handlePresencaAulaChange(aluno.id, aulaIndex, false)}
                        title={`Marcar falta na ${aulaIndex + 1}ª aula`}
                      >
                        F
                      </button>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="actions-container">
          <button
            className="btn-salvar"
            onClick={handleSalvarRegistro}
            disabled={loading}
          >
            <Save size={20} />
            {loading ? 'Salvando...' : 'Salvar Registro'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegistroFrequencia
