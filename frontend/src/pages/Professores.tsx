import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, X, Save } from 'lucide-react'
import { professoresAPI, Professor } from '../lib/api'
import './CommonPages.css'
import '../components/Modal.css'

interface ProfessorForm {
  nome: string
  cpf: string
  email: string
  telefone: string
  especialidade: string
}

const Professores = () => {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProfessorForm>({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    especialidade: ''
  })

  useEffect(() => {
    loadProfessores()
  }, [])

  const loadProfessores = async () => {
    try {
      const response = await professoresAPI.getAll()
      setProfessores(response.data)
    } catch (error) {
      console.error('Erro ao carregar professores:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (professor?: Professor) => {
    if (professor) {
      setEditingId(professor.id)
      setFormData({
        nome: professor.nome,
        cpf: professor.cpf,
        email: professor.email,
        telefone: professor.telefone,
        especialidade: professor.especialidade
      })
    } else {
      setEditingId(null)
      setFormData({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        especialidade: ''
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
      email: '',
      telefone: '',
      especialidade: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await professoresAPI.update(editingId, formData)
      } else {
        await professoresAPI.create(formData)
      }
      
      loadProfessores()
      closeModal()
    } catch (error) {
      console.error('Erro ao salvar professor:', error)
      alert('Erro ao salvar professor. Verifique os dados e tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este professor?')) {
      try {
        await professoresAPI.delete(id)
        loadProfessores()
      } catch (error) {
        console.error('Erro ao deletar professor:', error)
      }
    }
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Professores</h1>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Novo Professor
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Especialidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {professores.map((professor) => (
              <tr key={professor.id}>
                <td>{professor.nome}</td>
                <td>{professor.cpf}</td>
                <td>{professor.email}</td>
                <td>{professor.telefone}</td>
                <td>{professor.especialidade}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon" 
                      title="Editar"
                      onClick={() => openModal(professor)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      title="Excluir"
                      onClick={() => handleDelete(professor.id)}
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
              <h2>{editingId ? 'Editar Professor' : 'Novo Professor'}</h2>
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
                    <label>Telefone *</label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="professor@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Especialidade *</label>
                  <input
                    type="text"
                    value={formData.especialidade}
                    onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                    placeholder="Ex: Matemática, Português, Ciências..."
                    required
                  />
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

export default Professores
