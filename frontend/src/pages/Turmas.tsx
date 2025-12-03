import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit } from 'lucide-react'
import { turmasAPI, Turma } from '../lib/api'
import './CommonPages.css'

const Turmas = () => {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTurmas()
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
        <button className="btn-primary">
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
                    <button className="btn-icon" title="Editar">
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
    </div>
  )
}

export default Turmas
