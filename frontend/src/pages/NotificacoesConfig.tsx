import { useState, useEffect } from 'react';
import { Bell, Phone, MessageSquare, Mail, Clock, Calendar, Save, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import { notificacoesAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import './NotificacoesConfig.css';

interface ConfiguracaoNotificacao {
  id?: string;
  usuarioId: number;
  tipo: 'RESPONSAVEL' | 'PROFESSOR' | 'GESTAO';
  canal: 'WHATSAPP' | 'TELEGRAM' | 'SMS';
  telefone: string;
  telegramChatId?: string;
  notificarFrequencia: boolean;
  notificarNotas: boolean;
  notificarAlertas: boolean;
  horarioInicio: string;
  horarioFim: string;
  diasSemana: string[];
  resumoDiario: boolean;
  frequenciaMensagens: 'TODAS' | 'ALERTAS' | 'RESUMO';
  ativo: boolean;
}

const diasSemanaOptions = [
  { value: 'SEG', label: 'Segunda' },
  { value: 'TER', label: 'Terça' },
  { value: 'QUA', label: 'Quarta' },
  { value: 'QUI', label: 'Quinta' },
  { value: 'SEX', label: 'Sexta' },
  { value: 'SAB', label: 'Sábado' },
  { value: 'DOM', label: 'Domingo' },
];

const NotificacoesConfig = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [config, setConfig] = useState<ConfiguracaoNotificacao>({
    usuarioId: user?.id || 0,
    tipo: 'RESPONSAVEL',
    canal: 'WHATSAPP',
    telefone: '',
    notificarFrequencia: true,
    notificarNotas: true,
    notificarAlertas: true,
    horarioInicio: '08:00',
    horarioFim: '20:00',
    diasSemana: ['SEG', 'TER', 'QUA', 'QUI', 'SEX'],
    resumoDiario: true,
    frequenciaMensagens: 'TODAS',
    ativo: true,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await notificacoesAPI.getConfig(user?.id || 0);
      if (response.data.configuracao) {
        setConfig(response.data.configuracao);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Erro ao carregar configuração:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      await notificacoesAPI.saveConfig(config);
      
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      setMessage(null);
      
      await notificacoesAPI.testNotification({
        telefone: config.telefone,
        canal: config.canal,
        mensagem: '🧪 Teste do Sistema de Notificações\\n\\nSe você recebeu esta mensagem, suas configurações estão corretas!'
      });
      
      setMessage({ type: 'success', text: 'Mensagem de teste enviada! Verifique seu ' + config.canal });
    } catch (error) {
      console.error('Erro ao testar notificação:', error);
      setMessage({ type: 'error', text: 'Erro ao enviar teste. Verifique suas configurações.' });
    } finally {
      setTesting(false);
    }
  };

  const handleDiaSemanaToggle = (dia: string) => {
    setConfig(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter(d => d !== dia)
        : [...prev.diasSemana, dia]
    }));
  };

  if (loading) {
    return (
      <div className="notificacoes-config">
        <div className="loading">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="notificacoes-config">
      <div className="page-header">
        <div className="header-title">
          <Bell size={32} />
          <div>
            <h1>Configurações de Notificações</h1>
            <p>Configure como deseja receber atualizações em tempo real</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="config-grid">
        {/* Card: Canal de Comunicação */}
        <div className="config-card">
          <h3>
            <MessageSquare size={20} />
            Canal de Comunicação
          </h3>
          
          <div className="form-group">
            <label>Canal Preferido</label>
            <div className="canal-options">
              <button
                className={`canal-btn ${config.canal === 'WHATSAPP' ? 'active' : ''}`}
                onClick={() => setConfig({ ...config, canal: 'WHATSAPP' })}
              >
                <Phone size={20} />
                <div>
                  <strong>WhatsApp</strong>
                  <small>Mais popular</small>
                </div>
              </button>
              
              <button
                className={`canal-btn ${config.canal === 'TELEGRAM' ? 'active' : ''}`}
                onClick={() => setConfig({ ...config, canal: 'TELEGRAM' })}
              >
                <MessageSquare size={20} />
                <div>
                  <strong>Telegram</strong>
                  <small>Grátis ilimitado</small>
                </div>
              </button>
              
              <button
                className={`canal-btn ${config.canal === 'SMS' ? 'active' : ''}`}
                onClick={() => setConfig({ ...config, canal: 'SMS' })}
              >
                <Mail size={20} />
                <div>
                  <strong>SMS</strong>
                  <small>Sem internet</small>
                </div>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Telefone/Celular</label>
            <input
              type="tel"
              placeholder="+55 11 99999-9999"
              value={config.telefone}
              onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
              className="form-input"
            />
            <small className="form-hint">Use formato internacional: +55 XX XXXXX-XXXX</small>
          </div>

          {config.canal === 'TELEGRAM' && (
            <div className="telegram-instructions">
              <h4>Como configurar o Telegram:</h4>
              <ol>
                <li>Abra o Telegram</li>
                <li>Busque por: <strong>@escola_notificacoes_bot</strong></li>
                <li>Envie: <code>/start</code></li>
                <li>O bot vai vincular automaticamente</li>
              </ol>
            </div>
          )}
        </div>

        {/* Card: Tipos de Notificações */}
        <div className="config-card">
          <h3>
            <Bell size={20} />
            Tipos de Notificações
          </h3>
          
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.notificarFrequencia}
                onChange={(e) => setConfig({ ...config, notificarFrequencia: e.target.checked })}
              />
              <div>
                <strong>Frequência</strong>
                <small>Notificar quando faltas forem registradas</small>
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.notificarNotas}
                onChange={(e) => setConfig({ ...config, notificarNotas: e.target.checked })}
              />
              <div>
                <strong>Notas</strong>
                <small>Notificar quando notas forem lançadas</small>
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.notificarAlertas}
                onChange={(e) => setConfig({ ...config, notificarAlertas: e.target.checked })}
              />
              <div>
                <strong>Alertas</strong>
                <small>Notificar sobre médias e frequência críticas</small>
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.resumoDiario}
                onChange={(e) => setConfig({ ...config, resumoDiario: e.target.checked })}
              />
              <div>
                <strong>Resumo Diário</strong>
                <small>Receber resumo das atividades do dia</small>
              </div>
            </label>
          </div>

          <div className="form-group">
            <label>Frequência de Mensagens</label>
            <select
              value={config.frequenciaMensagens}
              onChange={(e) => setConfig({ ...config, frequenciaMensagens: e.target.value as any })}
              className="form-select"
            >
              <option value="TODAS">Todas as notificações</option>
              <option value="ALERTAS">Apenas alertas importantes</option>
              <option value="RESUMO">Apenas resumo diário</option>
            </select>
          </div>
        </div>

        {/* Card: Horários */}
        <div className="config-card">
          <h3>
            <Clock size={20} />
            Horários
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Início</label>
              <input
                type="time"
                value={config.horarioInicio}
                onChange={(e) => setConfig({ ...config, horarioInicio: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Fim</label>
              <input
                type="time"
                value={config.horarioFim}
                onChange={(e) => setConfig({ ...config, horarioFim: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <small className="form-hint">
            Você só receberá notificações entre esses horários
          </small>
        </div>

        {/* Card: Dias da Semana */}
        <div className="config-card">
          <h3>
            <Calendar size={20} />
            Dias da Semana
          </h3>
          
          <div className="dias-semana">
            {diasSemanaOptions.map(dia => (
              <button
                key={dia.value}
                className={`dia-btn ${config.diasSemana.includes(dia.value) ? 'active' : ''}`}
                onClick={() => handleDiaSemanaToggle(dia.value)}
              >
                {dia.label}
              </button>
            ))}
          </div>

          <small className="form-hint">
            Você só receberá notificações nos dias selecionados
          </small>
        </div>
      </div>

      {/* Ações */}
      <div className="actions">
        <button
          className="btn-test"
          onClick={handleTest}
          disabled={testing || !config.telefone}
        >
          {testing ? (
            <>Enviando...</>
          ) : (
            <>
              <TestTube size={20} />
              Enviar Teste
            </>
          )}
        </button>

        <button
          className="btn-save"
          onClick={handleSave}
          disabled={saving || !config.telefone}
        >
          {saving ? (
            <>Salvando...</>
          ) : (
            <>
              <Save size={20} />
              Salvar Configurações
            </>
          )}
        </button>
      </div>

      {/* Status */}
      <div className="status-card">
        <div className="status-indicator">
          <div className={`status-dot ${config.ativo ? 'active' : 'inactive'}`} />
          <strong>Status:</strong>
          <span>{config.ativo ? 'Ativo' : 'Inativo'}</span>
        </div>
        
        <button
          className="btn-toggle"
          onClick={() => setConfig({ ...config, ativo: !config.ativo })}
        >
          {config.ativo ? 'Desativar' : 'Ativar'} Notificações
        </button>
      </div>
    </div>
  );
};

export default NotificacoesConfig;
