import { notificationQueue, reportQueue, emailQueue, scheduledQueue } from '../queues';
import type { JobOptions } from 'bull';

/**
 * Helper para adicionar jobs de notificação à fila
 */
export async function adicionarNotificacao(data: {
  tipo: 'NOTA_LANCADA' | 'FALTA_REGISTRADA' | 'AVISO_GERAL' | 'REUNIAO' | 'EVENTO';
  destinatarioId: string;
  destinatarioNome: string;
  destinatarioTipo: 'ALUNO' | 'RESPONSAVEL' | 'PROFESSOR' | 'FUNCIONARIO';
  titulo: string;
  mensagem: string;
  metadata?: Record<string, any>;
  canais?: ('WHATSAPP' | 'SMS' | 'EMAIL')[];
  prioridade?: 'ALTA' | 'MEDIA' | 'BAIXA';
}) {
  const options: JobOptions = {
    attempts: 3, // 3 tentativas
    backoff: {
      type: 'exponential',
      delay: 60000, // Inicia com 1 minuto
    },
    removeOnComplete: 100, // Mantém últimos 100 jobs completos
    removeOnFail: 500, // Mantém últimos 500 jobs com falha
  };

  // Prioridade afeta ordem de processamento (menor = maior prioridade)
  if (data.prioridade === 'ALTA') {
    options.priority = 1;
  } else if (data.prioridade === 'MEDIA') {
    options.priority = 5;
  } else {
    options.priority = 10;
  }

  const jobData = {
    ...data,
    canais: data.canais || ['WHATSAPP'], // Default: WhatsApp
    prioridade: data.prioridade || 'MEDIA',
  };

  const job = await notificationQueue.add('send-notification', jobData, options);
  
  console.log(`📨 Notificação adicionada à fila: Job ${job.id}`);
  
  return {
    jobId: job.id,
    status: 'queued',
    estimatedProcessTime: '1-2 minutos',
  };
}

/**
 * Helper para adicionar jobs de relatório à fila
 */
export async function adicionarRelatorio(data: {
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
}) {
  const options: JobOptions = {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 120000, // 2 minutos
    },
    timeout: 300000, // 5 minutos timeout
    removeOnComplete: 50,
    removeOnFail: 200,
  };

  const job = await reportQueue.add('generate-report', data, options);
  
  console.log(`📊 Relatório adicionado à fila: Job ${job.id}`);
  
  return {
    jobId: job.id,
    status: 'queued',
    estimatedProcessTime: '3-5 minutos',
  };
}

/**
 * Helper para adicionar jobs de e-mail à fila
 */
