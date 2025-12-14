import { useEffect, useState } from 'react'
import { Edit, X, Save, Users, GraduationCap, BookOpen, CheckCircle, XCircle } from 'lucide-react'
import { alunosAPI, disciplinasAPI, turmasAPI, Aluno, Disciplina, Turma, api } from '../lib/api'
import './ModernPages.css'
import './Notas.css'
import '../components/Modal.css'

interface NotaData {
  id?: string
  alunoId: string
  disciplinaId: string
  trimestre: number
  avaliacao01: number | null
  avaliacao02: number | null
  avaliacao03: number | null
  mediaM1: number | null
  avaliacaoEAC: number | null
  notaFinalTrimestre: number | null
  observacao?: string
}

interface NotaFinal {
  id: string
  alunoId: string
  disciplinaId: string
  trimestre1: number | null
  trimestre2: number | null
  trimestre3: number | null
  mediaFinal: number | null
  aprovado: boolean
}

const Notas = () => {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [disciplinasDaTurma, setDisciplinasDaTurma] = useState<Disciplina[]>([])
  const [selectedTurma, setSelectedTurma] = useState<string>('')
  const [selectedAluno, setSelectedAluno] = useState<string>('')
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [notas, setNotas] = useState<NotaData[]>([])
  const [notaFinal, setNotaFinal] = useState<NotaFinal | null>(null)
  const [editingNota, setEditingNota] = useState<NotaData | null>(null)
  const [saving, setSaving] = useState(false)
  const [anoLetivo, setAnoLetivo] = useState<number>(new Date().getFullYear())
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([])

  useEffect(() => {
    loadData()
    loadAnosDisponiveis()
  }, [])

  useEffect(() => {
    if (selectedTurma) {
      loadAlunosByTurma()
      loadDisciplinasByTurma()
    } else {
      setAlunos([])
      setDisciplinasDaTurma([])
      setSelectedAluno('')
      setSelectedDisciplina('')
    }
  }, [selectedTurma])

  useEffect(() => {
    if (selectedAluno && selectedDisciplina) {
      loadNotas()
    }
  }, [selectedAluno, selectedDisciplina, anoLetivo])

  const loadAnosDisponiveis = async () => {
    try {
      const response = await api.get('/calendario-escolar')
      const anos = response.data.map((cal: any) => cal.ano)
      setAnosDisponiveis(anos.sort((a: number, b: number) => b - a))
      
      if (anos.length > 0 && !anos.includes(anoLetivo)) {
        setAnoLetivo(anos[0])
      }
    } catch (error) {
      console.error('Erro ao carregar anos disponíveis:', error)
      setAnosDisponiveis([new Date().getFullYear()])
    }
  }

  const loadData = async () => {
    try {
      const [turmasRes, disciplinasRes] = await Promise.all([
        turmasAPI.getAll(),
        disciplinasAPI.getAll()
      ])
      // Ordenar turmas de forma crescente pelo ano (1º ao 9º)
      const turmasOrdenadas = turmasRes.data.sort((a, b) => {
        // Primeiro por ano (crescente)
        if (a.ano !== b.ano) return a.ano - b.ano
        // Depois por nome (crescente)
        return a.nome.localeCompare(b.nome)
      })
      // Ordenar disciplinas em ordem alfabética crescente (A → Z)
      const disciplinasOrdenadas = disciplinasRes.data.sort((a, b) => {
        return a.nome.localeCompare(b.nome)
      })
      setTurmas(turmasOrdenadas)
      setDisciplinas(disciplinasOrdenadas)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAlunosByTurma = async () => {
    try {
      const response = await alunosAPI.getAll()
      const alunosFiltrados = response.data.filter((aluno: Aluno) => aluno.turmaId === selectedTurma)
      setAlunos(alunosFiltrados)
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
    }
  }

  const loadDisciplinasByTurma = async () => {
    try {
      // Buscar a turma com suas disciplinas vinculadas
      const response = await turmasAPI.getById(selectedTurma)
      const turmaComDisciplinas = response.data
      
      // Filtrar apenas as disciplinas que estão vinculadas à turma
      if (turmaComDisciplinas.disciplinas && turmaComDisciplinas.disciplinas.length > 0) {
        // Ordenar disciplinas em ordem alfabética
        const disciplinasOrdenadas = turmaComDisciplinas.disciplinas.sort((a, b) => {
          return a.nome.localeCompare(b.nome)
        })
        setDisciplinasDaTurma(disciplinasOrdenadas)
      } else {
        setDisciplinasDaTurma([])
      }
    } catch (error) {
      console.error('Erro ao carregar disciplinas da turma:', error)
      setDisciplinasDaTurma([])
    }
  }

  const loadNotas = async () => {
    try {
      const response = await api.get(`/notas/aluno/${selectedAluno}/disciplina/${selectedDisciplina}`, {
        params: { anoLetivo }
      })
      const { notas: notasBD, notaFinal: notaFinalBD } = response.data

      // Se não há notas no banco, criar estrutura inicial
      if (notasBD.length === 0) {
        const notasIniciais: NotaData[] = [1, 2, 3].map(t => ({
          alunoId: selectedAluno,
          disciplinaId: selectedDisciplina,
          trimestre: t,
          avaliacao01: null,
          avaliacao02: null,
          avaliacao03: null,
          mediaM1: null,
          avaliacaoEAC: null,
          notaFinalTrimestre: null
        }))
        setNotas(notasIniciais)
      } else {
        // Garantir que existem 3 trimestres
        const notasCompletas: NotaData[] = [1, 2, 3].map(t => {
          const notaExistente = notasBD.find((n: NotaData) => n.trimestre === t)
          return notaExistente || {
            alunoId: selectedAluno,
            disciplinaId: selectedDisciplina,
            trimestre: t,
            avaliacao01: null,
            avaliacao02: null,
            avaliacao03: null,
            mediaM1: null,
            avaliacaoEAC: null,
            notaFinalTrimestre: null
          }
        })
        setNotas(notasCompletas)
      }

      setNotaFinal(notaFinalBD)
    } catch (error) {
      console.error('Erro ao carregar notas:', error)
    }
  }

  const calcularMediaM1 = (av1: number | null, av2: number | null, av3: number | null): number | null => {
    if (av1 !== null && av2 !== null && av3 !== null) {
      return parseFloat((av1 + av2 + av3).toFixed(1))
    }
    return null
  }

  const calcularMediaParcialAno = (): { valor: number | null; texto: string } => {
    const t1 = notaFinal?.trimestre1
    const t2 = notaFinal?.trimestre2
    const t3 = notaFinal?.trimestre3

    // Se tem trimestre 3, usa a fórmula final
    if (t3 !== null && t3 !== undefined) {
      const mediaFinalCalc = t1 && t2 && t3 ? parseFloat(((t1 * 1 + t2 * 2 + t3 * 3) / 6).toFixed(2)) : null
      return { valor: mediaFinalCalc, texto: 'Média Parcial do Ano' }
    }
    
    // Se tem trimestre 2, usa a fórmula parcial com T1 e T2
    if (t2 !== null && t2 !== undefined) {
      const mediaParcial = t1 && t2 ? parseFloat(((t1 * 1 + t2 * 2) / 3).toFixed(2)) : null
      return { valor: mediaParcial, texto: 'Média Parcial do Ano (T1+T2)' }
    }
    
    // Se tem apenas trimestre 1, usa ele mesmo como nota parcial
    if (t1 !== null && t1 !== undefined) {
      return { valor: t1, texto: 'Média Parcial do Ano (T1)' }
    }
    
    return { valor: null, texto: 'Média Parcial do Ano' }
  }

  const getNotaColor = (nota: number | null): string => {
    if (nota === null) return ''
    if (nota >= 7.0) return 'nota-verde'
    if (nota >= 5.0) return 'nota-amarela'
    return 'nota-vermelha'
  }

  const openModal = (trimestre: number) => {
    const nota = notas.find(n => n.trimestre === trimestre) || {
      alunoId: selectedAluno,
      disciplinaId: selectedDisciplina,
      trimestre,
      avaliacao01: null,
      avaliacao02: null,
      avaliacao03: null,
      mediaM1: null,
      avaliacaoEAC: null
    }
    setEditingNota(nota)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingNota(null)
  }

  const handleNotaChange = (campo: keyof NotaData, valor: string) => {
    if (!editingNota) return
    
    const valorNum = valor === '' ? null : parseFloat(valor)
    
    if (valorNum !== null && (valorNum < 0 || valorNum > 10)) {
      return
    }

    const novaNotaEditada = { ...editingNota, [campo]: valorNum }
    
    if (campo === 'avaliacao01' || campo === 'avaliacao02' || campo === 'avaliacao03') {
      const media = calcularMediaM1(
        campo === 'avaliacao01' ? valorNum : novaNotaEditada.avaliacao01,
        campo === 'avaliacao02' ? valorNum : novaNotaEditada.avaliacao02,
        campo === 'avaliacao03' ? valorNum : novaNotaEditada.avaliacao03
      )
      novaNotaEditada.mediaM1 = media
    }
    
    setEditingNota(novaNotaEditada)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNota) return

    setSaving(true)
    try {
      // Enviar para a API
      const response = await api.post('/notas/salvar', {
        alunoId: editingNota.alunoId,
        disciplinaId: editingNota.disciplinaId,
        trimestre: editingNota.trimestre,
        anoLetivo: anoLetivo,
        avaliacao01: editingNota.avaliacao01,
        avaliacao02: editingNota.avaliacao02,
        avaliacao03: editingNota.avaliacao03,
        avaliacaoEAC: editingNota.avaliacaoEAC,
        observacao: editingNota.observacao
      })

      const { nota, notaFinal: notaFinalAtualizada } = response.data

      // Atualizar a lista de notas
      const notasAtualizadas = [...notas]
      const index = notasAtualizadas.findIndex(n => n.trimestre === nota.trimestre)
      if (index >= 0) {
        notasAtualizadas[index] = nota
      } else {
        notasAtualizadas.push(nota)
      }
      setNotas(notasAtualizadas)
      setNotaFinal(notaFinalAtualizada)
      
      closeModal()
      alert('Notas salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar nota:', error)
      alert('Erro ao salvar nota. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">Carregando...</div>

  const turmaSelecionada = turmas.find(t => t.id === selectedTurma)
  const alunoSelecionado = alunos.find(a => a.id === selectedAluno)
  const disciplinaSelecionada = disciplinas.find(d => d.id === selectedDisciplina)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Notas e Avaliações</h1>
      </div>

      {/* Seleção de Ano Letivo */}
      <div className="selection-section" style={{ backgroundColor: '#f0f9ff', border: '2px solid #3b82f6' }}>
        <div className="selection-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="selection-icon">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h2>1. Selecione o Ano Letivo</h2>
        </div>
        <div className="selection-grid">
          {anosDisponiveis.length === 0 ? (
            <p className="empty-message">Nenhum ano letivo disponível. Cadastre na aba "Calendário Escolar".</p>
          ) : (
            anosDisponiveis.map(ano => (
              <button
                key={ano}
                className={`selection-btn ${anoLetivo === ano ? 'active' : ''}`}
                onClick={() => {
                  setAnoLetivo(ano)
                  setSelectedTurma('')
                  setSelectedAluno('')
                  setSelectedDisciplina('')
                }}
                style={{ 
                  backgroundColor: anoLetivo === ano ? '#3b82f6' : '#fff',
                  borderColor: '#3b82f6',
                  fontWeight: '600',
                  fontSize: '1.1rem'
                }}
              >
                <div className="selection-btn-content">
                  <span className="selection-btn-title">{ano}</span>
                  <span className="selection-btn-subtitle">Ano Letivo</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Seleção de Turma */}
      <div className="selection-section">
        <div className="selection-header">
          <Users size={24} className="selection-icon" />
          <h2>2. Selecione a Turma</h2>
        </div>
        <div className="selection-grid">
          {turmas.map(turma => (
            <button
              key={turma.id}
              className={`selection-btn ${selectedTurma === turma.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedTurma(turma.id)
                setSelectedAluno('')
                setSelectedDisciplina('')
              }}
            >
              <div className="selection-btn-content">
                <span className="selection-btn-title">{turma.nome}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Seleção de Aluno */}
      {selectedTurma && (
        <div className="selection-section">
          <div className="selection-header">
            <GraduationCap size={24} className="selection-icon" />
            <h2>3. Selecione o Aluno</h2>
          </div>
          <div className="selection-grid">
            {alunos.length === 0 ? (
              <p className="empty-message">Nenhum aluno encontrado nesta turma</p>
            ) : (
              alunos.map(aluno => (
                <button
                  key={aluno.id}
                  className={`selection-btn ${selectedAluno === aluno.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedAluno(aluno.id)
                    setSelectedDisciplina('')
                  }}
                >
                  <div className="selection-btn-content">
                    <span className="selection-btn-title">{aluno.nome}</span>
                    <span className="selection-btn-subtitle">{aluno.cpf}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Seleção de Disciplina */}
      {selectedAluno && (
        <div className="selection-section">
          <div className="selection-header">
            <BookOpen size={24} className="selection-icon" />
            <h2>4. Selecione a Disciplina</h2>
          </div>
          <div className="selection-grid">
            {disciplinasDaTurma.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>Nenhuma disciplina cadastrada para esta turma.</p>
                <p style={{ marginTop: '10px', fontSize: '0.9em' }}>Cadastre disciplinas para esta turma na aba "Disciplinas".</p>
              </div>
            ) : (
              disciplinasDaTurma.map(disciplina => (
                <button
                  key={disciplina.id}
                  className={`selection-btn ${selectedDisciplina === disciplina.id ? 'active' : ''}`}
                  onClick={() => setSelectedDisciplina(disciplina.id)}
                >
                  <div className="selection-btn-content">
                    <span className="selection-btn-title">{disciplina.nome}</span>
                    <span className="selection-btn-subtitle">{disciplina.cargaHoraria}h - {disciplina.professor?.nome || 'Sem professor'}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {selectedAluno && selectedDisciplina && (
        <>
          <div className="notas-info">
            <h2>{alunoSelecionado?.nome}</h2>
            <p>{disciplinaSelecionada?.nome}</p>
          </div>

          <div className="trimestres-container">
            {[1, 2, 3].map(tri => {
              const nota = notas.find(n => n.trimestre === tri)
              return (
                <div key={tri} className="trimestre-card">
                  <div className="trimestre-header">
                    <h3>{tri}º Trimestre</h3>
                    <button 
                      className="btn-icon"
                      onClick={() => openModal(tri)}
                      title="Editar notas"
                    >
                      <Edit size={16} />
                    </button>
                  </div>

                  <div className="momento-section">
                    <h4>Momento 1</h4>
                    <div className="notas-grid">
                      <div className="nota-item">
                        <span className="nota-label">Avaliação 01:</span>
                        <span className={`nota-valor ${getNotaColor(nota?.avaliacao01 || null)}`}>
                          {nota?.avaliacao01?.toFixed(1) || '-'}
                        </span>
                      </div>
                      <div className="nota-item">
                        <span className="nota-label">Avaliação 02:</span>
                        <span className={`nota-valor ${getNotaColor(nota?.avaliacao02 || null)}`}>
                          {nota?.avaliacao02?.toFixed(1) || '-'}
                        </span>
                      </div>
                      <div className="nota-item">
                        <span className="nota-label">Avaliação 03:</span>
                        <span className={`nota-valor ${getNotaColor(nota?.avaliacao03 || null)}`}>
                          {nota?.avaliacao03?.toFixed(1) || '-'}
                        </span>
                      </div>
                      <div className="nota-item media">
                        <span className="nota-label">Média M1:</span>
                        <span className={`nota-valor ${getNotaColor(nota?.mediaM1 || null)}`}>
                          {nota?.mediaM1?.toFixed(1) || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="momento-section">
                    <h4>Momento 2</h4>
                    <div className="notas-grid">
                      <div className="nota-item">
                        <span className="nota-label">Avaliação EAC:</span>
                        <span className={`nota-valor ${getNotaColor(nota?.avaliacaoEAC || null)}`}>
                          {nota?.avaliacaoEAC?.toFixed(1) || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="momento-section">
                    <h4>Nota Final do Trimestre</h4>
                    <div className="notas-grid">
                      <div className="nota-item final-trimestre">
                        <span className="nota-label">Maior Nota (M1 ou EAC):</span>
                        <span className={`nota-valor ${getNotaColor(nota?.notaFinalTrimestre || null)}`}>
                          {nota?.notaFinalTrimestre?.toFixed(2) || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Card de Nota Final do Ano */}
            <div className="trimestre-card nota-final-ano-card">
              <div className="trimestre-header nota-final-header">
                <h3>📊 Nota Final do Ano</h3>
              </div>

              <div className="momento-section">
                <h4>Fórmula: (T1×1 + T2×2 + T3×3) ÷ 6</h4>
                <div className="notas-grid">
                  <div className="nota-item">
                    <span className="nota-label">1º Trimestre:</span>
                    <span className={`nota-valor ${getNotaColor(notaFinal?.trimestre1 || null)}`}>
                      {notaFinal?.trimestre1?.toFixed(2) || '-'}
                    </span>
                  </div>
                  <div className="nota-item">
                    <span className="nota-label">2º Trimestre:</span>
                    <span className={`nota-valor ${getNotaColor(notaFinal?.trimestre2 || null)}`}>
                      {notaFinal?.trimestre2?.toFixed(2) || '-'}
                    </span>
                  </div>
                  <div className="nota-item">
                    <span className="nota-label">3º Trimestre:</span>
                    <span className={`nota-valor ${getNotaColor(notaFinal?.trimestre3 || null)}`}>
                      {notaFinal?.trimestre3?.toFixed(2) || '-'}
                    </span>
                  </div>
                  <div className="nota-item media-parcial-ano">
                    <span className="nota-label" style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: '600',
                      color: '#2563eb'
                    }}>
                      {calcularMediaParcialAno().texto}:
                    </span>
                    <span className={`nota-valor ${getNotaColor(calcularMediaParcialAno().valor)}`} style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '700',
                      padding: '6px 12px',
                      backgroundColor: '#eff6ff',
                      borderRadius: '6px',
                      border: '2px solid #3b82f6'
                    }}>
                      {calcularMediaParcialAno().valor?.toFixed(2) || '-'}
                    </span>
                  </div>
                  <div className="nota-item media-final">
                    <span className="nota-label">Média Final:</span>
                    <span className={`nota-valor ${getNotaColor(notaFinal?.mediaFinal || null)}`}>
                      {notaFinal?.mediaFinal?.toFixed(2) || '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="momento-section status-section">
                <h4>Status Final</h4>
                {notaFinal?.mediaFinal !== null && notaFinal?.mediaFinal !== undefined ? (
                  <div className={`status-badge ${notaFinal.aprovado ? 'aprovado' : 'reprovado'}`}>
                    {notaFinal.aprovado ? (
                      <>
                        <CheckCircle size={32} />
                        <span>APROVADO</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={32} />
                        <span>REPROVADO</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="status-badge pendente">
                    <span>Aguardando lançamento de notas</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showModal && editingNota && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-notas" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Notas - {editingNota.trimestre}º Trimestre</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="momento-form">
                  <h3>Momento 1</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label style={{ color: '#334155' }}>Avaliação 01 (0.0 - 10.0)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={editingNota.avaliacao01 ?? ''}
                        onChange={(e) => handleNotaChange('avaliacao01', e.target.value)}
                        placeholder="0.0"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#334155' }}>Avaliação 02 (0.0 - 10.0)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={editingNota.avaliacao02 ?? ''}
                        onChange={(e) => handleNotaChange('avaliacao02', e.target.value)}
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label style={{ color: '#334155' }}>Avaliação 03 (0.0 - 10.0)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={editingNota.avaliacao03 ?? ''}
                        onChange={(e) => handleNotaChange('avaliacao03', e.target.value)}
                        placeholder="0.0"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#334155' }}>Média M1 (Automática)</label>
                      <input
                        type="text"
                        value={editingNota.mediaM1?.toFixed(1) || '-'}
                        disabled
                        className="nota-readonly"
                      />
                    </div>
                  </div>
                </div>

                <div className="momento-form">
                  <h3>Momento 2</h3>
                  <div className="form-group">
                    <label style={{ color: '#334155' }}>Avaliação EAC (0.0 - 10.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={editingNota.avaliacaoEAC ?? ''}
                      onChange={(e) => handleNotaChange('avaliacaoEAC', e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ color: '#334155' }}>Observações</label>
                  <textarea
                    value={editingNota.observacao || ''}
                    onChange={(e) => setEditingNota({ ...editingNota, observacao: e.target.value })}
                    placeholder="Observações sobre o desempenho do aluno..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={saving}>
                  <Save size={20} />
                  {saving ? 'Salvando...' : 'Salvar Notas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notas
