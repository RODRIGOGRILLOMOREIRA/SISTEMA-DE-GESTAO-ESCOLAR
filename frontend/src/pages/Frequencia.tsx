import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { frequenciasAPI, Frequencia as FrequenciaType } from '../lib/api'
import './CommonPages.css'

const Frequencia = () => {
  const [frequencias, setFrequencias] = useState<FrequenciaType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFrequencias()
  }, [])

  const loadFrequencias = async () => {
    try {
      const response = await frequenciasAPI.getAll()
      setFrequencias(response.data)
    } catch (error) {
      console.error('Erro ao carregar frequências:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este registro?')) {
      try {
        await frequenciasAPI.delete(id)
        loadFrequencias()
      } catch (error) {
        console.error('Erro ao deletar frequência:', error)
      }
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Frequência</h1>
        <button className="btn-primary">
          <Plus size={20} />
          Registrar Frequência
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Aluno</th>
              <th>Turma</th>
              <th>Status</th>
              <th>Observação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {frequencias.map((freq) => (
              <tr key={freq.id}>
                <td>{formatDate(freq.data)}</td>
                <td>{freq.aluno?.nome || '-'}</td>
                <td>{freq.turma?.nome || '-'}</td>
                <td>
                  <span className={`status ${freq.presente ? 'presente' : 'ausente'}`}>
                    {freq.presente ? 'Presente' : 'Ausente'}
                  </span>
                </td>
                <td>{freq.observacao || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon btn-danger" 
                      title="Excluir"
                      onClick={() => handleDelete(freq.id)}
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

export default Frequencia
