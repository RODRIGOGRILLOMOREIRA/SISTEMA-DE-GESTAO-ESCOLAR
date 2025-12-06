import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, X, Save } from 'lucide-react'
import { funcionariosAPI, type Funcionario } from '../lib/api'
import './CommonPages.css'
import '../components/Modal.css'

interface FuncionarioForm {
  nome: string
  cpf: string
  email: string
  telefone: string
  cargo: string
  setor: string
}

const FuncionariosPage = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FuncionarioForm>({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cargo: '',
    setor: ''
  })

  useEffect(() => {
    loadFuncionarios()
  }, [])

  const loadFuncionarios = async () => {
    try {
      const response = await funcionariosAPI.getAll()
      setFuncionarios(response.data)
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (funcionario?: Funcionario) => {
    if (funcionario) {
      setEditingId(funcionario.id)
      setFormData({
        nome: funcionario.nome,
        cpf: funcionario.cpf,
        email: funcionario.email,
        telefone: funcionario.telefone || '',
        cargo: funcionario.cargo,
        setor: funcionario.setor || ''
      })
    } else {
      setEditingId(null)
      setFormData({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        cargo: '',
        setor: ''
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
      cargo: '',
      setor: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await funcionariosAPI.update(editingId, formData)
      } else {
        await funcionariosAPI.create(formData)
      }
      
      loadFuncionarios()
      closeModal()
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error)
      alert('Erro ao salvar funcionário. Verifique os dados e tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este funcionário?')) {
      try {
        await funcionariosAPI.delete(id)
        loadFuncionarios()
      } catch (error) {
        console.error('Erro ao deletar funcionário:', error)
      }
    }
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Funcionários</h1>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Novo Funcionário
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
              <th>Setor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map((funcionario) => (
              <tr key={funcionario.id}>
                <td>{funcionario.nome}</td>
                <td>{funcionario.cpf}</td>
                <td>{funcionario.email}</td>
                <td>{funcionario.telefone || '-'}</td>
                <td>{funcionario.cargo}</td>
                <td>{funcionario.setor || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon" 
                      title="Editar"
                      onClick={() => openModal(funcionario)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      title="Excluir"
                      onClick={() => handleDelete(funcionario.id)}
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
              <h2>{editingId ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
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

                <div className="form-row">
                  <div className="form-group">
                    <label>Cargo *</label>
                    <input
                      type="text"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      placeholder="Ex: Auxiliar, Secretário..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Setor</label>
                    <input
                      type="text"
                      value={formData.setor}
                      onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                      placeholder="Ex: Secretaria, Limpeza..."
                    />
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

export default FuncionariosPage
