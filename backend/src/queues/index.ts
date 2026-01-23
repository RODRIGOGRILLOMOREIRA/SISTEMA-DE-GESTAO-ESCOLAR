import Queue from 'bull';
import { log } from '../lib/logger';

/**
 * ========================================
 * SISTEMA DE FILAS BULL - INICIALIZAÇÃO PROFISSIONAL
 * ========================================
 * 
 * Gerenciamento robusto de filas com:
 * - Verificação de disponibilidade do Redis antes de criar filas
 * - Lazy initialization controlada
 * - Tratamento de erros gracioso
 * - Suporte a múltiplos ambientes (Docker local + Upstash Cloud)
 * - Prevenção de criação múltipla de instâncias
 */

// Estado de inicialização
let queuesInitialized = false;
let redisAvailable = false;
let initializationPromise: Promise<boolean> | null = null;

// Instâncias das filas (singleton)
let _notificationQueue: Queue.Queue | null = null;
let _reportQueue: Queue.Queue | null = null;
let _emailQueue: Queue.Queue | null = null;
let _scheduledQueue: Queue.Queue | null = null;

/**
 * Obter configuração do Redis com detecção automática
 * Prioriza REDIS_URL (Docker local) sobre UPSTASH_REDIS_URL (Cloud)
 */
const getRedisConfig = () => {
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
  
  if (redisUrl) {
    const url = new URL(redisUrl);
    const isUpstash = redisUrl.includes('upstash.io');
    const isTLS = url.protocol === 'rediss:';
    
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password ? decodeURIComponent(url.password) : (isUpstash ? '' : 'Dev@Redis123'),
      username: isUpstash && url.username ? url.username : undefined,
      tls: isTLS ? {
        rejectUnauthorized: false,
      } : undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: false,
      retryStrategy: (times: number) => {
        if (times > 3) return null;
        return Math.min(times * 200, 1000);
      },
    };
  }
  
  // Fallback para Docker local
  return {
    host: 'localhost',
    port: 6379,
    password: 'Dev@Redis123',
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: false,
    retryStrategy: (times: number) => {
      if (times > 3) return null;
      return Math.min(times * 200, 1000);
    },
  };
};

const redisConfig = {
  redis: getRedisConfig(),
  settings: {
    maxStalledCount: 1,
    stalledInterval: 30000,
    guardInterval: 5000,
    retryProcessDelay: 5000,
  },
};

/**
 * Verificar se Redis está disponível antes de criar filas
 */
async function checkRedisAvailability(): Promise<boolean> {
  try {
    const Redis = require('ioredis');
    const testClient = new Redis(redisConfig.redis);
    
    await testClient.ping();
    await testClient.quit();
    
    return true;
  } catch (error: any) {
    log.warn({ component: 'queues', err: error }, 'Redis não disponível para filas Bull');
    return false;
  }
}

/**
 * Inicializar todas as filas de forma controlada e segura
 * Retorna true se foi bem-sucedido, false caso contrário
 */
export async function initializeQueues(): Promise<boolean> {
  // Evita múltiplas inicializações simultâneas
  if (initializationPromise) {
    return initializationPromise;
  }
  
  // Se já foi inicializado, retorna o status
  if (queuesInitialized) {
    return redisAvailable;
  }
  
  initializationPromise = (async () => {
    try {
      // Verificar disponibilidade do Redis
      redisAvailable = await checkRedisAvailability();
      
      if (!redisAvailable) {
        log.warn({ component: 'queues' }, 'Filas Bull desabilitadas - Redis não disponível');
        return false;
      }
      
      // Criar filas
      _notificationQueue = new Queue('notifications', redisConfig);
      _reportQueue = new Queue('reports', redisConfig);
      _emailQueue = new Queue('emails', redisConfig);
      _scheduledQueue = new Queue('scheduled', redisConfig);
      
      // Configurar eventos
      setupQueueEvents(_notificationQueue, 'NOTIFICATIONS');
      setupQueueEvents(_reportQueue, 'REPORTS');
      setupQueueEvents(_emailQueue, 'EMAILS');
      setupQueueEvents(_scheduledQueue, 'SCHEDULED');
      
      queuesInitialized = true;
      log.info({ component: 'queues' }, '✅ Filas Bull inicializadas com sucesso');
      
      return true;
    } catch (error: any) {
      log.error({ component: 'queues', err: error }, 'Erro ao inicializar filas Bull');
      return false;
    } finally {
      initializationPromise = null;
    }
  })();
  
  return initializationPromise;
}

/**
 * Verificar se as filas estão prontas para uso
 */
export function areQueuesReady(): boolean {
  return queuesInitialized && redisAvailable;
}

/**
 * Obter fila de notificações de forma segura
 * Retorna null se as filas não estiverem disponíveis
 */
export function getNotificationQueue(): Queue.Queue | null {
  if (!areQueuesReady()) {
    log.warn({ component: 'queues' }, 'Tentativa de acessar notificationQueue sem inicialização');
    return null;
  }
  return _notificationQueue;
}

/**
 * Obter fila de relatórios de forma segura
 */
export function getReportQueue(): Queue.Queue | null {
  if (!areQueuesReady()) {
    log.warn({ component: 'queues' }, 'Tentativa de acessar reportQueue sem inicialização');
    return null;
  }
  return _reportQueue;
}

