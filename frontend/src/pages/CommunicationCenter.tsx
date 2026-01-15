import React, { useState, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  Mail,
  Phone,
  Bell,
  FileText,
  Calendar,
  BarChart3,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Settings,
  Eye
} from 'lucide-react';
import { api } from '../lib/api';
import './CommunicationCenter.css';

interface Template {
  id: string;
  name: string;
  category: string;
  channel: string;
  subject?: string;
  content: string;
  variables: any[];
  isActive: boolean;
  createdAt: string;
}

interface Message {
  id: string;
  channel: string;
  recipientType: string;
  recipient: string;
  subject?: string;
  content: string;
  status: string;
  sentAt?: string;
  createdAt: string;
  template?: {
    name: string;
    category: string;
  };
}

interface Stats {
  totalMessages: number;
  sentToday: number;
  pendingMessages: number;
  activeSchedules: number;
  totalTemplates: number;
  messagesByChannel: Array<{ channel: string; _count: number }>;
  successRate: Array<{ status: string; _count: number }>;
}

interface Analytics {
  analytics: Array<{
    date: string;
    channel: string;
    sent: number;
    delivered: number;
    failed: number;
    read: number;
  }>;
  totals: {
    sent: number;
    delivered: number;
    failed: number;
    read: number;
  };
  deliveryRate: string;
  readRate: string;
  failureRate: string;
}

type Tab = 'overview' | 'send' | 'templates' | 'history' | 'analytics' | 'channels';

const CommunicationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para enviar mensagem
  const [sendForm, setSendForm] = useState({
    channel: 'email',
    recipientType: 'aluno',
    templateId: '',
    subject: '',
    content: '',
    variables: {}
  });

  // Estados para criar template
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'ACADEMICO',
    channel: 'email',
    subject: '',
    content: '',
    variables: []
  });

  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    loadStats();
    loadTemplates();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const response = await api.get('/communication/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await api.get('/communication/templates');
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/communication/history', {
        params: { limit: 50 }
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await api.get('/communication/analytics', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/communication/send', sendForm);
      alert('Mensagem enviada com sucesso!');
      setSendForm({
        channel: 'email',
        recipientType: 'aluno',
        templateId: '',
        subject: '',
        content: '',
        variables: {}
      });
      loadStats();
    } catch (error: any) {
      alert('Erro ao enviar mensagem: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/communication/templates', templateForm);
      alert('Template criado com sucesso!');
      setShowTemplateModal(false);
      setTemplateForm({
        name: '',
        category: 'ACADEMICO',
        channel: 'email',
        subject: '',
        content: '',
        variables: []
      });
      loadTemplates();
    } catch (error: any) {
      alert('Erro ao criar template: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail size={20} />;
      case 'sms':
        return <Phone size={20} />;
      case 'whatsapp':
        return <MessageSquare size={20} />;
      case 'push':
        return <Bell size={20} />;
      default:
        return <Send size={20} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle size={16} className="status-icon success" />;
      case 'failed':
        return <XCircle size={16} className="status-icon error" />;
      case 'pending':
        return <Clock size={16} className="status-icon pending" />;
      default:
        return <Clock size={16} className="status-icon" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      sent: 'Enviado',
      delivered: 'Entregue',
      failed: 'Falhou',
      read: 'Lido'
    };
    return labels[status] || status;
  };

  const getChannelLabel = (channel: string) => {
    const labels: Record<string, string> = {
      email: 'E-mail',
      sms: 'SMS',
      whatsapp: 'WhatsApp',
      push: 'Push',
      all: 'Todos'
    };
    return labels[channel] || channel;
  };

  const renderOverview = () => (
    <div className="communication-overview">
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <Send size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.totalMessages || 0}</h3>
            <p>Total de Mensagens</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.sentToday || 0}</h3>
            <p>Enviadas Hoje</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.pendingMessages || 0}</h3>
            <p>Pendentes</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.activeSchedules || 0}</h3>
            <p>Agendadas</p>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.totalTemplates || 0}</h3>
            <p>Templates Ativos</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Mensagens por Canal</h3>
          <div className="channel-bars">
            {stats?.messagesByChannel.map((item) => (
              <div key={item.channel} className="channel-bar">
                <div className="channel-info">
                  {getChannelIcon(item.channel)}
                  <span>{getChannelLabel(item.channel)}</span>
                </div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(item._count / (stats?.totalMessages || 1)) * 100}%`
                    }}
                  />
                </div>
                <span className="bar-value">{item._count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Taxa de Sucesso</h3>
          <div className="success-rate">
            {stats?.successRate.map((item) => (
              <div key={item.status} className={`rate-item ${item.status}`}>
                {getStatusIcon(item.status)}
                <div className="rate-info">
                  <span className="rate-label">{getStatusLabel(item.status)}</span>
                  <span className="rate-value">{item._count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSendMessage = () => (
    <div className="send-message-container">
      <form onSubmit={handleSendMessage} className="send-form">
        <h2>Enviar Nova Mensagem</h2>

        <div className="form-group">
          <label>Canal de Comunicação</label>
          <div className="channel-options">
            {['email', 'sms', 'whatsapp', 'push', 'all'].map((channel) => (
              <button
                key={channel}
                type="button"
                className={`channel-btn ${sendForm.channel === channel ? 'active' : ''}`}
                onClick={() => setSendForm({ ...sendForm, channel })}
              >
                {getChannelIcon(channel)}
                <span>{getChannelLabel(channel)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Destinatários</label>
            <select
              value={sendForm.recipientType}
              onChange={(e) => setSendForm({ ...sendForm, recipientType: e.target.value })}
              required
            >
              <option value="aluno">Alunos</option>
              <option value="responsavel">Responsáveis</option>
              <option value="professor">Professores</option>
              <option value="funcionario">Funcionários</option>
              <option value="turma">Turma Específica</option>
              <option value="todos">Todos</option>
            </select>
          </div>

          <div className="form-group">
            <label>Template (Opcional)</label>
            <select
              value={sendForm.templateId}
              onChange={(e) => {
                const template = templates.find((t) => t.id === e.target.value);
                setSendForm({
                  ...sendForm,
                  templateId: e.target.value,
                  subject: template?.subject || '',
                  content: template?.content || ''
                });
              }}
            >
              <option value="">Sem template</option>
              {templates
                .filter((t) => t.isActive)
                .map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {(sendForm.channel === 'email' || sendForm.channel === 'all') && (
          <div className="form-group">
            <label>Assunto</label>
            <input
              type="text"
              value={sendForm.subject}
              onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })}
              placeholder="Assunto da mensagem"
              required={sendForm.channel === 'email'}
            />
          </div>
        )}

        <div className="form-group">
          <label>Mensagem</label>
          <textarea
            value={sendForm.content}
            onChange={(e) => setSendForm({ ...sendForm, content: e.target.value })}
            placeholder="Digite sua mensagem aqui..."
            rows={6}
            required
          />
          <small className="form-hint">
            Você pode usar variáveis como: {'{'}nome{'}'}, {'{'}turma{'}'}, {'{'}data{'}'}
          </small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Send size={20} />
            {loading ? 'Enviando...' : 'Enviar Agora'}
          </button>
          <button type="button" className="btn btn-secondary" disabled={loading}>
            <Calendar size={20} />
            Agendar Envio
          </button>
        </div>
      </form>
    </div>
  );

  const renderTemplates = () => (
    <div className="templates-container">
      <div className="templates-header">
        <h2>Templates de Mensagens</h2>
        <button className="btn btn-primary" onClick={() => setShowTemplateModal(true)}>
          <Plus size={20} />
          Novo Template
        </button>
      </div>

      <div className="templates-grid">
        {templates.map((template) => (
          <div key={template.id} className={`template-card ${!template.isActive ? 'inactive' : ''}`}>
            <div className="template-header">
              <div className="template-title">
                {getChannelIcon(template.channel)}
                <h3>{template.name}</h3>
              </div>
              <span className={`template-badge ${template.category.toLowerCase()}`}>
                {template.category}
              </span>
            </div>
            <div className="template-content">
              {template.subject && <p className="template-subject"><strong>Assunto:</strong> {template.subject}</p>}
              <p className="template-text">{template.content.substring(0, 150)}...</p>
            </div>
            <div className="template-footer">
              <button className="btn btn-sm btn-secondary">
                <Eye size={16} />
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Criar Novo Template</h2>
            <form onSubmit={handleCreateTemplate}>
              <div className="form-group">
                <label>Nome do Template</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="Ex: Aviso de Notas"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                    required
                  >
                    <option value="ACADEMICO">Acadêmico</option>
                    <option value="FINANCEIRO">Financeiro</option>
                    <option value="EVENTOS">Eventos</option>
                    <option value="AVISOS">Avisos</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Canal</label>
                  <select
                    value={templateForm.channel}
                    onChange={(e) => setTemplateForm({ ...templateForm, channel: e.target.value })}
                    required
                  >
                    <option value="email">E-mail</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="push">Push</option>
                    <option value="all">Todos</option>
                  </select>
                </div>
              </div>

              {(templateForm.channel === 'email' || templateForm.channel === 'all') && (
                <div className="form-group">
                  <label>Assunto</label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    placeholder="Assunto do e-mail"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Conteúdo</label>
                <textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  placeholder="Digite o conteúdo do template..."
                  rows={6}
                  required
                />
                <small className="form-hint">
                  Use {'{'}nome{'}'}, {'{'}turma{'}'}, {'{'}data{'}'}, etc para variáveis dinâmicas
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTemplateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="history-container">
      <h2>Histórico de Mensagens</h2>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="history-table">
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Canal</th>
                <th>Destinatário</th>
                <th>Assunto/Conteúdo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td>{new Date(message.createdAt).toLocaleString('pt-BR')}</td>
                  <td>
                    <div className="channel-cell">
                      {getChannelIcon(message.channel)}
                      <span>{getChannelLabel(message.channel)}</span>
                    </div>
                  </td>
                  <td>{message.recipient}</td>
                  <td>
                    {message.subject || message.content.substring(0, 50)}...
                  </td>
                  <td>
                    <div className="status-cell">
                      {getStatusIcon(message.status)}
                      <span>{getStatusLabel(message.status)}</span>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary">
                      <Eye size={14} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="analytics-container">
      <h2>Analytics e Relatórios (Últimos 30 Dias)</h2>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : analytics ? (
        <div className="analytics-content">
          <div className="analytics-summary">
            <div className="summary-card">
              <h3>Total Enviado</h3>
              <p className="summary-value">{analytics.totals.sent}</p>
            </div>
            <div className="summary-card">
              <h3>Taxa de Entrega</h3>
              <p className="summary-value success">{analytics.deliveryRate}%</p>
            </div>
            <div className="summary-card">
              <h3>Taxa de Leitura</h3>
              <p className="summary-value info">{analytics.readRate}%</p>
            </div>
            <div className="summary-card">
              <h3>Taxa de Falha</h3>
              <p className="summary-value error">{analytics.failureRate}%</p>
            </div>
          </div>

          <div className="analytics-chart">
            <h3>Desempenho por Dia</h3>
            {/* Aqui você poderia adicionar um gráfico com uma biblioteca como Chart.js ou Recharts */}
            <p>Gráfico de performance ao longo do tempo</p>
          </div>
        </div>
      ) : (
        <div>Nenhum dado disponível</div>
      )}
    </div>
  );

  return (
    <div className="communication-center">
      <div className="page-header">
        <h1>Central de Comunicação Unificada</h1>
        <p>Gerencie todas as comunicações da escola em um só lugar</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={20} />
          Visão Geral
        </button>
        <button
          className={`tab ${activeTab === 'send' ? 'active' : ''}`}
          onClick={() => setActiveTab('send')}
        >
          <Send size={20} />
          Enviar Mensagem
        </button>
        <button
          className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <FileText size={20} />
          Templates
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={20} />
          Histórico
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={20} />
          Analytics
        </button>
        <button
          className={`tab ${activeTab === 'channels' ? 'active' : ''}`}
          onClick={() => setActiveTab('channels')}
        >
          <Settings size={20} />
          Canais
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'send' && renderSendMessage()}
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'channels' && (
          <div className="channels-container">
            <h2>Configuração de Canais</h2>
            <p>Configure as integrações com provedores de comunicação</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationCenter;
