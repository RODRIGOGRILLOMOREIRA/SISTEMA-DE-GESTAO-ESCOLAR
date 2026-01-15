import Redis from 'ioredis';

// Configuração otimizada do Redis para Windows - mantendo TODAS as funcionalidades
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    // Limitar tentativas de reconexão para evitar consumo excessivo de memória
    if (times > 3) {
      return null; // Para de tentar reconectar após 3 tentativas
    }
    return Math.min(times * 200, 1000);
  },
  lazyConnect: true,
  enableOfflineQueue: false,
  connectTimeout: 5000,
  commandTimeout: 3000,
  keepAlive: 30000,
  db: 0,
  keyPrefix: 'sge:',
  // Otimizações específicas para evitar problemas de memória
  enableReadyCheck: true,
});

// Eventos do Redis com logs informativos
redis.on('connect', () => {
  console.log('✅ Redis: Conectado com sucesso');
});

redis.on('ready', () => {
  console.log('✅ Redis: Pronto para operações');
});

let errorLogged = false;

redis.on('error', (err) => {
  if (!errorLogged) {
    console.log('⚠️ Redis: Não disponível');
    errorLogged = true;
  }
});

redis.on('close', () => {
  // Silenciar logs de close
});

redis.on('reconnecting', () => {
  // Silenciar logs de reconnecting
});

redis.on('connect', () => {
  errorLogged = false;
});

// Conectar ao Redis com tratamento de erro robusto
redis.connect().catch((err) => {
  console.log('🚀 Sistema iniciando... Tentando conectar Redis em segundo plano');
  console.log('📝 Instale Redis para funcionalidades completas: https://redis.io/docs/install/install-windows/');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await redis.quit();
    console.log('✅ Redis desconectado graciosamente');
  } catch (error) {
    console.log('✅ Sistema encerrado');
  }
});

process.on('SIGINT', async () => {
  try {
    await redis.quit();
    console.log('✅ Redis desconectado graciosamente');
  } catch (error) {
    console.log('✅ Sistema encerrado');
  }
  process.exit(0);
});

export default redis;
