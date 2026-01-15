import { Job } from 'bull';
import { reportQueue } from '../queues';
import { prisma } from '../lib/prisma';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { log } from '../lib/logger';

/**
 * Interface para job de relatório
 */
interface ReportJobData {
  tipo: 'BOLETIM' | 'FREQUENCIA' | 'DESEMPENHO_TURMA' | 'CONSOLIDADO_GERAL';
  formato: 'PDF' | 'EXCEL' | 'JSON';
  filtros: {
    alunoId?: string;
    turmaId?: string;
    disciplinaId?: string;
    dataInicio?: string;
    dataFim?: string;
    trimestre?: number;
    anoLetivo?: number;
  };
  solicitante: {
    id: string;
    nome: string;
    email: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Processa job de geração de relatório
 */
async function processReport(job: Job<ReportJobData>) {
  const { data } = job;
  
  log.info({ component: 'report-worker', jobId: job.id, tipo: data.tipo, solicitante: data.solicitante.nome }, 'Gerando relatório');
  
  await job.progress(5);

  try {
    let reportData: any;
    let fileName: string;

    switch (data.tipo) {
      case 'BOLETIM':
        reportData = await gerarBoletim(data.filtros);
        fileName = `boletim_${data.filtros.alunoId}_${Date.now()}`;
        break;

      case 'FREQUENCIA':
        reportData = await gerarRelatorioFrequencia(data.filtros);
        fileName = `frequencia_${data.filtros.turmaId}_${Date.now()}`;
        break;

      case 'DESEMPENHO_TURMA':
        reportData = await gerarDesempenhoTurma(data.filtros);
        fileName = `desempenho_${data.filtros.turmaId}_${Date.now()}`;
        break;

      case 'CONSOLIDADO_GERAL':
        reportData = await gerarConsolidadoGeral(data.filtros);
        fileName = `consolidado_${Date.now()}`;
        break;

      default:
        throw new Error(`Tipo de relatório não suportado: ${data.tipo}`);
    }

    await job.progress(70);

    // Gera arquivo no formato solicitado
    const filePath = await gerarArquivo(reportData, data.formato, fileName);
    
    await job.progress(90);

    // Envia e-mail com relatório anexo (opcional)
    if (data.solicitante.email) {
      await enviarRelatorioPorEmail(
        data.solicitante.email,
        data.tipo,
        filePath,
        fileName
      );
    }

    await job.progress(100);

    return {
      jobId: job.id,
      tipo: data.tipo,
      formato: data.formato,
      filePath,
      fileName: `${fileName}.${data.formato.toLowerCase()}`,
      geradoEm: new Date().toISOString(),
      solicitante: data.solicitante.nome,
    };
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    log.error({ component: 'report-worker', jobId: job.id, err: error }, 'Erro ao gerar relatório');
    throw error; // Permite retry
  }
}

/**
 * Gera boletim completo de um aluno
 */
async function gerarBoletim(filtros: ReportJobData['filtros']) {
  const { alunoId, anoLetivo = 2025 } = filtros;

  if (!alunoId) {
    throw new Error('alunoId é obrigatório para gerar boletim');
  }

  // Busca dados do aluno
  const aluno = await prisma.alunos.findUnique({
    where: { id: alunoId },
    include: {
      turmas: {
        select: {
          id: true,
          nome: true,
          ano: true,
          periodo: true,
        },
      },
    },
  });

  if (!aluno) {
    throw new Error(`Aluno ${alunoId} não encontrado`);
  }

  // Busca todas as notas
  const notas = await prisma.notas.findMany({
    where: {
      alunoId,
      anoLetivo,
    },
    include: {
      disciplinas: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
    orderBy: [
      { trimestre: 'asc' },
      { disciplinas: { nome: 'asc' } },
    ],
  });

  // Busca frequências
  const frequencias = await prisma.frequencias.findMany({
    where: {
      alunoId,
      data: {
        gte: new Date(anoLetivo, 0, 1),
        lte: new Date(anoLetivo, 11, 31),
      },
    },
  });

  // Agrupa por disciplina
  const disciplinasMap = new Map();
  
  notas.forEach(nota => {
    const disciplinaId = nota.disciplinaId;
    
    if (!disciplinasMap.has(disciplinaId)) {
      disciplinasMap.set(disciplinaId, {
        disciplina: nota.disciplinas.nome,
        trimestres: {},
        mediaFinal: 0,
      });
    }
    
    const disc = disciplinasMap.get(disciplinaId);
    disc.trimestres[`T${nota.trimestre}`] = nota.notaFinalTrimestre || 0;
  });

  // Calcula média final por disciplina
  disciplinasMap.forEach((disc, disciplinaId) => {
    const medias = Object.values(disc.trimestres) as number[];
    disc.mediaFinal = medias.length > 0 
      ? parseFloat((medias.reduce((a, b) => a + b, 0) / medias.length).toFixed(2))
      : 0;
  });

  // Estatísticas de frequência
  const totalRegistros = frequencias.length;
  const presencas = frequencias.filter(f => f.presente).length;
  const percentualPresenca = totalRegistros > 0
    ? ((presencas / totalRegistros) * 100).toFixed(2)
    : '0';

  return {
    aluno: {
      id: aluno.id,
      nome: aluno.nome,
      matricula: aluno.numeroMatricula,
      turma: aluno.turmas?.nome || 'N/A',
    },
    anoLetivo,
    disciplinas: Array.from(disciplinasMap.values()),
    frequencia: {
      totalAulas: totalRegistros,
      presencas,
      faltas: totalRegistros - presencas,
      percentual: `${percentualPresenca}%`,
    },
    geradoEm: format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }),
  };
}

/**
 * Gera relatório de frequência de uma turma
 */
async function gerarRelatorioFrequencia(filtros: ReportJobData['filtros']) {
  const { turmaId, dataInicio, dataFim } = filtros;

  if (!turmaId || !dataInicio || !dataFim) {
    throw new Error('turmaId, dataInicio e dataFim são obrigatórios');
  }

  const turma = await prisma.turmas.findUnique({
    where: { id: turmaId },
  });

  if (!turma) {
    throw new Error(`Turma ${turmaId} não encontrada`);
  }

  const frequencias = await prisma.frequencias.findMany({
    where: {
      turmaId,
      data: {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      },
    },
    include: {
      alunos: {
        select: {
          id: true,
          nome: true,
          numeroMatricula: true,
        },
      },
    },
    orderBy: [
      { data: 'asc' },
      { alunos: { nome: 'asc' } },
    ],
  });

  // Agrupa por aluno
  const alunosMap = new Map();
  
  frequencias.forEach(freq => {
    const alunoId = freq.alunoId;
    
    if (!alunosMap.has(alunoId)) {
      alunosMap.set(alunoId, {
        aluno: freq.alunos,
        presencas: 0,
        faltas: 0,
        total: 0,
        diasComFalta: [],
      });
    }
    
    const alunoData = alunosMap.get(alunoId);
    alunoData.total++;
    
    if (freq.presente) {
      alunoData.presencas++;
    } else {
      alunoData.faltas++;
      alunoData.diasComFalta.push(format(freq.data, 'dd/MM/yyyy'));
    }
  });

  // Calcula percentuais
  const relatorio = Array.from(alunosMap.values()).map(data => ({
    ...data,
    percentualPresenca: data.total > 0 
      ? `${((data.presencas / data.total) * 100).toFixed(2)}%`
      : '0%',
  }));

  return {
    turma: {
      id: turma.id,
      nome: turma.nome,
      ano: turma.ano,
      periodo: turma.periodo,
    },
    periodo: {
      inicio: format(new Date(dataInicio), 'dd/MM/yyyy'),
      fim: format(new Date(dataFim), 'dd/MM/yyyy'),
    },
    alunos: relatorio,
    resumo: {
      totalAlunos: relatorio.length,
      mediaPresenca: relatorio.length > 0
        ? `${(relatorio.reduce((acc, a) => acc + parseFloat(a.percentualPresenca), 0) / relatorio.length).toFixed(2)}%`
        : '0%',
    },
    geradoEm: format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }),
  };
}

