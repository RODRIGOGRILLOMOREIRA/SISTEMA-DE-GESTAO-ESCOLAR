import { useEffect, useState } from 'react'
import { Save, X, Calendar, TrendingUp, ArrowLeft } from 'lucide-react'
import { api } from '../lib/api'
import { toast } from 'react-hot-toast'
import { TableSkeleton } from './skeletons'
import './RegistroFrequencia.css'
import '../components/Modal.css'
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
  const [forceUpdate, setForceUpdate] = useState(0) // Para forçar re-render
  const [frequenciasDoDia, setFrequenciasDoDia] = useState<any[]>([]) // Todas as frequências registradas no dia
  const [mostrarAulasDadas, setMostrarAulasDadas] = useState(false) // Controla visualização das aulas dadas

  const diasSemana = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO']

  useEffect(() => {
    loadTurmas()
  }, [])

  useEffect(() => {
    if (turmaId && periodoAtivo && dataSelecionada) {
      const timer = setTimeout(() => {
        console.log('🔄 useEffect disparado - carregando dados', { turmaId, periodoAtivo, dataSelecionada })
        loadNumeroAulasDoDia()
        loadFrequenciasDoDia()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [turmaId, periodoAtivo, dataSelecionada])

  useEffect(() => {
    if (turmaId && disciplinaSelecionada && numeroAulasPadrao > 0) {
      console.log('FREQUENCIA - useEffect loadRegistroExistente, numeroAulasPadrao:', numeroAulasPadrao)
      const timer = setTimeout(() => {
        loadRegistroExistente()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [turmaId, disciplinaSelecionada, numeroAulasPadrao, dataSelecionada, periodoAtivo])

  const handleSalvarRegistro = async () => {
    if (!turmaId || !disciplinaSelecionada || !dataSelecionada || !periodoAtivo) {
      toast.error('Preencha todos os campos necessários')
      return
    }

    const loadingToast = toast.loading('Salvando registro de frequência...')
    
    try {
      setLoading(true)

      const registroData = {
        turmaId,
        data: dataSelecionada,
        periodo: periodoAtivo,
        disciplinaId: disciplinaSelecionada,
        presencas,
      }

      console.log('💾 Salvando registro...')

      const response = await api.post('/registro-frequencia', registroData)
      
      console.log('✅ Registro salvo!')
      
      toast.success('Registro salvo com sucesso!', { id: loadingToast })
      
      // Recarregar as frequências do dia após salvar
      setTimeout(() => loadFrequenciasDoDia(), 500)
      
      // Limpar campos do formulário DEPOIS de recarregar
      setDisciplinaSelecionada('')
      setPresencas([])
      setMostrarAulasDadas(false)
      
    } catch (error: any) {
      console.error('Erro ao salvar registro:', error)
      toast.error(error.response?.data?.error || 'Erro ao salvar registro', { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  const loadTurmas = async () => {
    try {
      const response = await api.get('/turmas')
      console.log('FREQUENCIA - Turmas carregadas:', response.data.length, response.data)
      setTurmas(response.data)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
    }
  }

  const loadNumeroAulasDoDia = async () => {
    try {
      console.log('FREQUENCIA - loadNumeroAulasDoDia chamado')
      console.log('turmaId:', turmaId)
      console.log('periodoAtivo:', periodoAtivo)
      console.log('dataSelecionada:', dataSelecionada)
      
      const diaSemanaAtual = getDiaSemanaFromData(dataSelecionada)
      console.log('diaSemanaAtual:', diaSemanaAtual)
      
      const response = await api.get(`/grade-horaria/turma/${turmaId}`)
      console.log('Grade horária:', response.data)
      
      if (response.data) {
        const horariosDoDia = response.data.horarios_aula.filter(
          (h: HorarioAula) => 
            h.diaSemana === diaSemanaAtual && 
            h.periodo === periodoAtivo &&
            h.disciplinaId
        )
        console.log('Horários do dia filtrados:', horariosDoDia)
        
        // Contar aulas por disciplina
        const disciplinasMap = new Map<string, number>()
        horariosDoDia.forEach((h: HorarioAula) => {
          const count = disciplinasMap.get(h.disciplinaId!) || 0
          disciplinasMap.set(h.disciplinaId!, count + 1)
        })
        console.log('Disciplinas no dia:', Array.from(disciplinasMap.entries()))
        
        // Filtrar disciplinas da turma que têm aula neste dia
        const turma = turmas.find(t => t.id === turmaId)
        console.log('Turma encontrada:', turma)
        console.log('Disciplinas da turma:', turma?.disciplinas)
        
        const disciplinasDisponiveis = turma?.disciplinas?.filter(
          d => disciplinasMap.has(d.id)
        ) || []
        console.log('Disciplinas disponíveis:', disciplinasDisponiveis)
        
        setDisciplinasDoDia(disciplinasDisponiveis)
        
        // Se a disciplina selecionada não está disponível neste dia, limpar
        if (disciplinaSelecionada && !disciplinasMap.has(disciplinaSelecionada)) {
          setDisciplinaSelecionada('')
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
      const response = await api.get(
        `/registro-frequencia/dia/${turmaId}`,
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

  const loadFrequenciasDoDia = async () => {
    if (!turmaId || !dataSelecionada || !periodoAtivo) return

    const timestamp = new Date().toLocaleTimeString()
    try {
      console.log(`⏰ [${timestamp}] FREQUENCIA - Carregando todas frequências do dia`, {
        turmaId,
        data: dataSelecionada,
        periodo: periodoAtivo
      })
      const response = await api.get(
        `/registro-frequencia/turma/${turmaId}/dia`,
        {
          params: {
            data: dataSelecionada,
            periodo: periodoAtivo
          }
        }
      )
      console.log(`⏰ [${timestamp}] FREQUENCIA - Frequências do dia RECEBIDAS:`, {
        total: response.data?.length || 0,
        registros: response.data
      })
      setFrequenciasDoDia(response.data || [])
      
      // Log para debug
      if (response.data && response.data.length > 0) {
        console.log(`✅ [${timestamp}] Registros carregados:`, response.data.map((r: any) => ({
          id: r.id,
          disciplina: r.disciplina?.nome,
          numeroAulas: r.numeroAulas,
          totalPresencas: r.totalPresencas
        })))
      } else {
        console.log(`⚠️ [${timestamp}] Nenhum registro encontrado para este dia/período`)
      }
    } catch (error) {
      console.error(`❌ [${timestamp}] Erro ao carregar frequências do dia:`, error)
      setFrequenciasDoDia([])
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
      // Converter ano para número para garantir compatibilidade
      const ano = typeof t.ano === 'string' ? parseInt(t.ano) : t.ano
      if (nivelEnsino === 'INICIAIS') return ano >= 1 && ano <= 5
      if (nivelEnsino === 'FINAIS') return ano >= 6 && ano <= 9
      return false
    })
    .sort((a, b) => {
      const anoA = typeof a.ano === 'string' ? parseInt(a.ano) : a.ano
      const anoB = typeof b.ano === 'string' ? parseInt(b.ano) : b.ano
      return anoA - anoB || a.nome.localeCompare(b.nome)
    })

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const novoValor = Math.max(1, numeroAulasPadrao - 1)
                      setNumeroAulasPadrao(novoValor)
                      setForceUpdate(prev => prev + 1)
                      const turma = turmas.find(t => t.id === turmaId)
                      if (turma?.alunos) {
                        setPresencas(turma.alunos.map(aluno => ({
                          alunoId: aluno.id,
                          presencas: Array(novoValor).fill(true)
                        })))
                      }
                    }}
                    disabled={!disciplinaSelecionada || numeroAulasPadrao <= 1}
                    style={{
                      width: '40px',
                      height: '40px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      border: '2px solid var(--primary-color)',
                      borderRadius: '8px',
                      background: 'white',
                      color: 'var(--primary-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    −
                  </button>
                  <input
                    key={`aulas-${forceUpdate}`}
                    type="number"
                    min="1"
                    max="5"
                    value={numeroAulasPadrao}
                    onChange={(e) => {
                      let valor = parseInt(e.target.value)
                      if (isNaN(valor) || valor < 1) valor = 1
                      if (valor > 5) valor = 5
                      console.log('FREQUENCIA - Alterando número de aulas para:', valor)
                      setNumeroAulasPadrao(valor)
                      setForceUpdate(prev => prev + 1)
                      const turma = turmas.find(t => t.id === turmaId)
                      if (turma?.alunos) {
                        setPresencas(turma.alunos.map(aluno => ({
                          alunoId: aluno.id,
                          presencas: Array(valor).fill(true)
                        })))
                      }
                    }}
                    onBlur={(e) => {
                      let valor = parseInt(e.target.value)
                      if (isNaN(valor) || valor < 1) valor = 1
                      if (valor > 5) valor = 5
                      setNumeroAulasPadrao(valor)
                    }}
                    className="number-control"
                    disabled={!disciplinaSelecionada}
                    style={{ flex: 1, textAlign: 'center', fontSize: '16px' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const novoValor = Math.min(5, numeroAulasPadrao + 1)
                      setNumeroAulasPadrao(novoValor)
                      setForceUpdate(prev => prev + 1)
                      const turma = turmas.find(t => t.id === turmaId)
                      if (turma?.alunos) {
                        setPresencas(turma.alunos.map(aluno => ({
                          alunoId: aluno.id,
                          presencas: Array(novoValor).fill(true)
                        })))
                      }
                    }}
                    disabled={!disciplinaSelecionada || numeroAulasPadrao >= 5}
                    style={{
                      width: '40px',
                      height: '40px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      border: '2px solid var(--primary-color)',
                      borderRadius: '8px',
                      background: 'white',
                      color: 'var(--primary-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button className="btn-voltar" onClick={handleVoltar} style={{ marginTop: '8px' }}>
          <ArrowLeft size={16} />
          Voltar
        </button>
      </div>

      {/* VERSÃO DESKTOP - Tabela */}
      <div className="table-container desktop-only">
        {/* BOTÃO AMARELO PARA MOSTRAR AULAS DADAS - DESKTOP */}
        {frequenciasDoDia.length > 0 && (
          <button
            className="btn-aulas-dadas"
            onClick={() => setMostrarAulasDadas(!mostrarAulasDadas)}
            style={{
              width: '100%',
              padding: '16px',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            <span style={{ fontSize: '20px' }}>📚</span>
            <span>
              {mostrarAulasDadas ? 'OCULTAR' : 'VER'} AULAS DADAS 
              ({frequenciasDoDia.reduce((total, freq) => total + (freq.numeroAulas || 0), 0)} aulas registradas)
            </span>
            <span style={{ fontSize: '20px' }}>{mostrarAulasDadas ? '▲' : '▼'}</span>
          </button>
        )}

        {/* TABELA DE AULAS REGISTRADAS - DESKTOP */}
        {mostrarAulasDadas && frequenciasDoDia.length > 0 && turmaSelecionada?.alunos && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              marginBottom: '15px', 
              color: '#1f2937', 
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              📋 Aulas Registradas Hoje - {new Date(dataSelecionada).toLocaleDateString('pt-BR')}
            </h3>
            
            {frequenciasDoDia.map((freq, freqIndex) => (
              <div key={freqIndex} style={{
                background: '#f9fafb',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '15px',
                  alignItems: 'center'
                }}>
                  <span style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {freq.disciplina?.nome || 'Disciplina'}
                  </span>
                  <span style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {freq.disciplina?.professor?.nome || 'Professor'}
                  </span>
                  <span style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    📚 {freq.numeroAulas || 0} {freq.numeroAulas === 1 ? 'aula' : 'aulas'}
                  </span>
                </div>

                <table className="frequencia-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>Nº</th>
                      <th>Aluno</th>
                      {Array.from({ length: freq.numeroAulas || 1 }, (_, i) => (
                        <th key={i} style={{ width: '80px', textAlign: 'center' }}>
                          {i + 1}ª Aula
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {turmaSelecionada.alunos.map((aluno, alunoIndex) => {
                      const presencasAluno = freq.presenca_aluno?.filter((p: any) => p.alunoId === aluno.id) || []
                      
                      return (
                        <tr key={aluno.id}>
                          <td className="numero-cell">{alunoIndex + 1}</td>
                          <td className="aluno-nome">{aluno.nome}</td>
                          {Array.from({ length: freq.numeroAulas || 1 }, (_, aulaIdx) => {
                            const presencaNaAula = presencasAluno.find((p: any) => p.aulaIndex === aulaIdx)
                            const presente = presencaNaAula?.presente ?? true
                            
                            return (
                              <td key={aulaIdx} style={{ textAlign: 'center', padding: '8px' }}>
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                  <button
                                    className={`btn-presenca-mini ${presente ? 'active' : ''}`}
                                    onClick={async () => {
                                      try {
                                        await api.patch(`/registro-frequencia/${freq.id}/presenca`, {
                                          alunoId: aluno.id,
                                          aulaIndex: aulaIdx,
                                          presente: true
                                        })
                                        setTimeout(() => loadFrequenciasDoDia(), 500)
                                      } catch (error) {
                                        console.error('Erro ao atualizar presença:', error)
                                        alert('Erro ao atualizar presença')
                                      }
                                    }}
                                    title="Marcar presença"
                                  >
                                    P
                                  </button>
                                  <button
                                    className={`btn-falta-mini ${!presente ? 'active' : ''}`}
                                    onClick={async () => {
                                      try {
                                        await api.patch(`/registro-frequencia/${freq.id}/presenca`, {
                                          alunoId: aluno.id,
                                          aulaIndex: aulaIdx,
                                          presente: false
                                        })
                                        setTimeout(() => loadFrequenciasDoDia(), 500)
                                      } catch (error) {
                                        console.error('Erro ao atualizar presença:', error)
                                        alert('Erro ao atualizar presença')
                                      }
                                    }}
                                    title="Marcar falta"
                                  >
                                    F
                                  </button>
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* TABELA DE NOVO REGISTRO - DESKTOP */}
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

      {/* VERSÃO MOBILE - Cards por aluno */}
      <div className="mobile-frequencia-container mobile-only">
        {/* NOVO REGISTRO - FORMULÁRIO SEMPRE NO TOPO */}
        {disciplinaSelecionada && turmaSelecionada?.alunos && (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '12px 12px 0 0',
              marginTop: '10px',
              fontWeight: '700',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>✏️</span>
              <span>Registrando: {disciplinasDoDia.find(d => d.id === disciplinaSelecionada)?.nome}</span>
            </div>
            {turmaSelecionada.alunos.map((aluno, index) => {
              const presencaAluno = presencas.find(p => p.alunoId === aluno.id)
              return (
                <div key={aluno.id} className="aluno-card-mobile">
                  <div className="aluno-card-header">
                    <span className="aluno-numero">{index + 1}</span>
                    <span className="aluno-nome-mobile">{aluno.nome}</span>
                  </div>
                  
                  <div className="aulas-grid-mobile">
                    {Array.from({ length: numeroAulasPadrao }, (_, aulaIndex) => (
                      <div key={aulaIndex} className="aula-item-mobile">
                        <div className="aula-label">{aulaIndex + 1}ª Aula</div>
                        <div className="aula-buttons">
                          <button
                            className={`btn-mobile-presenca ${presencaAluno?.presencas[aulaIndex] ? 'active' : ''}`}
                            onClick={() => handlePresencaAulaChange(aluno.id, aulaIndex, true)}
                          >
                            ✓ Presente
                          </button>
                          <button
                            className={`btn-mobile-falta ${!presencaAluno?.presencas[aulaIndex] ? 'active' : ''}`}
                            onClick={() => handlePresencaAulaChange(aluno.id, aulaIndex, false)}
                          >
                            ✗ Falta
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="actions-container-mobile">
              <button
                className="btn-salvar-mobile"
                onClick={handleSalvarRegistro}
                disabled={loading}
              >
                <Save size={20} />
                {loading ? 'Salvando...' : 'Salvar Registro'}
              </button>
            </div>
          </>
        )}

        {!disciplinaSelecionada && frequenciasDoDia.length === 0 && (
          <div className="selecione-disciplina-mobile">
            <p>👆 Selecione uma disciplina acima para registrar frequência</p>
          </div>
        )}

        {/* BOTÃO AMARELO PARA MOSTRAR AULAS DADAS - SÓ APARECE QUANDO TEM REGISTROS */}
        {frequenciasDoDia.length > 0 && (
          <button
            className="btn-aulas-dadas"
            onClick={() => setMostrarAulasDadas(!mostrarAulasDadas)}
            style={{
              width: '100%',
              padding: '16px',
              marginTop: disciplinaSelecionada ? '20px' : '10px',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            <span style={{ fontSize: '20px' }}>📚</span>
            <span>
              {mostrarAulasDadas ? 'OCULTAR' : 'VER'} AULAS DADAS 
              ({frequenciasDoDia.reduce((total, freq) => total + (freq.numeroAulas || 0), 0)} aulas)
            </span>
            <span style={{ fontSize: '20px' }}>{mostrarAulasDadas ? '▲' : '▼'}</span>
          </button>
        )}

        {/* FREQUÊNCIAS JÁ REGISTRADAS DO DIA - EDITÁVEIS (SÓ APARECE AO CLICAR NO BOTÃO) */}
        {mostrarAulasDadas && frequenciasDoDia.length > 0 && turmaSelecionada?.alunos && (
          <div className="frequencias-salvas-mobile" style={{
            background: '#f9fafb',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              color: '#1f2937',
              fontSize: '16px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📋</span>
              <span>Aulas Registradas - {new Date(dataSelecionada).toLocaleDateString('pt-BR')}</span>
            </h3>
            
            {frequenciasDoDia.map((freq, freqIndex) => (
              <div key={freqIndex} className="frequencia-editavel-card">
                <div className="frequencia-salva-header">
                  <span className="disciplina-badge">{freq.disciplina?.nome || 'Disciplina'}</span>
                  <span className="professor-badge">{freq.disciplina?.professor?.nome || 'Professor'}</span>
                  <span className="aulas-badge">📚 {freq.numeroAulas || 0} {freq.numeroAulas === 1 ? 'aula' : 'aulas'}</span>
                </div>

                {/* Lista de alunos para esta disciplina */}
                {turmaSelecionada.alunos.map((aluno, alunoIndex) => {
                  // Buscar presenças deste aluno para esta frequência
                  const presencasAluno = freq.presenca_aluno?.filter((p: any) => p.alunoId === aluno.id) || []
                  
                  return (
                    <div key={aluno.id} className="aluno-mini-card">
                      <div className="aluno-mini-header">
                        <span className="aluno-mini-numero">{alunoIndex + 1}</span>
                        <span className="aluno-mini-nome">{aluno.nome}</span>
                      </div>
                      
                      <div className="aulas-mini-grid">
                        {Array.from({ length: freq.numeroAulas || 1 }, (_, aulaIdx) => {
                          const presencaNaAula = presencasAluno.find((p: any) => p.aulaIndex === aulaIdx)
                          const presente = presencaNaAula?.presente ?? true
                          
                          return (
                            <div key={aulaIdx} className="aula-mini-item">
                              <span className="aula-mini-label">{aulaIdx + 1}ª</span>
                              <div className="aula-mini-buttons">
                                <button
                                  className={`btn-mini-p ${presente ? 'active' : ''}`}
                                  onClick={async () => {
                                    // Atualizar presença via API
                                    try {
                                      await api.patch(`/registro-frequencia/${freq.id}/presenca`, {
                                        alunoId: aluno.id,
                                        aulaIndex: aulaIdx,
                                        presente: true
                                      })
                                      setTimeout(() => loadFrequenciasDoDia(), 500)
                                    } catch (error) {
                                      console.error('Erro ao atualizar presença:', error)
                                      alert('Erro ao atualizar presença')
                                    }
                                  }}
                                  title="Marcar presença"
                                >
                                  ✓
                                </button>
                                <button
                                  className={`btn-mini-f ${!presente ? 'active' : ''}`}
                                  onClick={async () => {
                                    // Atualizar presença via API
                                    try {
                                      await api.patch(`/registro-frequencia/${freq.id}/presenca`, {
                                        alunoId: aluno.id,
                                        aulaIndex: aulaIdx,
                                        presente: false
                                      })
                                      setTimeout(() => loadFrequenciasDoDia(), 500)
                                    } catch (error) {
                                      console.error('Erro ao atualizar presença:', error)
                                      alert('Erro ao atualizar presença')
                                    }
                                  }}
                                  title="Marcar falta"
                                >
                                  ✗
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {!disciplinaSelecionada && frequenciasDoDia.length === 0 && (
          <div className="selecione-disciplina-mobile">
            <p>👆 Selecione uma disciplina acima para registrar frequência</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegistroFrequencia
