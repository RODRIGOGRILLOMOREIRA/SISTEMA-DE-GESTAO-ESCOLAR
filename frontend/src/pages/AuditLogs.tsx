import { useState, useEffect } from 'react';
import { Shield, Filter, Download, Calendar, User, Activity } from 'lucide-react';
import { api } from '../lib/api';
import { exportToExcel } from '../utils/exportExcel';
import './AuditLogs.css';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface Filters {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [page, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...filters,
      });

      const response = await api.get(`/audit/logs?${params}`);
      setLogs(response.data.logs);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = logs.map(log => ({
      'Data/Hora': new Date(log.createdAt).toLocaleString('pt-BR'),
      'Usuário': log.userName,
      'Ação': log.action,
      'Recurso': log.resource,
      'ID do Recurso': log.resourceId || '-',
      'IP': log.ipAddress || '-',
    }));

    exportToExcel({
      filename: `auditoria-${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Logs de Auditoria',
      data: exportData,
      columns: [
        { header: 'Data/Hora', key: 'Data/Hora', width: 20 },
        { header: 'Usuário', key: 'Usuário', width: 25 },
        { header: 'Ação', key: 'Ação', width: 15 },
        { header: 'Recurso', key: 'Recurso', width: 20 },
        { header: 'ID do Recurso', key: 'ID do Recurso', width: 25 },
        { header: 'IP', key: 'IP', width: 15 },
      ],
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return '#10b981';
      case 'UPDATE': return '#3b82f6';
      case 'DELETE': return '#ef4444';
      case 'LOGIN': return '#8b5cf6';
      case 'LOGOUT': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="audit-logs-page">
      <div className="page-header">
        <div className="header-title">
          <Shield size={32} />
          <div>
            <h1>Logs de Auditoria</h1>
            <p>Histórico de ações realizadas no sistema</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filtros
          </button>
          <button
            className="btn-primary"
            onClick={handleExport}
            disabled={logs.length === 0}
          >
            <Download size={20} />
            Exportar
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Ação</label>
              <select
                value={filters.action || ''}
                onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined })}
              >
                <option value="">Todas</option>
                <option value="CREATE">Criar</option>
                <option value="UPDATE">Atualizar</option>
                <option value="DELETE">Excluir</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Recurso</label>
              <select
                value={filters.resource || ''}
                onChange={(e) => setFilters({ ...filters, resource: e.target.value || undefined })}
              >
                <option value="">Todos</option>
                <option value="ALUNO">Aluno</option>
                <option value="TURMA">Turma</option>
                <option value="PROFESSOR">Professor</option>
                <option value="NOTA">Nota</option>
                <option value="FREQUENCIA">Frequência</option>
                <option value="DISCIPLINA">Disciplina</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Data Início</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
              />
            </div>

            <div className="filter-group">
              <label>Data Fim</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                setFilters({});
                setPage(1);
              }}
            >
              Limpar Filtros
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                setPage(1);
                loadLogs();
              }}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Carregando logs...</div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <Activity size={64} />
          <h3>Nenhum log encontrado</h3>
          <p>Não há registros de auditoria para os filtros selecionados</p>
        </div>
      ) : (
        <>
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                  <th>Recurso</th>
                  <th>ID do Recurso</th>
                  <th>IP</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div className="log-date">
                        <Calendar size={16} />
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td>
                      <div className="log-user">
                        <User size={16} />
                        {log.userName}
                      </div>
                    </td>
                    <td>
                      <span
                        className="log-action-badge"
                        style={{ backgroundColor: getActionColor(log.action) }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>{log.resource}</td>
                    <td><code>{log.resourceId || '-'}</code></td>
                    <td><code>{log.ipAddress || '-'}</code></td>
                    <td>
                      {log.details && (
                        <button
                          className="btn-details"
                          onClick={() => {
                            alert(JSON.stringify(log.details, null, 2));
                          }}
                        >
                          Ver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
              <span>
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogs;
