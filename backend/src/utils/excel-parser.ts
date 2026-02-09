import * as XLSX from 'xlsx';

// Tipos de dados que podemos importar
export type DataType = 'nome' | 'matricula' | 'nota' | 'frequencia' | 'conteudo' | 'disciplina' | 'turma' | 'bimestre' | 'data' | 'desconhecido';

export interface ColumnMapping {
  index: number;
  header: string;
  detectedType: DataType;
  confidence: number; // 0-100
  samples: any[]; // Amostras dos primeiros valores
}

export interface ParsedSheet {
  sheetName: string;
  columns: ColumnMapping[];
  totalRows: number;
  dataStartRow: number; // Linha onde os dados começam (depois do cabeçalho)
  rawData: any[][];
}

export interface ExcelAnalysis {
  sheets: ParsedSheet[];
  recommendations: string[];
  warnings: string[];
}

/**
 * IA para detectar o tipo de uma coluna baseado em:
 * - Palavras-chave no cabeçalho
 * - Padrão dos dados (números, datas, textos)
 * - Contexto de outras colunas
 */
class ColumnTypeDetector {
  private readonly patterns = {
    nome: /nome|aluno|estudante|discente/i,
    matricula: /matr[íi]cula|mat|id|c[óo]digo|ra/i,
    nota: /nota|pontua[çc][ãa]o|avalia[çc][ãa]o|prova|trabalho|m[ée]dia|resultado/i,
    frequencia: /frequ[êe]ncia|presen[çc]a|falta|comparecimento|%/i,
    conteudo: /conte[úu]do|habilidade|descri[çc][ãa]o|t[óo]pico|assunto|bncc/i,
    disciplina: /disciplina|mat[ée]ria|componente/i,
    turma: /turma|classe|s[ée]rie|ano/i,
    bimestre: /bimestre|trimestre|per[íi]odo|etapa/i,
    data: /data|dia|m[êe]s/i,
  };

  detect(header: string, samples: any[]): { type: DataType; confidence: number } {
    let maxConfidence = 0;
    let detectedType: DataType = 'desconhecido';

    // Testa cada padrão
    for (const [type, pattern] of Object.entries(this.patterns)) {
      const headerMatch = pattern.test(header);
      const dataMatch = this.testDataPattern(type as DataType, samples);
      
      const confidence = (headerMatch ? 60 : 0) + (dataMatch ? 40 : 0);
      
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedType = type as DataType;
      }
    }

    return { type: detectedType, confidence: maxConfidence };
  }

  private testDataPattern(type: DataType, samples: any[]): boolean {
    const validSamples = samples.filter(s => s !== null && s !== undefined && s !== '');
    if (validSamples.length === 0) return false;

    switch (type) {
      case 'nota':
        // Verifica se são números entre 0-10 ou 0-100
        return validSamples.every(s => {
          const num = parseFloat(String(s).replace(',', '.'));
          return !isNaN(num) && num >= 0 && num <= 100;
        });

      case 'frequencia':
        // Verifica se são números percentuais ou absolutos
        return validSamples.every(s => {
          const str = String(s);
          const num = parseFloat(str.replace(',', '.').replace('%', ''));
          return !isNaN(num) && num >= 0 && num <= 100;
        });

      case 'matricula':
        // Verifica se são números ou códigos alfanuméricos
        return validSamples.every(s => {
          const str = String(s).trim();
          return str.length > 0 && /^[A-Z0-9]+$/i.test(str);
        });

      case 'nome':
        // Verifica se são textos com pelo menos 2 palavras (nome e sobrenome)
        return validSamples.some(s => {
          const str = String(s).trim();
          return str.split(/\s+/).length >= 2;
        });

      case 'data':
        // Verifica se parecem datas
        return validSamples.some(s => {
          const str = String(s);
          return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(str) || !isNaN(Date.parse(str));
        });

      case 'conteudo':
        // Verifica se são textos longos (descrições)
        return validSamples.some(s => String(s).length > 20);

      default:
        return false;
    }
  }
}

/**
 * Parser principal de arquivos Excel
 */
export class ExcelParser {
  private detector = new ColumnTypeDetector();

