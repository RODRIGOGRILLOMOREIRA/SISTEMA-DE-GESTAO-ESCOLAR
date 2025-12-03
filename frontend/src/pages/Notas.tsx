import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit } from 'lucide-react'
import { notasAPI, Nota } from '../lib/api'
import './CommonPages.css'

const Notas = () => {
  const [notas, setNotas] = useState<Nota[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotas()
  }, [])

  const loadNotas = async () => {
    try {
      const response = await notasAPI.getAll()
      setNotas(response.data)
    } catch (error) {
      console.error('Erro ao carregar notas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir esta nota?')) {
      try {
        await notasAPI.delete(id)
        loadNotas()
      } catch (error) {
        console.error('Erro ao deletar nota:', error)
      }
    }
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Notas</h1>
        <button className="btn-primary">
          <Plus size={20} />
          Lançar Nota
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Disciplina</th>
              <th>Bimestre</th>
              <th>Nota</th>
              <th>Observação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {notas.map((nota) => (
              <tr key={nota.id}>
                <td>{nota.aluno?.nome || '-'}</td>
                <td>{nota.disciplina?.nome || '-'}</td>
                <td>{nota.bimestre}º</td>
                <td>
                  <span className={`nota ${nota.nota >= 6 ? 'aprovado' : 'reprovado'}`}>
                    {nota.nota.toFixed(1)}
                  </span>
                </td>
                <td>{nota.observacao || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Editar">
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      title="Excluir"
                      onClick={() => handleDelete(nota.id)}
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

export default Notas
