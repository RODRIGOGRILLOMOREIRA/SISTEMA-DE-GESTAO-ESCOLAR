import { useState, useEffect } from 'react'
import { Save, BookOpen, GraduationCap, Users, CheckCircle, XCircle, Power, Award } from 'lucide-react'
import { turmasAPI } from '../lib/api'
import BackButton from '../components/BackButton'
import { getHabilidadesPorAnoEComponente, getComponentesPorAno } from '../data/habilidadesBNCC'
import './Habilidades.css'
import './Notas.css'

interface Turma {
  id: string
  nome: string
  ano: number
  periodo: string
  alunos?: Aluno[]
}

interface Aluno {
  id: string
  nome: string
}

interface HabilidadeAluno {
  codigo: string
  descricao: string
  componente: string
  status: 'nao-iniciado' | 'em-desenvolvimento' | 'desenvolvido'
  trimestre: 1 | 2 | 3 | null
  habilitada: boolean
}

type CategoriaAno = 'iniciais' | 'finais' | null

const Habilidades = () => {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaAno>(null)
  const [turmaObj, setTurmaObj] = useState<Turma | null>(null)
  const [alunoSelecionado, setAlunoSelecionado] = useState('')
  const [componenteSelecionado, setComponenteSelecionado] = useState('')
  const [habilidades, setHabilidades] = useState<HabilidadeAluno[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTurmas()
  }, [])

  const loadTurmas = async () => {
    try {
      const response = await turmasAPI.getAll()
      setTurmas(response.data)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
    }
  }

  // Função para filtrar turmas por categoria
  const getTurmasPorCategoria = (): Turma[] => {
    if (!categoriaAtiva) return []
    if (categoriaAtiva === 'iniciais') {
      return turmas.filter(t => t.ano >= 1 && t.ano <= 5)
    } else {
      return turmas.filter(t => t.ano >= 6 && t.ano <= 9)
    }
  }

  const selecionarTurma = async (turma: Turma) => {
    setTurmaObj(turma)
    setAlunoSelecionado('')
    setComponenteSelecionado('')
    setHabilidades([])
    await loadAlunos(turma.id)
  }

  const loadAlunos = async (turmaId: string) => {
    try {
      const response = await turmasAPI.getById(turmaId)
      setAlunos(response.data.alunos || [])
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
    }
  }

  const handleAlunoChange = (alunoId: string) => {
    setAlunoSelecionado(alunoId)
    setComponenteSelecionado('')
    setHabilidades([])
  }

  const handleComponenteChange = (componente: string) => {
    setComponenteSelecionado(componente)
    if (turmaObj) {
      const habilidadesBNCC = getHabilidadesPorAnoEComponente(turmaObj.ano, componente)
      const habilidadesAluno: HabilidadeAluno[] = habilidadesBNCC.map(h => ({
        codigo: h.codigo,
        descricao: h.descricao,
        componente: h.componente,
        status: 'nao-iniciado',
        trimestre: null,
        habilitada: true
      }))
      setHabilidades(habilidadesAluno)
    }
  }

  const toggleHabilitada = (codigo: string) => {
    setHabilidades(prev =>
      prev.map(h => h.codigo === codigo ? { ...h, habilitada: !h.habilitada } : h)
    )
  }

  const alterarStatus = (codigo: string) => {
    setHabilidades(prev =>
      prev.map(h => {
        if (h.codigo === codigo) {
          const statusOrder: Array<'nao-iniciado' | 'em-desenvolvimento' | 'desenvolvido'> = ['nao-iniciado', 'em-desenvolvimento', 'desenvolvido']
          const currentIndex = statusOrder.indexOf(h.status)
          const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
          return { ...h, status: nextStatus }
        }
        return h
      })
    )
  }

  const alterarTrimestre = (codigo: string, trimestre: 1 | 2 | 3 | null) => {
    setHabilidades(prev =>
      prev.map(h => h.codigo === codigo ? { ...h, trimestre } : h)
    )
  }

  const handleSalvar = async () => {
    setLoading(true)
    try {
      // Implementar salvamento das habilidades
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Habilidades salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar habilidades:', error)
      alert('Erro ao salvar habilidades')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="habilidades-page">
      <BackButton />
      <div className="page-header">
        <h1>Registro de Habilidades</h1>
      </div>

      {!categoriaAtiva ? (
        <div className="selection-section">
          <div className="selection-header">
            <BookOpen size={24} className="selection-icon" />
            <h2>Selecione a Categoria</h2>
          </div>
          <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '600px', margin: '0 auto' }}>
            <button
              className="selection-btn"
              onClick={() => setCategoriaAtiva('iniciais')}
            >
              <div className="selection-btn-content">
                <span className="selection-btn-title">Anos Iniciais</span>
              </div>
            </button>
            <button
              className="selection-btn"
              onClick={() => setCategoriaAtiva('finais')}
            >
              <div className="selection-btn-content">
                <span className="selection-btn-title">Anos Finais</span>
              </div>
            </button>
          </div>
        </div>
      ) : !turmaObj ? (
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
              <GraduationCap size={24} className="selection-icon" />
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Selecione a Turma - {categoriaAtiva === 'iniciais' ? 'Anos Iniciais' : 'Anos Finais'}
              </h2>
            </div>
          </div>
          <div className="selection-grid" style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '12px' 
          }}>
            {getTurmasPorCategoria().length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                <p>Nenhuma turma cadastrada para {categoriaAtiva === 'iniciais' ? 'Anos Iniciais (1º ao 5º ano)' : 'Anos Finais (6º ao 9º ano)'}.</p>
              </div>
            ) : (
              getTurmasPorCategoria().map((turma) => (
                <button
                  key={turma.id}
                  className="selection-btn"
                  onClick={() => selecionarTurma(turma)}
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
      ) : !alunoSelecionado ? (
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
              <Users size={24} className="selection-icon" />
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Selecione o Aluno - {turmaObj?.nome}
              </h2>
            </div>
          </div>
          <div className="selection-grid" style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '12px' 
          }}>
            {alunos.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                <p>Nenhum aluno cadastrado nesta turma.</p>
              </div>
            ) : (
              alunos.map((aluno) => (
                <button
                  key={aluno.id}
                  className="selection-btn"
                  onClick={() => handleAlunoChange(aluno.id)}
                  style={{ 
                    padding: '12px 16px',
                    minHeight: 'auto'
                  }}
                >
                  <div className="selection-btn-content">
                    <span className="selection-btn-title" style={{ fontSize: '0.875rem' }}>
                      {aluno.nome}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : !componenteSelecionado ? (
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
              <BookOpen size={24} className="selection-icon" />
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Selecione o Componente Curricular
              </h2>
            </div>
          </div>
          <div className="selection-grid" style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '12px' 
          }}>
            {turmaObj && getComponentesPorAno(turmaObj.ano).map((componente) => (
              <button
                key={componente}
                className="selection-btn"
                onClick={() => handleComponenteChange(componente)}
                style={{ 
                  padding: '16px',
                  minHeight: 'auto'
                }}
              >
                <div className="selection-btn-content">
                  <span className="selection-btn-title" style={{ fontSize: '0.95rem' }}>
                    {componente}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="habilidades-header" style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #00BCD4 0%, #00ACC1 50%, #0097A7 100%)',
            borderRadius: '16px',
            color: 'white',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
              {componenteSelecionado} - {turmaObj?.ano}º Ano
            </h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Aluno: {alunos.find(a => a.id === alunoSelecionado)?.nome}
            </p>
          </div>

          {habilidades.length > 0 && (
            <>
              <div className="habilidades-lista-bncc">
                {habilidades.map((habilidade) => (
                  <div 
                    key={habilidade.codigo} 
                    className={`habilidade-card ${!habilidade.habilitada ? 'desabilitada' : ''}`}
                    style={{
                      opacity: habilidade.habilitada ? 1 : 0.4,
                      pointerEvents: habilidade.habilitada ? 'auto' : 'none',
                      position: 'relative'
                    }}
                  >
                    <div className="habilidade-codigo-badge">
                      {habilidade.codigo}
                    </div>
                    
                    <div className="habilidade-descricao-text">
                      {habilidade.descricao}
                    </div>

                    <div className="habilidade-controles">
                      <div className="controle-group">
                        <label>Status</label>
                        <button
                          className={`btn-status status-${habilidade.status}`}
                          onClick={() => alterarStatus(habilidade.codigo)}
                          disabled={!habilidade.habilitada}
                        >
                          {habilidade.status === 'nao-iniciado' && (
                            <>
                              <XCircle size={16} />
                              Não Iniciado
                            </>
                          )}
                          {habilidade.status === 'em-desenvolvimento' && (
                            <>
                              <Award size={16} />
                              Em Desenvolvimento
                            </>
                          )}
                          {habilidade.status === 'desenvolvido' && (
                            <>
                              <CheckCircle size={16} />
                              Desenvolvido
                            </>
                          )}
                        </button>
                      </div>

                      <div className="controle-group">
                        <label>Trimestre</label>
                        <div className="trimestre-buttons">
                          {[1, 2, 3].map(t => (
                            <button
                              key={t}
                              className={`btn-trimestre ${habilidade.trimestre === t ? 'active' : ''}`}
                              onClick={() => alterarTrimestre(habilidade.codigo, habilidade.trimestre === t ? null : t as 1 | 2 | 3)}
                              disabled={!habilidade.habilitada}
                            >
                              {t}º
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="controle-group">
                        <button
                          className={`btn-habilitar ${habilidade.habilitada ? 'habilitado' : 'desabilitado'}`}
                          onClick={() => toggleHabilitada(habilidade.codigo)}
                          title={habilidade.habilitada ? 'Desabilitar habilidade' : 'Habilitar habilidade'}
                          style={{
                            pointerEvents: 'auto',
                            opacity: 1
                          }}
                        >
                          <Power size={18} />
                          {habilidade.habilitada ? 'Habilitado' : 'Desabilitado'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="acoes-container">
                <button
                  className="btn-salvar"
                  onClick={handleSalvar}
                  disabled={loading}
                >
                  <Save size={20} />
                  {loading ? 'Salvando...' : 'Salvar Registro'}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Habilidades
