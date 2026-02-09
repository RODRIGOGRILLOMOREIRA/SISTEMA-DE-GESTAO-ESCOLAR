import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, X, Save, BookOpen, ArrowLeft, Download } from 'lucide-react'
import { alunosAPI, turmasAPI, Aluno, Turma } from '../lib/api'
import { extractData, extractTotal } from '../utils/apiHelpers'
import BackButton from '../components/BackButton'
import { VirtualizedTable } from '../components/VirtualizedTable'
import { TableSkeleton } from '../components/skeletons/TableSkeleton'
import { exportToExcel, formatAlunosForExport } from '../utils/exportExcel'
import toast from 'react-hot-toast'
import './CommonPages.css'
import '../components/Modal.css'
import './Notas.css'

interface AlunoForm {
  nome: string
  cpf: string
  dataNascimento: string
  email: string
  telefone: string
  endereco: string
  responsavel: string
  telefoneResp: string
  turmaId: string
  numeroMatricula: string
  statusMatricula: string
}

type CategoriaAno = 'iniciais' | 'finais' | null

const Alunos = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaAno>(null)
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null)
  const [formData, setFormData] = useState<AlunoForm>({
    nome: '',
    cpf: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    endereco: '',
    responsavel: '',
    telefoneResp: '',
    turmaId: '',
    numeroMatricula: '',
    statusMatricula: 'ATIVO'
  })

  useEffect(() => {
    loadAlunos()
    loadTurmas()
  }, [])

  const loadAlunos = async () => {
    try {
      const response = await alunosAPI.getAll(1, 1000)
      const alunos = extractData(response.data)
      const total = extractTotal(response.data)
      setAlunos(alunos)
      toast.success(`${total} alunos carregados`)
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
      toast.error('Erro ao carregar alunos')
    } finally {
      setLoading(false)
    }
  }

  const loadTurmas = async () => {
    try {
      const response = await turmasAPI.getAll()
      setTurmas(extractData(response.data))
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

  // Função para filtrar alunos da turma selecionada
  const getAlunosDaTurma = (): Aluno[] => {
    if (!turmaSelecionada) return []
    return alunos.filter(a => a.turmaId === turmaSelecionada.id)
  }

  const voltarParaCategorias = () => {
    setCategoriaAtiva(null)
    setTurmaSelecionada(null)
  }

  const voltarParaTurmas = () => {
    setTurmaSelecionada(null)
  }

  const selecionarTurma = (turma: Turma) => {
    setTurmaSelecionada(turma)
  }

  const openModal = (aluno?: Aluno) => {
    if (aluno) {
      setEditingId(aluno.id)
      setFormData({
        nome: aluno.nome,
        cpf: aluno.cpf,
        dataNascimento: aluno.dataNascimento.split('T')[0],
        email: aluno.email,
        telefone: aluno.telefone || '',
        endereco: aluno.endereco || '',
        responsavel: aluno.responsavel,
        telefoneResp: aluno.telefoneResp,
        turmaId: aluno.turmaId || '',
        numeroMatricula: aluno.numeroMatricula || '',
        statusMatricula: aluno.statusMatricula || 'ATIVO'
      })
    } else {
      setEditingId(null)
      setFormData({
        nome: '',
        cpf: '',
        dataNascimento: '',
        email: '',
        telefone: '',
        endereco: '',
        responsavel: '',
        telefoneResp: '',
        turmaId: turmaSelecionada?.id || '',
        numeroMatricula: '',
        statusMatricula: 'ATIVO'
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      nome: '',
      cpf: '',
      dataNascimento: '',
      email: '',
      telefone: '',
      endereco: '',
      responsavel: '',
      telefoneResp: '',
      turmaId: '',
      numeroMatricula: '',
      statusMatricula: 'ATIVO'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const loadingToast = toast.loading(editingId ? 'Atualizando aluno...' : 'Cadastrando aluno...')
    
    try {
      const data = {
        ...formData,
        dataNascimento: new Date(formData.dataNascimento).toISOString(),
        turmaId: formData.turmaId || null,
        telefone: formData.telefone || null,
        endereco: formData.endereco || null
      }

      if (editingId) {
        await alunosAPI.update(editingId, data)
        toast.success('Aluno atualizado com sucesso!', { id: loadingToast })
      } else {
        await alunosAPI.create(data)
        toast.success('Aluno cadastrado com sucesso!', { id: loadingToast })
      }
      
      loadAlunos()
      closeModal()
    } catch (error) {
      console.error('Erro ao salvar aluno:', error)
      toast.error('Erro ao salvar aluno. Verifique os dados e tente novamente.', { id: loadingToast })
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este aluno?')) {
      const loadingToast = toast.loading('Excluindo aluno...')
      try {
        await alunosAPI.delete(id)
        toast.success('Aluno excluído com sucesso!', { id: loadingToast })
        loadAlunos()
      } catch (error) {
        console.error('Erro ao deletar aluno:', error)
        toast.error('Erro ao excluir aluno', { id: loadingToast })
      }
    }
  }

  const handleExport = () => {
    const dataToExport = turmaSelecionada 
      ? alunosDaTurma 
      : alunos;
    
    if (dataToExport.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    const formattedData = formatAlunosForExport(dataToExport);
    const success = exportToExcel({
      filename: `alunos-${turmaSelecionada?.nome || 'todos'}-${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Alunos',
      data: formattedData,
      columns: [
        { header: 'Matrícula', key: 'Matrícula', width: 15 },
        { header: 'Nome', key: 'Nome', width: 30 },
        { header: 'CPF', key: 'CPF', width: 15 },
        { header: 'Data Nascimento', key: 'Data Nascimento', width: 18 },
        { header: 'Email', key: 'Email', width: 30 },
        { header: 'Telefone', key: 'Telefone', width: 15 },
        { header: 'Responsável', key: 'Responsável', width: 30 },
        { header: 'Tel. Responsável', key: 'Tel. Responsável', width: 15 },
        { header: 'Turma', key: 'Turma', width: 20 },
        { header: 'Status', key: 'Status', width: 12 },
      ],
    });

    if (success) {
      toast.success('Planilha exportada com sucesso!');
    } else {
      toast.error('Erro ao exportar planilha');
    }
  };


  if (loading) return (
    <div className="page">
      <BackButton />
      <div className="page-header">
        <h1>Alunos</h1>
      </div>
      <TableSkeleton rows={8} columns={4} />
    </div>
  )

  const turmasFiltradas = getTurmasPorCategoria()
  const alunosDaTurma = getAlunosDaTurma()

  return (
    <div className="page">
      <BackButton />
      <div className="page-header">
        <h1>Alunos</h1>
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
              <button 
                className="btn-secondary" 
                onClick={handleExport}
                disabled={alunosDaTurma.length === 0}
              >
                <Download size={20} />
                Exportar Excel
              </button>
              <button className="btn-primary" onClick={() => openModal()}>
                <Plus size={20} />
                Cadastrar Aluno
              </button>
            </>
          )}
        </div>
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
      ) : !turmaSelecionada ? (
        <>
          <div className="selection-section">
            <div className="selection-header">
              <BookOpen size={24} className="selection-icon" />
              <h2>Selecione a Turma</h2>
            </div>
            {turmasFiltradas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>Nenhuma turma cadastrada nesta categoria.</p>
              </div>
            ) : (
              <div className="selection-grid">
                {turmasFiltradas.map((turma) => (
                  <button
                    key={turma.id}
                    className="selection-btn"
                    onClick={() => selecionarTurma(turma)}
                  >
                    <div className="selection-btn-content">
                      <span className="selection-btn-title">
                        {turma.nome}
                      </span>
                      <span className="selection-btn-title" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                        {turma.alunos?.length || 0} {(turma.alunos?.length || 0) === 1 ? 'aluno' : 'alunos'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {alunosDaTurma.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>Nenhum aluno cadastrado nesta turma.</p>
            </div>
          ) : (
            <VirtualizedTable
              data={alunosDaTurma}
              columns={[
                {
                  key: 'nome',
                  label: 'Nome',
                  render: (aluno: Aluno) => aluno.nome
                },
                {
                  key: 'numeroMatricula',
                  label: 'Número de Matrícula',
                  render: (aluno: Aluno) => aluno.numeroMatricula || '-'
                },
                {
                  key: 'statusMatricula',
                  label: 'Status da Matrícula',
                  render: (aluno: Aluno) => (
                    <span className={`status-badge ${aluno.statusMatricula?.toLowerCase()}`}>
                      {aluno.statusMatricula || 'ATIVO'}
                    </span>
                  )
                },
                {
                  key: 'actions',
                  label: 'Ações',
                  sortable: false,
                  render: (aluno: Aluno) => (
                    <div className="action-buttons">
                      <button 
                        className="btn-icon" 
                        title="Editar"
                        onClick={(e) => {
                          e.stopPropagation()
                          openModal(aluno)
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-danger" 
                        title="Excluir"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(aluno.id)
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                }
              ]}
              searchable={true}
              searchKeys={['nome', 'numeroMatricula']}
              emptyMessage="Nenhum aluno encontrado"
              onRowClick={(aluno) => openModal(aluno)}
            />
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Editar Aluno' : 'Novo Aluno'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Número de Matrícula *</label>
                    <input
                      type="text"
                      value={formData.numeroMatricula}
                      onChange={(e) => setFormData({ ...formData, numeroMatricula: e.target.value })}
                      placeholder="Digite o número de matrícula"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Status da Matrícula *</label>
                    <select
                      value={formData.statusMatricula}
                      onChange={(e) => setFormData({ ...formData, statusMatricula: e.target.value })}
                      required
                    >
                      <option value="ATIVO">Ativo</option>
                      <option value="INATIVO">Inativo</option>
                      <option value="TRANSFERIDO">Transferido</option>
                      <option value="CONCLUIDO">Concluído</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>CPF *</label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Data de Nascimento *</label>
                    <input
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="aluno@email.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefone</label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Endereço</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Responsável *</label>
                    <input
                      type="text"
                      value={formData.responsavel}
                      onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                      placeholder="Nome do responsável"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefone do Responsável *</label>
                    <input
                      type="tel"
                      value={formData.telefoneResp}
                      onChange={(e) => setFormData({ ...formData, telefoneResp: e.target.value })}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Turma *</label>
                  <select
                    value={formData.turmaId}
                    onChange={(e) => setFormData({ ...formData, turmaId: e.target.value })}
                    required
                  >
                    <option value="">Selecione uma turma</option>
                    {turmas
                      .filter(t => categoriaAtiva === 'iniciais' ? t.ano >= 1 && t.ano <= 5 : t.ano >= 6 && t.ano <= 9)
                      .map((turma) => (
                        <option key={turma.id} value={turma.id}>
                          {turma.nome} - {turma.ano}º Ano ({turma.periodo})
                        </option>
                      ))}
                  </select>
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

export default Alunos