/**
 * Gera relatório de desempenho de uma turma
 */
async function gerarDesempenhoTurma(filtros: ReportJobData['filtros']) {
  const { turmaId, trimestre, anoLetivo = 2025 } = filtros;

  if (!turmaId) {
    throw new Error('turmaId é obrigatório');
  }

  const turma = await prisma.turmas.findUnique({
    where: { id: turmaId },
  });

  if (!turma) {
    throw new Error(`Turma ${turmaId} não encontrada`);
  }

  // Busca notas da turma
  const notas = await prisma.notas.findMany({
    where: {
      alunos: { turmaId },
      anoLetivo,
      ...(trimestre && { trimestre }),
    },
    include: {
      alunos: {
        select: {
          id: true,
          nome: true,
          numeroMatricula: true,
        },
      },
      disciplinas: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });

  // Agrupa por disciplina
  const disciplinasMap = new Map();
  
  notas.forEach(nota => {
    const disciplinaId = nota.disciplinaId;
    
    if (!disciplinasMap.has(disciplinaId)) {
      disciplinasMap.set(disciplinaId, {
        disciplina: nota.disciplinas.nome,
        notas: [],
        media: 0,
        aprovados: 0,
        reprovados: 0,
      });
    }
    
    const disc = disciplinasMap.get(disciplinaId);
    const notaFinal = nota.notaFinalTrimestre || 0;
    disc.notas.push(notaFinal);
    
    if (notaFinal >= 7.0) {
      disc.aprovados++;
    } else {
      disc.reprovados++;
    }
  });

  // Calcula médias
  disciplinasMap.forEach(disc => {
    disc.media = disc.notas.length > 0
      ? parseFloat((disc.notas.reduce((a: number, b: number) => a + b, 0) / disc.notas.length).toFixed(2))
      : 0;
    disc.totalAlunos = disc.notas.length;
    delete disc.notas; // Remove array de notas para reduzir tamanho
  });

  return {
    turma: {
      id: turma.id,
      nome: turma.nome,
      ano: turma.ano,
      periodo: turma.periodo,
    },
    filtros: {
      trimestre: trimestre || 'Todos',
      anoLetivo,
    },
    disciplinas: Array.from(disciplinasMap.values()),
    geradoEm: format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }),
  };
}

