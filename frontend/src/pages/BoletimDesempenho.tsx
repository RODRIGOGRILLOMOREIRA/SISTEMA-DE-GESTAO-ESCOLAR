import { useEffect, useState } from 'react'
import { api, turmasAPI, Turma, Aluno } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin, isProfessor } from '../lib/permissions'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import BackButton from '../components/BackButton'
import './ModernPages.css'
import './Notas.css'
import './BoletimDesempenho.css'

interface NotaBoletim {
  disciplina: string
  trimestre1: number | null
  trimestre2: number | null
  trimestre3: number | null
  mediaFinal: number | null
  aprovado: boolean
}

interface FrequenciaBoletim {
  disciplina: string
  trimestre1: { presencas: number, total: number, percentual: number }
  trimestre2: { presencas: number, total: number, percentual: number }
  trimestre3: { presencas: number, total: number, percentual: number }
  percentualAnual: number
}

interface DadosBoletim {
  aluno: Aluno
  turma: Turma
  notas: NotaBoletim[]
  frequencias: FrequenciaBoletim[]
}

const BoletimDesempenho = () => {
  const { user } = useAuth()
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [selectedTurma, setSelectedTurma] = useState<string>('')
  const [selectedAluno, setSelectedAluno] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [dadosBoletim, setDadosBoletim] = useState<DadosBoletim | null>(null)
  const [anoLetivo, setAnoLetivo] = useState<number>(new Date().getFullYear())
  const [config, setConfig] = useState<any>(null)
  const [professorTurmas, setProfessorTurmas] = useState<string[]>([])
  const [trimestre, setTrimestre] = useState<number>(1)

  useEffect(() => {
    loadConfig()
    if (user && isProfessor(user) && !isAdmin(user)) {
      loadProfessorTurmas()
    } else {
      loadTurmas()
    }
  }, [user])

  useEffect(() => {
    if (professorTurmas.length > 0) {
      loadTurmas()
    }
  }, [professorTurmas])

  useEffect(() => {
    if (selectedTurma) {
      loadAlunos()
    }
  }, [selectedTurma])

  useEffect(() => {
    if (selectedAluno && selectedTurma) {
      loadDadosBoletim()
    }
  }, [selectedAluno, selectedTurma, anoLetivo])

  const loadConfig = async () => {
    try {
      const response = await api.get('/configuracoes')
      setConfig(response.data)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const loadProfessorTurmas = async () => {
    if (!user?.email) return
    
    try {
      const professoresRes = await api.get('/professores')
      const professor = professoresRes.data.find((p: any) => 
        p.email?.toLowerCase() === user.email?.toLowerCase()
      )
      
      if (professor) {
        const disciplinasTurmasRes = await api.get('/disciplina-turma')
        const vinculosProfessor = disciplinasTurmasRes.data.filter(
          (dt: any) => dt.professorId === professor.id
        )
        const turmasIds: string[] = Array.from(new Set(vinculosProfessor.map((dt: any) => String(dt.turmaId))))
        setProfessorTurmas(turmasIds)
      }
    } catch (error) {
      console.error('Erro ao carregar turmas do professor:', error)
    }
  }

  const loadTurmas = async () => {
    try {
      const response = await turmasAPI.getAll()
      let turmasParaExibir = response.data
      
      if (user && isProfessor(user) && !isAdmin(user) && professorTurmas.length > 0) {
        turmasParaExibir = response.data.filter((t: Turma) => professorTurmas.includes(t.id))
      }
      
      const turmasOrdenadas = turmasParaExibir.sort((a, b) => {
        if (a.ano !== b.ano) return a.ano - b.ano
        return a.nome.localeCompare(b.nome)
      })
      
      setTurmas(turmasOrdenadas)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAlunos = async () => {
    try {
      const response = await api.get('/alunos')
      const alunosFiltrados = response.data
        .filter((aluno: Aluno) => aluno.turmaId === selectedTurma)
        .sort((a: Aluno, b: Aluno) => a.nome.localeCompare(b.nome))
      setAlunos(alunosFiltrados)
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
    }
  }

  const loadDadosBoletim = async () => {
    setLoading(true)
    try {
      console.log('🔍 Carregando dados do boletim para aluno:', selectedAluno, 'Ano:', anoLetivo)
      
      // Buscar dados do aluno e turma
      const [alunoRes, turmaRes] = await Promise.all([
        api.get(`/alunos/${selectedAluno}`),
        turmasAPI.getById(selectedTurma)
      ])

      const aluno = alunoRes.data
      const turma = turmaRes.data

      console.log('✅ Aluno e turma carregados:', { aluno: aluno.nome, turma: turma.nome })

      // Buscar notas finais de todas as disciplinas com cache-busting
      const notasRes = await api.get(`/notas/aluno/${selectedAluno}`, {
        params: { anoLetivo },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      console.log('📊 Notas recebidas:', notasRes.data)

      // Buscar frequências de todas as disciplinas com cache-busting
      const frequenciasRes = await api.get(`/frequencias/aluno/${selectedAluno}`, {
        params: { anoLetivo },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      console.log('📅 Frequências recebidas:', frequenciasRes.data)

      const notas: NotaBoletim[] = notasRes.data.map((nf: any) => ({
        disciplina: nf.disciplina?.nome || 'Disciplina não encontrada',
        trimestre1: nf.trimestre1,
        trimestre2: nf.trimestre2,
        trimestre3: nf.trimestre3,
        mediaFinal: nf.mediaFinal,
        aprovado: nf.aprovado
      }))

      const frequencias: FrequenciaBoletim[] = frequenciasRes.data.map((freq: any) => {
        const calcularPercentual = (presencas: number, total: number) => 
          total > 0 ? (presencas / total) * 100 : 0

        return {
          disciplina: freq.disciplina?.nome || 'Disciplina não encontrada',
          trimestre1: {
            presencas: freq.trimestre1Presencas || 0,
            total: freq.trimestre1Total || 0,
            percentual: calcularPercentual(freq.trimestre1Presencas || 0, freq.trimestre1Total || 0)
          },
          trimestre2: {
            presencas: freq.trimestre2Presencas || 0,
            total: freq.trimestre2Total || 0,
            percentual: calcularPercentual(freq.trimestre2Presencas || 0, freq.trimestre2Total || 0)
          },
          trimestre3: {
            presencas: freq.trimestre3Presencas || 0,
            total: freq.trimestre3Total || 0,
            percentual: calcularPercentual(freq.trimestre3Presencas || 0, freq.trimestre3Total || 0)
          },
          percentualAnual: freq.percentualAnual || 0
        }
      })

      console.log('✅ Dados processados:', { 
        notasCount: notas.length, 
        frequenciasCount: frequencias.length 
      })

      setDadosBoletim({ aluno, turma, notas, frequencias })
    } catch (error) {
      console.error('❌ Erro ao carregar dados do boletim:', error)
      alert('Erro ao carregar dados do boletim. Verifique se o aluno possui notas cadastradas.')
    } finally {
      setLoading(false)
    }
  }

  const gerarPDF = () => {
    if (!dadosBoletim) return

    const doc = new jsPDF({ orientation: 'landscape' })
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPos = 15

    // Logo e cabeçalho
    if (config?.logoUrl) {
      try {
        doc.addImage(config.logoUrl, 'PNG', pageWidth / 2 - 15, yPos, 30, 30)
        yPos += 35
      } catch (error) {
        yPos += 5
      }
    }

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(config?.nomeEscola || 'Sistema de Gestão Escolar', pageWidth / 2, yPos, { align: 'center' })
    yPos += 8

    doc.setFontSize(14)
    doc.text('BOLETIM ESCOLAR', pageWidth / 2, yPos, { align: 'center' })
    yPos += 10

    // Informações do aluno
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Aluno: ${dadosBoletim.aluno.nome}`, 14, yPos)
    yPos += 6
    doc.text(`Turma: ${dadosBoletim.turma.nome}`, 14, yPos)
    doc.text(`Ano Letivo: ${anoLetivo}`, pageWidth - 50, yPos)
    yPos += 6
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, yPos)
    yPos += 8

    // Tabela de Notas
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('NOTAS E MÉDIAS', 14, yPos)
    yPos += 6

    const notasData = dadosBoletim.notas.map(n => [
      n.disciplina,
      n.trimestre1?.toFixed(1) || '-',
      n.trimestre2?.toFixed(1) || '-',
      n.trimestre3?.toFixed(1) || '-',
      n.mediaFinal?.toFixed(1) || '-',
      getStatusNota(n.mediaFinal).label
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Disciplina', '1º Trim', '2º Trim', '3º Trim', 'Média Final', 'Situação']],
      body: notasData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 35, halign: 'center' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const valor = data.cell.text[0]
          if (valor.includes('Excelente')) {
            data.cell.styles.textColor = [5, 150, 105] // verde escuro
            data.cell.styles.fontStyle = 'bold'
          } else if (valor.includes('Aprovado')) {
            data.cell.styles.textColor = [16, 185, 129] // verde claro
            data.cell.styles.fontStyle = 'bold'
          } else if (valor.includes('Pode Evoluir')) {
            data.cell.styles.textColor = [245, 158, 11] // amarelo
            data.cell.styles.fontStyle = 'bold'
          } else if (valor.includes('Intervenção')) {
            data.cell.styles.textColor = [239, 68, 68] // vermelho
            data.cell.styles.fontStyle = 'bold'
          }
        }
      }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // Tabela de Frequências
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('FREQUÊNCIA', 14, yPos)
    yPos += 6

    const frequenciasData = dadosBoletim.frequencias.map(f => [
      f.disciplina,
      `${f.trimestre1.presencas}/${f.trimestre1.total} (${f.trimestre1.percentual.toFixed(0)}%)`,
      `${f.trimestre2.presencas}/${f.trimestre2.total} (${f.trimestre2.percentual.toFixed(0)}%)`,
      `${f.trimestre3.presencas}/${f.trimestre3.total} (${f.trimestre3.percentual.toFixed(0)}%)`,
      `${f.percentualAnual.toFixed(1)}%`
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Disciplina', '1º Trimestre', '2º Trimestre', '3º Trimestre', 'Anual']],
      body: frequenciasData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 40, halign: 'center' },
        3: { cellWidth: 40, halign: 'center' },
        4: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const percentual = parseFloat(data.cell.text[0])
          if (percentual < 75) {
            data.cell.styles.textColor = [239, 68, 68]
          } else {
            data.cell.styles.textColor = [16, 185, 129]
          }
        }
      }
    })

    // Rodapé

    doc.setFontSize(8)
    doc.setTextColor(100)
    doc.text(`Documento gerado em ${new Date().toLocaleString('pt-BR')} | Fórmula Final: (T1×3 + T2×3 + T3×4)÷10 | Frequência mínima: 75%`, 
      pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' })
    doc.setFontSize(7)
    doc.text(`Médias parciais: Apenas T1 = T1 | T1+T2 = (T1×3+T2×3)÷6 (proporcional) | T1+T2+T3 = Média Final`, 
      pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })

    // Salvar PDF
    const nomeArquivo = `Boletim_${dadosBoletim.aluno.nome.replace(/\s+/g, '_')}_${anoLetivo}.pdf`
    doc.save(nomeArquivo)
  }

  const getNomeTurma = () => {
    const turma = turmas.find(t => t.id === selectedTurma)
    return turma?.nome || ''
  }

  const getStatusGeral = () => {
    if (!dadosBoletim) return null
    
    const todasAprovadas = dadosBoletim.notas.every(n => n.mediaFinal !== null && n.mediaFinal >= 6.0)
    const todasFrequencias = dadosBoletim.frequencias.every(f => f.percentualAnual >= 75)
    
    return todasAprovadas && todasFrequencias
  }

  // Calcula média parcial proporcional (T1, T1+T2, ou T1+T2+T3)
  const calcularMediaParcial = (t1: number | null, t2: number | null, t3: number | null): number | null => {
    // Se todos os 3 trimestres foram lançados
    if (t3 !== null && t3 !== undefined && t2 !== null && t2 !== undefined && t1 !== null && t1 !== undefined) {
      return parseFloat(((t1 * 3 + t2 * 3 + t3 * 4) / 10).toFixed(2))
    }
    
    // Se T1 e T2 foram lançados
    if (t2 !== null && t2 !== undefined && t1 !== null && t1 !== undefined) {
      return parseFloat(((t1 * 3 + t2 * 3) / 6).toFixed(2))
    }
    
    // Se apenas T1 foi lançado
    if (t1 !== null && t1 !== undefined) {
      return t1
    }
    
    return null
  }

  // Calcula média final usando SEMPRE a fórmula completa (T1*3 + T2*3 + T3*4) / 10
  const calcularMediaFinal = (t1: number | null, t2: number | null, t3: number | null): number | null => {
    const trimestre1 = t1 ?? 0
    const trimestre2 = t2 ?? 0
    const trimestre3 = t3 ?? 0
    
    // Se pelo menos um trimestre foi lançado
    if (t1 !== null || t2 !== null || t3 !== null) {
      return parseFloat(((trimestre1 * 3 + trimestre2 * 3 + trimestre3 * 4) / 10).toFixed(2))
    }
    
    return null
  }

  const getStatusNota = (media: number | null) => {
    if (media === null) return { 
      label: 'Pendente', 
      cor: '#94a3b8',
      mensagem: 'Aguardando lançamento de notas'
    }
    
    if (media >= 8.0) return { 
      label: 'Aprovado Excelente', 
      cor: '#059669',
      mensagem: 'Parabéns! Continue assim!'
    }
    if (media >= 6.0) return { 
      label: 'Aprovado', 
      cor: '#10b981',
      mensagem: 'Bom trabalho! Pode melhorar ainda mais'
    }
    if (media >= 4.0) return { 
      label: 'Reprovado', 
      cor: '#f59e0b',
      mensagem: 'Atenção! Precisa se esforçar mais'
    }
    return { 
      label: 'Reprovado', 
      cor: '#ef4444',
      mensagem: 'Urgente! Busque ajuda imediatamente'
    }
  }

  return (
    <div className="page">
      <BackButton />
      <div className="page-header">
        <h1>Boletim de Desempenho</h1>
      </div>

      {/* Seleção de Ano Letivo */}
      <div className="selection-section">
        <div className="selection-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="selection-icon">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h2>1. Selecione o Ano Letivo</h2>
        </div>
        <div className="selection-grid">
          {[2023, 2024, 2025, 2026].map(ano => (
            <button
              key={ano}
              className={`selection-btn ${anoLetivo === ano ? 'active' : ''}`}
              onClick={() => {
                setAnoLetivo(ano)
                setSelectedTurma('')
                setSelectedAluno('')
              }}
            >
              <div className="selection-btn-content">
                <span className="selection-btn-title">{ano}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Seleção de Período */}
      <div className="selection-section">
        <div className="selection-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="selection-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <h2>2. Selecione o Período</h2>
        </div>
        <div className="selection-grid">
          <button
            className={`selection-btn ${trimestre === 1 ? 'active' : ''}`}
            onClick={() => setTrimestre(1)}
          >
            <div className="selection-btn-content">
              <span className="selection-btn-title">1º Trimestre</span>
            </div>
          </button>
          <button
            className={`selection-btn ${trimestre === 2 ? 'active' : ''}`}
            onClick={() => setTrimestre(2)}
          >
            <div className="selection-btn-content">
              <span className="selection-btn-title">2º Trimestre</span>
            </div>
          </button>
          <button
            className={`selection-btn ${trimestre === 3 ? 'active' : ''}`}
            onClick={() => setTrimestre(3)}
          >
            <div className="selection-btn-content">
              <span className="selection-btn-title">Anual (3º Trimestre)</span>
            </div>
          </button>
        </div>
      </div>

      {/* Seleção de Turma */}
      <div className="selection-section">
        <div className="selection-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="selection-icon">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h2>3. Selecione a Turma</h2>
        </div>
        <div className="selection-grid">
          {turmas.map(turma => (
            <button
              key={turma.id}
              className={`selection-btn ${selectedTurma === turma.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedTurma(turma.id)
                setSelectedAluno('')
              }}
            >
              <div className="selection-btn-content">
                <span className="selection-btn-title">{turma.nome}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Seleção de Aluno */}
      {selectedTurma && (
        <div className="selection-section">
          <div className="selection-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="selection-icon">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
            <h2>4. Selecione o Aluno</h2>
          </div>
          <div className="selection-grid">
            {alunos.length === 0 ? (
              <p className="empty-message">Nenhum aluno encontrado nesta turma</p>
            ) : (
              alunos.map(aluno => (
                <button
                  key={aluno.id}
                  className={`selection-btn ${selectedAluno === aluno.id ? 'active' : ''}`}
                  onClick={() => setSelectedAluno(aluno.id)}
                >
                  <div className="selection-btn-content">
                    <span className="selection-btn-title">{aluno.nome}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="content-box">
          <p>Carregando dados do boletim...</p>
        </div>
      ) : !selectedAluno ? (
        <div className="content-box">
          <p className="empty-state">Selecione um aluno para visualizar o boletim</p>
        </div>
      ) : dadosBoletim ? (
        <>
          {/* Card do Aluno */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '2px solid #e2e8f0'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #00BCD4, #0097A7)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(0, 188, 212, 0.3)'
                  }}>
                    {dadosBoletim.aluno.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ 
                      margin: '0 0 0.3rem 0',
                      fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                      color: '#1e293b',
                      fontWeight: '700'
                    }}>
                      {dadosBoletim.aluno.nome}
                    </h2>
                    <p style={{ 
                      color: '#64748b', 
                      margin: '0',
                      fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      🎓 {getNomeTurma()} | 📅 {anoLetivo}
                    </p>
                  </div>
                </div>
              </div>
              
              {getStatusGeral() !== null && (
                <div style={{
                  background: getStatusGeral() 
                    ? 'linear-gradient(135deg, #10b981, #059669)' 
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '15px',
                  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                  fontWeight: '700',
                  boxShadow: getStatusGeral()
                    ? '0 4px 20px rgba(16, 185, 129, 0.4)'
                    : '0 4px 20px rgba(239, 68, 68, 0.4)',
                  textAlign: 'center',
                  minWidth: '180px',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                  {getStatusGeral() ? '✅ APROVADO' : '❌ REPROVADO'}
                </div>
              )}
            </div>

            <button
              className="btn-primary"
              onClick={gerarPDF}
              style={{ 
                width: '100%', 
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', 
                padding: '1rem 2rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: 'none',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              📄 Imprimir Boletim (PDF)
            </button>
          </div>

          {/* Tabela de Notas com Card Moderno */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ 
              margin: '0 0 1.5rem 0',
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              color: '#1e293b',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📝 Notas e Médias
            </h3>
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: '100%' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                    <th style={{ color: 'white', padding: '1rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>Disciplina</th>
                    <th style={{ color: 'white', padding: '1rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>1º Trimestre</th>
                    <th style={{ color: 'white', padding: '1rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>2º Trimestre</th>
                    <th style={{ color: 'white', padding: '1rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>3º Trimestre</th>
                    <th style={{ color: 'white', padding: '1rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', backgroundColor: '#2563eb' }}>Média Parcial</th>
                    <th style={{ color: 'white', padding: '1rem', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', backgroundColor: '#2563eb' }}>Status Parcial</th>
                    <th style={{ color: 'white', padding: '1rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', backgroundColor: '#dc2626' }}>Média Final</th>
                    <th style={{ color: 'white', padding: '1rem', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', backgroundColor: '#dc2626' }}>Status Final</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosBoletim.notas.map((nota, index) => {
                    const mediaParcial = calcularMediaParcial(nota.trimestre1, nota.trimestre2, nota.trimestre3)
                    const mediaFinal = calcularMediaFinal(nota.trimestre1, nota.trimestre2, nota.trimestre3)
                    
                    return (
                      <tr key={index} style={{ 
                        background: index % 2 === 0 ? '#f8fafc' : 'white',
                        transition: 'all 0.2s ease'
                      }}>
                        <td style={{ 
                          fontWeight: '600',
                          padding: '1rem',
                          fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                          color: '#1e293b'
                        }}>
                          {nota.disciplina}
                        </td>
                        <td style={{ 
                          textAlign: 'center',
                          padding: '1rem',
                          fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                          fontWeight: '500'
                        }}>
                          {nota.trimestre1 !== null ? nota.trimestre1.toFixed(1) : '-'}
                        </td>
                        <td style={{ 
                          textAlign: 'center',
                          padding: '1rem',
                          fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                          fontWeight: '500'
                        }}>
                          {nota.trimestre2 !== null ? nota.trimestre2.toFixed(1) : '-'}
                        </td>
                        <td style={{ 
                          textAlign: 'center',
                          padding: '1rem',
                          fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                          fontWeight: '500'
                        }}>
                          {nota.trimestre3 !== null ? nota.trimestre3.toFixed(1) : '-'}
                        </td>
                        <td style={{ 
                          textAlign: 'center', 
                          fontWeight: 'bold', 
                          fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                          padding: '1rem',
                          backgroundColor: '#eff6ff',
                          color: getStatusNota(mediaParcial).cor
                        }}>
                          {mediaParcial !== null ? mediaParcial.toFixed(2) : '-'}
                        </td>
                        <td style={{ textAlign: 'center', padding: '0.8rem', backgroundColor: '#eff6ff' }}>
                          <div style={{ 
                            display: 'inline-flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            padding: 'clamp(0.5rem, 1.8vw, 0.7rem) clamp(0.7rem, 2vw, 1rem)',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            fontSize: 'clamp(0.75rem, 1.9vw, 0.85rem)',
                            color: 'white',
                            backgroundColor: getStatusNota(mediaParcial).cor,
                            boxShadow: `0 4px 12px ${getStatusNota(mediaParcial).cor}50`,
                            lineHeight: '1.3',
                            minWidth: 'clamp(100px, 15vw, 140px)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            <span style={{ fontWeight: '800' }}>{getStatusNota(mediaParcial).label}</span>
                            <span style={{ 
                              fontSize: 'clamp(0.65rem, 1.6vw, 0.75rem)',
                              fontWeight: '500',
                              fontStyle: 'italic',
                              opacity: '0.95',
                              textTransform: 'none',
                              letterSpacing: '0px'
                            }}>
                              {getStatusNota(mediaParcial).mensagem}
                            </span>
                          </div>
                        </td>
                        <td style={{ 
                          textAlign: 'center', 
                          fontWeight: 'bold', 
                          fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                          padding: '1rem',
                          backgroundColor: '#fef2f2',
                          color: getStatusNota(mediaFinal).cor
                        }}>
                          {mediaFinal !== null ? mediaFinal.toFixed(2) : '-'}
                        </td>
                        <td style={{ textAlign: 'center', padding: '0.8rem', backgroundColor: '#fef2f2' }}>
                          <div style={{ 
                            display: 'inline-flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            padding: 'clamp(0.5rem, 1.8vw, 0.7rem) clamp(0.7rem, 2vw, 1rem)',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            fontSize: 'clamp(0.75rem, 1.9vw, 0.85rem)',
                            color: 'white',
                            backgroundColor: getStatusNota(mediaFinal).cor,
                            boxShadow: `0 4px 12px ${getStatusNota(mediaFinal).cor}50`,
                            lineHeight: '1.3',
                            minWidth: 'clamp(100px, 15vw, 140px)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            <span style={{ fontWeight: '800' }}>{getStatusNota(mediaFinal).label}</span>
                            <span style={{ 
                              fontSize: 'clamp(0.65rem, 1.6vw, 0.75rem)',
                              fontWeight: '500',
                              fontStyle: 'italic',
                              opacity: '0.95',
                              textTransform: 'none',
                              letterSpacing: '0px'
                            }}>
                              {getStatusNota(mediaFinal).mensagem}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela de Frequências com Card Moderno */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ 
              margin: '0 0 1.5rem 0',
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              color: '#1e293b',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📅 Frequência
            </h3>
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: '100%' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #00BCD4, #0097A7)' }}>
                    <th style={{ color: 'white', padding: '1rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>Disciplina</th>
                    <th style={{ color: 'white', padding: '1rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>1º Trimestre</th>
                    <th style={{ color: 'white', padding: '1rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>2º Trimestre</th>
                    <th style={{ color: 'white', padding: '1rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>3º Trimestre</th>
                    <th style={{ color: 'white', padding: '1rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>Anual</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosBoletim.frequencias.map((freq, index) => (
                    <tr key={index} style={{ 
                      background: index % 2 === 0 ? '#f8fafc' : 'white',
                      transition: 'all 0.2s ease'
                    }}>
                      <td style={{ 
                        fontWeight: '600',
                        padding: '1rem',
                        fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                        color: '#1e293b'
                      }}>
                        {freq.disciplina}
                      </td>
                      <td style={{ 
                        textAlign: 'center',
                        padding: '1rem',
                        fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                        color: freq.trimestre1.percentual >= 75 ? '#059669' : '#dc2626',
                        fontWeight: '500'
                      }}>
                        {freq.trimestre1.presencas}/{freq.trimestre1.total} 
                        ({freq.trimestre1.percentual.toFixed(0)}%)
                      </td>
                      <td style={{ 
                        textAlign: 'center',
                        padding: '1rem',
                        fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                        color: freq.trimestre2.percentual >= 75 ? '#059669' : '#dc2626',
                        fontWeight: '500'
                      }}>
                        {freq.trimestre2.presencas}/{freq.trimestre2.total} 
                        ({freq.trimestre2.percentual.toFixed(0)}%)
                      </td>
                      <td style={{ 
                        textAlign: 'center',
                        padding: '1rem',
                        fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                        color: freq.trimestre3.percentual >= 75 ? '#059669' : '#dc2626',
                        fontWeight: '500'
                      }}>
                        {freq.trimestre3.presencas}/{freq.trimestre3.total} 
                        ({freq.trimestre3.percentual.toFixed(0)}%)
                      </td>
                      <td style={{ 
                        textAlign: 'center',
                        padding: '1rem'
                      }}>
                        <span style={{ 
                          display: 'inline-block',
                          padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.8rem, 2vw, 1rem)',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                          color: 'white',
                          backgroundColor: freq.percentualAnual >= 75 ? '#059669' : '#dc2626',
                          whiteSpace: 'nowrap',
                          boxShadow: freq.percentualAnual >= 75 ? '0 2px 8px rgba(5, 150, 105, 0.3)' : '0 2px 8px rgba(220, 38, 38, 0.3)'
                        }}>
                          {freq.percentualAnual.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ 
              marginTop: '1.5rem', 
              padding: 'clamp(1rem, 3vw, 1.5rem)', 
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '15px',
              border: '2px solid #bae6fd',
              boxShadow: '0 4px 16px rgba(0, 188, 212, 0.1)'
            }}>
              <p style={{ 
                margin: '0 0 1rem 0', 
                color: '#0369a1', 
                fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📋 Critérios de Avaliação
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{ 
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: '10px',
                  borderLeft: '4px solid #059669',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
                }}>
                  <strong style={{ color: '#059669' }}>8,0 a 10,0:</strong> Excelente
                </div>
                <div style={{ 
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: '10px',
                  borderLeft: '4px solid #10b981',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
                }}>
                  <strong style={{ color: '#10b981' }}>6,0 a 7,9:</strong> Aprovado
                </div>
                <div style={{ 
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: '10px',
                  borderLeft: '4px solid #f59e0b',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
                }}>
                  <strong style={{ color: '#f59e0b' }}>4,0 a 5,9:</strong> Pode Evoluir
                </div>
                <div style={{ 
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: '10px',
                  borderLeft: '4px solid #ef4444',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
                }}>
                  <strong style={{ color: '#ef4444' }}>0,0 a 3,9:</strong> Intervenção Urgente
                </div>
              </div>
              <div style={{
                padding: '1rem',
                background: 'white',
                borderRadius: '10px',
                fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                color: '#0369a1'
              }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                  📐 <strong>Fórmula Final:</strong> (1º Trim × 3 + 2º Trim × 3 + 3º Trim × 4) ÷ 10
                </p>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)', color: '#0891b2' }}>
                  ⚠️ <strong>Médias Parciais:</strong> Apenas T1 = T1 | T1+T2 = (T1×3+T2×3)÷6 (média proporcional)
                </p>
                <p style={{ margin: '0', fontWeight: '600' }}>
                  📊 <strong>Frequência Mínima:</strong> 75% | Aprovação requer notas E frequência adequadas
                </p>
              </div>
            </div>
          </div>

          {/* Estilos de Impressão e Responsividade */}
          <style>{`
            @media print {
              @page {
                size: A4 landscape;
                margin: 1.5cm;
              }
              
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                background: white !important;
              }
              
              .filters-section,
              button[style*="Imprimir"],
              nav,
              aside,
              .sidebar {
                display: none !important;
              }
              
              .table-container {
                overflow: visible !important;
              }
              
              table {
                page-break-inside: auto;
                font-size: 10px !important;
              }
              
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
              
              thead {
                display: table-header-group;
              }
              
              .data-table th,
              .data-table td {
                padding: 6px !important;
              }
              
              h3 {
                page-break-after: avoid;
                font-size: 14px !important;
              }
            }
            
            @media screen and (max-width: 1024px) {
              .table-container {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                border-radius: 10px;
              }
            }
            
            @media screen and (max-width: 768px) {
              .data-table {
                font-size: 0.8rem;
              }
              
              .data-table th,
              .data-table td {
                padding: 0.65rem !important;
              }
            }
            
            @media screen and (max-width: 480px) {
              .data-table th,
              .data-table td {
                padding: 0.5rem !important;
                font-size: 0.7rem !important;
              }
              
              .data-table th {
                font-size: 0.65rem !important;
              }
            }
          `}</style>
        </>
      ) : (
        <div className="content-box">
          <p className="empty-state">Nenhum dado encontrado para o aluno selecionado</p>
        </div>
      )}
    </div>
  )
}

export default BoletimDesempenho
