import { prisma } from '../lib/prisma';
import { log as logger } from '../lib/logger';
import { subDays, differenceInDays } from 'date-fns';

/**
 * Serviço de Predição de Evasão Escolar
 * Analisa múltiplos fatores para calcular risco de evasão
 */

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface StudentRiskAnalysis {
  alunoId: string;
  nome: string;
  turma: string;
  riskScore: number; // 0-100
  riskLevel: 'baixo' | 'medio' | 'alto' | 'critico';
  factors: RiskFactor[];
  recommendations: string[];
  lastUpdated: Date;
}

export interface RiskStatistics {
  total: number;
  baixo: number;
  medio: number;
  alto: number;
  critico: number;
  avgScore: number;
}

class DropoutPredictionService {
  
  /**
   * Analisa todos os alunos e retorna lista ordenada por risco
   */
  async analyzeAllStudents(turmaId?: string): Promise<StudentRiskAnalysis[]> {
    try {
      const whereClause: any = {
        statusMatricula: 'ATIVO'
      };
      
      if (turmaId) {
        whereClause.turmaId = turmaId;
      }

      const alunos = await prisma.alunos.findMany({
        where: whereClause,
        include: {
          turmas: true,
          frequencias: {
            where: {
              data: {
                gte: subDays(new Date(), 90) // Últimos 3 meses
              }
            }
          },
          notas: {
            where: {
              anoLetivo: new Date().getFullYear()
            }
          }
        }
      });

      const analyses: StudentRiskAnalysis[] = [];

      for (const aluno of alunos) {
        const analysis = await this.analyzeStudent(aluno.id);
        analyses.push(analysis);
      }

      // Ordenar por risco (maior para menor)
      return analyses.sort((a, b) => b.riskScore - a.riskScore);
      
    } catch (error) {
      logger.error('Erro ao analisar alunos:', error);
      throw new Error('Erro ao calcular predição de evasão');
    }
  }

  /**
   * Analisa um aluno específico
   */
  async analyzeStudent(alunoId: string): Promise<StudentRiskAnalysis> {
    try {
      const aluno = await prisma.alunos.findUnique({
        where: { id: alunoId },
        include: {
          turmas: true,
          frequencias: {
            where: {
              data: {
                gte: subDays(new Date(), 90)
              }
            },
            orderBy: {
              data: 'desc'
            }
          },
          notas: {
            where: {
              anoLetivo: new Date().getFullYear()
            }
          }
        }
      });

      if (!aluno) {
        throw new Error('Aluno não encontrado');
      }

      const factors: RiskFactor[] = [];

      // FATOR 1: Frequência
      const frequencyFactor = await this.analyzeFrequency(aluno);
      if (frequencyFactor) factors.push(frequencyFactor);

      // FATOR 2: Desempenho Acadêmico
      const performanceFactor = await this.analyzePerformance(aluno);
      if (performanceFactor) factors.push(performanceFactor);

      // FATOR 3: Faltas Consecutivas
      const consecutiveAbsencesFactor = await this.analyzeConsecutiveAbsences(aluno);
      if (consecutiveAbsencesFactor) factors.push(consecutiveAbsencesFactor);

      // FATOR 4: Tendência de Notas
      const gradeTrendFactor = await this.analyzeGradeTrend(aluno);
      if (gradeTrendFactor) factors.push(gradeTrendFactor);

      // FATOR 5: Engajamento (última presença)
      const engagementFactor = await this.analyzeEngagement(aluno);
      if (engagementFactor) factors.push(engagementFactor);

      // Calcular score total ponderado
      const totalScore = factors.reduce((sum, factor) => {
        return sum + (factor.score * factor.weight);
      }, 0);

      const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
      const riskScore = totalWeight > 0 ? Math.min(100, Math.round(totalScore / totalWeight)) : 0;

      // Determinar nível de risco
      const riskLevel = this.getRiskLevel(riskScore);

      // Gerar recomendações
      const recommendations = this.generateRecommendations(factors, riskLevel);

      return {
        alunoId: aluno.id,
        nome: aluno.nome,
        turma: aluno.turmas?.nome || 'Sem turma',
        riskScore,
        riskLevel,
        factors,
        recommendations,
        lastUpdated: new Date()
      };

    } catch (error) {
      logger.error(`Erro ao analisar aluno ${alunoId}:`, error);
      throw error;
    }
  }

