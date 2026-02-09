import { useState, useEffect } from 'react';
import { Activity, Server, Database, HardDrive, Cpu, Clock, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import BackButton from '../components/BackButton';
import './SystemMonitoring.css';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    memory: ServiceStatus;
    disk: ServiceStatus;
  };
  system: {
    platform: string;
    nodeVersion: string;
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    diskUsage: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  latency?: number;
  details?: any;
}

interface MetricData {
  requests_total: number;
  requests_per_second: number;
  avg_response_time: number;
  error_rate: number;
  active_connections: number;
}

const SystemMonitoring = () => {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSystemData();

    if (autoRefresh) {
      const interval = setInterval(loadSystemData, 5000); // Atualizar a cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      
      // Carregar health check
      const healthResponse = await api.get('/health');
      setHealth(healthResponse.data);

      // Carregar métricas (parseando texto Prometheus)
      const metricsResponse = await api.get('/metrics', {
        headers: { 'Accept': 'text/plain' }
      });
      
      const metricsText = metricsResponse.data;
      const parsedMetrics = parsePrometheusMetrics(metricsText);
      setMetrics(parsedMetrics);

    } catch (error) {
      console.error('Erro ao carregar dados do sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  const parsePrometheusMetrics = (text: string): MetricData => {
    const lines = text.split('\n');
    const metrics: any = {};

    lines.forEach(line => {
      if (line.startsWith('#') || !line.trim()) return;

      const [key, value] = line.split(' ');
      if (key && value) {
        metrics[key] = parseFloat(value);
      }
    });

    return {
      requests_total: metrics['http_requests_total'] || 0,
      requests_per_second: metrics['http_requests_per_second'] || 0,
      avg_response_time: metrics['http_request_duration_avg'] || 0,
      error_rate: metrics['http_error_rate'] || 0,
      active_connections: metrics['active_connections'] || 0,
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle size={24} className="status-icon healthy" />;
      case 'degraded':
        return <AlertCircle size={24} className="status-icon degraded" />;
      case 'unhealthy':
        return <XCircle size={24} className="status-icon unhealthy" />;
      default:
        return <Activity size={24} className="status-icon" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#10b981';
      case 'degraded':
        return '#f59e0b';
      case 'unhealthy':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading && !health) {
    return (
      <div className="system-monitoring-page">
        <BackButton />
        <div className="loading">Carregando dados do sistema...</div>
      </div>
    );
  }

  return (
    <div className="system-monitoring-page">
      <BackButton />

      <div className="page-header">
        <div className="header-title">
          <Activity size={32} />
          <div>
            <h1>Monitoramento do Sistema</h1>
            <p>Observabilidade em tempo real - Fase 4</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className={`btn-refresh ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Clock size={20} />
            {autoRefresh ? 'Atualização Automática' : 'Atualização Manual'}
          </button>
          <button className="btn-primary" onClick={loadSystemData}>
            Atualizar Agora
          </button>
        </div>
      </div>

      {/* Status Geral */}
      {health && (
        <div className="status-overview">
          <div className="status-card main-status" style={{ borderColor: getStatusColor(health.status) }}>
            {getStatusIcon(health.status)}
            <div className="status-info">
              <h2>Status Geral</h2>
              <p className="status-value" style={{ color: getStatusColor(health.status) }}>
                {health.status === 'healthy' ? 'Operacional' :
                 health.status === 'degraded' ? 'Degradado' : 'Inoperante'}
              </p>
              <p className="status-subtitle">
                Uptime: {formatUptime(health.uptime)}
              </p>
            </div>
          </div>

          {/* Serviços */}
          <div className="services-grid">
            <div className="service-card" style={{ borderColor: getStatusColor(health.services.database.status) }}>
              <Database size={32} color={getStatusColor(health.services.database.status)} />
              <div className="service-info">
                <h3>Banco de Dados</h3>
                <p className={`service-status ${health.services.database.status}`}>
                  {health.services.database.status === 'healthy' ? 'Conectado' : 'Erro'}
                </p>
                {health.services.database.latency && (
                  <span className="service-latency">{health.services.database.latency.toFixed(0)}ms</span>
                )}
              </div>
            </div>

            <div className="service-card" style={{ borderColor: getStatusColor(health.services.redis.status) }}>
              <Server size={32} color={getStatusColor(health.services.redis.status)} />
              <div className="service-info">
                <h3>Redis Cache</h3>
                <p className={`service-status ${health.services.redis.status}`}>
                  {health.services.redis.message || health.services.redis.status}
                </p>
                {health.services.redis.latency && (
                  <span className="service-latency">{health.services.redis.latency.toFixed(0)}ms</span>
                )}
              </div>
            </div>

            <div className="service-card" style={{ borderColor: getStatusColor(health.services.memory.status) }}>
              <Cpu size={32} color={getStatusColor(health.services.memory.status)} />
              <div className="service-info">
                <h3>Memória</h3>
                <p className={`service-status ${health.services.memory.status}`}>
                  {health.system.memoryUsage.percentage.toFixed(1)}% usado
                </p>
                <span className="service-latency">
                  {formatBytes(health.system.memoryUsage.used)} / {formatBytes(health.system.memoryUsage.total)}
                </span>
              </div>
            </div>

            <div className="service-card" style={{ borderColor: getStatusColor(health.services.disk.status) }}>
              <HardDrive size={32} color={getStatusColor(health.services.disk.status)} />
              <div className="service-info">
                <h3>Disco</h3>
                <p className={`service-status ${health.services.disk.status}`}>
                  {health.system.diskUsage.percentage.toFixed(1)}% usado
                </p>
                <span className="service-latency">
                  {formatBytes(health.system.diskUsage.used)} / {formatBytes(health.system.diskUsage.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Métricas de Performance */}
      {metrics && (
        <div className="metrics-section">
          <h2>
            <TrendingUp size={24} />
            Métricas de Performance
          </h2>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon" style={{ backgroundColor: '#3b82f620' }}>
                <Activity size={24} color="#3b82f6" />
              </div>
              <div className="metric-info">
                <p className="metric-label">Requisições Totais</p>
                <p className="metric-value">{metrics.requests_total.toLocaleString()}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ backgroundColor: '#10b98120' }}>
                <TrendingUp size={24} color="#10b981" />
              </div>
              <div className="metric-info">
                <p className="metric-label">Req/segundo</p>
                <p className="metric-value">{metrics.requests_per_second.toFixed(2)}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ backgroundColor: '#f59e0b20' }}>
                <Clock size={24} color="#f59e0b" />
              </div>
              <div className="metric-info">
                <p className="metric-label">Tempo Médio Resposta</p>
                <p className="metric-value">{metrics.avg_response_time.toFixed(0)}ms</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ backgroundColor: '#ef444420' }}>
                <AlertCircle size={24} color="#ef4444" />
              </div>
              <div className="metric-info">
                <p className="metric-label">Taxa de Erro</p>
                <p className="metric-value">{(metrics.error_rate * 100).toFixed(2)}%</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ backgroundColor: '#8b5cf620' }}>
                <Server size={24} color="#8b5cf6" />
              </div>
              <div className="metric-info">
                <p className="metric-label">Conexões Ativas</p>
                <p className="metric-value">{metrics.active_connections}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informações do Sistema */}
      {health && (
        <div className="system-info-section">
          <h2>Informações do Sistema</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Plataforma:</span>
              <span className="info-value">{health.system.platform}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Node.js:</span>
              <span className="info-value">{health.system.nodeVersion}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Última Atualização:</span>
              <span className="info-value">
                {new Date(health.timestamp).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Alertas e Avisos */}
      {health && health.status !== 'healthy' && (
        <div className="alerts-section">
          <div className="alert-card warning">
            <AlertCircle size={24} />
            <div>
              <h3>Atenção Necessária</h3>
              <p>
                {health.status === 'degraded' 
                  ? 'Alguns serviços estão com desempenho reduzido. Verifique os detalhes acima.'
                  : 'Serviços críticos estão indisponíveis. Intervenção imediata necessária!'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMonitoring;