/**
 * Gera relatório consolidado geral
 */
async function gerarConsolidadoGeral(filtros: ReportJobData['filtros']) {
  const { anoLetivo = 2025 } = filtros;

  // Estatísticas em paralelo
  const [
    totalAlunos,
    alunosAtivos,
    totalTurmas,
    totalProfessores,
    mediasGerais,
    frequenciaMedia,
  ] = await Promise.all([
    prisma.alunos.count(),
    prisma.alunos.count({ where: { statusMatricula: 'ATIVO' } }),
    prisma.turmas.count({ where: { anoLetivo } }),
    prisma.professores.count(),
    prisma.notas.aggregate({
      where: { anoLetivo },
      _avg: { notaFinalTrimestre: true },
    }),
    prisma.frequencias.aggregate({
      where: {
        data: {
          gte: new Date(anoLetivo, 0, 1),
          lte: new Date(anoLetivo, 11, 31),
        },
      },
      _avg: { presente: true },
    }),
  ]);

  return {
    anoLetivo,
    alunos: {
      total: totalAlunos,
      ativos: alunosAtivos,
      inativos: totalAlunos - alunosAtivos,
    },
    turmas: {
      total: totalTurmas,
    },
    professores: {
      total: totalProfessores,
    },
    desempenho: {
      mediaGeralNotas: mediasGerais._avg.notaFinalTrimestre?.toFixed(2) || 'N/A',
      mediaPresenca: frequenciaMedia._avg.presente 
        ? `${(frequenciaMedia._avg.presente * 100).toFixed(2)}%`
        : 'N/A',
    },
    geradoEm: format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }),
  };
}

/**
 * Gera arquivo no formato especificado
 */
async function gerarArquivo(data: unknown, formato: string, fileName: string): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const uploadsDir = path.join(__dirname, '../../uploads/reports');
  
  // Cria diretório se não existir
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    // Diretório já existe
  }

  const filePath = path.join(uploadsDir, `${fileName}.${formato.toLowerCase()}`);

  switch (formato) {
    case 'JSON':
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      break;

    case 'PDF':
    case 'EXCEL':
      // TODO: Implementar geração de PDF/Excel (usar bibliotecas como pdfkit ou exceljs)
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      log.warn({ component: 'report-worker', formato }, 'Formato não implementado ainda, salvando como JSON');
      break;

    default:
      throw new Error(`Formato não suportado: ${formato}`);
  }

  return filePath;
}

/**
 * Envia relatório por e-mail
 */
async function enviarRelatorioPorEmail(
  email: string,
  tipoRelatorio: string,
  filePath: string,
  fileName: string
) {
  // TODO: Integrar com serviço de e-mail (SendGrid, SES, etc)
  log.info({ component: 'report-worker', email, tipoRelatorio, fileName }, 'Enviando relatório por e-mail');
  
  // Placeholder - implementar integração real
  return Promise.resolve();
}

/**
 * Configura o worker da fila de relatórios
 * Processa 3 jobs concorrentes (relatórios são mais pesados)
 */
reportQueue.process(3, processReport);

// Retry strategy
reportQueue.on('failed', async (job, error) => {
  const maxAttempts = 2; // Relatórios: menos retries (são idempotentes)
  
  if (job.attemptsMade < maxAttempts) {
    log.warn({ component: 'report-worker', jobId: job.id, attempt: job.attemptsMade, maxAttempts }, 'Retentando relatório');
    await job.retry();
  } else {
    log.error({ component: 'report-worker', jobId: job.id, maxAttempts, err: error }, 'Relatório falhou após múltiplas tentativas');
  }
});

log.info({ component: 'report-worker' }, 'Report Worker iniciado');

export default reportQueue;