  /**
   * Analisa taxa de frequência
   */
  private async analyzeFrequency(aluno: any): Promise<RiskFactor | null> {
    const totalDays = aluno.frequencias.length;
    if (totalDays === 0) return null;

    const presentDays = aluno.frequencias.filter((f: any) => f.presente).length;
    const attendanceRate = (presentDays / totalDays) * 100;

    let score = 0;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let description = '';

    if (attendanceRate < 60) {
      score = 90;
      severity = 'critical';
      description = `Frequência crítica: ${attendanceRate.toFixed(1)}% (mínimo 75%)`;
    } else if (attendanceRate < 75) {
      score = 70;
      severity = 'high';
      description = `Frequência abaixo do mínimo: ${attendanceRate.toFixed(1)}%`;
    } else if (attendanceRate < 85) {
      score = 40;
      severity = 'medium';
      description = `Frequência preocupante: ${attendanceRate.toFixed(1)}%`;
    } else if (attendanceRate < 95) {
      score = 15;
      severity = 'low';
      description = `Frequência adequada: ${attendanceRate.toFixed(1)}%`;
    } else {
      return null; // Frequência ótima, não é fator de risco
    }

    return {
      name: 'Frequência',
      score,
      weight: 1.5, // Peso alto
      description,
      severity
    };
  }

  /**
   * Analisa desempenho acadêmico
   */
  private async analyzePerformance(aluno: any): Promise<RiskFactor | null> {
    if (aluno.notas.length === 0) return null;

    // Calcular média geral
    let totalNotas = 0;
    let countNotas = 0;

    aluno.notas.forEach((nota: any) => {
      if (nota.notaFinalTrimestre != null) {
        totalNotas += nota.notaFinalTrimestre;
        countNotas++;
      }
    });

    if (countNotas === 0) return null;

    const mediaGeral = totalNotas / countNotas;

    let score = 0;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let description = '';

    if (mediaGeral < 3.0) {
      score = 85;
      severity = 'critical';
      description = `Média crítica: ${mediaGeral.toFixed(1)} (muito abaixo da média)`;
    } else if (mediaGeral < 5.0) {
      score = 65;
      severity = 'high';
      description = `Média insuficiente: ${mediaGeral.toFixed(1)} (reprovação iminente)`;
    } else if (mediaGeral < 6.0) {
      score = 35;
      severity = 'medium';
      description = `Desempenho preocupante: ${mediaGeral.toFixed(1)}`;
    } else if (mediaGeral < 7.0) {
      score = 15;
      severity = 'low';
      description = `Desempenho abaixo do esperado: ${mediaGeral.toFixed(1)}`;
    } else {
      return null; // Desempenho bom
    }

    return {
      name: 'Desempenho Acadêmico',
      score,
      weight: 1.4,
      description,
      severity
    };
  }

