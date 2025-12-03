import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit } from 'lucide-react'
import { disciplinasAPI, Disciplina } from '../lib/api'
import './CommonPages.css'

const Disciplinas = () => {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDisciplinas()
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
        <button className="btn-primary">
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
                    <button className="btn-icon" title="Editar">
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
    </div>
  )
}

export default Disciplinas
