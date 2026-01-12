import { useEffect, useState } from 'react'
import { Edit, X, Save, Users, GraduationCap, BookOpen, CheckCircle, XCircle, Download } from 'lucide-react'
import { alunosAPI, disciplinasAPI, turmasAPI, Aluno, Disciplina, Turma, api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useAnoLetivo } from '../contexts/AnoLetivoContext'
import { isAdmin, isProfessor } from '../lib/permissions'
import BackButton from '../components/BackButton'
import { exportToExcel, formatNotasForExport } from '../utils/exportExcel'
import { toast } from 'react-hot-toast'
import { TableSkeleton } from '../components/skeletons'
import './ModernPages.css'
import './Notas.css'
import '../components/Modal.css'

interface NotaData {
  id?: string
  alunoId: string
  disciplinaId: string
  trimestre: number
  avaliacao01: number | null
  avaliacao02: number | null
  avaliacao03: number | null
  mediaM1: number | null
  avaliacaoEAC: number | null
  notaFinalTrimestre: number | null
  observacao?: string
}

interface NotaFinal {
  id: string
  alunoId: string
  disciplinaId: string
  trimestre1: number | null
  trimestre2: number | null
  trimestre3: number | null
  mediaFinal: number | null
  aprovado: boolean
}

const Notas = () => {
  const { user } = useAuth()
  const { anoLetivo } = useAnoLetivo()
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [disciplinasDaTurma, setDisciplinasDaTurma] = useState<Disciplina[]>([])
  const [selectedTurma, setSelectedTurma] = useState<string>('')
  const [selectedAluno, setSelectedAluno] = useState<string>('')
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [notas, setNotas] = useState<NotaData[]>([])
  const [notaFinal, setNotaFinal] = useState<NotaFinal | null>(null)
  const [editingNota, setEditingNota] = useState<NotaData | null>(null)
  const [saving, setSaving] = useState(false)
  const [professorDisciplinas, setProfessorDisciplinas] = useState<string[]>([])
  const [professorTurmas, setProfessorTurmas] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Carregar disciplinas do professor se não for admin
    if (user && isProfessor(user) && !isAdmin(user)) {
      loadProfessorDisciplinas()
    }
  }, [user])

  useEffect(() => {
    // Recarregar turmas quando as disciplinas do professor forem carregadas
    if (professorDisciplinas.length > 0 || professorTurmas.length > 0) {
      loadData()
    }
  }, [professorDisciplinas, professorTurmas])

  useEffect(() => {
    if (selectedTurma) {
      loadAlunosByTurma()
      loadDisciplinasByTurma()
    } else {
      setAlunos([])
      setDisciplinasDaTurma([])
      setSelectedAluno('')
      setSelectedDisciplina('')
    }
  }, [selectedTurma, professorDisciplinas])

  useEffect(() => {
    if (selectedAluno && selectedDisciplina) {
      loadNotas()
    }
  }, [selectedAluno, selectedDisciplina, anoLetivo])

  const loadProfessorDisciplinas = async () => {
    if (!user?.email) return
    
    try {
      // Buscar professor pelo email do usuário
      const professoresRes = await api.get('/professores')
      const professor = professoresRes.data.find((p: any) => p.email?.toLowerCase() === user.email?.toLowerCase())
      
      if (professor) {
        // Buscar disciplinas_turmas do professor
        const disciplinasTurmasRes = await api.get('/disciplina-turma')
        const vinculosProfessor = disciplinasTurmasRes.data.filter((dt: any) => dt.professorId === professor.id)
        
        // Extrair IDs únicos de disciplinas e turmas
        const disciplinasIds = [...new Set(vinculosProfessor.map((dt: any) => dt.disciplinaId))]
        const turmasIds = [...new Set(vinculosProfessor.map((dt: any) => dt.turmaId))]
        
        setProfessorDisciplinas(disciplinasIds)
        setProfessorTurmas(turmasIds)
      }
    } catch (error) {
      console.error('Erro ao carregar disciplinas do professor:', error)
    }
  }

  const loadData = async () => {
    try {
      const [turmasRes, disciplinasRes] = await Promise.all([
        turmasAPI.getAll(),
        disciplinasAPI.getAll()
      ])
      
      // Se for professor (não admin), filtrar apenas suas turmas
      let turmasParaExibir = turmasRes.data
      if (user && isProfessor(user) && !isAdmin(user) && professorTurmas.length > 0) {
        turmasParaExibir = turmasRes.data.filter((t: Turma) => professorTurmas.includes(t.id))
      }
      
      // Ordenar turmas de forma crescente pelo ano (1º ao 9º)
      const turmasOrdenadas = turmasParaExibir.sort((a, b) => {
        // Primeiro por ano (crescente)
        if (a.ano !== b.ano) return a.ano - b.ano
        // Depois por nome (crescente)
        return a.nome.localeCompare(b.nome)
      })
      
      // Ordenar disciplinas em ordem alfabética crescente (A → Z)
      const disciplinasOrdenadas = disciplinasRes.data.sort((a, b) => {
        return a.nome.localeCompare(b.nome)
      })
      
      setTurmas(turmasOrdenadas)
      setDisciplinas(disciplinasOrdenadas)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAlunosByTurma = async () => {
    try {
      const response = await alunosAPI.getAll()
      const alunosFiltrados = response.data.filter((aluno: Aluno) => aluno.turmaId === selectedTurma)
      setAlunos(alunosFiltrados)
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
    }
  }

  const loadDisciplinasByTurma = async () => {
    try {
      // Buscar a turma com suas disciplinas vinculadas
      const response = await turmasAPI.getById(selectedTurma)
      const turmaComDisciplinas = response.data
      
      // Filtrar apenas as disciplinas que estão vinculadas à turma
      if (turmaComDisciplinas.disciplinas && turmaComDisciplinas.disciplinas.length > 0) {
        let disciplinasParaExibir = turmaComDisciplinas.disciplinas
        
        // Se for professor (não admin), filtrar apenas suas disciplinas
        if (user && isProfessor(user) && !isAdmin(user) && professorDisciplinas.length > 0) {
          disciplinasParaExibir = disciplinasParaExibir.filter((d: Disciplina) => 
            professorDisciplinas.includes(d.id)
          )
        }
        
        // Ordenar disciplinas em ordem alfabética
        const disciplinasOrdenadas = disciplinasParaExibir.sort((a, b) => {
          return a.nome.localeCompare(b.nome)
        })
        setDisciplinasDaTurma(disciplinasOrdenadas)
      } else {
        setDisciplinasDaTurma([])
      }
    } catch (error) {
      console.error('Erro ao carregar disciplinas da turma:', error)
      setDisciplinasDaTurma([])
    }
  }

  const loadNotas = async () => {
    try {
      const response = await api.get(`/notas/aluno/${selectedAluno}/disciplina/${selectedDisciplina}`, {
        params: { anoLetivo },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const { notas: notasBD, notaFinal: notaFinalBD } = response.data

      // Se não há notas no banco, criar estrutura inicial
      if (notasBD.length === 0) {
        const notasIniciais: NotaData[] = [1, 2, 3].map(t => ({
          alunoId: selectedAluno,
          disciplinaId: selectedDisciplina,
          trimestre: t,
          avaliacao01: null,
          avaliacao02: null,
          avaliacao03: null,
          mediaM1: null,
          avaliacaoEAC: null,
          notaFinalTrimestre: null
        }))
        setNotas(notasIniciais)
      } else {
        // Garantir que existem 3 trimestres
        const notasCompletas: NotaData[] = [1, 2, 3].map(t => {
          const notaExistente = notasBD.find((n: NotaData) => n.trimestre === t)
          return notaExistente || {
            alunoId: selectedAluno,
            disciplinaId: selectedDisciplina,
            trimestre: t,
            avaliacao01: null,
            avaliacao02: null,
            avaliacao03: null,
            mediaM1: null,
            avaliacaoEAC: null,
            notaFinalTrimestre: null
          }
        })
        setNotas(notasCompletas)
      }

      setNotaFinal(notaFinalBD)
    } catch (error) {
      console.error('Erro ao carregar notas:', error)
    }
  }

  const calcularMediaM1 = (av1: number | null, av2: number | null, av3: number | null): number | null => {
    if (av1 !== null && av2 !== null && av3 !== null) {
      return parseFloat((av1 + av2 + av3).toFixed(1))
    }
    return null
  }

  const calcularMediaParcialAno = (): { valor: number | null; texto: string } => {
    const t1 = notaFinal?.trimestre1
    const t2 = notaFinal?.trimestre2
    const t3 = notaFinal?.trimestre3

    // Se todos os 3 trimestres foram lançados: Média Final
    if (t3 !== null && t3 !== undefined && t2 !== null && t2 !== undefined && t1 !== null && t1 !== undefined) {
      const mediaFinal = parseFloat(((t1 * 3 + t2 * 3 + t3 * 4) / 10).toFixed(2))
      return { valor: mediaFinal, texto: 'Média Final' }
    }
    
    // Se T1 e T2 foram lançados: Média Parcial proporcional
    if (t2 !== null && t2 !== undefined && t1 !== null && t1 !== undefined) {
      const mediaParcial = parseFloat(((t1 * 3 + t2 * 3) / 6).toFixed(2))
      return { valor: mediaParcial, texto: 'Média Parcial (T1+T2)' }
    }
    
    // Se apenas T1 foi lançado: exibe a nota do T1
    if (t1 !== null && t1 !== undefined) {
      return { valor: t1, texto: 'Média Parcial (T1)' }
    }
    
    return { valor: null, texto: 'Média Parcial do Ano' }
  }

  // Calcula a média final usando SEMPRE a fórmula completa (T1*3 + T2*3 + T3*4) / 10
  // mesmo que nem todos os trimestres tenham sido lançados (usa 0 para os não lançados)
  const calcularMediaFinalAno = (): number | null => {
    const t1 = notaFinal?.trimestre1 ?? 0
    const t2 = notaFinal?.trimestre2 ?? 0
    const t3 = notaFinal?.trimestre3 ?? 0
    
    // Se pelo menos um trimestre foi lançado, calcula com a fórmula completa
    if (notaFinal?.trimestre1 !== null || notaFinal?.trimestre2 !== null || notaFinal?.trimestre3 !== null) {
      return parseFloat(((t1 * 3 + t2 * 3 + t3 * 4) / 10).toFixed(2))
    }
    
    return null
  }

  const getNotaColor = (nota: number | null): string => {
    if (nota === null) return ''
    if (nota >= 7.0) return 'nota-verde'
    if (nota >= 5.0) return 'nota-amarela'
    return 'nota-vermelha'
  }
  const getStatusNota = (media: number | null) => {
    if (media === null) return { 
      label: 'Pendente', 
      cor: '#94a3b8', 
      icon: null,
      mensagem: 'Aguardando lançamento de notas'
    }
    
    if (media >= 8.0) return { 
      label: 'Aprovado Excelente', 
      cor: '#059669', 
      icon: <CheckCircle size={32} />,
      mensagem: 'Parabéns! Continue assim!'
    }
    if (media >= 6.0) return { 
      label: 'Aprovado', 
      cor: '#10b981', 
      icon: <CheckCircle size={32} />,
      mensagem: 'Bom trabalho! Pode melhorar ainda mais'
    }
    if (media >= 4.0) return { 
      label: 'Reprovado', 
      cor: '#f59e0b', 
      icon: <XCircle size={32} />,
      mensagem: 'Atenção! Precisa se esforçar mais'
    }
    return { 
      label: 'Reprovado', 
      cor: '#ef4444', 
      icon: <XCircle size={32} />,
      mensagem: 'Urgente! Busque ajuda imediatamente'
    }
  }
  const openModal = (trimestre: number) => {
    const nota = notas.find(n => n.trimestre === trimestre) || {
      alunoId: selectedAluno,
      disciplinaId: selectedDisciplina,
      trimestre,
      avaliacao01: null,
      avaliacao02: null,
      avaliacao03: null,
      mediaM1: null,
      avaliacaoEAC: null
    }
    setEditingNota(nota)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingNota(null)
  }

  const handleNotaChange = (campo: keyof NotaData, valor: string) => {
    if (!editingNota) return
    
    const valorNum = valor === '' ? null : parseFloat(valor)
    
    if (valorNum !== null && (valorNum < 0 || valorNum > 10)) {
      return
    }

    const novaNotaEditada = { ...editingNota, [campo]: valorNum }
    
    if (campo === 'avaliacao01' || campo === 'avaliacao02' || campo === 'avaliacao03') {
      const media = calcularMediaM1(
        campo === 'avaliacao01' ? valorNum : novaNotaEditada.avaliacao01,
        campo === 'avaliacao02' ? valorNum : novaNotaEditada.avaliacao02,
        campo === 'avaliacao03' ? valorNum : novaNotaEditada.avaliacao03
      )
      novaNotaEditada.mediaM1 = media
    }
    
    setEditingNota(novaNotaEditada)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNota) return

    setSaving(true)
    const loadingToast = toast.loading('Salvando notas...')
    
    try {
      // Enviar para a API
      const response = await api.post('/notas/salvar', {
        alunoId: editingNota.alunoId,
        disciplinaId: editingNota.disciplinaId,
        trimestre: editingNota.trimestre,
        anoLetivo: anoLetivo,
        avaliacao01: editingNota.avaliacao01,
        avaliacao02: editingNota.avaliacao02,
        avaliacao03: editingNota.avaliacao03,
        avaliacaoEAC: editingNota.avaliacaoEAC,
        observacao: editingNota.observacao
      })

      const { nota, notaFinal: notaFinalAtualizada } = response.data

      // Atualizar a lista de notas
      const notasAtualizadas = [...notas]
      const index = notasAtualizadas.findIndex(n => n.trimestre === nota.trimestre)
      if (index >= 0) {
        notasAtualizadas[index] = nota
      } else {
        notasAtualizadas.push(nota)
      }
      setNotas(notasAtualizadas)
      setNotaFinal(notaFinalAtualizada)
      
      // Forçar recarregamento para garantir sincronização entre dispositivos
      setTimeout(() => {
        loadNotas()
      }, 500)
      
      toast.success('Notas salvas com sucesso!', { id: loadingToast })
      closeModal()
    } catch (error) {
      console.error('Erro ao salvar nota:', error)
      toast.error('Erro ao salvar nota. Tente novamente.', { id: loadingToast })
    } finally {
      setSaving(false)
    }
  }

  const handleExportarNotas = async () => {
    if (!selectedTurma || !selectedDisciplina) {
      toast.error('Selecione uma turma e disciplina primeiro');
      return;
    }

    try {
      // Buscar todas as notas da turma/disciplina
      const turma = turmas.find(t => t.id === selectedTurma);
      const disciplina = disciplinas.find(d => d.id === selectedDisciplina);
      
      if (!turma || !disciplina) {
        toast.error('Turma ou disciplina não encontrada');
        return;
      }

      // Buscar notas de todos os alunos da turma
      const alunosDaTurma = alunos.filter(a => a.turmaId === selectedTurma);
      
      if (alunosDaTurma.length === 0) {
        toast.error('Não há alunos nesta turma');
        return;
      }

      const loadingToast = toast.loading('Preparando exportação...');
      
      // Buscar notas de cada aluno
      const promises = alunosDaTurma.map(aluno => 
        api.get(`/notas/aluno/${aluno.id}/disciplina/${selectedDisciplina}`, {
          params: { anoLetivo }
        }).catch(() => ({ data: { notas: [], notaFinal: null } }))
      );

      const respostas = await Promise.all(promises);
      
      // Formatar dados para exportação
      const dadosExportacao = alunosDaTurma.map((aluno, index) => {
        const { notas: notasAluno, notaFinal } = respostas[index].data;
        
        const trimestre1 = notasAluno.find((n: NotaData) => n.trimestre === 1);
        const trimestre2 = notasAluno.find((n: NotaData) => n.trimestre === 2);
        const trimestre3 = notasAluno.find((n: NotaData) => n.trimestre === 3);

        return {
          'Aluno': aluno.nome,
          'Disciplina': disciplina.nome,
          'Turma': turma.nome,
          'Ano Letivo': anoLetivo,
          'T1 - Av1': trimestre1?.avaliacao01 ?? '-',
          'T1 - Av2': trimestre1?.avaliacao02 ?? '-',
          'T1 - Av3': trimestre1?.avaliacao03 ?? '-',
          'T1 - Média': trimestre1?.mediaM1 ?? '-',
          'T1 - EAC': trimestre1?.avaliacaoEAC ?? '-',
          'T1 - Final': trimestre1?.notaFinalTrimestre ?? '-',
          'T2 - Av1': trimestre2?.avaliacao01 ?? '-',
          'T2 - Av2': trimestre2?.avaliacao02 ?? '-',
          'T2 - Av3': trimestre2?.avaliacao03 ?? '-',
          'T2 - Média': trimestre2?.mediaM1 ?? '-',
          'T2 - EAC': trimestre2?.avaliacaoEAC ?? '-',
          'T2 - Final': trimestre2?.notaFinalTrimestre ?? '-',
          'T3 - Av1': trimestre3?.avaliacao01 ?? '-',
          'T3 - Av2': trimestre3?.avaliacao02 ?? '-',
          'T3 - Av3': trimestre3?.avaliacao03 ?? '-',
          'T3 - Média': trimestre3?.mediaM1 ?? '-',
          'T3 - EAC': trimestre3?.avaliacaoEAC ?? '-',
          'T3 - Final': trimestre3?.notaFinalTrimestre ?? '-',
          'Média Final': notaFinal?.mediaFinal ?? '-',
          'Situação': notaFinal?.aprovado ? 'Aprovado' : (notaFinal ? 'Reprovado' : '-'),
        };
      });

      const success = exportToExcel({
        filename: `notas-${turma.nome.replace(/\s+/g, '-')}-${disciplina.nome.replace(/\s+/g, '-')}-${anoLetivo}`,
        sheetName: 'Notas',
        data: dadosExportacao,
        columns: [
          { header: 'Aluno', key: 'Aluno', width: 30 },
          { header: 'Disciplina', key: 'Disciplina', width: 25 },
          { header: 'Turma', key: 'Turma', width: 15 },
          { header: 'Ano Letivo', key: 'Ano Letivo', width: 12 },
          { header: 'T1 - Av1', key: 'T1 - Av1', width: 10 },
          { header: 'T1 - Av2', key: 'T1 - Av2', width: 10 },
          { header: 'T1 - Av3', key: 'T1 - Av3', width: 10 },
          { header: 'T1 - Média', key: 'T1 - Média', width: 12 },
          { header: 'T1 - EAC', key: 'T1 - EAC', width: 10 },
          { header: 'T1 - Final', key: 'T1 - Final', width: 12 },
          { header: 'T2 - Av1', key: 'T2 - Av1', width: 10 },
          { header: 'T2 - Av2', key: 'T2 - Av2', width: 10 },
          { header: 'T2 - Av3', key: 'T2 - Av3', width: 10 },
          { header: 'T2 - Média', key: 'T2 - Média', width: 12 },
          { header: 'T2 - EAC', key: 'T2 - EAC', width: 10 },
          { header: 'T2 - Final', key: 'T2 - Final', width: 12 },
          { header: 'T3 - Av1', key: 'T3 - Av1', width: 10 },
          { header: 'T3 - Av2', key: 'T3 - Av2', width: 10 },
          { header: 'T3 - Av3', key: 'T3 - Av3', width: 10 },
          { header: 'T3 - Média', key: 'T3 - Média', width: 12 },
          { header: 'T3 - EAC', key: 'T3 - EAC', width: 10 },
          { header: 'T3 - Final', key: 'T3 - Final', width: 12 },
          { header: 'Média Final', key: 'Média Final', width: 12 },
          { header: 'Situação', key: 'Situação', width: 12 },
        ],
      });

      toast.dismiss(loadingToast);
      
      if (success) {
        toast.success('Notas exportadas com sucesso!');
      } else {
        toast.error('Erro ao exportar notas');
      }
    } catch (error) {
      console.error('Erro ao exportar notas:', error);
      toast.error('Erro ao exportar notas');
    }
  };

  if (loading) return (
    <div className="page">
      <BackButton />
      <div className="page-header">
        <h1>Notas e Avaliações</h1>
      </div>
      <TableSkeleton rows={5} columns={3} />
    </div>
  )

  const turmaSelecionada = turmas.find(t => t.id === selectedTurma)
  const alunoSelecionado = alunos.find(a => a.id === selectedAluno)
  const disciplinaSelecionada = disciplinas.find(d => d.id === selectedDisciplina)

  return (
    <div className="page">
      <BackButton />
      <div className="page-header">
        <h1>Notas e Avaliações</h1>
        {selectedTurma && selectedDisciplina && (
          <button 
            className="btn-secondary" 
            onClick={handleExportarNotas}
            title="Exportar notas de todos os alunos desta turma/disciplina"
          >
            <Download size={20} />
            Exportar Excel
          </button>
        )}
      </div>

      {/* Seleção de Turma */}
      <div className="selection-section">
        <div className="selection-header">
          <Users size={24} className="selection-icon" />
          <h2>1. Selecione a Turma</h2>
        </div>
        <div className="selection-grid">
          {turmas.map(turma => (
            <button
              key={turma.id}
              className={`selection-btn ${selectedTurma === turma.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedTurma(turma.id)
                setSelectedAluno('')
                setSelectedDisciplina('')
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
            <GraduationCap size={24} className="selection-icon" />
            <h2>2. Selecione o Aluno</h2>
          </div>
          <div className="selection-grid">
            {alunos.length === 0 ? (
              <p className="empty-message">Nenhum aluno encontrado nesta turma</p>
            ) : (
              alunos.map(aluno => (
                <button
                  key={aluno.id}
                  className={`selection-btn ${selectedAluno === aluno.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedAluno(aluno.id)
                    setSelectedDisciplina('')
                  }}
                >
                  <div className="selection-btn-content">
                    <span className="selection-btn-title">{aluno.nome}</span>
                    <span className="selection-btn-subtitle">{aluno.cpf}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Seleção de Disciplina */}
      {selectedAluno && (
        <div className="selection-section">
          <div className="selection-header">
            <BookOpen size={24} className="selection-icon" />
            <h2>3. Selecione a Disciplina</h2>
          </div>
          <div className="selection-grid">
            {disciplinasDaTurma.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>Nenhuma disciplina cadastrada para esta turma.</p>
                <p style={{ marginTop: '10px', fontSize: '0.9em' }}>Cadastre disciplinas para esta turma na aba "Disciplinas".</p>
              </div>
            ) : (
              disciplinasDaTurma.map(disciplina => (
                <button
                  key={disciplina.id}
                  className={`selection-btn ${selectedDisciplina === disciplina.id ? 'active' : ''}`}
                  onClick={() => setSelectedDisciplina(disciplina.id)}
                >
                  <div className="selection-btn-content">
                    <span className="selection-btn-title">{disciplina.nome}</span>
                    <span className="selection-btn-subtitle">{disciplina.cargaHoraria}h - {disciplina.professor?.nome || 'Sem professor'}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {selectedAluno && selectedDisciplina && (
        <>
          <div className="notas-info">
            <h2>{alunoSelecionado?.nome}</h2>
            <p>{disciplinaSelecionada?.nome}</p>
          </div>

          <div className="trimestres-container">
            {[1, 2, 3].map(tri => {
              const nota = notas.find(n => n.trimestre === tri)
              return (
                <div key={tri} className="trimestre-card">
                  <div className="trimestre-header">
                    <h3>{tri}º Trimestre</h3>
                    <button 
                      className="btn-icon"
                      onClick={() => openModal(tri)}
                      title="Editar notas"
                    >
                      <Edit size={16} />
                    </button>
                  </div>

                  <div className="momento-section">
                    <h4>Momento 1</h4>
                    <div className="notas-grid">
                      <div className="nota-item">
                        <span className="nota-label">Avaliação 01:</span>
                        <span className={`nota-valor ${getNotaColor(nota?.avaliacao01 || null)}`}>
                          {nota?.avaliacao01?.toFixed(1) || '-'}
                        </span>
                      </div>
                      <div className="nota-item">
                        <span className="nota-label">Avaliação 02:</span>
                        <span className={`nota-valor ${getNotaColor(nota?.avaliacao02 || null)}`}>
                          {nota?.avaliacao02?.toFixed(1) || '-'}
                        </span>
                      </div>
                      <div className="nota-item">
                        <span className="nota-label">Avaliação 03:</span>
                        <span className={`nota-valor ${getNotaColor(nota?.avaliacao03 || null)}`}>
                          {nota?.avaliacao03?.toFixed(1) || '-'}
                        </span>
                      </div>
                      <div className="nota-item media">
                        <span className="nota-label">Média M1:</span>
                        <span className={`nota-valor ${getNotaColor(nota?.mediaM1 || null)}`}>
                          {nota?.mediaM1?.toFixed(1) || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="momento-section">
                    <h4>Momento 2</h4>
                    <div className="notas-grid">
                      <div className="nota-item">
                        <span className="nota-label">Avaliação EAC:</span>
                        <span className={`nota-valor ${getNotaColor(nota?.avaliacaoEAC || null)}`}>
                          {nota?.avaliacaoEAC?.toFixed(1) || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="momento-section">
                    <h4>Nota Final do Trimestre</h4>
                    <div className="notas-grid">
                      <div className="nota-item final-trimestre">
                        <span className="nota-label">Maior Nota (M1 ou EAC):</span>
                        <span className={`nota-valor ${getNotaColor(nota?.notaFinalTrimestre || null)}`}>
                          {nota?.notaFinalTrimestre?.toFixed(2) || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Card de Nota Final do Ano */}
            <div className="trimestre-card nota-final-ano-card">
              <div className="trimestre-header nota-final-header">
                <h3>📊 Nota Final do Ano</h3>
              </div>

              <div className="momento-section">
                <h4>Fórmula: (T1×3 + T2×3 + T3×4) ÷ 10</h4>
                <div className="notas-grid">
                  <div className="nota-item">
                    <span className="nota-label">1º Trimestre:</span>
                    <span className={`nota-valor ${getNotaColor(notaFinal?.trimestre1 || null)}`}>
                      {notaFinal?.trimestre1?.toFixed(2) || '-'}
                    </span>
                  </div>
                  <div className="nota-item">
                    <span className="nota-label">2º Trimestre:</span>
                    <span className={`nota-valor ${getNotaColor(notaFinal?.trimestre2 || null)}`}>
                      {notaFinal?.trimestre2?.toFixed(2) || '-'}
                    </span>
                  </div>
                  <div className="nota-item">
                    <span className="nota-label">3º Trimestre:</span>
                    <span className={`nota-valor ${getNotaColor(notaFinal?.trimestre3 || null)}`}>
                      {notaFinal?.trimestre3?.toFixed(2) || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Média Parcial + Status Parcial */}
              <div className="momento-section">
                <div className="notas-grid">
                  <div className="nota-item media-parcial-ano">
                    <span className="nota-label" style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: '600',
                      color: '#2563eb'
                    }}>
                      {calcularMediaParcialAno().texto}:
                    </span>
                    <span className={`nota-valor ${getNotaColor(calcularMediaParcialAno().valor)}`} style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '700',
                      padding: '6px 12px',
                      backgroundColor: '#eff6ff',
                      borderRadius: '6px',
                      border: '2px solid #3b82f6'
                    }}>
                      {calcularMediaParcialAno().valor?.toFixed(2) || '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="momento-section status-section">
                <h4 style={{ color: '#2563eb', marginBottom: '16px' }}>Status Parcial</h4>
                {calcularMediaParcialAno().valor !== null ? (
                  <div 
                    className="status-badge"
                    style={{ 
                      backgroundColor: getStatusNota(calcularMediaParcialAno().valor).cor,
                      color: 'white',
                      border: 'none',
                      flexDirection: 'column',
                      gap: '12px',
                      padding: '20px',
                      borderRadius: '16px',
                      boxShadow: `0 8px 24px ${getStatusNota(calcularMediaParcialAno().valor).cor}40`
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      fontSize: 'clamp(1rem, 2.8vw, 1.3rem)',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {getStatusNota(calcularMediaParcialAno().valor).icon}
                      <span>{getStatusNota(calcularMediaParcialAno().valor).label}</span>
                    </div>
                    <div style={{ 
                      fontSize: 'clamp(0.85rem, 2.2vw, 1rem)',
                      fontWeight: '500',
                      textAlign: 'center',
                      lineHeight: '1.4',
                      opacity: '0.95',
                      fontStyle: 'italic'
                    }}>
                      {getStatusNota(calcularMediaParcialAno().valor).mensagem}
                    </div>
                  </div>
                ) : (
                  <div className="status-badge pendente" style={{
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '20px',
                    borderRadius: '16px'
                  }}>
                    <span style={{ fontSize: 'clamp(0.9rem, 2.3vw, 1.1rem)', fontWeight: '600' }}>Pendente</span>
                    <span style={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', fontStyle: 'italic' }}>{getStatusNota(null).mensagem}</span>
                  </div>
                )}
              </div>

              {/* Média Final + Status Final */}
              <div className="momento-section">
                <div className="notas-grid">
                  <div className="nota-item media-final">
                    <span className="nota-label" style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: '600',
                      color: '#dc2626'
                    }}>Média Final do Ano:</span>
                    <span className={`nota-valor ${getNotaColor(calcularMediaFinalAno())}`} style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '700',
                      padding: '6px 12px',
                      backgroundColor: '#fef2f2',
                      borderRadius: '6px',
                      border: '2px solid #ef4444'
                    }}>
                      {calcularMediaFinalAno()?.toFixed(2) || '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="momento-section status-section">
                <h4 style={{ color: '#dc2626', marginBottom: '16px' }}>Status Final</h4>
                {calcularMediaFinalAno() !== null ? (
                  <div 
                    className="status-badge"
                    style={{ 
                      backgroundColor: getStatusNota(calcularMediaFinalAno()).cor,
                      color: 'white',
                      border: 'none',
                      flexDirection: 'column',
                      gap: '12px',
                      padding: '20px',
                      borderRadius: '16px',
                      boxShadow: `0 8px 24px ${getStatusNota(calcularMediaFinalAno()).cor}40`
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      fontSize: 'clamp(1rem, 2.8vw, 1.3rem)',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {getStatusNota(calcularMediaFinalAno()).icon}
                      <span>{getStatusNota(calcularMediaFinalAno()).label}</span>
                    </div>
                    <div style={{ 
                      fontSize: 'clamp(0.85rem, 2.2vw, 1rem)',
                      fontWeight: '500',
                      textAlign: 'center',
                      lineHeight: '1.4',
                      opacity: '0.95',
                      fontStyle: 'italic'
                    }}>
                      {getStatusNota(calcularMediaFinalAno()).mensagem}
                    </div>
                  </div>
                ) : (
                  <div className="status-badge pendente" style={{
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '20px',
                    borderRadius: '16px'
                  }}>
                    <span style={{ fontSize: 'clamp(0.9rem, 2.3vw, 1.1rem)', fontWeight: '600' }}>Pendente</span>
                    <span style={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', fontStyle: 'italic' }}>{getStatusNota(null).mensagem}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showModal && editingNota && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-notas" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Notas - {editingNota.trimestre}º Trimestre</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="momento-form">
                  <h3>Momento 1</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label style={{ color: '#334155' }}>Avaliação 01 (0.0 - 10.0)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={editingNota.avaliacao01 ?? ''}
                        onChange={(e) => handleNotaChange('avaliacao01', e.target.value)}
                        placeholder="0.0"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#334155' }}>Avaliação 02 (0.0 - 10.0)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={editingNota.avaliacao02 ?? ''}
                        onChange={(e) => handleNotaChange('avaliacao02', e.target.value)}
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label style={{ color: '#334155' }}>Avaliação 03 (0.0 - 10.0)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={editingNota.avaliacao03 ?? ''}
                        onChange={(e) => handleNotaChange('avaliacao03', e.target.value)}
                        placeholder="0.0"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#334155' }}>Média M1 (Automática)</label>
                      <input
                        type="text"
                        value={editingNota.mediaM1?.toFixed(1) || '-'}
                        disabled
                        className="nota-readonly"
                      />
                    </div>
                  </div>
                </div>

                <div className="momento-form">
                  <h3>Momento 2</h3>
                  <div className="form-group">
                    <label style={{ color: '#334155' }}>Avaliação EAC (0.0 - 10.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={editingNota.avaliacaoEAC ?? ''}
                      onChange={(e) => handleNotaChange('avaliacaoEAC', e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ color: '#334155' }}>Observações</label>
                  <textarea
                    value={editingNota.observacao || ''}
                    onChange={(e) => setEditingNota({ ...editingNota, observacao: e.target.value })}
                    placeholder="Observações sobre o desempenho do aluno..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={saving}>
                  <Save size={20} />
                  {saving ? 'Salvando...' : 'Salvar Notas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notas
