import { useState, useEffect } from 'react'
import { Calendar, BookOpen, TrendingUp, Award } from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { turmasAPI, registroFrequenciaAPI, notasAPI, alunosAPI, api, Turma as TurmaAPI } from '../lib/api'
import './ModernPages.css'
import './Relatorios.css'

interface Turma {
  id: string
  nome: string
  ano: string
  periodo: string
  anoNumerico?: number // Adicionado para facilitar ordenação
}

interface FrequenciaStats {
  totalAulas: number
  totalPresencas: number
  totalFaltas: number
  percentualPresenca: number
  percentualFalta: number
}

interface FrequenciaAluno {
  alunoId: string
  alunoNome: string
  totalAulas: number
  presencas: number
  faltas: number
  percentualPresenca: number
}

interface NotasStats {
  media: number
  aprovados: number
  reprovados: number
  recuperacao: number
  percentualAprovacao: number
}

interface NotaAluno {
  alunoId: string
  alunoNome: string
  trim1?: number
  trim2?: number
  trim3?: number
  mediaFinal: number
  situacao: 'Aprovado' | 'Recuperação' | 'Reprovado'
}

type TipoRelatorio = 'frequencia' | 'notas'
type Segmento = 'iniciais' | 'finais'
type PeriodoFrequencia = 'dia' | 'mes' | 'trimestre' | 'ano'
type PeriodoNotas = 'trim1' | 'trim2' | 'trim3' | 'final'

