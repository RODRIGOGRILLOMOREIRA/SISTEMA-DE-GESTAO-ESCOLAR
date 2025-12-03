import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit } from 'lucide-react'
import { alunosAPI, Aluno } from '../lib/api'
import './CommonPages.css'

const Alunos = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlunos()
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
        <button className="btn-primary">
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
                    <button className="btn-icon" title="Editar">
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
    </div>
  )
}

export default Alunos
