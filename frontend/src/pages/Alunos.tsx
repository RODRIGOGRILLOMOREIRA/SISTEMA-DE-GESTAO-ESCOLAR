import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, X, Save } from 'lucide-react'
import { alunosAPI, turmasAPI, Aluno, Turma } from '../lib/api'
import './CommonPages.css'
import '../components/Modal.css'

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
}

const Alunos = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AlunoForm>({
    nome: '',
    cpf: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    endereco: '',
    responsavel: '',
    telefoneResp: '',
    turmaId: ''
  })

  useEffect(() => {
    loadAlunos()
    loadTurmas()
  }, [])

  const loadAlunos = async () => {
    try {
      const response = await alunosAPI.getAll()
      setAlunos(response.data)
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTurmas = async () => {
    try {
      const response = await turmasAPI.getAll()
      setTurmas(response.data)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
    }
  }

  const openModal = (aluno?: Aluno) => {
    // Recarregar turmas toda vez que abrir o modal
    loadTurmas()
    
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
        turmaId: aluno.turmaId || ''
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
        turmaId: ''
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
      turmaId: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      } else {
        await alunosAPI.create(data)
      }
      
      loadAlunos()
      closeModal()
    } catch (error) {
      console.error('Erro ao salvar aluno:', error)
      alert('Erro ao salvar aluno. Verifique os dados e tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este aluno?')) {
      try {
        await alunosAPI.delete(id)
        loadAlunos()
      } catch (error) {
        console.error('Erro ao deletar aluno:', error)
      }
    }
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Alunos</h1>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Novo Aluno
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Email</th>
              <th>Turma</th>
              <th>Responsável</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => (
              <tr key={aluno.id}>
                <td>{aluno.nome}</td>
                <td>{aluno.cpf}</td>
                <td>{aluno.email}</td>
                <td>{aluno.turma?.nome || '-'}</td>
                <td>{aluno.responsavel}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon" 
                      title="Editar"
                      onClick={() => openModal(aluno)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      title="Excluir"
                      onClick={() => handleDelete(aluno.id)}
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
                  <label>Turma</label>
                  <select
                    value={formData.turmaId}
                    onChange={(e) => setFormData({ ...formData, turmaId: e.target.value })}
                  >
                    <option value="">Selecione uma turma</option>
                    {turmas.map((turma) => (
                      <option key={turma.id} value={turma.id}>
                        {turma.nome} - {turma.ano} ({turma.periodo})
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
