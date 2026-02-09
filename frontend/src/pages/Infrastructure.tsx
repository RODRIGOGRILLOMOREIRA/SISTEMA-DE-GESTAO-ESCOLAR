import { useState, useEffect } from 'react';
import { Database, Download, Trash2, RefreshCw, HardDrive, Clock, CheckCircle, AlertTriangle, Server } from 'lucide-react';
import { api } from '../lib/api';
import './Infrastructure.css';

interface Backup {
  filename: string;
  size: string;
  date: Date;
  timestamp: string;
}

interface BackupConfig {
  enabled: boolean;
  schedule: string;
  retentionDays: number;
  path: string;
}

const Infrastructure = () => {
  const [activeTab, setActiveTab] = useState<'backup' | 'redis'>('backup');
  const [backups, setBackups] = useState<Backup[]>([]);
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redis state
  const [redisStatus, setRedisStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown');

  useEffect(() => {
    loadBackups();
    loadConfig();
    checkRedisStatus();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const response = await api.get('/backup/list');
      setBackups(response.data);
    } catch (error: any) {
      setError('Erro ao carregar backups');
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await api.get('/backup/config');
      setConfig(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const checkRedisStatus = async () => {
    try {
      const response = await api.get('/health');
      setRedisStatus(response.data.services?.redis === 'healthy' ? 'connected' : 'disconnected');
    } catch (error) {
      setRedisStatus('disconnected');
    }
  };

  const createBackup = async () => {
    setCreating(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await api.post('/backup/create');
      setSuccess(`Backup criado: ${response.data.filename}`);
      loadBackups();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao criar backup');
    } finally {
      setCreating(false);
    }
  };

  const deleteBackup = async (filename: string) => {
    if (!confirm(`Tem certeza que deseja deletar o backup ${filename}?`)) return;
    
    try {
      await api.delete(`/backup/${filename}`);
      setSuccess('Backup deletado com sucesso');
      loadBackups();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao deletar backup');
    }
  };

  const downloadBackup = (filename: string) => {
    window.open(`/api/backup/download/${filename}`, '_blank');
  };

  const cleanOldBackups = async () => {
    if (!confirm('Tem certeza que deseja limpar backups antigos?')) return;
    
    try {
      const response = await api.post('/backup/clean');
      setSuccess(response.data.message);
      loadBackups();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao limpar backups');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <div className="infrastructure-container">
      <div className="infrastructure-header">
        <div className="header-content">
          <Server size={32} />
          <div>
            <h1>Infraestrutura e Serviços</h1>
            <p>Gerenciamento de Backup e Cache - Fase 4</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={20} />
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          {success}
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="infrastructure-tabs">
        <button
          className={`tab ${activeTab === 'backup' ? 'active' : ''}`}
          onClick={() => setActiveTab('backup')}
        >
          <Database size={20} />
          Backup Automático
        </button>
        <button
          className={`tab ${activeTab === 'redis' ? 'active' : ''}`}
          onClick={() => setActiveTab('redis')}
        >
          <HardDrive size={20} />
          Redis Cache
        </button>
      </div>

      <div className="infrastructure-content">
        {/* TAB: BACKUP */}
        {activeTab === 'backup' && (
          <div className="backup-tab">
            {/* Status Card */}
            <div className="status-cards">
              <div className="status-card">
                <div className="status-icon">
                  <Database size={24} />
                </div>
                <div className="status-info">
                  <h3>Status do Backup</h3>
                  <p className={config?.enabled ? 'status-enabled' : 'status-disabled'}>
                    {config?.enabled ? 'Ativado' : 'Desativado'}
                  </p>
                </div>
              </div>

              <div className="status-card">
                <div className="status-icon">
                  <Clock size={24} />
                </div>
                <div className="status-info">
                  <h3>Agendamento</h3>
                  <p>{config?.schedule || 'Não configurado'}</p>
                  <small>Cron expression</small>
                </div>
              </div>

              <div className="status-card">
                <div className="status-icon">
                  <HardDrive size={24} />
                </div>
                <div className="status-info">
                  <h3>Total de Backups</h3>
                  <p className="status-count">{backups.length}</p>
                </div>
              </div>

              <div className="status-card">
                <div className="status-icon">
                  <RefreshCw size={24} />
                </div>
                <div className="status-info">
                  <h3>Retenção</h3>
                  <p>{config?.retentionDays || 7} dias</p>
                  <small>Backups automáticos</small>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="backup-actions">
              <button 
                className="btn-primary"
                onClick={createBackup}
                disabled={creating}
              >
                <Database size={20} />
                {creating ? 'Criando...' : 'Criar Backup Manual'}
              </button>
              <button 
                className="btn-secondary"
                onClick={loadBackups}
                disabled={loading}
              >
                <RefreshCw size={20} />
                Atualizar Lista
              </button>
              <button 
                className="btn-warning"
                onClick={cleanOldBackups}
              >
                <Trash2 size={20} />
                Limpar Antigos
              </button>
            </div>

            {/* Backups List */}
            <div className="backups-section">
              <h2>Backups Disponíveis</h2>
              
              {loading ? (
                <div className="loading">Carregando backups...</div>
              ) : backups.length === 0 ? (
                <div className="empty-state">
                  <Database size={48} />
                  <p>Nenhum backup encontrado</p>
                  <button className="btn-primary" onClick={createBackup}>
                    Criar Primeiro Backup
                  </button>
                </div>
              ) : (
                <div className="backups-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Nome do Arquivo</th>
                        <th>Tamanho</th>
                        <th>Data/Hora</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map((backup) => (
                        <tr key={backup.filename}>
                          <td>
                            <code>{backup.filename}</code>
                          </td>
                          <td>{backup.size}</td>
                          <td>{formatDate(backup.date)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-icon"
                                onClick={() => downloadBackup(backup.filename)}
                                title="Download"
                              >
                                <Download size={16} />
                              </button>
                              <button
                                className="btn-icon btn-danger"
                                onClick={() => deleteBackup(backup.filename)}
                                title="Deletar"
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
              )}
            </div>

            {/* Info Box */}
            <div className="info-box">
              <h3>ℹ️ Informações sobre Backup</h3>
              <ul>
                <li><strong>Backup Automático:</strong> Executado diariamente às {config?.schedule?.split(' ')[1] || '3'}h da manhã</li>
                <li><strong>Retenção:</strong> Backups com mais de {config?.retentionDays || 7} dias são removidos automaticamente</li>
                <li><strong>Formato:</strong> PostgreSQL dump (formato comprimido)</li>
                <li><strong>Localização:</strong> <code>{config?.path || 'backups/'}</code></li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB: REDIS */}
        {activeTab === 'redis' && (
          <div className="redis-tab">
            <div className="status-banner" data-status={redisStatus}>
              <HardDrive size={48} />
              <div>
                <h2>Redis Cache Distribuído</h2>
                <p className="status-text">
                  Status: <strong>{redisStatus === 'connected' ? 'Conectado' : 'Desconectado'}</strong>
                </p>
              </div>
            </div>

            {redisStatus === 'disconnected' && (
              <div className="redis-setup">
                <h3>🚀 Como Instalar o Redis</h3>
                <div className="setup-steps">
                  <div className="step">
                    <span className="step-number">1</span>
                    <div>
                      <h4>Instalar Docker Desktop</h4>
                      <p>Baixe e instale o Docker Desktop para Windows</p>
                      <a href="https://www.docker.com/products/docker-desktop" target="_blank" className="btn-link">
                        Download Docker Desktop
                      </a>
                    </div>
                  </div>

                  <div className="step">
                    <span className="step-number">2</span>
                    <div>
                      <h4>Iniciar Redis</h4>
                      <p>Execute o comando no terminal na raiz do projeto:</p>
                      <code className="command-box">docker-compose up -d redis</code>
                    </div>
                  </div>

                  <div className="step">
                    <span className="step-number">3</span>
                    <div>
                      <h4>Reiniciar Backend</h4>
                      <p>Reinicie o servidor backend para conectar ao Redis</p>
                      <code className="command-box">cd backend && npm run dev</code>
                    </div>
                  </div>
                </div>

                <div className="benefits-box">
                  <h3>✨ Benefícios do Redis</h3>
                  <ul>
                    <li>⚡ <strong>Performance 10-100x melhor</strong> em operações de leitura</li>
                    <li>🔄 <strong>Cache distribuído</strong> - compartilhado entre instâncias</li>
                    <li>🛡️ <strong>Rate limiting robusto</strong> - proteção contra abuso</li>
                    <li>📊 <strong>Filas de background jobs</strong> - processamento assíncrono</li>
                    <li>💾 <strong>Persistência de dados</strong> - cache sobrevive a reinicializações</li>
                  </ul>
                </div>
              </div>
            )}

            {redisStatus === 'connected' && (
              <div className="redis-connected">
                <div className="success-banner">
                  <CheckCircle size={48} />
                  <div>
                    <h3>Redis Conectado com Sucesso!</h3>
                    <p>O sistema está usando cache distribuído para melhor performance</p>
                  </div>
                </div>

                <div className="redis-stats">
                  <h3>📊 Estatísticas (em breve)</h3>
                  <p>Métricas de cache e performance serão exibidas aqui</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Infrastructure;
