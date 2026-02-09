import { Queue, Worker, Job } from 'bullmq';
import { logger } from '../lib/logger';
import communicationService from '../services/communication.service';

// Configuração do Redis via Upstash
const getRedisConnection = () => {
  if (process.env.UPSTASH_REDIS_URL) {
    const url = new URL(process.env.UPSTASH_REDIS_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port),
      password: url.password || '',
      username: url.username || 'default',
      tls: {
        rejectUnauthorized: false,
      },
    };
  }
  return {
    host: 'localhost',
    port: 6379,
  };
};

// Fila para processar mensagens agendadas
export const scheduledMessagesQueue = new Queue('scheduled-messages', {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: {
      age: 24 * 3600, // 24 horas
      count: 100
    },
    removeOnFail: {
      age: 7 * 24 * 3600 // 7 dias
    }
  }
});

// Worker para processar mensagens agendadas
const scheduledMessagesWorker = new Worker(
  'scheduled-messages',
  async (job: Job) => {
    try {
      logger.info(`Processando job de mensagens agendadas: ${job.id}`);
      
      const processed = await communicationService.processScheduledMessages();
      
      logger.info(`Job ${job.id} concluído: ${processed} mensagens processadas`);
      
      return {
        success: true,
        processed
      };
    } catch (error) {
      logger.error(`Erro no job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: getRedisConnection(),
    concurrency: 5
  }
);

// Event handlers
scheduledMessagesWorker.on('completed', (job) => {
  logger.info(`✅ Job ${job.id} completado com sucesso`);
});

scheduledMessagesWorker.on('failed', (job, err) => {
  logger.error(`❌ Job ${job?.id} falhou:`, err);
});

scheduledMessagesWorker.on('error', (err) => {
  logger.error('Erro no worker de mensagens agendadas:', err);
});

/**
 * Agenda job recorrente para processar mensagens
 * Executa a cada 1 minuto
 */
export async function scheduleRecurringJob() {
  try {
    // Remove jobs antigos com o mesmo nome
    await scheduledMessagesQueue.removeRepeatableByKey('scheduled-messages-processor');
    
    // Adiciona job recorrente
    await scheduledMessagesQueue.add(
      'process-scheduled',
      {},
      {
        repeat: {
          pattern: '* * * * *' // A cada minuto
        },
        jobId: 'scheduled-messages-processor'
      }
    );
    
    logger.info('✅ Job recorrente de mensagens agendadas configurado (executa a cada minuto)');
  } catch (error) {
    logger.error('Erro ao configurar job recorrente:', error);
  }
}

/**
 * Agenda envio imediato de uma mensagem específica
 */
export async function scheduleImmediateMessage(messageData: {
  channel: string;
  recipientType: string;
  recipientId?: string;
  recipientIds?: string[];
  templateId?: string;
  content: string;
  subject?: string;
  sentBy: string;
}) {
  try {
    const job = await scheduledMessagesQueue.add(
      'send-immediate',
      messageData,
      {
        priority: 1 // Alta prioridade
      }
    );
    
    logger.info(`Mensagem agendada para envio imediato: ${job.id}`);
    return job.id;
  } catch (error) {
    logger.error('Erro ao agendar mensagem imediata:', error);
    throw error;
  }
}

export { scheduledMessagesWorker };
