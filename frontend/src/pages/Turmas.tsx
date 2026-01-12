import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, X, Save, BookOpen, GraduationCap, ArrowLeft, Download } from 'lucide-react'
import { turmasAPI, professoresAPI, Turma, Professor } from '../lib/api'
import BackButton from '../components/BackButton'
import { VirtualizedTable } from '../components/VirtualizedTable'
import { TableSkeleton } from '../components/skeletons/TableSkeleton'
import { exportToExcel, formatTurmasForExport } from '../utils/exportExcel'
import toast from 'react-hot-toast'
import './CommonPages.css'
import '../components/Modal.css'
import './Notas.css'

interface TurmaForm {
  nome: string
  ano: string
  anoLetivo: string
  periodo: string
  professorId: string
}

type CategoriaAno = 'iniciais' | 'finais' | null

const Turmas = () => {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [professores, setProfessores] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaAno>(null)
  const [formData, setFormData] = useState<TurmaForm>({
    nome: '',
    ano: '',
    anoLetivo: new Date().getFullYear().toString(),
    periodo: '',
    professorId: ''
  })

  useEffect(() => {
    loadTurmas()
    loadProfessores()
  }, [])

  const loadTurmas = async () => {
    try {
      const response = await turmasAPI.getAll()
      setTurmas(response.data)
      toast.success(`${response.data.length} turmas carregadas`)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
      toast.error('Erro ao carregar turmas')
    } finally {
      setLoading(false)
    }
  }

  const loadProfessores = async () => {
    try {
      const response = await professoresAPI.getAll()
      setProfessores(response.data)
    } catch (error) {
      console.error('Erro ao carregar professores:', error)
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

  const voltarParaCategorias = () => {
    setCategoriaAtiva(null)
  }

  const openModal = (turma?: Turma) => {
    loadProfessores()
    
    if (turma) {
      setEditingId(turma.id)
      setFormData({
        nome: turma.nome,
        ano: turma.ano.toString(),
        anoLetivo: turma.anoLetivo.toString(),
        periodo: turma.periodo,
        professorId: turma.professorId || ''
      })
    } else {
      setEditingId(null)
      // Define ano padrão baseado na categoria
      const anoInicial = categoriaAtiva === 'iniciais' ? '1' : '6'
      setFormData({
        nome: '',
        ano: anoInicial,
        anoLetivo: new Date().getFullYear().toString(),
        periodo: '',
        professorId: ''
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      nome: '',
      ano: '',
      anoLetivo: new Date().getFullYear().toString(),
      periodo: '',
      professorId: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const loadingToast = toast.loading(editingId ? 'Atualizando turma...' : 'Criando turma...')
    
    try {
      const data = {
        nome: formData.nome,
        ano: parseInt(formData.ano),
        anoLetivo: parseInt(formData.anoLetivo),
        periodo: formData.periodo,
        professorId: formData.professorId || null
      }

      if (editingId) {
        await turmasAPI.update(editingId, data)
        toast.success('Turma atualizada com sucesso!', { id: loadingToast })
      } else {
        await turmasAPI.create(data)
        toast.success('Turma criada com sucesso!', { id: loadingToast })
      }
      
      loadTurmas()
      closeModal()
    } catch (error) {
      console.error('Erro ao salvar turma:', error)
      toast.error('Erro ao salvar turma. Verifique os dados e tente novamente.', { id: loadingToast })
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir esta turma?')) {
      const loadingToast = toast.loading('Excluindo turma...')
      try {
        await turmasAPI.delete(id)
        toast.success('Turma excluída com sucesso!', { id: loadingToast })
        loadTurmas()
      } catch (error) {
        console.error('Erro ao deletar turma:', error)
        toast.error('Erro ao excluir turma', { id: loadingToast })
      }
    }
  }

  const handleExport = () => {
    const dataToExport = categoriaAtiva ? turmasFiltradas : turmas;
    
    if (dataToExport.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    const formattedData = formatTurmasForExport(dataToExport);
    const success = exportToExcel({
      filename: `turmas-${categoriaAtiva || 'todas'}-${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Turmas',
      data: formattedData,
      columns: [
        { header: 'Nome', key: 'Nome', width: 20 },
        { header: 'Ano', key: 'Ano', width: 10 },
        { header: 'Ano Letivo', key: 'Ano Letivo', width: 12 },
        { header: 'Período', key: 'Período', width: 15 },
        { header: 'Professor', key: 'Professor', width: 30 },
        { header: 'Total Alunos', key: 'Total Alunos', width: 15 },
        { header: 'Total Disciplinas', key: 'Total Disciplinas', width: 18 },
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
        <h1>Turmas</h1>
      </div>
      <TableSkeleton rows={6} columns={7} />
    </div>
  )

  const turmasFiltradas = getTurmasPorCategoria()

  return (
    <div className="page">
      <BackButton />
      <div className="page-header">
        <h1>Turmas</h1>
        {categoriaAtiva && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-voltar" onClick={voltarParaCategorias}>
              <ArrowLeft size={16} />
              Voltar
            </button>
            <button 
              className="btn-secondary" 
              onClick={handleExport}
              disabled={turmasFiltradas.length === 0}
            >
              <Download size={20} />
              Exportar Excel
            </button>
            <button className="btn-primary" onClick={() => openModal()}>
              <Plus size={20} />
              Nova Turma
            </button>
          </div>
        )}
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
      ) : (
        <>

          {turmasFiltradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>Nenhuma turma cadastrada nesta categoria.</p>
            </div>
          ) : (
            <VirtualizedTable
              data={turmasFiltradas}
              columns={[
                {
                  key: 'nome',
                  label: 'Nome',
                  render: (turma: Turma) => turma.nome
                },
                {
                  key: 'ano',
                  label: 'Ano',
                  render: (turma: Turma) => turma.ano
                },
                {
                  key: 'anoLetivo',
                  label: 'Ano Letivo',
                  render: (turma: Turma) => turma.anoLetivo
                },
                {
                  key: 'periodo',
                  label: 'Período',
                  render: (turma: Turma) => turma.periodo
                },
                {
                  key: 'professor',
                  label: 'Professor',
                  render: (turma: Turma) => turma.professor?.nome || '-'
                },
                {
                  key: 'alunos',
                  label: 'Qtd. Alunos',
                  render: (turma: Turma) => turma.alunos?.length || 0
                },
                {
                  key: 'actions',
                  label: 'Ações',
                  sortable: false,
                  render: (turma: Turma) => (
                    <div className="action-buttons">
                      <button 
                        className="btn-icon" 
                        title="Editar"
                        onClick={(e) => {
                          e.stopPropagation()
                          openModal(turma)
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-danger" 
                        title="Excluir"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(turma.id)
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                }
              ]}
              searchable={true}
              searchKeys={['nome', 'periodo']}
              emptyMessage="Nenhuma turma encontrada"
              onRowClick={(turma) => openModal(turma)}
            />
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Editar Turma' : 'Nova Turma'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome da Turma *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: 3º Ano A, Turma Integral..."
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ano *</label>
                    <select
                      value={formData.ano}
                      onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                      required
                    >
                      <option value="">Selecione o ano</option>
                      {categoriaAtiva === 'iniciais' ? (
                        <>
                          <option value="1">1º Ano</option>
                          <option value="2">2º Ano</option>
                          <option value="3">3º Ano</option>
                          <option value="4">4º Ano</option>
                          <option value="5">5º Ano</option>
                        </>
                      ) : (
                        <>
                          <option value="6">6º Ano</option>
                          <option value="7">7º Ano</option>
                          <option value="8">8º Ano</option>
                          <option value="9">9º Ano</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Ano Letivo *</label>
                    <select
                      value={formData.anoLetivo}
                      onChange={(e) => setFormData({ ...formData, anoLetivo: e.target.value })}
                      required
                    >
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                      <option value="2029">2029</option>
                      <option value="2030">2030</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Período *</label>
                  <select
                    value={formData.periodo}
                    onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                    required
                  >
                    <option value="">Selecione o período</option>
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                    <option value="Integral">Integral</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Professor Responsável</label>
                  <select
                    value={formData.professorId}
                    onChange={(e) => setFormData({ ...formData, professorId: e.target.value })}
                  >
                    <option value="">Selecione um professor</option>
                    {professores.map((professor) => (
                      <option key={professor.id} value={professor.id}>
                        {professor.nome} - {professor.especialidade}
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

export default Turmas
