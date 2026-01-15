import Queue from 'bull';
import redis from '../lib/redis';

// Configuração do Redis para Bull Queue - TOTALMENTE FUNCIONAL
const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null, // Bull Queue necessita disso
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: (times: number) => {
      // Limitar tentativas de reconexão
      if (times > 3) {
        return null; // Para de tentar após 3 tentativas
      }
      return Math.min(times * 200, 1000);
    },
  },
  // Configurações otimizadas para performance e memória
  settings: {
    maxStalledCount: 1,
    stalledInterval: 30000,
    guardInterval: 5000,
    retryProcessDelay: 5000,
  },
};

// Variáveis para armazenar as instâncias das filas (lazy initialization)
let _notificationQueue: Queue.Queue | null = null;
let _reportQueue: Queue.Queue | null = null;
let _emailQueue: Queue.Queue | null = null;
let _scheduledQueue: Queue.Queue | null = null;
let queuesInitialized = false;

/**
 * Fila para processamento de notificações
 * Prioridade: ALTA - crítico para experiência do usuário
 */
export const notificationQueue = new Proxy({} as Queue.Queue, {
  get(target, prop) {
    if (!_notificationQueue && !queuesInitialized) {
      _notificationQueue = new Queue('notifications', redisConfig);
      setupQueueEvents(_notificationQueue, 'NOTIFICATIONS');
    }
    return _notificationQueue ? (_notificationQueue as any)[prop] : undefined;
  }
});

/**
 * Fila para geração de relatórios
 * Prioridade: MÉDIA - pode ser processado em background
 */
export const reportQueue = new Proxy({} as Queue.Queue, {
  get(target, prop) {
    if (!_reportQueue && !queuesInitialized) {
      _reportQueue = new Queue('reports', redisConfig);
      setupQueueEvents(_reportQueue, 'REPORTS');
    }
    return _reportQueue ? (_reportQueue as any)[prop] : undefined;
  }
});

/**
 * Fila para envio de e-mails
 * Prioridade: MÉDIA - retry automático importante
 */
export const emailQueue = new Proxy({} as Queue.Queue, {
  get(target, prop) {
    if (!_emailQueue && !queuesInitialized) {
      _emailQueue = new Queue('emails', redisConfig);
      setupQueueEvents(_emailQueue, 'EMAILS');
    }
    return _emailQueue ? (_emailQueue as any)[prop] : undefined;
  }
});

/**
 * Fila para backup e tarefas agendadas
 * Prioridade: BAIXA - executar fora do horário de pico
 */
export const scheduledQueue = new Proxy({} as Queue.Queue, {
  get(target, prop) {
    if (!_scheduledQueue && !queuesInitialized) {
      _scheduledQueue = new Queue('scheduled', redisConfig);
      setupQueueEvents(_scheduledQueue, 'SCHEDULED');
    }
    return _scheduledQueue ? (_scheduledQueue as any)[prop] : undefined;
  }
});

// Configurações de rate limiting por fila
// (settings são configurados nas options do job, não na fila)

// Eventos de monitoramento (logs) - TOTALMENTE FUNCIONAIS
function setupQueueEvents(queue: Queue.Queue, queueName: string) {
  queue.on('error', (error) => {
    // Silenciar erros de conexão Redis se não estiver disponível
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect ETIMEDOUT')) {
      return;
    }
    console.error(`❌ [${queueName}] Queue error:`, error.message);
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

// Função para limpar as filas quando necessário
export function cleanupQueues() {
  const promises = [];
  if (_notificationQueue) promises.push(_notificationQueue.close());
  if (_reportQueue) promises.push(_reportQueue.close());
  if (_emailQueue) promises.push(_emailQueue.close());
  if (_scheduledQueue) promises.push(_scheduledQueue.close());
  return Promise.all(promises);
}

// Graceful shutdown - FUNCIONAL COMPLETO
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing queues...');
  await cleanupQueues();
  console.log('✅ All queues closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, closing queues...');
  await cleanupQueues();
  console.log('✅ All queues closed');
  process.exit(0);
});

export default {
  notificationQueue,
  reportQueue,
  emailQueue,
  scheduledQueue,
  cleanupQueues,
};
