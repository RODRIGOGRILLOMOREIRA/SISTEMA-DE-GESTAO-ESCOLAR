import { HybridRedisManager } from './redis-hybrid';
import { log } from './logger';

/**
 * ========================================
 * REDIS HÍBRIDO - Docker Local + Upstash Cloud
 * ========================================
 * 
 * Sistema profissional com redundância e otimização:
 * - Local (Docker): Velocidade (~1ms latência)
 * - Cloud (Upstash): Persistência e backup
 * - Failover automático entre os dois
 * - Health checks contínuos
 * - Sem single point of failure
 */

// Instância singleton do gerenciador híbrido
const hybridRedis = new HybridRedisManager();

// Inicializar conexões
let isInitialized = false;

async function ensureInitialized() {
  if (!isInitialized) {
    await hybridRedis.initialize();
    isInitialized = true;
    log.info({ component: 'redis' }, '✅ Redis híbrido inicializado com sucesso');
  }
}

/**
 * Obter cliente Redis (com failover automático)
 */
export async function getRedisClient() {
  await ensureInitialized();
  return hybridRedis.getClient();
}

/**
 * GET: Buscar valor por chave
 * Prioriza local (mais rápido), faz fallback para cloud
 */
export async function redisGet(key: string): Promise<string | null> {
  await ensureInitialized();
  return hybridRedis.get(key);
}

/**
 * SET: Armazenar valor com TTL opcional
 * Escreve em ambos (local + cloud) se REDIS_WRITE_BOTH=true
 */
export async function redisSet(key: string, value: string, ttl?: number): Promise<void> {
  await ensureInitialized();
  await hybridRedis.set(key, value, ttl);
}

/**
 * DEL: Remover chave
 * Remove de ambos os Redis
 */
export async function redisDel(key: string): Promise<void> {
  await ensureInitialized();
  await hybridRedis.del(key);
}

/**
 * EXISTS: Verificar se chave existe
 */
export async function redisExists(key: string): Promise<boolean> {
  await ensureInitialized();
  return hybridRedis.exists(key);
}

/**
 * INCR: Incrementar contador
 */
export async function redisIncr(key: string): Promise<number> {
  await ensureInitialized();
  const client = await hybridRedis.getClient();
  return await client.incr(key);
}

/**
 * EXPIRE: Definir TTL para chave existente
 */
export async function redisExpire(key: string, seconds: number): Promise<void> {
  await ensureInitialized();
  const client = await hybridRedis.getClient();
  await client.expire(key, seconds);
}

/**
 * Health check: Status de ambos os Redis
 */
export async function getRedisHealth() {
  await ensureInitialized();
  return hybridRedis.getHealth();
}

/**
 * Obter ambos os clientes (local + cloud)
 * Útil para casos especiais que precisam acessar um específico
 */
export async function getRedisClients() {
  await ensureInitialized();
  return hybridRedis.getClients();
}

/**
 * Verificar se está conectado (pelo menos um Redis funcionando)
 */
export async function isRedisConnected(): Promise<boolean> {
  try {
    await ensureInitialized();
    const health = hybridRedis.getHealth();
    return health.local.connected || health.cloud.connected;
  } catch {
    return false;
  }
}

/**
 * Informações detalhadas do sistema
 */
export function getRedisInfo() {
  return {
    type: 'hybrid',
    strategy: {
      read: 'local-first with cloud fallback',
      write: process.env.REDIS_WRITE_BOTH === 'true' ? 'both (local + cloud)' : 'local only',
    },
    health: hybridRedis.getHealth(),
  };
}

// Exportar instância para casos avançados
export { hybridRedis as redis };

// Inicializar automaticamente no carregamento do módulo
ensureInitialized().catch((error) => {
  log.error({ component: 'redis', err: error }, '❌ Falha crítica ao inicializar Redis híbrido');
  // Não lança erro para não quebrar a aplicação durante startup
});

// Graceful shutdown
const shutdown = async () => {
  try {
    const clients = await hybridRedis.getClients();
    
    if (clients.local) {
      await clients.local.quit();
      log.info({ component: 'redis' }, '✅ Redis local desconectado');
    }
    
    if (clients.cloud) {
      await clients.cloud.quit();
      log.info({ component: 'redis' }, '✅ Redis cloud desconectado');
    }
    
    log.info({ component: 'redis' }, '✅ Sistema Redis híbrido encerrado com sucesso');
  } catch (error: any) {
    log.error({ component: 'redis', err: error }, '❌ Erro ao desconectar Redis');
  }
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default hybridRedis;