/**
 * Obter fila de emails de forma segura
 */
export function getEmailQueue(): Queue.Queue | null {
  if (!areQueuesReady()) {
    log.warn({ component: 'queues' }, 'Tentativa de acessar emailQueue sem inicialização');
    return null;
  }
  return _emailQueue;
}

/**
 * Obter fila de tarefas agendadas de forma segura
 */
export function getScheduledQueue(): Queue.Queue | null {
  if (!areQueuesReady()) {
    log.warn({ component: 'queues' }, 'Tentativa de acessar scheduledQueue sem inicialização');
    return null;
  }
  return _scheduledQueue;
}

/**
 * Exports legados para compatibilidade (deprecated - use get*Queue())
 * Mantidos por retrocompatibilidade mas com aviso
 */
export const notificationQueue = new Proxy({} as Queue.Queue, {
  get(target, prop) {
    const queue = getNotificationQueue();
    if (!queue) {
      log.warn({ component: 'queues' }, 'notificationQueue acessado mas não disponível');
      return undefined;
    }
    return (queue as any)[prop];
  }
});

export const reportQueue = new Proxy({} as Queue.Queue, {
  get(target, prop) {
    const queue = getReportQueue();
    if (!queue) {
      log.warn({ component: 'queues' }, 'reportQueue acessado mas não disponível');
      return undefined;
    }
    return (queue as any)[prop];
  }
});

export const emailQueue = new Proxy({} as Queue.Queue, {
  get(target, prop) {
    const queue = getEmailQueue();
    if (!queue) {
      log.warn({ component: 'queues' }, 'emailQueue acessado mas não disponível');
      return undefined;
    }
    return (queue as any)[prop];
  }
});

export const scheduledQueue = new Proxy({} as Queue.Queue, {
  get(target, prop) {
    const queue = getScheduledQueue();
    if (!queue) {
      log.warn({ component: 'queues' }, 'scheduledQueue acessado mas não disponível');
      return undefined;
    }
    return (queue as any)[prop];
  }
});


// Configurações de rate limiting por fila
// (settings são configurados nas options do job, não na fila)

/**
 * Configurar eventos de monitoramento para uma fila
 * Logs estruturados para observabilidade completa
 */
function setupQueueEvents(queue: Queue.Queue, queueName: string) {
  queue.on('error', (error) => {
    // Silenciar erros de conexão Redis esperados
    if (error.message.includes('ECONNREFUSED') || 
        error.message.includes('connect ETIMEDOUT') ||
        error.message.includes('ENOTFOUND')) {
      return;
    }
    log.error({ component: 'queues', queue: queueName, err: error }, `Queue error`);
  });

  queue.on('waiting', (jobId) => {
    log.debug({ component: 'queues', queue: queueName, jobId }, 'Job waiting');
  });

  queue.on('active', (job) => {
    log.info({ component: 'queues', queue: queueName, jobId: job.id, jobName: job.name }, 'Job active');
  });

  queue.on('completed', (job, result) => {
    log.info({ component: 'queues', queue: queueName, jobId: job.id, result }, 'Job completed');
  });

  queue.on('failed', (job, error) => {
    log.error({ 
      component: 'queues', 
      queue: queueName, 
      jobId: job?.id, 
      err: error 
    }, 'Job failed');
  });

  queue.on('stalled', (job) => {
    log.warn({ component: 'queues', queue: queueName, jobId: job.id }, 'Job stalled');
  });

  queue.on('progress', (job, progress) => {
    log.debug({ component: 'queues', queue: queueName, jobId: job.id, progress }, 'Job progress');
  });
}

/**
 * Limpar e fechar todas as filas gracefully
 */
export async function cleanupQueues(): Promise<void> {
  if (!queuesInitialized) {
    return;
  }
  
  log.info({ component: 'queues' }, 'Encerrando filas Bull...');
  
  const promises: Promise<void>[] = [];
  
  if (_notificationQueue) {
    promises.push(_notificationQueue.close());
  }
  if (_reportQueue) {
    promises.push(_reportQueue.close());
  }
  if (_emailQueue) {
    promises.push(_emailQueue.close());
  }
  if (_scheduledQueue) {
    promises.push(_scheduledQueue.close());
  }
  
  await Promise.allSettled(promises);
  
  _notificationQueue = null;
  _reportQueue = null;
  _emailQueue = null;
  _scheduledQueue = null;
  queuesInitialized = false;
  redisAvailable = false;
  
  log.info({ component: 'queues' }, '✅ Todas as filas fechadas');
}


/**
 * Graceful shutdown handlers
 */
process.on('SIGTERM', async () => {
  log.info({ component: 'queues' }, 'SIGTERM recebido, encerrando filas...');
  await cleanupQueues();
  process.exit(0);
});

process.on('SIGINT', async () => {
  log.info({ component: 'queues' }, 'SIGINT recebido, encerrando filas...');
  await cleanupQueues();
  process.exit(0);
});

/**
 * Exports principais
 */
export default {
  initializeQueues,
  areQueuesReady,
  getNotificationQueue,
  getReportQueue,
  getEmailQueue,
  getScheduledQueue,
  notificationQueue,
  reportQueue,
  emailQueue,
  scheduledQueue,
  cleanupQueues,
};
