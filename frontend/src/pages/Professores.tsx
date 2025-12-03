import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit } from 'lucide-react'
import { professoresAPI, Professor } from '../lib/api'
import './CommonPages.css'

const Professores = () => {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)

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
        <button className="btn-primary">
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
                    <button className="btn-icon" title="Editar">
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
    </div>
  )
}

export default Professores
