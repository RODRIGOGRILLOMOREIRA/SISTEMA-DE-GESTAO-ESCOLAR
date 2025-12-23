import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../lib/permissions';
import RelatorioGeralPonto from '../components/RelatorioGeralPonto';
import './ModernPages.css';

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

export default function RegistroPonto() {
  const { user } = useAuth();
  const [view, setView] = useState<'registro' | 'consulta' | 'jornada' | 'banco-horas' | 'relatorio'>('registro');
  const [tipoPessoa, setTipoPessoa] = useState<'PROFESSOR' | 'FUNCIONARIO' | 'EQUIPE_DIRETIVA'>('PROFESSOR');
  const [pessoaSelecionada, setPessoaSelecionada] = useState<string>('');
  const [tipoRegistro, setTipoRegistro] = useState<'ENTRADA' | 'SAIDA' | 'INTERVALO_INICIO' | 'INTERVALO_FIM'>('ENTRADA');
  const [observacao, setObservacao] = useState('');
  
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [equipeDiretiva, setEquipeDiretiva] = useState<EquipeDiretiva[]>([]);
  
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);
  const [jornada, setJornada] = useState<ConfiguracaoJornada | null>(null);
  const [bancoHoras, setBancoHoras] = useState<BancoHoras[]>([]);
  
  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Estado para armazenar o ID e tipo da pessoa logada
  const [pessoaLogadaId, _setPessoaLogadaId] = useState<string>('');
  const [tipoPessoaLogada, _setTipoPessoaLogada] = useState<'PROFESSOR' | 'FUNCIONARIO' | 'EQUIPE_DIRETIVA' | null>(null);

  // Form de configuração de jornada
  const [formJornada, setFormJornada] = useState({
    cargaHorariaSemanal: 40,
    cargaHorariaDiaria: 8,
    horarioEntrada: '08:00',
    horarioSaida: '17:00',
    horarioIntervaloInicio: '12:00',
    horarioIntervaloFim: '13:00',
    diasTrabalho: ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA']
  });

  useEffect(() => {
    carregarPessoas();
  }, []);
  
  useEffect(() => {
    // Identificar pessoa logada
    if (user && user.email) {
      identificarPessoaLogada(user.email);
    }
  }, [user, professores, funcionarios, equipeDiretiva]);
  
  useEffect(() => {
    // Se não for admin, selecionar automaticamente a própria pessoa
    if (pessoaLogadaId && tipoPessoaLogada && !isAdmin(user)) {
      setPessoaSelecionada(pessoaLogadaId);
      setTipoPessoa(tipoPessoaLogada);
    }
  }, [pessoaLogadaId, tipoPessoaLogada, user]);

  useEffect(() => {
    if (pessoaSelecionada) {
      if (view === 'consulta') {
        carregarRegistros();
      } else if (view === 'jornada') {
        carregarJornada();
      } else if (view === 'banco-horas') {
        carregarBancoHoras();
      }
    }
  }, [pessoaSelecionada, view, mesFiltro, anoFiltro]);

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
  
  const identificarPessoaLogada = (_email: string) => {
    // TODO: Implementar identificação quando models tiverem campo email
    // Buscar nos professores
    // const prof = professores.find(p => p.email?.toLowerCase() === _email.toLowerCase());
    // if (prof) {
    //   setPessoaLogadaId(prof.id);
    //   setTipoPessoaLogada('PROFESSOR');
    //   return;
    // }
    
    // Buscar nos funcionários
    // const func = funcionarios.find(f => f.email?.toLowerCase() === email.toLowerCase());
    // if (func) {
    //   setPessoaLogadaId(func.id);
    //   setTipoPessoaLogada('FUNCIONARIO');
    //   return;
    // }
    
    // Buscar na equipe diretiva
    // const equip = equipeDiretiva.find(e => e.email?.toLowerCase() === email.toLowerCase());
    // if (equip) {
    //   setPessoaLogadaId(equip.id);
    //   setTipoPessoaLogada('EQUIPE_DIRETIVA');
    //   return;
    // }
  };

  const carregarRegistros = async () => {
    if (!pessoaSelecionada) return;
    
    // Se não é admin, só pode ver seus próprios registros
    if (!isAdmin(user) && pessoaSelecionada !== pessoaLogadaId) {
      setMessage({ type: 'error', text: 'Você só pode visualizar seus próprios registros' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get(`/ponto/pessoa/${pessoaSelecionada}`, {
        params: { mes: mesFiltro, ano: anoFiltro }
      });
      setRegistros(response.data);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar registros' });
    } finally {
      setLoading(false);
    }
  };

  const carregarJornada = async () => {
    if (!pessoaSelecionada) return;
    
    // Se não é admin, só pode ver sua própria jornada
    if (!isAdmin(user) && pessoaSelecionada !== pessoaLogadaId) {
      setMessage({ type: 'error', text: 'Você só pode visualizar sua própria jornada' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get(`/ponto/jornada/${pessoaSelecionada}`);
      setJornada(response.data);
      setFormJornada({
        cargaHorariaSemanal: response.data.cargaHorariaSemanal,
        cargaHorariaDiaria: response.data.cargaHorariaDiaria,
        horarioEntrada: response.data.horarioEntrada || '08:00',
        horarioSaida: response.data.horarioSaida || '17:00',
        horarioIntervaloInicio: response.data.horarioIntervaloInicio || '12:00',
        horarioIntervaloFim: response.data.horarioIntervaloFim || '13:00',
        diasTrabalho: response.data.diasTrabalho
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        setJornada(null);
      } else {
        console.error('Erro ao carregar jornada:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const carregarBancoHoras = async () => {
    if (!pessoaSelecionada) return;
    
    // Se não é admin, só pode ver seu próprio banco de horas
    if (!isAdmin(user) && pessoaSelecionada !== pessoaLogadaId) {
      setMessage({ type: 'error', text: 'Você só pode visualizar seu próprio banco de horas' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get(`/ponto/banco-horas/${pessoaSelecionada}`);
      setBancoHoras(response.data);
    } catch (error) {
      console.error('Erro ao carregar banco de horas:', error);
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
        tipoPessoa,
        tipoRegistro,
        observacao: observacao || undefined
      });

      setMessage({ type: 'success', text: 'Ponto registrado com sucesso!' });
      setObservacao('');
      
      // Recarregar registros se estiver na aba de consulta
      if (view === 'consulta') {
        carregarRegistros();
      }
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      setMessage({ type: 'error', text: 'Erro ao registrar ponto' });
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
      await api.post('/ponto/jornada', {
        pessoaId: pessoaSelecionada,
        tipoPessoa,
        ...formJornada
      });

      setMessage({ type: 'success', text: 'Jornada salva com sucesso!' });
      carregarJornada();
    } catch (error) {
      console.error('Erro ao salvar jornada:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar jornada' });
    } finally {
      setLoading(false);
    }
  };

  const calcularBancoHoras = async () => {
    if (!pessoaSelecionada) {
      setMessage({ type: 'error', text: 'Selecione uma pessoa' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/ponto/banco-horas/calcular', {
        pessoaId: pessoaSelecionada,
        tipoPessoa,
        mes: mesFiltro,
        ano: anoFiltro
      });

      setMessage({ type: 'success', text: 'Banco de horas calculado!' });
      carregarBancoHoras();
    } catch (error: any) {
      console.error('Erro ao calcular banco de horas:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Erro ao calcular banco de horas' 
      });
    } finally {
      setLoading(false);
    }
  };

  const deletarRegistro = async (id: string) => {
    // Apenas admins podem excluir
    if (!isAdmin(user)) {
      setMessage({ type: 'error', text: 'Apenas Diretores podem excluir registros' });
      return;
    }
    
    if (!confirm('Deseja realmente excluir este registro?')) return;

    try {
      await api.delete(`/ponto/${id}`);
      setMessage({ type: 'success', text: 'Registro excluído' });
      carregarRegistros();
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir registro' });
    }
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

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarHora = (data: string) => {
    return new Date(data).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getNomePessoa = (id: string) => {
    const pessoa = [...professores, ...funcionarios, ...equipeDiretiva].find(p => p.id === id);
    return pessoa?.nome || 'Desconhecido';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🕐 Registro de Ponto</h1>
          {isAdmin(user) && (
            <span 
              className="status-badge" 
              style={{ 
                fontSize: '14px', 
                marginLeft: '15px',
                backgroundColor: '#fbbf24',
                color: '#1e293b',
                border: '2px solid #f59e0b',
                fontWeight: '700',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
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

      <div className="tabs-container">
        <button
          className={`tab-button ${view === 'registro' ? 'active' : ''}`}
          onClick={() => setView('registro')}
        >
          📝 Registrar Ponto
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
          📄 Relatório Geral
        </button>
      </div>

      <div className="filters-section">
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
          <label>Nome:</label>
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
        
        {!isAdmin(user) && (
          <div className="message info" style={{ marginTop: '10px' }}>
            ℹ️ Você está visualizando seus próprios registros. Apenas Diretores podem visualizar registros de outras pessoas.
          </div>
        )}

        {(view === 'consulta' || view === 'banco-horas') && (
          <>
            <div className="form-group">
              <label>Mês:</label>
              <select value={mesFiltro} onChange={(e) => setMesFiltro(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                  <option key={mes} value={mes}>
                    {new Date(2024, mes - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ano:</label>
              <input
                type="number"
                value={anoFiltro}
                onChange={(e) => setAnoFiltro(Number(e.target.value))}
                min="2000"
                max="2099"
                placeholder="Digite o ano"
              />
            </div>
          </>
        )}
      </div>

      {view === 'registro' && (
        <div className="content-box">
          <h2>Registrar Ponto</h2>
          
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
              className="btn-primary"
              onClick={registrarPonto}
              disabled={loading || !pessoaSelecionada}
            >
              {loading ? 'Registrando...' : '✅ Registrar Ponto'}
            </button>
          </div>
        </div>
      )}

      {view === 'consulta' && (
        <div className="content-box">
          <h2>Registros de Ponto - {getNomePessoa(pessoaSelecionada)}</h2>
          <p className="subtitle">
            {new Date(anoFiltro, mesFiltro - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>

          {loading ? (
            <p>Carregando...</p>
          ) : registros.length === 0 ? (
            <p className="empty-state">Nenhum registro encontrado neste período</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Tipo</th>
                    <th>Observação</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((registro) => (
                    <tr key={registro.id}>
                      <td>{formatarData(registro.data)}</td>
                      <td>{formatarHora(registro.horaRegistro)}</td>
                      <td>
                        <span className="status-badge">
                          {registro.tipoRegistro === 'ENTRADA' && '🟢'}
                          {registro.tipoRegistro === 'SAIDA' && '🔴'}
                          {registro.tipoRegistro === 'INTERVALO_INICIO' && '🟡'}
                          {registro.tipoRegistro === 'INTERVALO_FIM' && '🟢'}
                          {' '}
                          {registro.tipoRegistro.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>{registro.observacao || '-'}</td>
                      <td>
                        <span className={`status-badge ${registro.aprovado ? 'status-success' : 'status-warning'}`}>
                          {registro.aprovado ? '✅ Aprovado' : '⏳ Pendente'}
                        </span>
                      </td>
                      <td>
                        {isAdmin(user) && (
                          <button 
                            className="btn-icon btn-danger"
                            onClick={() => deletarRegistro(registro.id)}
                            title="Excluir"
                          >
                            🗑️
                          </button>
                        )}
                        {!isAdmin(user) && (
                          <span style={{ color: '#999', fontSize: '12px' }}>
                            Sem permissão
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === 'jornada' && (
        <div className="content-box">
          <h2>Configuração de Jornada - {getNomePessoa(pessoaSelecionada)}</h2>
          
          {!pessoaSelecionada ? (
            <p className="empty-state">Selecione uma pessoa para configurar a jornada</p>
          ) : (
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Carga Horária Semanal:</label>
                  <input
                    type="number"
                    value={formJornada.cargaHorariaSemanal}
                    onChange={(e) => setFormJornada({...formJornada, cargaHorariaSemanal: Number(e.target.value)})}
                    min="0"
                    max="60"
                  />
                </div>

                <div className="form-group">
                  <label>Carga Horária Diária:</label>
                  <input
                    type="number"
                    value={formJornada.cargaHorariaDiaria}
                    onChange={(e) => setFormJornada({...formJornada, cargaHorariaDiaria: Number(e.target.value)})}
                    min="0"
                    max="12"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Horário de Entrada:</label>
                  <input
                    type="time"
                    value={formJornada.horarioEntrada}
                    onChange={(e) => setFormJornada({...formJornada, horarioEntrada: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Horário de Saída:</label>
                  <input
                    type="time"
                    value={formJornada.horarioSaida}
                    onChange={(e) => setFormJornada({...formJornada, horarioSaida: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Início do Intervalo:</label>
                  <input
                    type="time"
                    value={formJornada.horarioIntervaloInicio}
                    onChange={(e) => setFormJornada({...formJornada, horarioIntervaloInicio: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Fim do Intervalo:</label>
                  <input
                    type="time"
                    value={formJornada.horarioIntervaloFim}
                    onChange={(e) => setFormJornada({...formJornada, horarioIntervaloFim: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dias de Trabalho:</label>
                <div className="checkbox-group">
                  {['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'].map(dia => (
                    <label key={dia} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formJornada.diasTrabalho.includes(dia)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormJornada({
                              ...formJornada,
                              diasTrabalho: [...formJornada.diasTrabalho, dia]
                            });
                          } else {
                            setFormJornada({
                              ...formJornada,
                              diasTrabalho: formJornada.diasTrabalho.filter(d => d !== dia)
                            });
                          }
                        }}
                      />
                      {dia}
                    </label>
                  ))}
                </div>
              </div>

              <button 
                className="btn-primary"
                onClick={salvarJornada}
                disabled={loading || !isAdmin(user)}
              >
                {loading ? 'Salvando...' : '💾 Salvar Jornada'}
              </button>
              {!isAdmin(user) && (
                <p className="message info" style={{ marginTop: '10px' }}>
                  ℹ️ Apenas Diretores podem alterar a jornada de trabalho
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'banco-horas' && (
        <div className="content-box">
          <h2>Banco de Horas - {getNomePessoa(pessoaSelecionada)}</h2>
          
          {!pessoaSelecionada ? (
            <p className="empty-state">Selecione uma pessoa para ver o banco de horas</p>
          ) : (
            <>
              <div className="actions-bar" style={{ marginBottom: '1.5rem' }}>
                <button 
                  className="btn-primary"
                  onClick={calcularBancoHoras}
                  disabled={loading}
                >
                  {loading ? 'Calculando...' : '🔄 Calcular Mês Atual'}
                </button>
              </div>

              {loading ? (
                <p>Carregando...</p>
              ) : bancoHoras.length === 0 ? (
                <p className="empty-state">Nenhum registro de banco de horas encontrado</p>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Período</th>
                        <th>Horas Devidas</th>
                        <th>Horas Trabalhadas</th>
                        <th>Saldo</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bancoHoras.map((banco) => (
                        <tr key={banco.id}>
                          <td>
                            {new Date(banco.ano, banco.mes - 1).toLocaleDateString('pt-BR', { 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </td>
                          <td>{banco.horasDevidas.toFixed(2)}h</td>
                          <td>{banco.horasTrabalhadas.toFixed(2)}h</td>
                          <td>
                            <strong style={{ color: banco.saldo >= 0 ? '#10b981' : '#ef4444' }}>
                              {banco.saldo >= 0 ? '+' : ''}{banco.saldo.toFixed(2)}h
                            </strong>
                          </td>
                          <td>
                            {banco.saldo >= 0 ? (
                              <span className="status-badge status-success">✅ Positivo</span>
                            ) : (
                              <span className="status-badge status-error">⚠️ Negativo</span>
                            )}
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

      {view === 'relatorio' && (
        <RelatorioGeralPonto 
          pessoaSelecionada={pessoaSelecionada}
          tipoPessoa={tipoPessoa}
          getNomePessoa={getNomePessoa}
          mesFiltro={mesFiltro}
          anoFiltro={anoFiltro}
          setMesFiltro={setMesFiltro}
          setAnoFiltro={setAnoFiltro}
          registros={registros}
          bancoHoras={bancoHoras}
          jornada={jornada}
          carregarRegistros={carregarRegistros}
          carregarBancoHoras={carregarBancoHoras}
          formatarData={formatarData}
          formatarHora={formatarHora}
        />
      )}
    </div>
  );
}
