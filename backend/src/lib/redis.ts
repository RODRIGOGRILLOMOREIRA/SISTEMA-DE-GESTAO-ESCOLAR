import Redis from 'ioredis';

// Configuração do Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true, // Não conecta automaticamente
});

// Eventos do Redis
redis.on('connect', () => {
  console.log('✅ Redis: Conectando...');
});

redis.on('ready', () => {
  console.log('✅ Redis: Pronto para uso');
});

redis.on('error', (err) => {
  console.error('❌ Redis erro:', err.message);
});

redis.on('close', () => {
  console.log('⚠️ Redis: Conexão fechada');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis: Reconectando...');
});

// Conectar ao Redis (com tratamento de erro)
redis.connect().catch((err) => {
  console.error('❌ Falha ao conectar no Redis:', err.message);
  console.warn('⚠️ Sistema funcionará sem cache');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redis.quit();
});

export default redis;
