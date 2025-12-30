import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, X, Save, BookOpen, GraduationCap, ArrowLeft } from 'lucide-react'
import { disciplinasAPI, professoresAPI, turmasAPI, Disciplina, Professor, Turma } from '../lib/api'
import BackButton from '../components/BackButton'
import './ModernPages.css'
import '../components/Modal.css'
import './DisciplinasAutocomplete.css'
import './Notas.css'

interface DisciplinaForm {
  nome: string
  cargaHoraria: string
  professorNome: string
}

type CategoriaAno = 'iniciais' | 'finais' | null

const Disciplinas = () => {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [professores, setProfessores] = useState<Professor[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaAno>(null)
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null)
  const [formData, setFormData] = useState<DisciplinaForm>({
    nome: '',
    cargaHoraria: '',
    professorNome: ''
  })

  const [professorSuggestions, setProfessorSuggestions] = useState<Professor[]>([])

  // Disciplinas que pertencem aos Anos Finais (6º ao 9º)
  const disciplinasAnosFinais = ['Inglês', 'Ingles', 'Projeto de Vida']

  // Função para filtrar turmas por categoria
  const getTurmasPorCategoria = (categoria: CategoriaAno): Turma[] => {
    if (!categoria) return turmas
    console.log('Filtrando turmas para categoria:', categoria)
    console.log('Total de turmas:', turmas.length)
    if (categoria === 'iniciais') {
      const filtradas = turmas.filter(t => t.ano >= 1 && t.ano <= 5)
      console.log('Turmas Anos Iniciais:', filtradas)
      return filtradas
    } else {
      const filtradas = turmas.filter(t => t.ano >= 6 && t.ano <= 9)
      console.log('Turmas Anos Finais:', filtradas)
      return filtradas
    }
  }

  // Função para buscar professor pelo nome
  const handleProfessorSearch = (searchTerm: string) => {
    console.log('Buscando professor:', searchTerm)
    console.log('Total de professores disponíveis:', professores.length)
    console.log('Professores:', professores)
    
    setFormData({ ...formData, professorNome: searchTerm })
    if (searchTerm.length > 0) {
      const filtered = professores.filter(p => 
        p.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
      console.log('Professores filtrados:', filtered)
      setProfessorSuggestions(filtered)
    } else {
      setProfessorSuggestions([])
    }
  }

  // Função para selecionar professor
  const selectProfessor = (professor: Professor) => {
    setFormData({ ...formData, professorNome: professor.nome })
    setProfessorSuggestions([])
  }

  useEffect(() => {
    loadDisciplinas()
    loadProfessores()
    loadTurmas()
  }, [])

  // Recarregar turmas sempre que voltar para a seleção de categoria ou turma
  useEffect(() => {
    if (categoriaAtiva && !turmaSelecionada) {
      loadTurmas()
    }
  }, [categoriaAtiva, turmaSelecionada])

  useEffect(() => {
    console.log('Categoria ativa mudou:', categoriaAtiva)
    console.log('Total de turmas no estado:', turmas.length)
    console.log('Turmas:', turmas)
    if (categoriaAtiva) {
      const turmasFiltradas = getTurmasPorCategoria(categoriaAtiva)
      console.log('Turmas filtradas para', categoriaAtiva, ':', turmasFiltradas)
    }
  }, [categoriaAtiva, turmas])

  const loadDisciplinas = async () => {
    try {
      const response = await disciplinasAPI.getAll()
      setDisciplinas(response.data)
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProfessores = async () => {
    try {
      console.log('Carregando professores...')
      const response = await professoresAPI.getAll()
      console.log('Professores carregados:', response.data)
      console.log('Número de professores:', response.data.length)
      setProfessores(response.data)
    } catch (error) {
      console.error('Erro ao carregar professores:', error)
    }
  }

  const loadTurmas = async () => {
    try {
      const response = await turmasAPI.getAll()
      console.log('Response completo:', response)
      console.log('Response.data:', response.data)
      console.log('Tipo de response.data:', typeof response.data)
      console.log('É array?', Array.isArray(response.data))
      
      const turmasData = Array.isArray(response.data) ? response.data : []
      // Ordenar turmas por ano e depois por nome
      const turmasOrdenadas = turmasData.sort((a, b) => {
        if (a.ano !== b.ano) return a.ano - b.ano;
        return a.nome.localeCompare(b.nome);
      })
      console.log('Turmas a serem definidas:', turmasOrdenadas)
      setTurmas(turmasOrdenadas)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
    }
  }

  // Função para selecionar turma e carregar suas disciplinas
  const selecionarTurma = async (turma: Turma) => {
    try {
      // Recarregar turma com disciplinas atualizadas
      const response = await turmasAPI.getById(turma.id)
      setTurmaSelecionada(response.data)
    } catch (error) {
      console.error('Erro ao carregar turma:', error)
      setTurmaSelecionada(turma)
    }
  }

  // Função para obter disciplinas de uma turma específica
  const getDisciplinasDaTurma = (turma: Turma): Disciplina[] => {
    // Retornar disciplinas diretamente da turma (já vem com professor correto do backend)
    return turma.disciplinas || []
  }

  const openModal = async (turma: Turma, disciplina?: Disciplina) => {
    console.log('Abrindo modal...')
    console.log('Turma:', turma)
    console.log('Disciplina:', disciplina)
    
    // Recarregar professores antes de abrir o modal
    await loadProfessores()
    
    setTurmaSelecionada(turma)
    
    if (disciplina) {
      setEditingId(disciplina.id)
      setFormData({
        nome: disciplina.nome,
        cargaHoraria: disciplina.cargaHoraria.toString(),
        professorNome: disciplina.professor?.nome || ''
      })
      console.log('Editando disciplina:', disciplina)
      console.log('Professor da disciplina:', disciplina.professor)
    } else {
      setEditingId(null)
      setFormData({
        nome: '',
        cargaHoraria: '',
        professorNome: ''
      })
      console.log('Nova disciplina')
    }
    setProfessorSuggestions([])
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setTurmaSelecionada(null)
    setFormData({
      nome: '',
      cargaHoraria: '',
      professorNome: ''
    })
    setProfessorSuggestions([])
  }

  const voltarParaCategorias = () => {
    setCategoriaAtiva(null)
    setTurmaSelecionada(null)
  }

  const voltarParaTurmas = () => {
    setTurmaSelecionada(null)
    // Recarregar turmas para obter dados atualizados
    loadTurmas()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!turmaSelecionada) {
      alert('Erro: Nenhuma turma selecionada.')
      return
    }
    
    try {
      const professor = professores.find(p => p.nome === formData.professorNome)
      
      const data = {
        nome: formData.nome,
        cargaHoraria: parseInt(formData.cargaHoraria),
        professorId: professor?.id || undefined,
        turmaIds: [turmaSelecionada.id]
      }

      if (editingId) {
        await disciplinasAPI.update(editingId, data as any)
      } else {
        await disciplinasAPI.create(data as any)
      }
      
      loadDisciplinas()
      closeModal()
    } catch (error) {
      console.error('Erro ao salvar disciplina:', error)
      alert('Erro ao salvar disciplina. Verifique os dados e tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir esta disciplina?')) {
      try {
        await disciplinasAPI.delete(id)
        loadDisciplinas()
      } catch (error) {
        console.error('Erro ao deletar disciplina:', error)
      }
    }
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="page">
      <BackButton />
      <div className="page-header">
        <h1>Disciplinas</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {categoriaAtiva && !turmaSelecionada && (
            <button className="btn-voltar" onClick={voltarParaCategorias}>
              <ArrowLeft size={16} />
              Voltar
            </button>
          )}
          {turmaSelecionada && (
            <>
              <button className="btn-voltar" onClick={voltarParaTurmas}>
                <ArrowLeft size={16} />
                Voltar
              </button>
              <button className="btn-primary" onClick={() => openModal()}>
                <Plus size={20} />
                Cadastrar Disciplina
              </button>
            </>
          )}
        </div>
      </div>

      {/* Seleção de Categoria */}
      {!categoriaAtiva && (
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
      )}

      {/* Seleção de Turma */}
      {categoriaAtiva && !turmaSelecionada && (
        <>
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
              {getTurmasPorCategoria(categoriaAtiva).length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                  <p>Nenhuma turma cadastrada para {categoriaAtiva === 'iniciais' ? 'Anos Iniciais (1º ao 5º ano)' : 'Anos Finais (6º ao 9º ano)'}.</p>
                  <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                    Cadastre turmas na aba "Turmas" primeiro.
                  </p>
                </div>
              ) : (
                getTurmasPorCategoria(categoriaAtiva)
                  .map((turma) => (
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
        </>
      )}

      {/* Lista de Disciplinas da Turma */}
      {turmaSelecionada && (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Carga Horária</th>
                  <th>Professor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {getDisciplinasDaTurma(turmaSelecionada).length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                      Nenhuma disciplina cadastrada para esta turma.
                    </td>
                  </tr>
                ) : (
                  getDisciplinasDaTurma(turmaSelecionada)
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                    .map((disciplina) => (
                      <tr key={disciplina.id}>
                        <td data-label="Nome">{disciplina.nome}</td>
                        <td data-label="Carga Horária">{disciplina.cargaHoraria}h</td>
                        <td data-label="Professor">{disciplina.professor?.nome || 'Sem professor'}</td>
                        <td data-label="Ações">
                          <div className="action-buttons">
                            <button
                              className="btn-edit"
                              onClick={() => openModal(turmaSelecionada, disciplina)}
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(disciplina.id)}
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && turmaSelecionada && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingId ? 'Editar Disciplina' : 'Nova Disciplina'}
                <span style={{ fontSize: '0.9em', fontWeight: 'normal', marginLeft: '10px' }}>
                  - {turmaSelecionada.nome}
                </span>
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome da Disciplina *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Matemática, Português..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Carga Horária (horas) *</label>
                  <input
                    type="number"
                    value={formData.cargaHoraria}
                    onChange={(e) => setFormData({ ...formData, cargaHoraria: e.target.value })}
                    placeholder="Ex: 60"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group autocomplete-container">
                  <label>Professor</label>
                  {professores.length === 0 ? (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '4px',
                      color: '#856404',
                      fontSize: '0.9em'
                    }}>
                      ⚠️ Nenhum professor cadastrado. Cadastre professores primeiro na aba "Professores".
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={formData.professorNome}
                        onChange={(e) => handleProfessorSearch(e.target.value)}
                        placeholder="Digite para buscar professor..."
                        autoComplete="off"
                      />
                      {professorSuggestions.length > 0 && (
                        <div className="autocomplete-suggestions">
                          {professorSuggestions.map((professor) => (
                            <div
                              key={professor.id}
                              onClick={() => selectProfessor(professor)}
                              className="autocomplete-suggestion-item"
                            >
                              {professor.nome} - {professor.especialidade || professor.area || 'Sem especialidade'}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  <Save size={20} />
                  {editingId ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Disciplinas
