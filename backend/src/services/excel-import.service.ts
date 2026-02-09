import { PrismaClient } from '@prisma/client';
import { ExcelParser, DataType, ParsedSheet } from '../utils/excel-parser';

const prisma = new PrismaClient();

export interface ImportResult {
  success: boolean;
  imported: {
    notas: number;
    frequencias: number;
    conteudos: number;
  };
  errors: ImportError[];
  warnings: string[];
}

export interface ImportError {
  row: number;
  column: string;
  value: any;
  reason: string;
}

export interface ImportPreview {
  totalRecords: number;
  validRecords: number;
  errors: ImportError[];
  warnings: string[];
  sample: any[]; // Primeiros 5 registros para preview
}

/**
 * Service para importação de dados do Excel
 */
export class ExcelImportService {
  private parser = new ExcelParser();

  /**
   * Analisa o arquivo Excel e retorna preview sem importar
   */
  async preview(buffer: Buffer, sheetIndex: number, columnMapping: Record<number, DataType>): Promise<ImportPreview> {
    const analysis = this.parser.parse(buffer);
    
    if (!analysis.sheets[sheetIndex]) {
      throw new Error('Planilha não encontrada');
    }

    const sheet = analysis.sheets[sheetIndex];
    const data = this.parser.extractData(sheet, columnMapping);
    
    const errors: ImportError[] = [];
    const warnings: string[] = [];
    let validRecords = 0;

    // Valida cada registro
    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      const validation = await this.validateRecord(record, i + sheet.dataStartRow + 1);
      
      if (validation.errors.length === 0) {
        validRecords++;
      } else {
        errors.push(...validation.errors);
      }
      
      warnings.push(...validation.warnings);
    }

