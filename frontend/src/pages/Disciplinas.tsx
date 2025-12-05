import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, X, Save } from 'lucide-react'
import { disciplinasAPI, professoresAPI, Disciplina, Professor } from '../lib/api'
import './CommonPages.css'
import '../components/Modal.css'

interface DisciplinaForm {
  nome: string
  cargaHoraria: string
  professorId: string
}

const Disciplinas = () => {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [professores, setProfessores] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<DisciplinaForm>({
    nome: '',
    cargaHoraria: '',
    professorId: ''
  })

  useEffect(() => {
    loadDisciplinas()
    loadProfessores()
  }, [])

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
      const response = await professoresAPI.getAll()
      setProfessores(response.data)
    } catch (error) {
      console.error('Erro ao carregar professores:', error)
    }
  }

  const openModal = (disciplina?: Disciplina) => {
    // Recarregar professores toda vez que abrir o modal
    loadProfessores()
    
    if (disciplina) {
      setEditingId(disciplina.id)
      setFormData({
        nome: disciplina.nome,
        cargaHoraria: disciplina.cargaHoraria.toString(),
        professorId: disciplina.professorId || ''
      })
    } else {
      setEditingId(null)
      setFormData({
        nome: '',
        cargaHoraria: '',
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
      cargaHoraria: '',
      professorId: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        nome: formData.nome,
        cargaHoraria: parseInt(formData.cargaHoraria),
        professorId: formData.professorId || null
      }

      if (editingId) {
        await disciplinasAPI.update(editingId, data)
      } else {
        await disciplinasAPI.create(data)
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
      <div className="page-header">
        <h1>Disciplinas</h1>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Nova Disciplina
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Carga Horária</th>
              <th>Professor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {disciplinas.map((disciplina) => (
              <tr key={disciplina.id}>
                <td>{disciplina.nome}</td>
                <td>{disciplina.cargaHoraria}h</td>
                <td>{disciplina.professor?.nome || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon" 
                      title="Editar"
                      onClick={() => openModal(disciplina)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      title="Excluir"
                      onClick={() => handleDelete(disciplina.id)}
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
              <h2>{editingId ? 'Editar Disciplina' : 'Nova Disciplina'}</h2>
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

                <div className="form-row">
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

                  <div className="form-group">
                    <label>Professor</label>
                    <select
                      value={formData.professorId}
                      onChange={(e) => setFormData({ ...formData, professorId: e.target.value })}
                    >
                      <option value="">Selecione um professor</option>
                      {professores.map((professor) => (
                        <option key={professor.id} value={professor.id}>
                          {professor.nome}
                        </option>
                      ))}
                    </select>
                  </div>
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