  /**
   * Analisa faltas consecutivas
   */
  private async analyzeConsecutiveAbsences(aluno: any): Promise<RiskFactor | null> {
    const frequencias = aluno.frequencias.sort((a: any, b: any) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    let consecutiveAbsences = 0;
    for (const freq of frequencias) {
      if (!freq.presente) {
        consecutiveAbsences++;
      } else {
        break;
      }
    }

    if (consecutiveAbsences === 0) return null;

    let score = 0;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let description = '';

    if (consecutiveAbsences >= 10) {
      score = 95;
      severity = 'critical';
      description = `${consecutiveAbsences} dias consecutivos sem comparecer`;
    } else if (consecutiveAbsences >= 7) {
      score = 75;
      severity = 'high';
      description = `${consecutiveAbsences} dias consecutivos de falta`;
    } else if (consecutiveAbsences >= 5) {
      score = 50;
      severity = 'medium';
      description = `${consecutiveAbsences} dias consecutivos de falta`;
    } else if (consecutiveAbsences >= 3) {
      score = 25;
      severity = 'low';
      description = `${consecutiveAbsences} dias consecutivos de falta`;
    } else {
      return null;
    }

    return {
      name: 'Faltas Consecutivas',
      score,
      weight: 1.3,
      description,
      severity
    };
  }

  /**
   * Analisa tendência de notas (melhorando ou piorando)
   */
  private async analyzeGradeTrend(aluno: any): Promise<RiskFactor | null> {
    const notasPorTrimestre = [1, 2, 3].map(trim => {
      const notasTrim = aluno.notas.filter((n: any) => n.trimestre === trim);
      if (notasTrim.length === 0) return null;
      
      const soma = notasTrim.reduce((acc: number, n: any) => 
        acc + (n.notaFinalTrimestre || 0), 0
      );
      return soma / notasTrim.length;
    }).filter((n: any) => n !== null);

    if (notasPorTrimestre.length < 2) return null;

    // Calcular variação percentual entre primeiro e último trimestre disponível
    const primeiraMedia = notasPorTrimestre[0]!;
    const ultimaMedia = notasPorTrimestre[notasPorTrimestre.length - 1]!;
    const variacao = ((ultimaMedia - primeiraMedia) / primeiraMedia) * 100;

    if (variacao >= -10) return null; // Não piorou significativamente

    let score = 0;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let description = '';

    if (variacao <= -40) {
      score = 80;
      severity = 'critical';
      description = `Queda drástica no desempenho: ${Math.abs(variacao).toFixed(0)}%`;
    } else if (variacao <= -30) {
      score = 60;
      severity = 'high';
      description = `Queda acentuada no desempenho: ${Math.abs(variacao).toFixed(0)}%`;
    } else if (variacao <= -20) {
      score = 40;
      severity = 'medium';
      description = `Queda no desempenho: ${Math.abs(variacao).toFixed(0)}%`;
    } else {
      score = 20;
      severity = 'low';
      description = `Leve queda no desempenho: ${Math.abs(variacao).toFixed(0)}%`;
    }

    return {
      name: 'Tendência de Notas',
      score,
      weight: 1.2,
      description,
      severity
    };
  }

  /**
   * Analisa engajamento (última vez que compareceu)
   */
  private async analyzeEngagement(aluno: any): Promise<RiskFactor | null> {
    if (aluno.frequencias.length === 0) {
      return {
        name: 'Engajamento',
        score: 70,
        weight: 1.0,
        description: 'Sem registros de frequência',
        severity: 'high'
      };
    }

    const ultimaPresenca = aluno.frequencias.find((f: any) => f.presente);
    if (!ultimaPresenca) {
      return {
        name: 'Engajamento',
        score: 80,
        weight: 1.0,
        description: 'Nenhuma presença registrada recentemente',
        severity: 'critical'
      };
    }

    const diasSemPresenca = differenceInDays(new Date(), new Date(ultimaPresenca.data));

    if (diasSemPresenca <= 5) return null; // Engajamento normal

    let score = 0;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let description = '';

    if (diasSemPresenca >= 30) {
      score = 90;
      severity = 'critical';
      description = `Sem comparecer há ${diasSemPresenca} dias`;
    } else if (diasSemPresenca >= 20) {
      score = 70;
      severity = 'high';
      description = `Sem comparecer há ${diasSemPresenca} dias`;
    } else if (diasSemPresenca >= 15) {
      score = 45;
      severity = 'medium';
      description = `Sem comparecer há ${diasSemPresenca} dias`;
    } else {
      score = 25;
      severity = 'low';
      description = `Sem comparecer há ${diasSemPresenca} dias`;
    }

    return {
      name: 'Engajamento',
      score,
      weight: 1.1,
      description,
      severity
    };
  }

  /**
   * Determina nível de risco baseado no score
   */
  private getRiskLevel(score: number): 'baixo' | 'medio' | 'alto' | 'critico' {
    if (score >= 70) return 'critico';
    if (score >= 50) return 'alto';
    if (score >= 30) return 'medio';
    return 'baixo';
  }

  /**
   * Gera recomendações baseadas nos fatores de risco
   */
  private generateRecommendations(
    factors: RiskFactor[], 
    riskLevel: string
  ): string[] {
    const recommendations: string[] = [];

    // Recomendações por fator
    factors.forEach(factor => {
      switch (factor.name) {
        case 'Frequência':
          if (factor.severity === 'critical' || factor.severity === 'high') {
            recommendations.push('URGENTE: Reunião imediata com responsáveis para entender motivo das faltas');
            recommendations.push('Verificar se há problemas familiares, de saúde ou transporte');
          } else {
            recommendations.push('Acompanhar frequência semanalmente');
          }
          break;

        case 'Desempenho Acadêmico':
          if (factor.severity === 'critical' || factor.severity === 'high') {
            recommendations.push('Encaminhar para reforço escolar urgente');
            recommendations.push('Avaliar necessidade de apoio psicopedagógico');
            recommendations.push('Criar plano de recuperação individualizado');
          } else {
            recommendations.push('Oferecer aulas de reforço em disciplinas específicas');
          }
          break;

        case 'Faltas Consecutivas':
          recommendations.push('Contato imediato com família (telefone + WhatsApp)');
          recommendations.push('Visita domiciliar se não houver retorno em 48h');
          if (factor.severity === 'critical') {
            recommendations.push('Acionar Conselho Tutelar se abandono configurado');
          }
          break;

        case 'Tendência de Notas':
          recommendations.push('Investigar mudanças recentes (família, saúde, social)');
          recommendations.push('Conversa individual com aluno e coordenação');
          recommendations.push('Plano de ação com metas de melhoria');
          break;

        case 'Engajamento':
          recommendations.push('Verificar se há problemas de integração social');
          recommendations.push('Avaliar interesse do aluno nas atividades escolares');
          recommendations.push('Considerar atividades extracurriculares para aumentar engajamento');
          break;
      }
    });

    // Recomendações gerais por nível de risco
    if (riskLevel === 'critico') {
      recommendations.unshift('🚨 AÇÃO IMEDIATA NECESSÁRIA - Risco de evasão iminente');
      recommendations.push('Reunião multidisciplinar (direção, coordenação, psicólogo, família)');
      recommendations.push('Criar plano de intervenção personalizado com acompanhamento semanal');
    } else if (riskLevel === 'alto') {
      recommendations.unshift('⚠️ ATENÇÃO - Requer acompanhamento próximo');
      recommendations.push('Agendar reunião com família nos próximos 7 dias');
    } else if (riskLevel === 'medio') {
      recommendations.push('Monitorar evolução quinzenalmente');
    }

    // Remover duplicatas
    return [...new Set(recommendations)];
  }

  /**
   * Obtém estatísticas gerais de risco
   */
  async getRiskStatistics(turmaId?: string): Promise<RiskStatistics> {
    const analyses = await this.analyzeAllStudents(turmaId);

    const stats: RiskStatistics = {
      total: analyses.length,
      baixo: analyses.filter(a => a.riskLevel === 'baixo').length,
      medio: analyses.filter(a => a.riskLevel === 'medio').length,
      alto: analyses.filter(a => a.riskLevel === 'alto').length,
      critico: analyses.filter(a => a.riskLevel === 'critico').length,
      avgScore: analyses.reduce((sum, a) => sum + a.riskScore, 0) / (analyses.length || 1)
    };

    return stats;
  }

  /**
   * Obtém alunos em risco crítico ou alto
   */
  async getHighRiskStudents(turmaId?: string): Promise<StudentRiskAnalysis[]> {
    const analyses = await this.analyzeAllStudents(turmaId);
    return analyses.filter(a => a.riskLevel === 'critico' || a.riskLevel === 'alto');
  }
}

export const dropoutPredictionService = new DropoutPredictionService();