    return {
      totalRecords: data.length,
      validRecords,
      errors,
      warnings: [...new Set(warnings)], // Remove duplicatas
      sample: data.slice(0, 5) // Primeiros 5 registros
    };
  }

  /**
   * Valida um registro antes de importar
   */
  private async validateRecord(record: any, rowNumber: number): Promise<{ errors: ImportError[]; warnings: string[] }> {
    const errors: ImportError[] = [];
    const warnings: string[] = [];

    // Validação de matrícula/aluno
    if (record.matricula) {
      const aluno = await prisma.alunos.findFirst({
        where: {
          OR: [
            { numeroMatricula: record.matricula },
            { id: record.matricula }
          ]
        }
      });

      if (!aluno) {
        errors.push({
          row: rowNumber,
          column: 'Matrícula',
          value: record.matricula,
          reason: 'Aluno não encontrado no sistema'
        });
      } else {
        record._alunoId = aluno.id; // Guarda ID para importação
      }
    } else if (record.nome) {
      // Tenta buscar por nome (menos confiável)
      const alunos = await prisma.alunos.findMany({
        where: {
          nome: {
            contains: record.nome,
            mode: 'insensitive'
          }
        }
      });

      if (alunos.length === 0) {
        errors.push({
          row: rowNumber,
          column: 'Nome',
          value: record.nome,
          reason: 'Aluno não encontrado no sistema'
        });
      } else if (alunos.length > 1) {
        warnings.push(`Múltiplos alunos encontrados para "${record.nome}" - usando o primeiro`);
        record._alunoId = alunos[0].id;
      } else {
        record._alunoId = alunos[0].id;
      }
    }

    // Validação de turma
    if (record.turma) {
      const turma = await prisma.turmas.findFirst({
        where: {
          OR: [
            { nome: record.turma },
            { id: record.turma }
          ]
        }
      });

      if (!turma) {
        errors.push({
          row: rowNumber,
          column: 'Turma',
          value: record.turma,
          reason: 'Turma não encontrada no sistema'
        });
      } else {
        record._turmaId = turma.id;
      }
    }

    // Validação de disciplina
    if (record.disciplina) {
      const disciplina = await prisma.disciplinas.findFirst({
        where: {
          OR: [
            { nome: { contains: record.disciplina, mode: 'insensitive' } },
            { id: record.disciplina }
          ]
        }
      });

      if (!disciplina) {
        errors.push({
          row: rowNumber,
          column: 'Disciplina',
          value: record.disciplina,
          reason: 'Disciplina não encontrada no sistema'
        });
      } else {
        record._disciplinaId = disciplina.id;
      }
    }

    // Validação de nota
    if (record.nota !== undefined && record.nota !== null) {
      const nota = parseFloat(record.nota);
      if (isNaN(nota) || nota < 0 || nota > 10) {
        errors.push({
          row: rowNumber,
          column: 'Nota',
          value: record.nota,
          reason: 'Nota deve estar entre 0 e 10'
        });
      }
    }

    // Validação de frequência
    if (record.frequencia !== undefined && record.frequencia !== null) {
      const freq = parseFloat(record.frequencia);
      if (isNaN(freq) || freq < 0 || freq > 100) {
        errors.push({
          row: rowNumber,
          column: 'Frequência',
          value: record.frequencia,
          reason: 'Frequência deve estar entre 0 e 100%'
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Executa a importação dos dados
   */
  async import(
    buffer: Buffer,
    sheetIndex: number,
    columnMapping: Record<number, DataType>,
    options: {
      anoLetivo: number;
      bimestre?: number;
      periodo?: string;
    }
  ): Promise<ImportResult> {
    const analysis = this.parser.parse(buffer);
    
    if (!analysis.sheets[sheetIndex]) {
      throw new Error('Planilha não encontrada');
    }

    const sheet = analysis.sheets[sheetIndex];
    const data = this.parser.extractData(sheet, columnMapping);
    
    const result: ImportResult = {
      success: true,
      imported: {
        notas: 0,
        frequencias: 0,
        conteudos: 0
      },
      errors: [],
      warnings: []
    };

    // Valida todos os registros primeiro
    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      const validation = await this.validateRecord(record, i + sheet.dataStartRow + 1);
      
      result.errors.push(...validation.errors);
      result.warnings.push(...validation.warnings);
    }

    // Se houver erros críticos, não importa nada
    if (result.errors.length > 0) {
      result.success = false;
      return result;
    }

    // Importa em transação (tudo ou nada)
    try {
      await prisma.$transaction(async (tx) => {
        for (const record of data) {
          // Importa notas
          if (record.nota !== undefined && record.nota !== null && record._alunoId && record._disciplinaId) {
            await tx.notas.upsert({              where: {
                alunoId_disciplinaId_trimestre_anoLetivo: {
                  alunoId: record._alunoId,
                  disciplinaId: record._disciplinaId,
                  trimestre: options.bimestre || 1,
                  anoLetivo: options.anoLetivo
                }
              },
              create: {
                id: `nota_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                alunoId: record._alunoId,
                disciplinaId: record._disciplinaId,
                trimestre: options.bimestre || 1,
                anoLetivo: options.anoLetivo,
                avaliacao01: parseFloat(record.nota),
                createdAt: new Date(),
                updatedAt: new Date()
              },
              update: {
                avaliacao01: parseFloat(record.nota),
                updatedAt: new Date()
              }
            });
            result.imported.notas++;
          }

          // Importa frequências
          if (record.frequencia !== undefined && record.frequencia !== null && record._alunoId) {
            await tx.frequencias.create({
              data: {
                id: `freq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                alunoId: record._alunoId,
                data: new Date(),
                presente: parseFloat(record.frequencia) >= 75,
                turmaId: record._turmaId,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
            result.imported.frequencias++;
          }

          // Importa conteúdos: funcionalidade desabilitada (tabela não existe no schema)
        }
      });
    } catch (error) {
      result.success = false;
      result.errors.push({
        row: 0,
        column: 'Sistema',
        value: null,
        reason: `Erro ao importar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }

    return result;
  }

  /**
   * Busca histórico de importações
   */
  async getImportHistory(limit: number = 20) {
    // TODO: Criar tabela de log de importações
    // Por enquanto retorna array vazio
    return [];
  }
}
