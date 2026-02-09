import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../lib/permissions';
import ReconhecimentoFacialIA from '../components/ReconhecimentoFacialIA';
import CadastroFacialIA from '../pages/CadastroFacialIA';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ModernPages.css';
import './RegistroPonto.css';

interface Professor {
  id: string;
  nome: string;
  cargaHorariaSemanal?: number;
}

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  cargaHorariaSemanal?: number;
}

interface EquipeDiretiva {
  id: string;
  nome: string;
  cargo: string;
  cargaHorariaSemanal?: number;
}

interface RegistroPonto {
  id: string;
  pessoaId: string;
  tipoPessoa: 'PROFESSOR' | 'FUNCIONARIO' | 'EQUIPE_DIRETIVA';
  data: string;
  horaRegistro: string;
  tipoRegistro: 'ENTRADA' | 'SAIDA' | 'INTERVALO_INICIO' | 'INTERVALO_FIM';
  observacao?: string;
  aprovado: boolean;
  reconhecimentoIA?: boolean;
  confianca?: number;
  fotoUrl?: string;
}

interface ConfiguracaoJornada {
  id: string;
  pessoaId: string;
  tipoPessoa: string;
  cargaHorariaSemanal: number;
  cargaHorariaDiaria: number;
  horarioEntrada?: string;
  horarioSaida?: string;
  horarioIntervaloInicio?: string;
  horarioIntervaloFim?: string;
  diasTrabalho: string[];
}

interface BancoHoras {
  id: string;
  pessoaId: string;
  mes: number;
  ano: number;
  horasTrabalhadas: number;
  horasDevidas: number;
  saldo: number;
}

interface ConfigEscola {
  id?: string;
  nomeEscola: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  logoUrl?: string;
}