export async function adicionarEmail(data: {
  destinatarios: string[];
  assunto: string;
  corpo: string;
  html?: string;
  anexos?: { filename: string; path: string }[];
  prioridade?: 'ALTA' | 'MEDIA' | 'BAIXA';
}) {
  const options: JobOptions = {
    attempts: 5, // E-mails: mais tentativas
    backoff: {
      type: 'exponential',
      delay: 30000, // Inicia com 30 segundos
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  };

  if (data.prioridade === 'ALTA') {
    options.priority = 1;
  } else if (data.prioridade === 'MEDIA') {
    options.priority = 5;
  } else {
    options.priority = 10;
  }

  const job = await emailQueue.add('send-email', data, options);
  
  console.log(`📧 E-mail adicionado à fila: Job ${job.id}`);
  
  return {
    jobId: job.id,
    status: 'queued',
  };
}

/**
 * Helper para agendar jobs recorrentes
 */
export async function agendarJob(data: {
  tipo: 'BACKUP' | 'RELATORIO_DIARIO' | 'LIMPEZA' | 'SINCRONIZACAO';
  payload: any;
  cron?: string; // Ex: '0 0 * * *' = todo dia à meia-noite
  delay?: number; // Em milissegundos
  repeat?: {
    every?: number; // Em milissegundos
    limit?: number; // Número máximo de execuções
  };
}) {
  const options: JobOptions = {
    attempts: 1, // Jobs agendados: única tentativa
    removeOnComplete: 10,
    removeOnFail: 50,
  };

  if (data.cron) {
    options.repeat = { cron: data.cron };
  } else if (data.delay) {
    options.delay = data.delay;
  } else if (data.repeat) {
    options.repeat = data.repeat;
  }

  const job = await scheduledQueue.add('scheduled-job', {
    tipo: data.tipo,
    payload: data.payload,
  }, options);
  
  console.log(`⏰ Job agendado: ${data.tipo} - Job ${job.id}`);
  
  return {
    jobId: job.id,
    tipo: data.tipo,
    status: 'scheduled',
  };
}

/**
 * Busca status de um job específico
 */
export async function buscarStatusJob(jobId: string, fila: 'notifications' | 'reports' | 'emails' | 'scheduled' = 'notifications') {
  let queue;
  
  switch (fila) {
    case 'notifications':
      queue = notificationQueue;
      break;
    case 'reports':
      queue = reportQueue;
      break;
    case 'emails':
      queue = emailQueue;
      break;
    case 'scheduled':
      queue = scheduledQueue;
      break;
  }

  const job = await queue.getJob(jobId);
  
  if (!job) {
    return {
      jobId,
      status: 'not_found',
    };
  }

  const state = await job.getState();
  const progress = job.progress();
  const failedReason = job.failedReason;

  return {
    jobId: job.id,
    name: job.name,
    status: state,
    progress,
    data: job.data,
    result: job.returnvalue,
    failedReason,
    attempts: job.attemptsMade,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
}

/**
 * Cancela um job pendente
 */
export async function cancelarJob(jobId: string, fila: 'notifications' | 'reports' | 'emails' | 'scheduled' = 'notifications') {
  let queue;
  
  switch (fila) {
    case 'notifications':
      queue = notificationQueue;
      break;
    case 'reports':
      queue = reportQueue;
      break;
    case 'emails':
      queue = emailQueue;
      break;
    case 'scheduled':
      queue = scheduledQueue;
      break;
  }

  const job = await queue.getJob(jobId);
  
  if (!job) {
    throw new Error(`Job ${jobId} não encontrado`);
  }

  const state = await job.getState();
  
  if (state === 'active' || state === 'completed') {
    throw new Error(`Não é possível cancelar job em estado: ${state}`);
  }

  await job.remove();
  
  console.log(`❌ Job ${jobId} cancelado`);
  
  return {
    jobId,
    status: 'cancelled',
  };
}

/**
 * Estatísticas das filas
 */
export async function obterEstatisticasFilas() {
  const [notifCounts, reportCounts, emailCounts, scheduledCounts] = await Promise.all([
    notificationQueue.getJobCounts(),
    reportQueue.getJobCounts(),
    emailQueue.getJobCounts(),
    scheduledQueue.getJobCounts(),
  ]);

  return {
    notifications: {
      waiting: notifCounts.waiting,
      active: notifCounts.active,
      completed: notifCounts.completed,
      failed: notifCounts.failed,
      delayed: notifCounts.delayed,
    },
    reports: {
      waiting: reportCounts.waiting,
      active: reportCounts.active,
      completed: reportCounts.completed,
      failed: reportCounts.failed,
      delayed: reportCounts.delayed,
    },
    emails: {
      waiting: emailCounts.waiting,
      active: emailCounts.active,
      completed: emailCounts.completed,
      failed: emailCounts.failed,
      delayed: emailCounts.delayed,
    },
    scheduled: {
      waiting: scheduledCounts.waiting,
      active: scheduledCounts.active,
      completed: scheduledCounts.completed,
      failed: scheduledCounts.failed,
      delayed: scheduledCounts.delayed,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Limpa jobs antigos
 */
export async function limparJobsAntigos(diasAntigos: number = 7) {
  const timestamp = Date.now() - (diasAntigos * 24 * 60 * 60 * 1000);

  const results = await Promise.all([
    notificationQueue.clean(timestamp, 'completed'),
    notificationQueue.clean(timestamp, 'failed'),
    reportQueue.clean(timestamp, 'completed'),
    reportQueue.clean(timestamp, 'failed'),
    emailQueue.clean(timestamp, 'completed'),
    emailQueue.clean(timestamp, 'failed'),
    scheduledQueue.clean(timestamp, 'completed'),
    scheduledQueue.clean(timestamp, 'failed'),
  ]);

  const totalRemovidos = results.reduce((acc, jobs) => acc + jobs.length, 0);

  console.log(`🧹 ${totalRemovidos} jobs antigos removidos (>${diasAntigos} dias)`);

  return {
    removidos: totalRemovidos,
    diasAntigos,
  };
}

export default {
  adicionarNotificacao,
  adicionarRelatorio,
  adicionarEmail,
  agendarJob,
  buscarStatusJob,
  cancelarJob,
  obterEstatisticasFilas,
  limparJobsAntigos,
};
