import Redis from 'ioredis';

/**
 * ========================================
 * REDIS - UPSTASH CLOUD
 * ========================================
 * 
 * Conexão direta com Upstash Redis Cloud
 * 100% funcional para celular e notebook
 */

let redis: Redis;
let isConnected = false;

// Configuração para Upstash Cloud
const upstashConfig = {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableOfflineQueue: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
  keepAlive: 30000,
  keyPrefix: 'sge:',
  enableReadyCheck: true,
  reconnectOnError: (err: Error) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
};

// Criar instância do Redis com Upstash
if (process.env.UPSTASH_REDIS_URL) {
  const url = new URL(process.env.UPSTASH_REDIS_URL);
  
  redis = new Redis({
    ...upstashConfig,
    host: url.hostname,
    port: parseInt(url.port) || 6379,
    password: url.password || '',
    username: url.username || 'default',
    tls: url.protocol === 'rediss:' ? {
      rejectUnauthorized: false, // Importante para Upstash Cloud
      minVersion: 'TLSv1.2',
    } : undefined,
    family: 4, // Force IPv4 para compatibilidade celular/notebook
    lazyConnect: true, // Conectar de forma lazy para evitar problemas
    showFriendlyErrorStack: true,
  });
  
  console.log('☁️ Configurando Upstash Redis Cloud...');
  console.log(`   Host: ${url.hostname}`);
  console.log(`   Port: ${url.port || 6379}`);
  console.log(`   TLS: ${url.protocol === 'rediss:' ? 'Ativado' : 'Desativado'}`);
  
  // Conectar de forma assíncrona
  redis.connect().catch((err) => {
    console.error('❌ Erro ao conectar ao Upstash:', err.message);
  });
} else {
  // Erro se não tiver Upstash configurado
  console.error('❌ UPSTASH_REDIS_URL não configurado no .env');
  console.error('   Configure a URL do Upstash para usar Redis');
  console.error('   Formato: rediss://default:senha@host.upstash.io:6379');
  
  // Criar instância fake para não quebrar a aplicação
  redis = new Redis({
    host: 'localhost',
    port: 6379,
    lazyConnect: true,
    maxRetriesPerRequest: null,
    retryStrategy: () => null, // Não tentar reconectar
  });
}

// Eventos de conexão
redis.on('connect', () => {
  console.log('🔄 Redis: Conectando...');
});

redis.on('ready', () => {
  isConnected = true;
  console.log('✅ Redis: Conectado e pronto!');
  console.log('🎮 Gamificação ATIVA');
  console.log('🔍 Busca Autocomplete ATIVA');
  console.log('👥 Presença Online ATIVA');
  console.log('💬 Chat em Tempo Real ATIVO');
  console.log('📊 Dashboard Ao Vivo ATIVO');
});

redis.on('error', (err: Error) => {
  if (!isConnected) {
    console.error('❌ Redis: Erro de conexão');
    console.error('   Mensagem:', err.message);
    console.log('');
    console.log('📝 Verifique:');
    console.log('   1. UPSTASH_REDIS_URL no .env está correto');
    console.log('   2. URL completa: rediss://default:senha@host:port');
    console.log('   3. Porta é 6379 para Upstash');
    console.log('   4. Protocolo é rediss:// (com dois s)');
  }
});

redis.on('close', () => {
  isConnected = false;
  console.log('⚠️ Redis: Conexão fechada');
});

redis.on('reconnecting', (delay: number) => {
  console.log(`🔄 Redis: Reconectando em ${delay}ms...`);
});

// Teste de conexão inicial
redis.ping()
  .then(() => {
    console.log('✅ Teste de conexão Redis: SUCESSO');
  })
  .catch((err) => {
    console.error('❌ Teste de conexão Redis: FALHOU');
    console.error('   Configure UPSTASH_REDIS_URL no .env');
  });

// Graceful shutdown
const shutdown = async () => {
  try {
    await redis.quit();
    console.log('✅ Redis desconectado graciosamente');
  } catch (error) {
    console.log('✅ Sistema encerrado');
  }
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Helper para verificar se está conectado
export const isRedisConnected = () => isConnected;

// Helper para obter informações
export const getRedisInfo = () => ({
  isConnected,
  status: redis.status,
  host: process.env.UPSTASH_REDIS_URL ? 'Upstash Cloud' : 'Local',
});

export default redis;
