import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, X, Save, Download } from 'lucide-react'
import { professoresAPI, turmasAPI, disciplinasAPI, Professor, Turma, Disciplina } from '../lib/api'
import BackButton from '../components/BackButton'
import { exportToExcel } from '../utils/exportExcel'
import toast from 'react-hot-toast'
import './CommonPages.css'
import '../components/Modal.css'

interface ProfessorForm {
  nome: string
  cpf: string
  email: string
  telefone: string
  area: string
  componentes: string[]
  turmasVinculadas: string[]
}

const Professores = () => {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProfessorForm>({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    area: '',
    componentes: [],
    turmasVinculadas: []
  })

  useEffect(() => {
    loadProfessores()
    loadTurmas()
    loadDisciplinas()
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

  const loadTurmas = async () => {
    try {
      const response = await turmasAPI.getAll()
      const turmasOrdenadas = response.data.sort((a, b) => a.ano - b.ano)
      setTurmas(turmasOrdenadas)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
    }
  }

  const loadDisciplinas = async () => {
    try {
      const response = await disciplinasAPI.getAll()
      const disciplinasOrdenadas = response.data.sort((a, b) => a.nome.localeCompare(b.nome))
      setDisciplinas(disciplinasOrdenadas)
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error)
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
        area: professor.area || '',
        componentes: professor.componentes ? JSON.parse(professor.componentes) : [],
        turmasVinculadas: professor.turmasVinculadas ? JSON.parse(professor.turmasVinculadas) : []
      })
    } else {
      setEditingId(null)
      setFormData({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        area: '',
        componentes: [],
        turmasVinculadas: []
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
      area: '',
      componentes: [],
      turmasVinculadas: []
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dataToSend = {
        ...formData,
        componentes: JSON.stringify(formData.componentes),
        turmasVinculadas: JSON.stringify(formData.turmasVinculadas)
      }
      
      if (editingId) {
        await professoresAPI.update(editingId, dataToSend)
      } else {
        await professoresAPI.create(dataToSend)
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
        toast.success('Professor excluído com sucesso!')
        loadProfessores()
      } catch (error) {
        console.error('Erro ao deletar professor:', error)
        toast.error('Erro ao excluir professor')
      }
    }
  }

  const handleExport = () => {
    if (professores.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    const formattedData = professores.map(prof => ({
      'Nome': prof.nome,
      'CPF': prof.cpf,
      'Email': prof.email,
      'Telefone': prof.telefone || 'N/A',
      'Área': prof.area || 'N/A',
      'Componentes': prof.componentes || 'N/A',
      'Turmas Vinculadas': prof.turmasVinculadas || 'N/A',
    }));

    const success = exportToExcel({
      filename: `professores-${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Professores',
      data: formattedData,
      columns: [
        { header: 'Nome', key: 'Nome', width: 30 },
        { header: 'CPF', key: 'CPF', width: 15 },
        { header: 'Email', key: 'Email', width: 30 },
        { header: 'Telefone', key: 'Telefone', width: 15 },
        { header: 'Área', key: 'Área', width: 20 },
        { header: 'Componentes', key: 'Componentes', width: 30 },
        { header: 'Turmas Vinculadas', key: 'Turmas Vinculadas', width: 30 },
      ],
    });

    if (success) {
      toast.success('Planilha exportada com sucesso!');
    } else {
      toast.error('Erro ao exportar planilha');
    }
  };

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="page">
      <BackButton />
      <div className="page-header">
        <h1>Professores</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            onClick={handleExport}
            disabled={professores.length === 0}
          >
            <Download size={20} />
            Exportar Excel
          </button>
          <button className="btn-primary" onClick={() => openModal()}>
            <Plus size={20} />
            Novo Professor
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Área de Atuação</th>
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
                <td>{professor.area || '-'}</td>
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
                  <label>Área de Atuação *</label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Anos Iniciais">Anos Iniciais (1º ao 5º ano)</option>
                    <option value="Anos Finais">Anos Finais (6º ao 9º ano)</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>

                <div className="form-row" style={{ gap: '24px', alignItems: 'flex-start' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Componentes Curriculares *</label>
                    <div style={{ 
                      border: '1px solid rgba(255, 255, 255, 0.3)', 
                      borderRadius: '8px', 
                      padding: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      minHeight: '200px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                    {disciplinas.length === 0 ? (
                      <p style={{ margin: '0', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '20px' }}>
                        Nenhuma disciplina cadastrada
                      </p>
                    ) : (
                      disciplinas.map((disciplina) => (
                        <label 
                          key={disciplina.id} 
                          style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px 12px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            transition: 'all 0.2s',
                            color: 'white',
                            fontSize: '14px',
                            marginBottom: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.componentes.includes(disciplina.nome)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ 
                                  ...formData, 
                                  componentes: [...formData.componentes, disciplina.nome] 
                                })
                              } else {
                                setFormData({ 
                                  ...formData, 
                                  componentes: formData.componentes.filter(c => c !== disciplina.nome) 
                                })
                              }
                            }}
                            style={{ 
                              marginRight: '12px',
                              cursor: 'pointer',
                              width: '16px',
                              height: '16px'
                            }}
                          />
                          <span>{disciplina.nome}</span>
                        </label>
                      ))
                    )}
                  </div>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Turmas Vinculadas *</label>
                    <div style={{ 
                      border: '1px solid rgba(255, 255, 255, 0.3)', 
                      borderRadius: '8px', 
                      padding: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      minHeight: '200px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                    {turmas.length === 0 ? (
                      <p style={{ margin: '0', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '20px' }}>
                        Nenhuma turma cadastrada
                      </p>
                    ) : (
                      turmas
                        .filter(turma => {
                          if (!formData.area || formData.area === 'Ambos') return true
                          if (formData.area === 'Anos Iniciais') return turma.ano >= 1 && turma.ano <= 5
                          if (formData.area === 'Anos Finais') return turma.ano >= 6 && turma.ano <= 9
                          return true
                        })
                        .map((turma) => (
                          <label 
                            key={turma.id} 
                            style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              padding: '10px 12px',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              transition: 'all 0.2s',
                              color: 'white',
                              fontSize: '14px',
                              marginBottom: '4px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={formData.turmasVinculadas.includes(turma.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ 
                                    ...formData, 
                                    turmasVinculadas: [...formData.turmasVinculadas, turma.id] 
                                  })
                                } else {
                                  setFormData({ 
                                    ...formData, 
                                    turmasVinculadas: formData.turmasVinculadas.filter(t => t !== turma.id) 
                                  })
                                }
                              }}
                              style={{ 
                                marginRight: '12px',
                                cursor: 'pointer',
                                width: '16px',
                                height: '16px'
                              }}
                            />
                            <span>{turma.nome} - {turma.ano}º ano - {turma.periodo} ({turma.anoLetivo})</span>
                          </label>
                        ))
                    )}
                  </div>
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

export default Professores
