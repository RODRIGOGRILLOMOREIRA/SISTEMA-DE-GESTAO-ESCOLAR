import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, X, Save } from 'lucide-react'
import { turmasAPI, professoresAPI, Turma, Professor } from '../lib/api'
import './CommonPages.css'
import '../components/Modal.css'

interface TurmaForm {
  nome: string
  ano: string
  periodo: string
  professorId: string
}

const Turmas = () => {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [professores, setProfessores] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<TurmaForm>({
    nome: '',
    ano: '',
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
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
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

  const openModal = (turma?: Turma) => {
    // Recarregar professores toda vez que abrir o modal
    loadProfessores()
    
    if (turma) {
      setEditingId(turma.id)
      setFormData({
        nome: turma.nome,
        ano: turma.ano.toString(),
        periodo: turma.periodo,
        professorId: turma.professorId || ''
      })
    } else {
      setEditingId(null)
      setFormData({
        nome: '',
        ano: '',
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
      periodo: '',
      professorId: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        nome: formData.nome,
        ano: parseInt(formData.ano),
        periodo: formData.periodo,
        professorId: formData.professorId || null
      }

      if (editingId) {
        await turmasAPI.update(editingId, data)
      } else {
        await turmasAPI.create(data)
      }
      
      loadTurmas()
      closeModal()
    } catch (error) {
      console.error('Erro ao salvar turma:', error)
      alert('Erro ao salvar turma. Verifique os dados e tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir esta turma?')) {
      try {
        await turmasAPI.delete(id)
        loadTurmas()
      } catch (error) {
        console.error('Erro ao deletar turma:', error)
      }
    }
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Turmas</h1>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Nova Turma
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ano</th>
              <th>Período</th>
              <th>Professor</th>
              <th>Qtd. Alunos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {turmas.map((turma) => (
              <tr key={turma.id}>
                <td>{turma.nome}</td>
                <td>{turma.ano}</td>
                <td>{turma.periodo}</td>
                <td>{turma.professor?.nome || '-'}</td>
                <td>{turma.alunos?.length || 0}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon" 
                      title="Editar"
                      onClick={() => openModal(turma)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      title="Excluir"
                      onClick={() => handleDelete(turma.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                    <input
                      type="number"
                      value={formData.ano}
                      onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                      placeholder="Ex: 2024"
                      min="2020"
                      max="2030"
                      required
                    />
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
