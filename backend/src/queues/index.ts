import Queue from 'bull';
import redis from '../lib/redis';

// Configuração do Redis para Bull
const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null, // Bull Queue precisa disso
    enableReadyCheck: false,
  },
};

/**
 * Fila para processamento de notificações
 * Prioridade: ALTA - crítico para experiência do usuário
 */
export const notificationQueue = new Queue('notifications', redisConfig);

/**
 * Fila para geração de relatórios
 * Prioridade: MÉDIA - pode ser processado em background
 */
export const reportQueue = new Queue('reports', redisConfig);

/**
 * Fila para envio de e-mails
 * Prioridade: MÉDIA - retry automático importante
 */
export const emailQueue = new Queue('emails', redisConfig);

/**
 * Fila para backup e tarefas agendadas
 * Prioridade: BAIXA - executar fora do horário de pico
 */
export const scheduledQueue = new Queue('scheduled', redisConfig);

// Configurações de rate limiting por fila
// (settings são configurados nas options do job, não na fila)

// Eventos de monitoramento (logs)
function setupQueueEvents(queue: Queue.Queue, queueName: string) {
  queue.on('error', (error) => {
    console.error(`❌ [${queueName}] Queue error:`, error);
  });

  queue.on('waiting', (jobId) => {
    console.log(`⏳ [${queueName}] Job ${jobId} waiting`);
  });

  queue.on('active', (job) => {
    console.log(`▶️  [${queueName}] Job ${job.id} active: ${job.name}`);
  });

  queue.on('completed', (job, result) => {
    console.log(`✅ [${queueName}] Job ${job.id} completed:`, result);
  });

  queue.on('failed', (job, error) => {
    console.error(`❌ [${queueName}] Job ${job?.id} failed:`, error.message);
  });

  queue.on('stalled', (job) => {
    console.warn(`⚠️  [${queueName}] Job ${job.id} stalled`);
  });

  queue.on('progress', (job, progress) => {
    console.log(`📊 [${queueName}] Job ${job.id} progress: ${progress}%`);
  });
}

// Configurar eventos para todas as filas
setupQueueEvents(notificationQueue, 'NOTIFICATIONS');
setupQueueEvents(reportQueue, 'REPORTS');
setupQueueEvents(emailQueue, 'EMAILS');
setupQueueEvents(scheduledQueue, 'SCHEDULED');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing queues...');
  await Promise.all([
    notificationQueue.close(),
    reportQueue.close(),
    emailQueue.close(),
    scheduledQueue.close(),
  ]);
  console.log('✅ All queues closed');
  process.exit(0);
});

export default {
  notificationQueue,
  reportQueue,
  emailQueue,
  scheduledQueue,
};