  /**
   * Analisa um arquivo Excel e retorna estrutura detectada
   */
  parse(buffer: Buffer): ExcelAnalysis {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheets: ParsedSheet[] = [];
    const recommendations: string[] = [];
    const warnings: string[] = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: null,
        raw: false // Converte para strings
      });

      if (rawData.length === 0) {
        warnings.push(`Planilha "${sheetName}" está vazia`);
        continue;
      }

      // Detecta linha de cabeçalho (primeira linha não vazia)
      let headerRow = 0;
      while (headerRow < rawData.length && rawData[headerRow].every(cell => !cell)) {
        headerRow++;
      }

      if (headerRow >= rawData.length) {
        warnings.push(`Planilha "${sheetName}" não possui cabeçalho válido`);
        continue;
      }

      const headers = rawData[headerRow];
      const dataStartRow = headerRow + 1;
      const dataRows = rawData.slice(dataStartRow);

      // Analisa cada coluna
      const columns: ColumnMapping[] = headers.map((header, index) => {
        const samples = dataRows
          .slice(0, 10) // Pega primeiras 10 linhas como amostra
          .map(row => row[index])
          .filter(cell => cell !== null && cell !== undefined && cell !== '');

        const { type, confidence } = this.detector.detect(String(header || `Coluna ${index + 1}`), samples);

        return {
          index,
          header: String(header || `Coluna ${index + 1}`),
          detectedType: type,
          confidence,
          samples: samples.slice(0, 3) // Só mantém 3 amostras para preview
        };
      });

      sheets.push({
        sheetName,
        columns,
        totalRows: dataRows.length,
        dataStartRow,
        rawData
      });

      // Gera recomendações
      const highConfidenceColumns = columns.filter(c => c.confidence >= 60);
      const lowConfidenceColumns = columns.filter(c => c.confidence < 60 && c.confidence > 0);

      if (highConfidenceColumns.length > 0) {
        recommendations.push(
          `Planilha "${sheetName}": ${highConfidenceColumns.length} colunas identificadas automaticamente`
        );
      }

      if (lowConfidenceColumns.length > 0) {
        warnings.push(
          `Planilha "${sheetName}": ${lowConfidenceColumns.length} colunas com baixa confiança - revisar manualmente`
        );
      }

      // Detecta padrões específicos
      const hasNota = columns.some(c => c.detectedType === 'nota');
      const hasFrequencia = columns.some(c => c.detectedType === 'frequencia');
      const hasConteudo = columns.some(c => c.detectedType === 'conteudo');

      if (hasNota) recommendations.push(`Planilha "${sheetName}" parece conter notas`);
      if (hasFrequencia) recommendations.push(`Planilha "${sheetName}" parece conter frequência`);
      if (hasConteudo) recommendations.push(`Planilha "${sheetName}" parece conter conteúdos/habilidades`);
    }

    return {
      sheets,
      recommendations,
      warnings
    };
  }

  /**
   * Extrai dados de uma planilha com mapeamento confirmado pelo usuário
   */
  extractData(
    sheet: ParsedSheet,
    columnMapping: Record<number, DataType>
  ): any[] {
    const data: any[] = [];
    const dataRows = sheet.rawData.slice(sheet.dataStartRow);

    for (const row of dataRows) {
      // Ignora linhas vazias
      if (row.every(cell => !cell)) continue;

      const record: any = {};
      
      for (const [index, type] of Object.entries(columnMapping)) {
        const colIndex = parseInt(index);
        const value = row[colIndex];

        if (value !== null && value !== undefined && value !== '') {
          record[type] = this.normalizeValue(type, value);
        }
      }

      if (Object.keys(record).length > 0) {
        data.push(record);
      }
    }

    return data;
  }

  /**
   * Normaliza valores conforme o tipo
   */
  private normalizeValue(type: DataType, value: any): any {
    switch (type) {
      case 'nota':
      case 'frequencia':
        // Converte para número
        const num = parseFloat(String(value).replace(',', '.').replace('%', ''));
        return isNaN(num) ? null : num;

      case 'matricula':
        // Remove espaços e converte para uppercase
        return String(value).trim().toUpperCase();

      case 'nome':
        // Normaliza nome (primeira letra maiúscula)
        return String(value)
          .trim()
          .split(/\s+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

      case 'data':
        // Tenta converter para Date
        const date = new Date(value);
        return isNaN(date.getTime()) ? value : date.toISOString();

      default:
        return String(value).trim();
    }
  }
}
