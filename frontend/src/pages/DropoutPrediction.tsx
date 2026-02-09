import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Users, Target, RefreshCw, Filter, Download } from 'lucide-react';
import { api } from '../lib/api';
import './DropoutPrediction.css';

interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface StudentRisk {
  alunoId: string;
  nome: string;
  turma: string;
  riskScore: number;
  riskLevel: 'baixo' | 'medio' | 'alto' | 'critico';
  factors: RiskFactor[];
  recommendations: string[];
  lastUpdated: string;
}

interface Statistics {
  total: number;
  baixo: number;
  medio: number;
  alto: number;
  critico: number;
  avgScore: number;
}

const DropoutPrediction = () => {
  const [students, setStudents] = useState<StudentRisk[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'baixo' | 'medio' | 'alto' | 'critico'>('todos');
  const [selectedStudent, setSelectedStudent] = useState<StudentRisk | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analysisRes, statsRes] = await Promise.all([
        api.get('/dropout-prediction/analyze'),
        api.get('/dropout-prediction/statistics')
      ]);
      
      setStudents(analysisRes.data);
      setStatistics(statsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critico': return '#dc2626'; // red-600
      case 'alto': return '#f59e0b'; // amber-500
      case 'medio': return '#eab308'; // yellow-500
      case 'baixo': return '#10b981'; // green-500
      default: return '#6b7280';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critico': return 'CRÍTICO';
      case 'alto': return 'ALTO';
      case 'medio': return 'MÉDIO';
      case 'baixo': return 'BAIXO';
      default: return 'DESCONHECIDO';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '•';
    }
  };

  const filteredStudents = students.filter(student => {
    if (filter === 'todos') return true;
    return student.riskLevel === filter;
  });

  const exportToCSV = () => {
    const headers = ['Nome', 'Turma', 'Score', 'Nível de Risco', 'Fatores de Risco'];
    const rows = students.map(s => [
      s.nome,
      s.turma,
      s.riskScore,
      getRiskLabel(s.riskLevel),
      s.factors.map(f => f.name).join('; ')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predicao-evasao-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="dropout-prediction-loading">
        <RefreshCw size={48} className="spinning" />
        <p>Analisando alunos...</p>
      </div>
    );
  }

  return (
    <div className="dropout-prediction-container">
      {/* Header */}
      <div className="dropout-header">
        <div className="header-content">
          <TrendingDown size={32} />
          <div>
            <h1>Predição de Evasão Escolar</h1>
            <p>Análise preditiva com Inteligência Artificial</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={loadData}>
            <RefreshCw size={20} />
            Atualizar
          </button>
          <button className="btn-secondary" onClick={exportToCSV}>
            <Download size={20} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="stats-cards">
          <div className="stat-card total">
            <Users size={24} />
            <div>
              <h3>Total de Alunos</h3>
              <p className="stat-value">{statistics.total}</p>
            </div>
          </div>

          <div className="stat-card low">
            <Target size={24} />
            <div>
              <h3>Baixo Risco</h3>
              <p className="stat-value">{statistics.baixo}</p>
              <small>{((statistics.baixo / statistics.total) * 100).toFixed(0)}%</small>
            </div>
          </div>

          <div className="stat-card medium">
            <AlertTriangle size={24} />
            <div>
              <h3>Médio Risco</h3>
              <p className="stat-value">{statistics.medio}</p>
              <small>{((statistics.medio / statistics.total) * 100).toFixed(0)}%</small>
            </div>
          </div>

          <div className="stat-card high">
            <AlertTriangle size={24} />
            <div>
              <h3>Alto Risco</h3>
              <p className="stat-value">{statistics.alto}</p>
              <small>{((statistics.alto / statistics.total) * 100).toFixed(0)}%</small>
            </div>
          </div>

          <div className="stat-card critical">
            <AlertTriangle size={24} />
            <div>
              <h3>Risco Crítico</h3>
              <p className="stat-value">{statistics.critico}</p>
              <small>{((statistics.critico / statistics.total) * 100).toFixed(0)}%</small>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <Filter size={20} />
        <span>Filtrar por:</span>
        <button 
          className={filter === 'todos' ? 'active' : ''} 
          onClick={() => setFilter('todos')}
        >
          Todos ({students.length})
        </button>
        <button 
          className={filter === 'critico' ? 'active critical' : ''} 
          onClick={() => setFilter('critico')}
        >
          Crítico ({statistics?.critico || 0})
        </button>
        <button 
          className={filter === 'alto' ? 'active high' : ''} 
          onClick={() => setFilter('alto')}
        >
          Alto ({statistics?.alto || 0})
        </button>
        <button 
          className={filter === 'medio' ? 'active medium' : ''} 
          onClick={() => setFilter('medio')}
        >
          Médio ({statistics?.medio || 0})
        </button>
        <button 
          className={filter === 'baixo' ? 'active low' : ''} 
          onClick={() => setFilter('baixo')}
        >
          Baixo ({statistics?.baixo || 0})
        </button>
      </div>

      {/* Students List */}
      <div className="students-grid">
        {filteredStudents.map(student => (
          <div 
            key={student.alunoId} 
            className={`student-card risk-${student.riskLevel}`}
            onClick={() => setSelectedStudent(student)}
          >
            <div className="student-header">
              <div>
                <h3>{student.nome}</h3>
                <p className="turma">{student.turma}</p>
              </div>
              <div className="risk-badge" style={{ backgroundColor: getRiskColor(student.riskLevel) }}>
                {student.riskScore}
              </div>
            </div>

            <div className="risk-level">
              <span style={{ color: getRiskColor(student.riskLevel) }}>
                {getRiskLabel(student.riskLevel)}
              </span>
            </div>

            <div className="factors-preview">
              {student.factors.slice(0, 3).map((factor, idx) => (
                <div key={idx} className="factor-tag">
                  {getSeverityIcon(factor.severity)} {factor.name}
                </div>
              ))}
              {student.factors.length > 3 && (
                <div className="factor-tag more">
                  +{student.factors.length - 3} mais
                </div>
              )}
            </div>

            <button className="view-details">Ver Detalhes →</button>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="empty-state">
          <Users size={64} />
          <p>Nenhum aluno encontrado neste filtro</p>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedStudent.nome}</h2>
                <p>{selectedStudent.turma}</p>
              </div>
              <button className="close-button" onClick={() => setSelectedStudent(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Risk Score */}
              <div className="risk-score-section">
                <div className="score-circle" style={{ 
                  borderColor: getRiskColor(selectedStudent.riskLevel),
                  color: getRiskColor(selectedStudent.riskLevel)
                }}>
                  <span className="score-value">{selectedStudent.riskScore}</span>
                  <span className="score-label">{getRiskLabel(selectedStudent.riskLevel)}</span>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="section">
                <h3>Fatores de Risco</h3>
                <div className="factors-list">
                  {selectedStudent.factors.map((factor, idx) => (
                    <div key={idx} className={`factor-item severity-${factor.severity}`}>
                      <div className="factor-header">
                        <span className="factor-icon">{getSeverityIcon(factor.severity)}</span>
                        <span className="factor-name">{factor.name}</span>
                        <span className="factor-score">{factor.score}/100</span>
                      </div>
                      <p className="factor-description">{factor.description}</p>
                      <div className="factor-bar">
                        <div 
                          className="factor-bar-fill" 
                          style={{ 
                            width: `${factor.score}%`,
                            backgroundColor: getRiskColor(
                              factor.severity === 'critical' ? 'critico' :
                              factor.severity === 'high' ? 'alto' :
                              factor.severity === 'medium' ? 'medio' : 'baixo'
                            )
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="section">
                <h3>Recomendações de Ação</h3>
                <div className="recommendations-list">
                  {selectedStudent.recommendations.map((rec, idx) => (
                    <div key={idx} className="recommendation-item">
                      <span className="rec-number">{idx + 1}</span>
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button className="btn-primary">
                  Agendar Reunião
                </button>
                <button className="btn-secondary">
                  Gerar Relatório
                </button>
                <button className="btn-secondary">
                  Histórico do Aluno
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropoutPrediction;