const Relatorios = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>('frequencia')
  const [segmento, setSegmento] = useState<Segmento>('iniciais')
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null)
  const [periodoFrequencia, setPeriodoFrequencia] = useState<PeriodoFrequencia>('mes')
  const [periodoNotas, setPeriodoNotas] = useState<PeriodoNotas>('trim1')
  const [loading, setLoading] = useState(false)
  const [frequenciaStats, setFrequenciaStats] = useState<FrequenciaStats | null>(null)
  const [notasStats, setNotasStats] = useState<NotasStats | null>(null)
  const [frequenciaAlunos, setFrequenciaAlunos] = useState<FrequenciaAluno[]>([])
  const [notasAlunos, setNotasAlunos] = useState<NotaAluno[]>([])
  const [buscaAluno, setBuscaAluno] = useState('')
  const [alunoSelecionado, setAlunoSelecionado] = useState<string | null>(null)
  const [anoLetivo, setAnoLetivo] = useState<number>(new Date().getFullYear())
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([])
  const [dataInicioCustom, setDataInicioCustom] = useState('')
  const [dataFimCustom, setDataFimCustom] = useState('')
  const [usarDataCustom, setUsarDataCustom] = useState(false)

  useEffect(() => {
    loadTurmas()
    loadAnosDisponiveis()
  }, [segmento])

  useEffect(() => {
    if (turmaSelecionada) {
      console.log('📊 Turma selecionada mudou:', {
        nome: turmaSelecionada.nome,
        ano: turmaSelecionada.ano,
        anoNumerico: turmaSelecionada.anoNumerico,
        tipoRelatorio,
        periodo: tipoRelatorio === 'notas' ? periodoNotas : periodoFrequencia
      })
      
      if (tipoRelatorio === 'frequencia') {
        loadFrequenciaData()
      } else {
        loadNotasData()
      }
    }
  }, [turmaSelecionada, tipoRelatorio, periodoFrequencia, periodoNotas, anoLetivo, dataInicioCustom, dataFimCustom, usarDataCustom])

  const loadAnosDisponiveis = async () => {
    try {
      const response = await api.get('/calendario')
      const anos = response.data.map((cal: any) => cal.ano)
      setAnosDisponiveis(anos)
      if (anos.length > 0 && !anos.includes(anoLetivo)) {
        setAnoLetivo(anos[0])
      }
    } catch (error) {
      console.error('Erro ao carregar anos do calendário:', error)
      setAnosDisponiveis([new Date().getFullYear()])
    }
  }

  const loadTurmas = async () => {
    try {
      setLoading(true)
      const response = await turmasAPI.getAll()
      
      console.log('📊 Turmas recebidas do backend:', response.data.map((t: TurmaAPI) => ({
        nome: t.nome,
        ano: t.ano,
        periodo: t.periodo
      })))
      
      // Filtrar turmas por segmento
      const turmasFiltradas = response.data.filter((t: TurmaAPI) => {
        const ano = parseInt(t.ano?.toString() || '0')
        if (segmento === 'iniciais') {
          return ano >= 1 && ano <= 5
        } else {
          return ano >= 6 && ano <= 9
        }
      }).map((t: TurmaAPI) => ({
        id: t.id,
        nome: t.nome,
        ano: t.ano?.toString() || '0',
        periodo: t.periodo,
        anoNumerico: parseInt(t.ano?.toString() || '0') // Adicionar para facilitar ordenação
      }))
      .sort((a, b) => {
        // Ordenar por ano (numérico) em ordem crescente
        const anoA = a.anoNumerico
        const anoB = b.anoNumerico
        if (anoA !== anoB) return anoA - anoB
        // Se o ano for igual, ordenar por nome (ex: 6A, 6B)
        return a.nome.localeCompare(b.nome)
      })
      
      console.log('📊 Turmas filtradas e ordenadas:', turmasFiltradas.map(t => ({
        nome: t.nome,
        ano: t.ano,
        periodo: t.periodo
      })))
      
      setTurmas(turmasFiltradas)
      setTurmaSelecionada(null)
    } catch (error) {
      console.error('❌ Erro ao carregar turmas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFrequenciaData = async () => {
    if (!turmaSelecionada) return

    try {
      setLoading(true)

      // Primeiro, buscar todos os alunos da turma
      const alunosResponse = await alunosAPI.getByTurma(turmaSelecionada.id)
      const todosAlunos = alunosResponse.data

      // Calcular datas baseado no período
      const hoje = new Date()
      let dataInicio: Date
      let dataFim: Date

      if (usarDataCustom && dataInicioCustom && dataFimCustom) {
        // Usar datas personalizadas
        dataInicio = new Date(dataInicioCustom)
        dataFim = new Date(dataFimCustom)
      } else {
        // Usar período selecionado baseado no ano letivo
        switch (periodoFrequencia) {
          case 'dia':
            dataInicio = hoje
            dataFim = hoje
            break
          case 'mes':
            dataInicio = new Date(anoLetivo, hoje.getMonth(), 1)
            dataFim = new Date(anoLetivo, hoje.getMonth() + 1, 0)
            break
          case 'trimestre':
            const trimestreAtual = Math.floor(hoje.getMonth() / 3)
            dataInicio = new Date(anoLetivo, trimestreAtual * 3, 1)
            dataFim = new Date(anoLetivo, (trimestreAtual + 1) * 3, 0)
            break
          case 'ano':
            // Buscar datas do calendário escolar
            try {
              const calendarioResponse = await api.get(`/calendario/ano/${anoLetivo}`)
              const eventos = calendarioResponse.data.eventos_calendario
              const inicioAno = eventos.find((e: any) => e.tipo === 'INICIO_ANO_LETIVO')
              const fimAno = eventos.find((e: any) => e.tipo === 'FIM_ANO_LETIVO')
              
              if (inicioAno && fimAno) {
                dataInicio = new Date(inicioAno.dataInicio)
                dataFim = new Date(fimAno.dataFim || fimAno.dataInicio)
              } else {
                dataInicio = new Date(anoLetivo, 0, 1)
                dataFim = new Date(anoLetivo, 11, 31)
              }
            } catch {
              dataInicio = new Date(anoLetivo, 0, 1)
              dataFim = new Date(anoLetivo, 11, 31)
            }
            break
          default:
            dataInicio = hoje
            dataFim = hoje
        }
      }

      const response = await registroFrequenciaAPI.getByTurmaAndPeriodo(
        turmaSelecionada.id,
        dataInicio.toISOString().split('T')[0],
        dataFim.toISOString().split('T')[0]
      )

      // Inicializar mapa com todos os alunos da turma
      const alunosMap = new Map<string, FrequenciaAluno>()
      todosAlunos.forEach((aluno: any) => {
        alunosMap.set(aluno.id, {
          alunoId: aluno.id,
          alunoNome: aluno.nome,
          totalAulas: 0,
          presencas: 0,
          faltas: 0,
          percentualPresenca: 0
        })
      })

      // Calcular estatísticas gerais e por aluno
      let totalPresencas = 0
      let totalFaltas = 0
      let totalAulas = 0

      console.log('📊 Processando dados de frequência', {
        registros: response.data.length,
        amostra: response.data[0] ? {
          data: response.data[0].data,
          presenca_aluno: response.data[0].presenca_aluno?.length
        } : null
      })

      response.data.forEach((registro: any) => {
        // Verificar se existe presenca_aluno (nome correto do relacionamento)
        const presencas = registro.presenca_aluno || registro.presencas || []
        
        if (presencas && Array.isArray(presencas)) {
          presencas.forEach((presenca: any) => {
            totalAulas++
            if (presenca.presente) {
              totalPresencas++
            } else {
              totalFaltas++
            }

            // Atualizar dados do aluno
            const alunoId = presenca.alunoId
            
            if (alunosMap.has(alunoId)) {
              const alunoData = alunosMap.get(alunoId)!
              alunoData.totalAulas++
              if (presenca.presente) {
                alunoData.presencas++
              } else {
                alunoData.faltas++
              }
            }
          })
        }
      })

      // Calcular percentuais por aluno
      const alunosArray = Array.from(alunosMap.values()).map(aluno => ({
        ...aluno,
        percentualPresenca: aluno.totalAulas > 0 
          ? (aluno.presencas / aluno.totalAulas) * 100 
          : 0
      })).sort((a, b) => a.alunoNome.localeCompare(b.alunoNome))

      const percentualPresenca = totalAulas > 0 ? (totalPresencas / totalAulas) * 100 : 0
      const percentualFalta = totalAulas > 0 ? (totalFaltas / totalAulas) * 100 : 0

      setFrequenciaStats({
        totalAulas,
        totalPresencas,
        totalFaltas,
        percentualPresenca,
        percentualFalta
      })
      setFrequenciaAlunos(alunosArray)
    } catch (error) {
      console.error('Erro ao carregar dados de frequência:', error)
      setFrequenciaStats(null)
    } finally {
      setLoading(false)
    }
  }

  const loadNotasData = async () => {
    if (!turmaSelecionada) return

    try {
      setLoading(true)
      
      console.log('📊 Carregando notas', {
        turma: turmaSelecionada.nome,
        turmaId: turmaSelecionada.id,
        periodoSelecionado: periodoNotas
      })
      
      // Primeiro, buscar todos os alunos da turma
      const alunosResponse = await alunosAPI.getByTurma(turmaSelecionada.id)
      const todosAlunos = alunosResponse.data

      console.log('📊 Alunos encontrados', {
        total: todosAlunos.length,
        alunos: todosAlunos.map((a: any) => a.nome)
      })

      const response = await notasAPI.getByTurma(turmaSelecionada.id, anoLetivo)
      
      console.log('📊 Notas recebidas do backend', {
        anoLetivo,
        totalNotas: response.data.length,
        notasPorPeriodo: {
          trim1: response.data.filter((n: any) => n.periodo === 'trim1').length,
          trim2: response.data.filter((n: any) => n.periodo === 'trim2').length,
          trim3: response.data.filter((n: any) => n.periodo === 'trim3').length,
          final: response.data.filter((n: any) => n.periodo === 'final').length
        },
        amostra: response.data.length > 0 ? {
          alunoId: (response.data[0] as any).alunoId,
          periodo: (response.data[0] as any).periodo,
          valor: (response.data[0] as any).valor
        } : null
      })
      
      // Inicializar mapa com todos os alunos da turma
      const alunosMap = new Map<string, NotaAluno>()
      todosAlunos.forEach((aluno: any) => {
        alunosMap.set(aluno.id, {
          alunoId: aluno.id,
          alunoNome: aluno.nome,
          trim1: undefined,
          trim2: undefined,
          trim3: undefined,
          mediaFinal: 0,
          situacao: 'Reprovado'
        })
      })

      const todasNotas = response.data

      todasNotas.forEach((nota: any) => {
        const alunoId = nota.alunoId
        
        if (alunosMap.has(alunoId)) {
          const alunoData = alunosMap.get(alunoId)!
          const valor = parseFloat(nota.valor || 0)

          if (nota.periodo === 'trim1') alunoData.trim1 = valor
          else if (nota.periodo === 'trim2') alunoData.trim2 = valor
          else if (nota.periodo === 'trim3') alunoData.trim3 = valor
          else if (nota.periodo === 'final') alunoData.mediaFinal = valor
        }
      })

      console.log('📊 Mapa de alunos após processar notas', {
        totalAlunos: alunosMap.size,
        alunosComNotas: Array.from(alunosMap.values()).filter(a => 
          a.trim1 !== undefined || a.trim2 !== undefined || a.trim3 !== undefined || a.mediaFinal > 0
        ).length,
        amostra: Array.from(alunosMap.values()).slice(0, 2).map(a => ({
          nome: a.alunoNome,
          trim1: a.trim1,
          trim2: a.trim2,
          trim3: a.trim3,
          mediaFinal: a.mediaFinal
        }))
      })

      // Calcular médias finais e situações
      const alunosArray = Array.from(alunosMap.values()).map(aluno => {
        const notas = [aluno.trim1, aluno.trim2, aluno.trim3].filter(n => n !== undefined) as number[]
        const media = notas.length > 0 
          ? notas.reduce((a, b) => a + b, 0) / notas.length 
          : aluno.mediaFinal

        if (aluno.mediaFinal === 0) {
          aluno.mediaFinal = media
        }

        if (aluno.mediaFinal >= 7) {
          aluno.situacao = 'Aprovado'
        } else if (aluno.mediaFinal >= 5) {
          aluno.situacao = 'Recuperação'
        } else {
          aluno.situacao = 'Reprovado'
        }

        return aluno
      }).sort((a, b) => a.alunoNome.localeCompare(b.alunoNome))

      console.log('📊 Alunos processados', {
        total: alunosArray.length,
        comNotas: alunosArray.filter(a => a.mediaFinal > 0).length,
        amostra: alunosArray.slice(0, 3).map(a => ({
          nome: a.alunoNome,
          mediaFinal: a.mediaFinal,
          situacao: a.situacao
        }))
      })

      // Calcular estatísticas gerais
      let somaNotas = 0
      let aprovados = 0
      let reprovados = 0
      let recuperacao = 0

      alunosArray.forEach((aluno) => {
        somaNotas += aluno.mediaFinal
        
        if (aluno.situacao === 'Aprovado') aprovados++
        else if (aluno.situacao === 'Recuperação') recuperacao++
        else reprovados++
      })

      const media = alunosArray.length > 0 ? somaNotas / alunosArray.length : 0
      const percentualAprovacao = alunosArray.length > 0 
        ? (aprovados / alunosArray.length) * 100 
        : 0

      setNotasStats({
        media,
        aprovados,
        reprovados,
        recuperacao,
        percentualAprovacao
      })
      
      console.log('📊 Estatísticas calculadas', {
        media: media.toFixed(2),
        aprovados,
        reprovados,
        recuperacao,
        percentualAprovacao: percentualAprovacao.toFixed(2) + '%',
        totalAlunos: alunosArray.length
      })
      
      setNotasAlunos(alunosArray)
      
      console.log('📊 Estado atualizado - notasAlunos definido com', alunosArray.length, 'alunos')
    } catch (error) {
      console.error('❌ Erro ao carregar dados de notas:', error)
      setNotasStats(null)
      setNotasAlunos([])
    } finally {
      setLoading(false)
    }
  }

  const getAlunosFiltrados = <T extends FrequenciaAluno | NotaAluno>(alunos: T[]): T[] => {
    let filtrados: T[] = [...alunos]
    
    if (buscaAluno.trim()) {
      filtrados = filtrados.filter(aluno => 
        aluno.alunoNome.toLowerCase().includes(buscaAluno.toLowerCase())
      ) as T[]
    }
    
    if (alunoSelecionado) {
      filtrados = filtrados.filter(aluno => aluno.alunoId === alunoSelecionado) as T[]
    }
    
    return filtrados
  }

  const renderFrequenciaDashboard = () => {
    if (!frequenciaStats) return null

    const alunosFiltrados = getAlunosFiltrados(frequenciaAlunos) as FrequenciaAluno[]

    const pieData = [
      { name: 'Presenças', value: frequenciaStats.totalPresencas, color: '#4CAF50' },
      { name: 'Faltas', value: frequenciaStats.totalFaltas, color: '#f44336' }
    ]

    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h2>Relatório de Frequência - {turmaSelecionada?.nome}</h2>
            <p>Período: {periodoFrequencia.charAt(0).toUpperCase() + periodoFrequencia.slice(1)}</p>
          </div>
          <div className="periodo-filters">
            <button
              className={`periodo-btn ${periodoFrequencia === 'dia' ? 'active' : ''}`}
              onClick={() => setPeriodoFrequencia('dia')}
            >
              Dia
            </button>
            <button
              className={`periodo-btn ${periodoFrequencia === 'mes' ? 'active' : ''}`}
              onClick={() => setPeriodoFrequencia('mes')}
            >
              Mês
            </button>
            <button
              className={`periodo-btn ${periodoFrequencia === 'trimestre' ? 'active' : ''}`}
              onClick={() => setPeriodoFrequencia('trimestre')}
            >
              Trimestre
            </button>
            <button
              className={`periodo-btn ${periodoFrequencia === 'ano' ? 'active' : ''}`}
              onClick={() => setPeriodoFrequencia('ano')}
            >
              Ano
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="stats-grid">
          <div className="stat-card info">
            <span className="stat-label">Total de Aulas</span>
            <span className="stat-value">{frequenciaStats.totalAulas}</span>
            <span className="stat-desc">Registros computados</span>
          </div>
          <div className="stat-card success">
            <span className="stat-label">Presenças</span>
            <span className="stat-value">{frequenciaStats.totalPresencas}</span>
            <span className="stat-desc">{frequenciaStats.percentualPresenca.toFixed(1)}% de frequência</span>
          </div>
          <div className="stat-card danger">
            <span className="stat-label">Faltas</span>
            <span className="stat-value">{frequenciaStats.totalFaltas}</span>
            <span className="stat-desc">{frequenciaStats.percentualFalta.toFixed(1)}% de ausência</span>
          </div>
        </div>

        {/* Gráficos */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title">Distribuição de Frequência</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Comparativo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de Frequência por Aluno */}
        {frequenciaAlunos.length > 0 ? (
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Frequência Individual dos Alunos</h3>
              <div className="search-controls">
                <input
                  type="text"
                  placeholder="Buscar aluno..."
                  value={buscaAluno}
                  onChange={(e) => {
                    setBuscaAluno(e.target.value)
                    setAlunoSelecionado(null)
                  }}
                  className="search-input"
                />
                {buscaAluno && (
                  <button 
                    onClick={() => {
                      setBuscaAluno('')
                      setAlunoSelecionado(null)
                    }}
                    className="clear-button"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
            {alunosFiltrados.length === 0 ? (
              <div className="no-results">Nenhum aluno encontrado com esse nome.</div>
            ) : (
              <table className="details-table">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Total de Aulas</th>
                    <th>Presenças</th>
                    <th>Faltas</th>
                    <th>Percentual de Presença</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alunosFiltrados.map((aluno) => (
                    <tr key={aluno.alunoId}>
                      <td>{aluno.alunoNome}</td>
                      <td>{aluno.totalAulas}</td>
                      <td>{aluno.presencas}</td>
                      <td>{aluno.faltas}</td>
                      <td>{aluno.percentualPresenca.toFixed(1)}%</td>
                      <td>
                        <span className={`status-badge ${aluno.percentualPresenca >= 75 ? 'presente' : 'ausente'}`}>
                          {aluno.percentualPresenca >= 75 ? 'Frequência Adequada' : 'Atenção Necessária'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="dashboard-section">
            <div className="no-results">Esta turma ainda não possui alunos cadastrados. Cadastre alunos na aba "Alunos" para visualizar os dados aqui.</div>
          </div>
        )}
      </div>
    )
  }

  const renderNotasDashboard = () => {
    console.log('📊 Renderizando dashboard de notas', {
      notasStats,
      notasAlunos: notasAlunos.length,
      turmaSelecionada: turmaSelecionada?.nome,
      turmaAno: turmaSelecionada?.ano
    })
    
    // Sempre mostrar o dashboard, mesmo sem dados
    if (!notasStats) {
      // Criar stats vazio para permitir renderização
      const statsVazio: NotasStats = {
        media: 0,
        aprovados: 0,
        reprovados: 0,
        recuperacao: 0,
        percentualAprovacao: 0
      }
      
      console.log('📊 Usando stats vazio para renderizar dashboard')
      
      // Continuar renderização com stats vazio ao invés de retornar
      return renderNotasDashboardContent(statsVazio, [])
    }
    
    return renderNotasDashboardContent(notasStats, getAlunosFiltrados(notasAlunos) as NotaAluno[])
  }

  const renderNotasDashboardContent = (stats: NotasStats, alunosFiltrados: NotaAluno[]) => {
    const pieData = [
      { name: 'Aprovados', value: stats.aprovados, color: '#4CAF50' },
      { name: 'Recuperação', value: stats.recuperacao, color: '#ff9800' },
      { name: 'Reprovados', value: stats.reprovados, color: '#f44336' }
    ]

    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h2>Relatório de Notas - {turmaSelecionada?.nome}</h2>
            <p>Período: {periodoNotas === 'final' ? 'Resultado Final' : `Trimestre ${periodoNotas.slice(-1)}`}</p>
          </div>
          <div className="periodo-filters">
            <button
              className={`periodo-btn ${periodoNotas === 'trim1' ? 'active' : ''}`}
              onClick={() => setPeriodoNotas('trim1')}
            >
              1º Trimestre
            </button>
            <button
              className={`periodo-btn ${periodoNotas === 'trim2' ? 'active' : ''}`}
              onClick={() => setPeriodoNotas('trim2')}
            >
              2º Trimestre
            </button>
            <button
              className={`periodo-btn ${periodoNotas === 'trim3' ? 'active' : ''}`}
              onClick={() => setPeriodoNotas('trim3')}
            >
              3º Trimestre
            </button>
            <button
              className={`periodo-btn ${periodoNotas === 'final' ? 'active' : ''}`}
              onClick={() => setPeriodoNotas('final')}
            >
              Resultado Final
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="stats-grid">
          <div className="stat-card info">
            <span className="stat-label">Média da Turma</span>
            <span className="stat-value">{stats.media.toFixed(1)}</span>
            <span className="stat-desc">Desempenho geral</span>
          </div>
          <div className="stat-card success">
            <span className="stat-label">Aprovados</span>
            <span className="stat-value">{stats.aprovados}</span>
            <span className="stat-desc">{stats.percentualAprovacao.toFixed(1)}% da turma</span>
          </div>
          <div className="stat-card warning">
            <span className="stat-label">Recuperação</span>
            <span className="stat-value">{stats.recuperacao}</span>
            <span className="stat-desc">Nota entre 5 e 6.9</span>
          </div>
          <div className="stat-card danger">
            <span className="stat-label">Reprovados</span>
            <span className="stat-value">{stats.reprovados}</span>
            <span className="stat-desc">Nota abaixo de 5</span>
          </div>
        </div>

        {/* Gráficos */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title">Distribuição de Resultados</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Situação dos Alunos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de Notas por Aluno */}
        {notasAlunos.length > 0 ? (
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Notas Individuais dos Alunos</h3>
              <div className="search-controls">
                <input
                  type="text"
                  placeholder="Buscar aluno..."
                  value={buscaAluno}
                  onChange={(e) => {
                    setBuscaAluno(e.target.value)
                    setAlunoSelecionado(null)
                  }}
                  className="search-input"
                />
                {buscaAluno && (
                  <button 
                    onClick={() => {
                      setBuscaAluno('')
                      setAlunoSelecionado(null)
                    }}
                    className="clear-button"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
            {alunosFiltrados.length === 0 ? (
              <div className="no-results">Nenhum aluno encontrado com esse nome.</div>
            ) : (
              <table className="details-table">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>1º Trimestre</th>
                    <th>2º Trimestre</th>
                    <th>3º Trimestre</th>
                    <th>Média Final</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {alunosFiltrados.map((aluno) => (
                    <tr key={aluno.alunoId}>
                      <td>{aluno.alunoNome}</td>
                      <td>{aluno.trim1 !== undefined ? aluno.trim1.toFixed(1) : '-'}</td>
                      <td>{aluno.trim2 !== undefined ? aluno.trim2.toFixed(1) : '-'}</td>
                      <td>{aluno.trim3 !== undefined ? aluno.trim3.toFixed(1) : '-'}</td>
                      <td><strong>{aluno.mediaFinal.toFixed(1)}</strong></td>
                      <td>
                        <span className={`status-badge ${
                          aluno.situacao === 'Aprovado' ? 'aprovado' : 
                          aluno.situacao === 'Recuperação' ? 'recuperacao' : 
                          'reprovado'
                        }`}>
                          {aluno.situacao}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="dashboard-section">
            <div className="no-results">Esta turma ainda não possui alunos cadastrados. Cadastre alunos na aba "Alunos" para visualizar os dados aqui.</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relatorios-container">
      <div className="relatorios-header">
        <h1>Relatórios</h1>
        <p>Análise completa de frequência e desempenho acadêmico</p>
      </div>

      {/* Tipo de Relatório */}
      <div className="tipo-relatorio">
        <button
          className={`tipo-btn ${tipoRelatorio === 'frequencia' ? 'active' : ''}`}
          onClick={() => setTipoRelatorio('frequencia')}
        >
          <div className="tipo-btn-icon">
            <Calendar size={24} />
          </div>
          <span className="tipo-btn-label">Relatório de Frequência</span>
          <span className="tipo-btn-desc">Acompanhamento de presença e faltas</span>
        </button>
        <button
          className={`tipo-btn ${tipoRelatorio === 'notas' ? 'active' : ''}`}
          onClick={() => setTipoRelatorio('notas')}
        >
          <div className="tipo-btn-icon">
            <Award size={24} />
          </div>
          <span className="tipo-btn-label">Relatório de Notas</span>
          <span className="tipo-btn-desc">Análise de desempenho e aprovação</span>
        </button>
      </div>

      {/* Segmento */}
      <div className="segmento-selection">
        <button
          className={`segmento-btn ${segmento === 'iniciais' ? 'active' : ''}`}
          onClick={() => setSegmento('iniciais')}
        >
          <BookOpen size={20} />
          Anos Iniciais (1º ao 5º)
        </button>
        <button
          className={`segmento-btn ${segmento === 'finais' ? 'active' : ''}`}
          onClick={() => setSegmento('finais')}
        >
          <TrendingUp size={20} />
          Anos Finais (6º ao 9º)
        </button>
      </div>

      {/* Filtros de Período */}
      <div className="filtros-periodo">
        <div className="filtros-info">
          <div className="info-icon">ℹ️</div>
          <div className="info-text">
            Selecione o ano letivo e o período desejado. Para "Ano Letivo Completo", 
            o sistema utilizará as datas do calendário escolar cadastrado.
          </div>
        </div>
        
        <div className="filtros-controles">
          <div className="filtro-grupo">
            <label className="filtro-label">Ano Letivo:</label>
            <select 
              value={anoLetivo} 
              onChange={(e) => setAnoLetivo(Number(e.target.value))}
              className="filtro-select"
            >
              {anosDisponiveis.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>

          {tipoRelatorio === 'frequencia' && (
            <div className="filtro-grupo">
              <label className="filtro-label">Período:</label>
              <select 
                value={periodoFrequencia} 
                onChange={(e) => {
                  setPeriodoFrequencia(e.target.value as PeriodoFrequencia)
                  setUsarDataCustom(false)
                }}
                className="filtro-select"
              >
                <option value="dia">Dia Atual</option>
                <option value="mes">Mês Atual</option>
                <option value="trimestre">Trimestre Atual</option>
                <option value="ano">Ano Letivo Completo</option>
              </select>
            </div>
          )}

          {tipoRelatorio === 'notas' && (
            <div className="filtro-grupo">
              <label className="filtro-label">Trimestre:</label>
              <select 
                value={periodoNotas} 
                onChange={(e) => setPeriodoNotas(e.target.value as PeriodoNotas)}
                className="filtro-select"
              >
                <option value="trim1">1º Trimestre</option>
                <option value="trim2">2º Trimestre</option>
                <option value="trim3">3º Trimestre</option>
                <option value="final">Notas Finais</option>
              </select>
            </div>
          )}

          {tipoRelatorio === 'frequencia' && (
            <div className="filtro-grupo-custom">
              <label className="filtro-checkbox">
                <input 
                  type="checkbox" 
                  checked={usarDataCustom}
                  onChange={(e) => setUsarDataCustom(e.target.checked)}
                />
                <span>Período Personalizado</span>
              </label>
              {usarDataCustom && (
                <div className="filtro-datas">
                  <div className="filtro-data">
                    <label>Início:</label>
                    <input 
                      type="date" 
                      value={dataInicioCustom}
                      onChange={(e) => setDataInicioCustom(e.target.value)}
                      className="filtro-input-date"
                    />
                  </div>
                  <div className="filtro-data">
                    <label>Fim:</label>
                    <input 
                      type="date" 
                      value={dataFimCustom}
                      onChange={(e) => setDataFimCustom(e.target.value)}
                      className="filtro-input-date"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Turmas */}
      {loading && !turmaSelecionada ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando turmas...</p>
        </div>
      ) : turmas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-text">Nenhuma turma encontrada</div>
          <div className="empty-state-desc">
            Não há turmas cadastradas para {segmento === 'iniciais' ? 'Anos Iniciais' : 'Anos Finais'}
          </div>
        </div>
      ) : (
        <>
          <div className="turmas-grid">
            {turmas.map((turma) => (
              <div
                key={turma.id}
                className={`turma-card ${turmaSelecionada?.id === turma.id ? 'active' : ''}`}
                onClick={() => setTurmaSelecionada(turma)}
              >
                <div className="turma-nome">{turma.nome}</div>
                <div className="turma-info">
                  {turma.ano}º Ano - {turma.periodo}
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard */}
          {turmaSelecionada && (
            loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando dados...</p>
              </div>
            ) : (
              tipoRelatorio === 'frequencia' 
                ? renderFrequenciaDashboard() 
                : renderNotasDashboard()
            )
          )}
        </>
      )}
    </div>
  )
}

export default Relatorios
