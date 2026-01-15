import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Play } from 'lucide-react';
import axios from 'axios';
import './ImportExcel.css';

interface ColumnMapping {
  index: number;
  header: string;
  detectedType: string;
  confidence: number;
  samples: any[];
}

interface Sheet {
  sheetName: string;
  columns: ColumnMapping[];
  totalRows: number;
  dataStartRow: number;
}

interface Analysis {
  sheets: Sheet[];
  recommendations: string[];
  warnings: string[];
}

interface ImportError {
  row: number;
  column: string;
  value: any;
  reason: string;
}

interface Preview {
  totalRecords: number;
  validRecords: number;
  errors: ImportError[];
  warnings: string[];
  sample: any[];
}

const dataTypeLabels: Record<string, string> = {
  nome: 'Nome',
  matricula: 'Matrícula',
  nota: 'Nota',
  frequencia: 'Frequência',
  conteudo: 'Conteúdo',
  disciplina: 'Disciplina',
  turma: 'Turma',
  bimestre: 'Bimestre',
  data: 'Data',
  desconhecido: 'Desconhecido'
};

const ImportExcel: React.FC = () => {
  const [_selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<number>(0);
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({});
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'result'>('upload');
  
  // Opções de importação
  const [anoLetivo, setAnoLetivo] = useState(new Date().getFullYear());
  const [bimestre, setBimestre] = useState(1);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    setSelectedFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post('http://localhost:3333/api/excel-import/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFileId(response.data.fileId);
      setAnalysis(response.data.analysis);
      
      // Inicializa mapeamento com detecções da IA
      const initialMapping: Record<number, string> = {};
      response.data.analysis.sheets[0]?.columns.forEach((col: ColumnMapping) => {
        if (col.confidence >= 60) {
          initialMapping[col.index] = col.detectedType;
        }
      });
      setColumnMapping(initialMapping);
      
      setStep('mapping');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao analisar arquivo');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePreview = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3333/api/excel-import/preview', {
        fileId,
        sheetIndex: selectedSheet,
        columnMapping
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setPreview(response.data);
      setStep('preview');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao gerar preview');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3333/api/excel-import/execute', {
        fileId,
        sheetIndex: selectedSheet,
        columnMapping,
        options: {
          anoLetivo,
          bimestre
        }
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setResult(response.data);
      setStep('result');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao executar importação');
    } finally {
      setLoading(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setFileId(null);
    setAnalysis(null);
    setSelectedSheet(0);
    setColumnMapping({});
    setPreview(null);
    setResult(null);
    setError(null);
    setStep('upload');
  };

  return (
    <div className="import-excel-container">
      <div className="import-header">
        <FileSpreadsheet size={32} className="header-icon" />
        <div>
          <h1>Importar Dados do Excel</h1>
          <p>Importe notas, frequências e conteúdos de suas planilhas existentes</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      {/* ETAPA 1: Upload */}
      {step === 'upload' && (
        <div className="upload-section">
          <div 
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload size={48} className="dropzone-icon" />
            <p className="dropzone-title">Arraste seu arquivo Excel aqui</p>
            <p className="dropzone-subtitle">ou clique para selecionar</p>
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input" className="btn btn-primary">
              Selecionar Arquivo
            </label>
          </div>

          {analysis && (
            <div className="recommendations">
              <h3>✨ Recomendações da IA</h3>
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="recommendation-item">
                  <CheckCircle size={16} />
                  <span>{rec}</span>
                </div>
              ))}
              {analysis.warnings.map((warn, i) => (
                <div key={i} className="warning-item">
                  <AlertCircle size={16} />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ETAPA 2: Mapeamento */}
      {step === 'mapping' && analysis && (
        <div className="mapping-section">
          <div className="section-header">
            <h2>Etapa 2: Verificar Mapeamento</h2>
            <p>A IA detectou automaticamente as colunas. Revise e ajuste se necessário.</p>
          </div>

          <div className="sheet-selector">
            <label>Planilha:</label>
            <select value={selectedSheet} onChange={(e) => setSelectedSheet(parseInt(e.target.value))}>
              {analysis.sheets.map((sheet, i) => (
                <option key={i} value={i}>{sheet.sheetName} ({sheet.totalRows} linhas)</option>
              ))}
            </select>
          </div>

          <div className="columns-grid">
            {analysis.sheets[selectedSheet]?.columns.map((col) => (
              <div key={col.index} className="column-card">
                <div className="column-header">
                  <strong>{col.header}</strong>
                  <span className={`confidence ${col.confidence >= 60 ? 'high' : 'low'}`}>
                    {col.confidence}% confiança
                  </span>
                </div>
                
                <div className="column-samples">
                  <small>Amostras:</small>
                  {col.samples.slice(0, 2).map((sample, i) => (
                    <div key={i} className="sample">{String(sample)}</div>
                  ))}
                </div>

                <select
                  value={columnMapping[col.index] || 'desconhecido'}
                  onChange={(e) => setColumnMapping({ ...columnMapping, [col.index]: e.target.value })}
                  className="column-select"
                >
                  {Object.entries(dataTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="import-options">
            <div className="option-group">
              <label>Ano Letivo:</label>
              <input 
                type="number" 
                value={anoLetivo} 
                onChange={(e) => setAnoLetivo(parseInt(e.target.value))}
                min={2020}
                max={2030}
              />
            </div>
            <div className="option-group">
              <label>Bimestre:</label>
              <select value={bimestre} onChange={(e) => setBimestre(parseInt(e.target.value))}>
                <option value={1}>1º Bimestre</option>
                <option value={2}>2º Bimestre</option>
                <option value={3}>3º Bimestre</option>
                <option value={4}>4º Bimestre</option>
              </select>
            </div>
          </div>

          <div className="actions">
            <button onClick={resetImport} className="btn btn-secondary">
              Cancelar
            </button>
            <button onClick={handleGeneratePreview} className="btn btn-primary" disabled={loading}>
              {loading ? 'Validando...' : 'Continuar para Preview'}
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3: Preview */}
      {step === 'preview' && preview && (
        <div className="preview-section">
          <div className="section-header">
            <h2>Etapa 3: Confirmar Importação</h2>
            <p>Revise os dados antes de importar</p>
          </div>

          <div className="preview-stats">
            <div className="stat-card">
              <span className="stat-label">Total de Registros</span>
              <span className="stat-value">{preview.totalRecords}</span>
            </div>
            <div className="stat-card success">
              <CheckCircle size={24} />
              <span className="stat-label">Válidos</span>
              <span className="stat-value">{preview.validRecords}</span>
            </div>
            <div className="stat-card error">
              <AlertCircle size={24} />
              <span className="stat-label">Erros</span>
              <span className="stat-value">{preview.errors.length}</span>
            </div>
          </div>

          {preview.errors.length > 0 && (
            <div className="errors-list">
              <h3>⚠️ Erros Encontrados</h3>
              <p>Corrija os erros abaixo antes de importar:</p>
              {preview.errors.slice(0, 10).map((err, i) => (
                <div key={i} className="error-item">
                  <strong>Linha {err.row}:</strong> {err.reason}
                  <small>Coluna: {err.column}, Valor: {String(err.value)}</small>
                </div>
              ))}
              {preview.errors.length > 10 && (
                <p className="more-errors">E mais {preview.errors.length - 10} erros...</p>
              )}
            </div>
          )}

          {preview.warnings.length > 0 && (
            <div className="warnings-list">
              <h3>ℹ️ Avisos</h3>
              {preview.warnings.slice(0, 5).map((warn, i) => (
                <div key={i} className="warning-item">{warn}</div>
              ))}
            </div>
          )}

          <div className="sample-data">
            <h3>📋 Amostra dos Dados</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    {Object.keys(preview.sample[0] || {}).filter(k => !k.startsWith('_')).map(key => (
                      <th key={key}>{dataTypeLabels[key] || key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.sample.map((row, i) => (
                    <tr key={i}>
                      {Object.entries(row).filter(([k]) => !k.startsWith('_')).map(([_key, value], j) => (
                        <td key={j}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="actions">
            <button onClick={() => setStep('mapping')} className="btn btn-secondary">
              Voltar
            </button>
            <button 
              onClick={handleExecuteImport} 
              className="btn btn-primary"
              disabled={loading || preview.errors.length > 0}
            >
              <Play size={20} />
              {loading ? 'Importando...' : 'Executar Importação'}
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 4: Resultado */}
      {step === 'result' && result && (
        <div className="result-section">
          <div className={`result-header ${result.success ? 'success' : 'error'}`}>
            {result.success ? <CheckCircle size={48} /> : <AlertCircle size={48} />}
            <h2>{result.success ? 'Importação Concluída!' : 'Importação Falhou'}</h2>
          </div>

          <div className="result-stats">
            <div className="stat-card">
              <span className="stat-label">Notas Importadas</span>
              <span className="stat-value">{result.imported.notas}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Frequências Importadas</span>
              <span className="stat-value">{result.imported.frequencias}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Conteúdos Importados</span>
              <span className="stat-value">{result.imported.conteudos}</span>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="errors-list">
              <h3>Erros:</h3>
              {result.errors.map((err: ImportError, i: number) => (
                <div key={i} className="error-item">{err.reason}</div>
              ))}
            </div>
          )}

          <div className="actions">
            <button onClick={resetImport} className="btn btn-primary">
              Nova Importação
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExcel;