export default function RegistroPontoIntegrado() {
  const { user } = useAuth();
  
  // Estado da aba/modo ativo
  const [modo, setModo] = useState<'manual' | 'ia' | 'cadastro'>('manual');
  const [view, setView] = useState<'registro' | 'consulta' | 'jornada' | 'banco-horas' | 'relatorio'>('registro');
  
  // Estados principais
  const [tipoPessoa, setTipoPessoa] = useState<'PROFESSOR' | 'FUNCIONARIO' | 'EQUIPE_DIRETIVA'>('PROFESSOR');
  const [pessoaSelecionada, setPessoaSelecionada] = useState<string>('');
  const [tipoRegistro, setTipoRegistro] = useState<'ENTRADA' | 'SAIDA' | 'INTERVALO_INICIO' | 'INTERVALO_FIM'>('ENTRADA');
  const [observacao, setObservacao] = useState('');
  
  // Listas de pessoas
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [equipeDiretiva, setEquipeDiretiva] = useState<EquipeDiretiva[]>([]);
  
  // Dados para exibição
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);
  const [jornada, setJornada] = useState<ConfiguracaoJornada | null>(null);
  const [bancoHoras, setBancoHoras] = useState<BancoHoras[]>([]);
  const [configEscola, setConfigEscola] = useState<ConfigEscola | null>(null);
  
  // Filtros
  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());
  const [filtroBancoHoras, setFiltroBancoHoras] = useState<'mensal' | 'anual'>('mensal');
  
  // UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editandoJornada, setEditandoJornada] = useState(false);
  
  // Form de jornada
  const [formJornada, setFormJornada] = useState({
    cargaHorariaSemanal: 40,
    cargaHorariaDiaria: 8,
    horarioEntrada: '08:00',
    horarioSaida: '17:00',
    horarioIntervaloInicio: '12:00',
    horarioIntervaloFim: '13:00',
    diasTrabalho: ['SEG', 'TER', 'QUA', 'QUI', 'SEX']
  });

  // Ref para impressão
  const relatorioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    carregarPessoas();
    carregarConfigEscola();
    
    // Se não for admin, selecionar automaticamente o usuário logado
    if (user && !isAdmin(user)) {
      setPessoaSelecionada(user.id);
    }
  }, []);

  useEffect(() => {
    if (pessoaSelecionada) {
      if (view === 'consulta') {
        carregarRegistros();
      } else if (view === 'jornada') {
        carregarJornada();
      } else if (view === 'banco-horas' || view === 'relatorio') {
        carregarBancoHoras();
      }
    }
  }, [pessoaSelecionada, view, mesFiltro, anoFiltro]);

  useEffect(() => {
    if (view === 'relatorio' && pessoaSelecionada) {
      carregarRegistros();
      carregarJornada();
    }
  }, [view, pessoaSelecionada, mesFiltro, anoFiltro]);

  const carregarPessoas = async () => {
    try {
      const [profRes, funcRes, equipRes] = await Promise.all([
        api.get('/professores'),
        api.get('/funcionarios'),
        api.get('/equipe-diretiva')
      ]);
      
      setProfessores(profRes.data);
      setFuncionarios(funcRes.data);
      setEquipeDiretiva(equipRes.data);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
    }
  };

  const carregarConfigEscola = async () => {
    try {
      const response = await api.get('/configuracoes');
      if (response.data && response.data.length > 0) {
        setConfigEscola(response.data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const carregarRegistros = async () => {
    if (!pessoaSelecionada) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/ponto/pessoa/${pessoaSelecionada}`, {
        params: { mes: mesFiltro, ano: anoFiltro }
      });
      setRegistros(response.data);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  const excluirRegistro = async (registroId: string) => {
    if (!isAdmin(user)) {
      setMessage({ type: 'error', text: '❌ Apenas administradores podem excluir registros' });
      return;
    }

    if (!confirm('⚠️ Tem certeza que deseja excluir este registro?')) {
      return;
    }

    try {
      await api.delete(`/ponto/${registroId}`);
      setMessage({ type: 'success', text: '✅ Registro excluído com sucesso!' });
      carregarRegistros();
    } catch (error: any) {
      console.error('Erro ao excluir registro:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao excluir registro' });
    }
  };

  const editarRegistro = async (registroId: string, novoTipo: string, novaObservacao: string) => {
    if (!isAdmin(user)) {
      setMessage({ type: 'error', text: '❌ Apenas administradores podem editar registros' });
      return;
    }

    try {
      await api.put(`/ponto/${registroId}`, {
        tipoRegistro: novoTipo,
        observacao: novaObservacao
      });
      setMessage({ type: 'success', text: '✅ Registro atualizado com sucesso!' });
      carregarRegistros();
    } catch (error: any) {
      console.error('Erro ao editar registro:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao editar registro' });
    }
  };

  const formatarHorario = (dataHora: string) => {
    const data = new Date(dataHora);
    return data.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const carregarJornada = async () => {
    if (!pessoaSelecionada) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/ponto/jornada/${pessoaSelecionada}`);
      if (response.data) {
        // Remover duplicatas dos dias de trabalho
        const diasUnicos = response.data.diasTrabalho 
          ? Array.from(new Set(response.data.diasTrabalho))
          : ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
        
        setJornada({ ...response.data, diasTrabalho: diasUnicos });
        setFormJornada({
          cargaHorariaSemanal: response.data.cargaHorariaSemanal,
          cargaHorariaDiaria: response.data.cargaHorariaDiaria,
          horarioEntrada: response.data.horarioEntrada || '08:00',
          horarioSaida: response.data.horarioSaida || '17:00',
          horarioIntervaloInicio: response.data.horarioIntervaloInicio || '12:00',
          horarioIntervaloFim: response.data.horarioIntervaloFim || '13:00',
          diasTrabalho: diasUnicos
        });
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Erro ao carregar jornada:', error);
      }
      setJornada(null);
    } finally {
      setLoading(false);
    }
  };

  const carregarBancoHoras = async () => {
    if (!pessoaSelecionada) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/ponto/banco-horas/${pessoaSelecionada}`);
      setBancoHoras(response.data);
    } catch (error) {
      console.error('Erro ao carregar banco de horas:', error);
      setBancoHoras([]);
    } finally {
      setLoading(false);
    }
  };

  const registrarPonto = async () => {
    if (!pessoaSelecionada) {
      setMessage({ type: 'error', text: 'Selecione uma pessoa' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/ponto', {
        pessoaId: pessoaSelecionada,
        tipoPessoa: tipoPessoa,
        tipoRegistro: tipoRegistro,
        observacao: observacao || undefined
      });

      const nomePessoa = getNomePessoa(pessoaSelecionada);
      setMessage({ type: 'success', text: `✅ Ponto de ${nomePessoa} registrado com sucesso!` });
      setObservacao('');
      
      if (isAdmin(user)) {
        setPessoaSelecionada('');
      }
      
      if (view === 'consulta') {
        carregarRegistros();
      }
    } catch (error: any) {
      console.error('Erro ao registrar ponto:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao registrar ponto' });
    } finally {
      setLoading(false);
    }
  };

  const handleReconhecimentoSucesso = async (pessoaId: string, tipoPessoa: string, nome: string, confianca: number, foto: string) => {
    try {
      setLoading(true);
      setMessage({ type: 'success', text: `🤖 ${nome} reconhecido! Registrando ponto...` });

      const blob = await fetch(foto).then(r => r.blob());
      const formData = new FormData();
      formData.append('foto', blob, 'registro-ia.jpg');
      formData.append('pessoaId', pessoaId);
      formData.append('tipoPessoa', tipoPessoa);
      formData.append('tipoRegistro', tipoRegistro);
      formData.append('observacao', `Reconhecimento IA - ${confianca}% confiança`);
      formData.append('reconhecimentoIA', 'true');
      formData.append('confianca', confianca.toString());

      await api.post('/ponto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({ type: 'success', text: `✅ Ponto de ${nome} registrado com sucesso via IA!` });
      
      if (view === 'consulta') {
        carregarRegistros();
      }
    } catch (error: any) {
      console.error('Erro ao registrar ponto via IA:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao registrar ponto' });
    } finally {
      setLoading(false);
    }
  };

  const salvarJornada = async () => {
    if (!pessoaSelecionada) {
      setMessage({ type: 'error', text: 'Selecione uma pessoa' });
      return;
    }

    setLoading(true);
    try {
      // Remover duplicatas dos dias de trabalho antes de salvar
      const diasUnicos = Array.from(new Set(formJornada.diasTrabalho));
      
      await api.post('/ponto/jornada', {
        pessoaId: pessoaSelecionada,
        tipoPessoa: tipoPessoa,
        ...formJornada,
        diasTrabalho: diasUnicos
      });

      setMessage({ type: 'success', text: '✅ Jornada configurada com sucesso!' });
      await carregarJornada();
      setEditandoJornada(false);
    } catch (error: any) {
      console.error('Erro ao salvar jornada:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao salvar jornada' });
    } finally {
      setLoading(false);
    }
  };

  const gerarPDF = () => {
    if (!pessoaSelecionada) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Logo e Cabeçalho da Escola
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(configEscola?.nomeEscola || 'Sistema de Gestão Escolar', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    if (configEscola?.endereco) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(configEscola.endereco, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
    }

    if (configEscola?.telefone || configEscola?.email) {
      doc.setFontSize(9);
      const contato = [configEscola?.telefone, configEscola?.email].filter(Boolean).join(' | ');
      doc.text(contato, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
    }

    if (configEscola?.cnpj) {
      doc.setFontSize(9);
      doc.text(`CNPJ: ${configEscola.cnpj}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
    }

    // Linha divisória
    doc.setLineWidth(0.5);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 8;

    // Título do Relatório
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE PONTO', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Informações da Pessoa
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO FUNCIONÁRIO', 14, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${getNomePessoa(pessoaSelecionada)}`, 14, yPos);
    yPos += 5;
    doc.text(`Função: ${tipoPessoa.replace('_', ' ')}`, 14, yPos);
    yPos += 5;
    doc.text(`Período: ${String(mesFiltro).padStart(2, '0')}/${anoFiltro}`, 14, yPos);
    yPos += 5;
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, yPos);
    yPos += 10;

    // Jornada de Trabalho
    if (jornada) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('JORNADA DE TRABALHO', 14, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Carga Horária Semanal: ${jornada.cargaHorariaSemanal}h`, 14, yPos);
      yPos += 5;
      doc.text(`Carga Horária Diária: ${jornada.cargaHorariaDiaria}h`, 14, yPos);
      yPos += 5;
      doc.text(`Horário: ${jornada.horarioEntrada} às ${jornada.horarioSaida}`, 14, yPos);
      yPos += 5;
      doc.text(`Intervalo: ${jornada.horarioIntervaloInicio} às ${jornada.horarioIntervaloFim}`, 14, yPos);
      yPos += 5;
      const diasUnicos = Array.from(new Set(jornada.diasTrabalho));
      doc.text(`Dias de Trabalho: ${diasUnicos.join(', ')}`, 14, yPos);
      yPos += 10;
    }

    // Registros de Ponto
    if (registros.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('REGISTROS DE PONTO', 14, yPos);
      yPos += 6;

      const registrosData = registros.map(r => [
        formatarData(r.data),
        r.horaRegistro,
        getTipoRegistroLabel(r.tipoRegistro).replace(/🟢|🔴|🟡/g, '').trim(),
        (r.observacao || '-').substring(0, 40),
        r.reconhecimentoIA ? 'IA' : 'Manual',
        r.aprovado ? 'Sim' : 'Não'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Data', 'Hora', 'Tipo', 'Observação', 'Método', 'Aprovado']],
        body: registrosData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 20 },
          2: { cellWidth: 30 },
          3: { cellWidth: 55 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Banco de Horas
    if (bancoHoras.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('BANCO DE HORAS', 14, yPos);
      yPos += 6;

      const bancoData = bancoHoras.map(b => [
        `${String(b.mes).padStart(2, '0')}/${b.ano}`,
        `${b.horasTrabalhadas.toFixed(2)}h`,
        `${b.horasDevidas.toFixed(2)}h`,
        `${b.saldo >= 0 ? '+' : ''}${b.saldo.toFixed(2)}h`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Mês/Ano', 'Trabalhadas', 'Devidas', 'Saldo']],
        body: bancoData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 45 },
          2: { cellWidth: 45 },
          3: { cellWidth: 45 }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Rodapé
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        'Documento gerado pelo Sistema de Gestão Escolar',
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 6,
        { align: 'center' }
      );
    }

    // Salvar PDF
    const nomeArquivo = `relatorio_ponto_${getNomePessoa(pessoaSelecionada).replace(/\s+/g, '_')}_${mesFiltro}_${anoFiltro}.pdf`;
    doc.save(nomeArquivo);
  };

  const getNomePessoa = (id: string): string => {
    const pessoa = [...professores, ...funcionarios, ...equipeDiretiva].find(p => p.id === id);
    return pessoa ? pessoa.nome : id;
  };

  const getPessoasList = () => {
    switch (tipoPessoa) {
      case 'PROFESSOR':
        return professores;
      case 'FUNCIONARIO':
        return funcionarios;
      case 'EQUIPE_DIRETIVA':
        return equipeDiretiva;
      default:
        return [];
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const getTipoRegistroLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'ENTRADA': '🟢 Entrada',
      'SAIDA': '🔴 Saída',
      'INTERVALO_INICIO': '🟡 Início Intervalo',
      'INTERVALO_FIM': '🟢 Fim Intervalo'
    };
    return labels[tipo] || tipo;
  };

  const handleDiaTrabalhoToggle = (dia: string) => {
    setFormJornada(prev => ({
      ...prev,
      diasTrabalho: prev.diasTrabalho.includes(dia)
        ? prev.diasTrabalho.filter(d => d !== dia)
        : [...prev.diasTrabalho, dia]
    }));
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title" style={{ margin: 0 }}>📋 Registro de Ponto</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.95rem', color: '#64748b' }}>
            {user?.email}
          </span>
          {isAdmin(user) && (
            <span
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                backgroundColor: '#fbbf24',
                color: '#ffffff',
                border: '2px solid #f59e0b',
                fontWeight: '600',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              👑 Administrador
            </span>
          )}
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type === 'error' ? 'message-error' : 'message-success'}`}>
          {message.text}
        </div>
      )}

      {/* Navegação Principal */}
      <div className="tabs-container">
        <button
          className={`tab-button ${view === 'registro' ? 'active' : ''}`}
          onClick={() => setView('registro')}
        >
          📝 Registro de Ponto
        </button>
        <button
          className={`tab-button ${view === 'consulta' ? 'active' : ''}`}
          onClick={() => setView('consulta')}
        >
          📊 Consultar Registros
        </button>
        <button
          className={`tab-button ${view === 'jornada' ? 'active' : ''}`}
          onClick={() => setView('jornada')}
        >
          ⏰ Jornada de Trabalho
        </button>
        <button
          className={`tab-button ${view === 'banco-horas' ? 'active' : ''}`}
          onClick={() => setView('banco-horas')}
        >
          💰 Banco de Horas
        </button>
        <button
          className={`tab-button ${view === 'relatorio' ? 'active' : ''}`}
          onClick={() => setView('relatorio')}
        >
          📄 Relatório Completo
        </button>
      </div>

      {/* Filtros Globais */}
      <div className="filters-section">
        {!isAdmin(user) && (
          <div className="message info" style={{ marginBottom: '15px', gridColumn: '1 / -1' }}>
            ℹ️ Você está visualizando apenas suas próprias informações
          </div>
        )}
        
        <div className="form-group">
          <label>Função:</label>
          <select 
            value={tipoPessoa} 
            onChange={(e) => {
              setTipoPessoa(e.target.value as any);
              setPessoaSelecionada('');
            }}
            disabled={!isAdmin(user)}
          >
            <option value="PROFESSOR">Professor</option>
            <option value="FUNCIONARIO">Funcionário</option>
            <option value="EQUIPE_DIRETIVA">Equipe Diretiva</option>
          </select>
        </div>

        <div className="form-group">
          <label>Pessoa:</label>
          <select 
            value={pessoaSelecionada} 
            onChange={(e) => setPessoaSelecionada(e.target.value)}
            disabled={!isAdmin(user)}
          >
            <option value="">Selecione...</option>
            {getPessoasList().map((pessoa) => (
              <option key={pessoa.id} value={pessoa.id}>
                {pessoa.nome}
              </option>
            ))}
          </select>
        </div>

        {view === 'consulta' && (
          <>
            <div className="form-group">
              <label>Mês:</label>
              <input
                type="number"
                value={mesFiltro}
                onChange={(e) => setMesFiltro(Number(e.target.value))}
                min="1"
                max="12"
              />
            </div>
            <div className="form-group">
              <label>Ano:</label>
              <input
                type="number"
                value={anoFiltro}
                onChange={(e) => setAnoFiltro(Number(e.target.value))}
                min="2000"
                max="2099"
              />
            </div>
          </>
        )}
      </div>

      {/* ÁREA DE REGISTRO DE PONTO - INTEGRADA */}
      {view === 'registro' && (
        <div className="content-box">
          <h2>Registrar Ponto</h2>
          
          {/* Seletor de Modo de Registro */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
            <button
              className={`btn-mode ${modo === 'manual' ? 'active' : ''}`}
              onClick={() => setModo('manual')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: modo === 'manual' ? '2px solid #0ea5e9' : '2px solid #e2e8f0',
                background: modo === 'manual' ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : '#ffffff',
                color: modo === 'manual' ? '#ffffff' : '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              📝 Registro Manual
            </button>
            <button
              className={`btn-mode ${modo === 'ia' ? 'active' : ''}`}
              onClick={() => setModo('ia')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: modo === 'ia' ? '2px solid #8b5cf6' : '2px solid #e2e8f0',
                background: modo === 'ia' ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : '#ffffff',
                color: modo === 'ia' ? '#ffffff' : '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              🤖 Reconhecimento IA
            </button>
            <button
              className={`btn-mode ${modo === 'cadastro' ? 'active' : ''}`}
              onClick={() => setModo('cadastro')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: modo === 'cadastro' ? '2px solid #10b981' : '2px solid #e2e8f0',
                background: modo === 'cadastro' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#ffffff',
                color: modo === 'cadastro' ? '#ffffff' : '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              📸 Cadastrar Rosto
            </button>
          </div>

          {/* MODO: Registro Manual */}
          {modo === 'manual' && (
            <div className="form-section">
              <div className="form-group">
                <label>Tipo de Registro:</label>
                <select 
                  value={tipoRegistro} 
                  onChange={(e) => setTipoRegistro(e.target.value as any)}
                >
                  <option value="ENTRADA">🟢 Entrada</option>
                  <option value="SAIDA">🔴 Saída</option>
                  <option value="INTERVALO_INICIO">🟡 Início Intervalo</option>
                  <option value="INTERVALO_FIM">🟢 Fim Intervalo</option>
                </select>
              </div>

              <div className="form-group">
                <label>Observação (opcional):</label>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Ex: Compensação de horas, reunião externa..."
                  rows={3}
                />
              </div>

              <button 
                className="btn-primary btn-register"
                onClick={registrarPonto}
                disabled={loading || !pessoaSelecionada}
              >
                {loading ? 'Registrando...' : '✅ Registrar Ponto'}
              </button>
            </div>
          )}

          {/* MODO: Reconhecimento IA */}
          {modo === 'ia' && (
            <div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Tipo de Registro para IA:</label>
                <select 
                  value={tipoRegistro} 
                  onChange={(e) => setTipoRegistro(e.target.value as any)}
                  style={{ maxWidth: '300px' }}
                >
                  <option value="ENTRADA">🟢 Entrada</option>
                  <option value="SAIDA">🔴 Saída</option>
                  <option value="INTERVALO_INICIO">🟡 Início Intervalo</option>
                  <option value="INTERVALO_FIM">🟢 Fim Intervalo</option>
                </select>
              </div>
              <ReconhecimentoFacialIA 
                onReconhecimentoSucesso={handleReconhecimentoSucesso}
                onErro={(erro) => setMessage({ type: 'error', text: erro })}
              />
            </div>
          )}

          {/* MODO: Cadastro Facial */}
          {modo === 'cadastro' && (
            <CadastroFacialIA />
          )}
        </div>
      )}

      {/* CONSULTAR REGISTROS */}
      {view === 'consulta' && (
        <div className="content-box">
          <h2>Consultar Registros</h2>
          
          {!pessoaSelecionada ? (
            <div className="message info">
              ℹ️ Selecione uma pessoa para visualizar os registros
            </div>
          ) : loading ? (
            <div className="message info">⏳ Carregando registros...</div>
          ) : registros.length === 0 ? (
            <div className="message warning">
              ⚠️ Nenhum registro encontrado para {getNomePessoa(pessoaSelecionada)} em {mesFiltro}/{anoFiltro}
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Tipo</th>
                    <th>Método</th>
                    <th>Confiança IA</th>
                    <th>Observação</th>
                    <th>Status</th>
                    {isAdmin(user) && <th>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {registros.map((registro) => (
                    <tr key={registro.id}>
                      <td>{formatarData(registro.data)}</td>
                      <td style={{ 
                        fontWeight: '700', 
                        fontSize: '1.1em',
                        color: '#1e293b',
                        fontFamily: 'monospace'
                      }}>
                        {formatarHorario(registro.horaRegistro)}
                      </td>
                      <td>{getTipoRegistroLabel(registro.tipoRegistro)}</td>
                      <td>
                        {registro.reconhecimentoIA ? (
                          <span style={{ color: '#8b5cf6', fontWeight: '600' }}>🤖 IA</span>
                        ) : (
                          <span style={{ color: '#0ea5e9', fontWeight: '600' }}>📝 Manual</span>
                        )}
                      </td>
                      <td>
                        {registro.confianca ? (
                          <span style={{ color: '#10b981', fontWeight: '600' }}>
                            {registro.confianca}%
                          </span>
                        ) : '-'}
                      </td>
                      <td>{registro.observacao || '-'}</td>
                      <td>
                        <span className={`status-badge ${registro.aprovado ? 'approved' : 'pending'}`}>
                          {registro.aprovado ? '✅ Aprovado' : '⏳ Pendente'}
                        </span>
                      </td>
                      {isAdmin(user) && (
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              onClick={() => {
                                const novoTipo = prompt('Novo tipo (ENTRADA, SAIDA, INTERVALO_INICIO, INTERVALO_FIM):', registro.tipoRegistro);
                                const novaObs = prompt('Nova observação:', registro.observacao || '');
                                if (novoTipo) editarRegistro(registro.id, novoTipo, novaObs || '');
                              }}
                              style={{
                                padding: '5px 10px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85em'
                              }}
                              title="Editar registro"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => excluirRegistro(registro.id)}
                              style={{
                                padding: '5px 10px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85em'
                              }}
                              title="Excluir registro"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* JORNADA DE TRABALHO */}
      {view === 'jornada' && (
        <div className="content-box">
          <h2>Configuração de Jornada</h2>
          
          {!pessoaSelecionada ? (
            <div className="message info">
              ℹ️ Selecione uma pessoa para configurar a jornada
            </div>
          ) : (
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Carga Horária Semanal (horas):</label>
                  <input
                    type="number"
                    value={formJornada.cargaHorariaSemanal}
                    onChange={(e) => setFormJornada({ ...formJornada, cargaHorariaSemanal: Number(e.target.value) })}
                    min="1"
                    max="60"
                    disabled={!editandoJornada && jornada !== null}
                  />
                </div>

                <div className="form-group">
                  <label>Carga Horária Diária (horas):</label>
                  <input
                    type="number"
                    value={formJornada.cargaHorariaDiaria}
                    onChange={(e) => setFormJornada({ ...formJornada, cargaHorariaDiaria: Number(e.target.value) })}
                    min="1"
                    max="12"
                    disabled={!editandoJornada && jornada !== null}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Horário de Entrada:</label>
                  <input
                    type="time"
                    value={formJornada.horarioEntrada}
                    onChange={(e) => setFormJornada({ ...formJornada, horarioEntrada: e.target.value })}
                    disabled={!editandoJornada && jornada !== null}
                  />
                </div>

                <div className="form-group">
                  <label>Horário de Saída:</label>
                  <input
                    type="time"
                    value={formJornada.horarioSaida}
                    onChange={(e) => setFormJornada({ ...formJornada, horarioSaida: e.target.value })}
                    disabled={!editandoJornada && jornada !== null}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Início do Intervalo:</label>
                  <input
                    type="time"
                    value={formJornada.horarioIntervaloInicio}
                    onChange={(e) => setFormJornada({ ...formJornada, horarioIntervaloInicio: e.target.value })}
                    disabled={!editandoJornada && jornada !== null}
                  />
                </div>

                <div className="form-group">
                  <label>Fim do Intervalo:</label>
                  <input
                    type="time"
                    value={formJornada.horarioIntervaloFim}
                    onChange={(e) => setFormJornada({ ...formJornada, horarioIntervaloFim: e.target.value })}
                    disabled={!editandoJornada && jornada !== null}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dias de Trabalho:</label>
                <div className="dias-trabalho-grid">
                  {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map((dia) => (
                    <button
                      key={dia}
                      type="button"
                      className={`dia-button ${formJornada.diasTrabalho.includes(dia) ? 'active' : ''}`}
                      onClick={() => handleDiaTrabalhoToggle(dia)}
                      disabled={!editandoJornada && jornada !== null}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                {jornada && !editandoJornada && (
                  <button 
                    className="btn-editar"
                    onClick={() => {
                      setEditandoJornada(true);
                      // Recarregar dados atuais nos campos
                      if (jornada) {
                        const diasUnicos = Array.from(new Set(jornada.diasTrabalho || ['SEG', 'TER', 'QUA', 'QUI', 'SEX']));
                        setFormJornada({
                          cargaHorariaSemanal: jornada.cargaHorariaSemanal,
                          cargaHorariaDiaria: jornada.cargaHorariaDiaria,
                          horarioEntrada: jornada.horarioEntrada || '08:00',
                          horarioSaida: jornada.horarioSaida || '17:00',
                          horarioIntervaloInicio: jornada.horarioIntervaloInicio || '12:00',
                          horarioIntervaloFim: jornada.horarioIntervaloFim || '13:00',
                          diasTrabalho: diasUnicos
                        });
                      }
                    }}
                    style={{
                      padding: '14px 28px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    ✏️ Editar Jornada de Trabalho
                  </button>
                )}

                {(editandoJornada || !jornada) && (
                  <>
                    {editandoJornada && (
                      <button 
                        onClick={() => {
                          setEditandoJornada(false);
                          // Recarregar dados originais
                          if (jornada) {
                            const diasUnicos = Array.from(new Set(jornada.diasTrabalho || ['SEG', 'TER', 'QUA', 'QUI', 'SEX']));
                            setFormJornada({
                              cargaHorariaSemanal: jornada.cargaHorariaSemanal,
                              cargaHorariaDiaria: jornada.cargaHorariaDiaria,
                              horarioEntrada: jornada.horarioEntrada || '08:00',
                              horarioSaida: jornada.horarioSaida || '17:00',
                              horarioIntervaloInicio: jornada.horarioIntervaloInicio || '12:00',
                              horarioIntervaloFim: jornada.horarioIntervaloFim || '13:00',
                              diasTrabalho: diasUnicos
                            });
                          }
                        }}
                        style={{
                          padding: '14px 28px',
                          background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                          color: 'white',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '12px',
                          fontSize: '15px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(107, 114, 128, 0.3)'
                        }}
                      >
                        ❌ Cancelar
                      </button>
                    )}
                    
                    <button 
                      className="btn-primary"
                      onClick={async () => {
                        await salvarJornada();
                        setEditandoJornada(false);
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Salvando...' : '💾 Salvar Configuração'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BANCO DE HORAS */}
      {view === 'banco-horas' && (
        <div className="content-box">
          <h2>Banco de Horas</h2>
          
          {!pessoaSelecionada ? (
            <div className="message info">
              ℹ️ Selecione uma pessoa para visualizar o banco de horas
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Período:</label>
                  <select 
                    value={filtroBancoHoras} 
                    onChange={(e) => setFiltroBancoHoras(e.target.value as 'mensal' | 'anual')}
                    style={{ 
                      border: '2px solid #00BCD4',
                      borderRadius: '8px',
                      padding: '10px 12px'
                    }}
                  >
                    <option value="mensal">📅 Mensal</option>
                    <option value="anual">📆 Anual</option>
                  </select>
                </div>
                
                {filtroBancoHoras === 'mensal' && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Mês:</label>
                    <input
                      type="number"
                      value={mesFiltro}
                      onChange={(e) => setMesFiltro(Number(e.target.value))}
                      min="1"
                      max="12"
                      style={{ 
                        border: '2px solid #00BCD4',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        width: '80px'
                      }}
                    />
                  </div>
                )}
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Ano:</label>
                  <input
                    type="number"
                    value={anoFiltro}
                    onChange={(e) => setAnoFiltro(Number(e.target.value))}
                    min="2000"
                    max="2099"
                    style={{ 
                      border: '2px solid #00BCD4',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      width: '100px'
                    }}
                  />
                </div>
              </div>

              {loading ? (
                <div className="message info">⏳ Carregando banco de horas...</div>
              ) : bancoHoras.length === 0 ? (
                <div className="message warning">
                  ⚠️ Nenhum registro de banco de horas para {getNomePessoa(pessoaSelecionada)}
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Mês/Ano</th>
                        <th>Horas Trabalhadas</th>
                        <th>Horas Devidas</th>
                        <th>Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bancoHoras
                        .filter(banco => {
                          if (filtroBancoHoras === 'mensal') {
                            return banco.mes === mesFiltro && banco.ano === anoFiltro;
                          }
                          return banco.ano === anoFiltro;
                        })
                        .map((banco) => (
                          <tr key={banco.id}>
                            <td style={{ fontWeight: '700' }}>
                              {String(banco.mes).padStart(2, '0')}/{banco.ano}
                            </td>
                            <td>{banco.horasTrabalhadas.toFixed(2)}h</td>
                            <td>{banco.horasDevidas.toFixed(2)}h</td>
                            <td>
                              <span style={{
                                color: banco.saldo >= 0 ? '#10b981' : '#ef4444',
                                fontWeight: '700',
                                fontSize: '1.1em'
                              }}>
                                {banco.saldo >= 0 ? '+' : ''}{banco.saldo.toFixed(2)}h
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* RELATÓRIO COMPLETO */}
      {view === 'relatorio' && (
        <div className="content-box">
          <h2>Relatório Completo</h2>
          
          {!pessoaSelecionada ? (
            <div className="message info">
              ℹ️ Selecione uma pessoa para gerar o relatório
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Mês:</label>
                  <input
                    type="number"
                    value={mesFiltro}
                    onChange={(e) => setMesFiltro(Number(e.target.value))}
                    min="1"
                    max="12"
                    style={{ 
                      border: '2px solid #00BCD4',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      width: '80px'
                    }}
                  />
                </div>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Ano:</label>
                  <input
                    type="number"
                    value={anoFiltro}
                    onChange={(e) => setAnoFiltro(Number(e.target.value))}
                    min="2000"
                    max="2099"
                    style={{ 
                      border: '2px solid #00BCD4',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      width: '100px'
                    }}
                  />
                </div>
                
                <button 
                  className="btn-primary"
                  onClick={gerarPDF}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}
                >
                  📄 Gerar PDF
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{getNomePessoa(pessoaSelecionada)}</h3>
                <p style={{ margin: 0, color: '#64748b' }}>
                  Período: {String(mesFiltro).padStart(2, '0')}/{anoFiltro}
                </p>
              </div>

              <div ref={relatorioRef} style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                {/* Cabeçalho da Escola */}
                <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #0ea5e9', paddingBottom: '20px' }}>
                  <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#0f172a' }}>
                    {configEscola?.nomeEscola || 'Sistema de Gestão Escolar'}
                  </h1>
                  {configEscola?.endereco && (
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b' }}>{configEscola.endereco}</p>
                  )}
                  {(configEscola?.telefone || configEscola?.email) && (
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b' }}>
                      {[configEscola?.telefone, configEscola?.email].filter(Boolean).join(' | ')}
                    </p>
                  )}
                  {configEscola?.cnpj && (
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b' }}>
                      CNPJ: {configEscola.cnpj}
                    </p>
                  )}
                </div>

                {/* Título */}
                <h2 style={{ textAlign: 'center', margin: '0 0 30px 0', fontSize: '20px', color: '#0ea5e9' }}>
                  RELATÓRIO DE PONTO
                </h2>

                {/* Dados do Funcionário */}
                <div style={{ marginBottom: '25px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a' }}>
                    DADOS DO FUNCIONÁRIO
                  </h3>
                  <p style={{ margin: '8px 0' }}><strong>Nome:</strong> {getNomePessoa(pessoaSelecionada)}</p>
                  <p style={{ margin: '8px 0' }}><strong>Função:</strong> {tipoPessoa.replace('_', ' ')}</p>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Período:</strong> {String(mesFiltro).padStart(2, '0')}/{anoFiltro}
                  </p>
                </div>

                {/* Jornada */}
                {jornada && (
                  <div style={{ marginBottom: '25px', background: '#f0f9ff', padding: '20px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0369a1' }}>
                      JORNADA DE TRABALHO
                    </h3>
                    <p style={{ margin: '8px 0' }}><strong>Carga Horária Semanal:</strong> {jornada.cargaHorariaSemanal}h</p>
                    <p style={{ margin: '8px 0' }}><strong>Carga Horária Diária:</strong> {jornada.cargaHorariaDiaria}h</p>
                    <p style={{ margin: '8px 0' }}>
                      <strong>Horário:</strong> {jornada.horarioEntrada} às {jornada.horarioSaida}
                    </p>
                    <p style={{ margin: '8px 0' }}>
                      <strong>Intervalo:</strong> {jornada.horarioIntervaloInicio} às {jornada.horarioIntervaloFim}
                    </p>
                    <p style={{ margin: '8px 0' }}>
                      <strong>Dias de Trabalho:</strong> {Array.from(new Set(jornada.diasTrabalho)).join(', ')}
                    </p>
                  </div>
                )}

                {/* Registros */}
                {registros.length > 0 && (
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a' }}>
                      REGISTROS DE PONTO ({registros.length})
                    </h3>
                    <div className="table-container">
                      <table className="data-table" style={{ width: '100%', fontSize: '14px' }}>
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Hora</th>
                            <th>Tipo</th>
                            <th>Método</th>
                            <th>Obs</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registros.map((registro) => (
                            <tr key={registro.id}>
                              <td>{formatarData(registro.data)}</td>
                              <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>
                                {formatarHorario(registro.horaRegistro)}
                              </td>
                              <td>{getTipoRegistroLabel(registro.tipoRegistro)}</td>
                              <td>
                                {registro.reconhecimentoIA ? '🤖 IA' : '📝 Manual'}
                                {registro.confianca && ` (${registro.confianca}%)`}
                              </td>
                              <td>{(registro.observacao || '-').substring(0, 30)}</td>
                              <td>{registro.aprovado ? '✅' : '⏳'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Banco de Horas */}
                {bancoHoras.length > 0 && (
                  <div style={{ marginBottom: '25px', background: '#f0fdf4', padding: '20px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#15803d' }}>
                      BANCO DE HORAS
                    </h3>
                    <div className="table-container">
                      <table className="data-table" style={{ width: '100%', fontSize: '14px' }}>
                        <thead>
                          <tr>
                            <th>Mês/Ano</th>
                            <th>Trabalhadas</th>
                            <th>Devidas</th>
                            <th>Saldo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bancoHoras.map((banco) => (
                            <tr key={banco.id}>
                              <td>{String(banco.mes).padStart(2, '0')}/{banco.ano}</td>
                              <td>{banco.horasTrabalhadas.toFixed(2)}h</td>
                              <td>{banco.horasDevidas.toFixed(2)}h</td>
                              <td style={{ 
                                color: banco.saldo >= 0 ? '#15803d' : '#dc2626',
                                fontWeight: '600'
                              }}>
                                {banco.saldo >= 0 ? '+' : ''}{banco.saldo.toFixed(2)}h
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Rodapé */}
                <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                  <p>Documento gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                  <p>Sistema de Gestão Escolar</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
