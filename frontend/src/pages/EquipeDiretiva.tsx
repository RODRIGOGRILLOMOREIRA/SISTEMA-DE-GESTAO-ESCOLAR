import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, X, Save } from 'lucide-react'
import { equipeDiretivaAPI, type EquipeDiretiva } from '../lib/api'
import './EquipeDiretiva.css'
import '../components/Modal.css'

interface EquipeDiretivaForm {
  nome: string
  cpf: string
  email: string
  telefone: string
  cargo: string
}

const EquipeDiretivaPage = () => {
  const [equipe, setEquipe] = useState<EquipeDiretiva[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<EquipeDiretivaForm>({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cargo: ''
  })

  useEffect(() => {
    loadEquipe()
  }, [])

  const loadEquipe = async () => {
    try {
      const response = await equipeDiretivaAPI.getAll()
      setEquipe(response.data)
    } catch (error) {
      console.error('Erro ao carregar equipe diretiva:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (membro?: EquipeDiretiva) => {
    if (membro) {
      setEditingId(membro.id)
      setFormData({
        nome: membro.nome,
        cpf: membro.cpf,
        email: membro.email,
        telefone: membro.telefone || '',
        cargo: membro.cargo
      })
    } else {
      setEditingId(null)
      setFormData({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        cargo: ''
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
      cargo: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await equipeDiretivaAPI.update(editingId, formData)
      } else {
        await equipeDiretivaAPI.create(formData)
      }
      
      loadEquipe()
      closeModal()
    } catch (error) {
      console.error('Erro ao salvar membro:', error)
      alert('Erro ao salvar membro. Verifique os dados e tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este membro?')) {
      try {
        await equipeDiretivaAPI.delete(id)
        loadEquipe()
      } catch (error) {
        console.error('Erro ao deletar membro:', error)
      }
    }
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Equipe Diretiva</h1>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Novo Membro
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
              <th>Cargo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipe.map((membro) => (
              <tr key={membro.id}>
                <td>{membro.nome}</td>
                <td>{membro.cpf}</td>
                <td>{membro.email}</td>
                <td>{membro.telefone || '-'}</td>
                <td>{membro.cargo}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon" 
                      title="Editar"
                      onClick={() => openModal(membro)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      title="Excluir"
                      onClick={() => handleDelete(membro.id)}
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
              <h2>{editingId ? 'Editar Membro' : 'Novo Membro'}</h2>
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
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cargo *</label>
                  <input
                    type="text"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    placeholder="Ex: Diretor, Vice-Diretor, Coordenador..."
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

export default EquipeDiretivaPage
