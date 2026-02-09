/**
 * REDIS HÍBRIDO - LOCAL + UPSTASH
 * 
 * Sistema inteligente que usa:
 * - Redis Local (Docker): Para cache rápido e desenvolvimento (latência ~1ms)
 * - Upstash Cloud: Para persistência, backup e produção (global, escalável)
 * 
 * Funcionalidades:
 * - Failover automático entre local e cloud
 * - Sincronização bidirecional (opcional)
 * - Priorização inteligente (local para leitura, ambos para escrita)
 * - Monitoramento de saúde contínuo
 * - Sem single point of failure
 */

import Redis from 'ioredis';
import { log } from './logger';

// Configurações
const SYNC_ENABLED = process.env.REDIS_SYNC_ENABLED === 'true';
const WRITE_BOTH = process.env.REDIS_WRITE_BOTH === 'true' || true; // Escrever em ambos por padrão
const READ_PREFERENCE = process.env.REDIS_READ_PREFERENCE || 'local'; // 'local' | 'cloud' | 'both'

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  username?: string;
  tls?: { rejectUnauthorized: boolean };
  maxRetriesPerRequest: number;
  enableReadyCheck: boolean;
  retryStrategy: (times: number) => number | null;
}

export class HybridRedisManager {
  private localRedis: Redis | null = null;
  private cloudRedis: Redis | null = null;
  private localHealthy: boolean = false;
  private cloudHealthy: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private initialized: boolean = false;

  constructor() {
    // Inicialização agora é explícita via initialize()
  }

  /**
   * Inicializar conexões (deve ser chamado antes de usar)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    await this.initializeConnections();
    this.startHealthChecks();
    this.initialized = true;
  }

  /**
   * Inicializar conexões Local e Cloud
   */
  private async initializeConnections() {
    // 1. Redis Local (Docker)
    try {
      const localUrl = process.env.REDIS_URL;
      if (localUrl) {
        const url = new URL(localUrl);
        const config: RedisConfig = {
          host: url.hostname,
          port: parseInt(url.port) || 6379,
          password: url.password ? decodeURIComponent(url.password) : undefined,
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          retryStrategy: (times) => {
            if (times > 3) return null;
            return Math.min(times * 200, 1000);
          },
        };

        this.localRedis = new Redis(config);
        
        this.localRedis.on('connect', () => {
          this.localHealthy = true;
          log.info({ component: 'redis-hybrid' }, '✅ Redis Local conectado');
        });

        this.localRedis.on('error', (err) => {
          this.localHealthy = false;
          log.warn({ component: 'redis-hybrid', err }, '⚠️  Redis Local erro');
        });

        await this.localRedis.ping();
        log.info({ component: 'redis-hybrid' }, '🐳 Redis Local inicializado (Docker)');
      }
    } catch (error: any) {
      log.warn({ component: 'redis-hybrid' }, `Redis Local não disponível: ${error.message}`);
    }

    // 2. Redis Cloud (Upstash)
    try {
      const cloudUrl = process.env.UPSTASH_REDIS_URL;
      if (cloudUrl) {
        const url = new URL(cloudUrl);
        const isUpstash = cloudUrl.includes('upstash.io');
        const config: RedisConfig = {
          host: url.hostname,
          port: parseInt(url.port) || 6379,
          password: url.password ? decodeURIComponent(url.password) : undefined,
          username: isUpstash && url.username ? url.username : undefined,
          tls: url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          retryStrategy: (times) => {
            if (times > 5) return null;
            return Math.min(times * 500, 2000);
          },
        };

        this.cloudRedis = new Redis(config);

        this.cloudRedis.on('connect', () => {
          this.cloudHealthy = true;
          log.info({ component: 'redis-hybrid' }, '✅ Redis Cloud conectado');
        });

        this.cloudRedis.on('error', (err) => {
          this.cloudHealthy = false;
          log.warn({ component: 'redis-hybrid', err }, '⚠️  Redis Cloud erro');
        });

        await this.cloudRedis.ping();
        log.info({ component: 'redis-hybrid' }, '☁️  Redis Cloud inicializado (Upstash)');
      }
    } catch (error: any) {
      log.warn({ component: 'redis-hybrid' }, `Redis Cloud não disponível: ${error.message}`);
    }

    // Validar que pelo menos um está disponível
    if (!this.localRedis && !this.cloudRedis) {
      throw new Error('Nenhum Redis disponível! Configure REDIS_URL ou UPSTASH_REDIS_URL');
    }

    log.info({ 
      component: 'redis-hybrid',
      local: !!this.localRedis,
      cloud: !!this.cloudRedis,
      sync: SYNC_ENABLED
    }, '🔄 Redis Híbrido inicializado');
  }

  /**
   * Health checks contínuos
   */
  private startHealthChecks() {
    this.healthCheckInterval = setInterval(async () => {
      if (this.localRedis) {
        try {
          await this.localRedis.ping();
          if (!this.localHealthy) {
            this.localHealthy = true;
            log.info({ component: 'redis-hybrid' }, '✅ Redis Local recuperado');
          }
        } catch {
          if (this.localHealthy) {
            this.localHealthy = false;
            log.warn({ component: 'redis-hybrid' }, '❌ Redis Local indisponível');
          }
        }
      }

      if (this.cloudRedis) {
        try {
          await this.cloudRedis.ping();
          if (!this.cloudHealthy) {
            this.cloudHealthy = true;
            log.info({ component: 'redis-hybrid' }, '✅ Redis Cloud recuperado');
          }
        } catch {
          if (this.cloudHealthy) {
            this.cloudHealthy = false;
            log.warn({ component: 'redis-hybrid' }, '❌ Redis Cloud indisponível');
          }
        }
      }
    }, 30000); // A cada 30 segundos
  }

  /**
   * Garantir que está inicializado antes de operações
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * GET com fallback inteligente
   */
  async get(key: string): Promise<string | null> {
    await this.ensureInitialized();
    
    const preference = READ_PREFERENCE;

    try {
      // Tentar local primeiro (mais rápido)
      if (preference === 'local' || preference === 'both') {
        if (this.localHealthy && this.localRedis) {
          const value = await this.localRedis.get(key);
          if (value !== null) {
            return value;
          }
        }
      }

      // Fallback para cloud
      if (this.cloudHealthy && this.cloudRedis) {
        const value = await this.cloudRedis.get(key);
        
        // Se encontrou no cloud mas não no local, sincronizar
        if (value !== null && SYNC_ENABLED && this.localHealthy && this.localRedis) {
          await this.localRedis.set(key, value).catch(() => {});
        }
        
        return value;
      }

      return null;
    } catch (error: any) {
      log.error({ component: 'redis-hybrid', key, err: error }, 'Erro no GET');
      return null;
    }
  }

  /**
   * SET com escrita dupla (opcional)
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    await this.ensureInitialized();
    
    const promises: Promise<any>[] = [];

    // Escrever no local
    if (this.localHealthy && this.localRedis) {
      const promise = ttl
        ? this.localRedis.setex(key, ttl, value)
        : this.localRedis.set(key, value);
      promises.push(promise);
    }

    // Escrever no cloud (se WRITE_BOTH estiver habilitado)
    if (WRITE_BOTH && this.cloudHealthy && this.cloudRedis) {
      const promise = ttl
        ? this.cloudRedis.setex(key, ttl, value)
        : this.cloudRedis.set(key, value);
      promises.push(promise);
    }

    if (promises.length === 0) {
      throw new Error('Nenhum Redis disponível para escrita');
    }

    // Executar em paralelo, mas não falhar se um der erro
    await Promise.allSettled(promises);
  }

  /**
   * DEL com deleção dupla
   */
  async del(key: string): Promise<void> {
    await this.ensureInitialized();
    
    const promises: Promise<any>[] = [];

    if (this.localHealthy && this.localRedis) {
      promises.push(this.localRedis.del(key));
    }

    if (WRITE_BOTH && this.cloudHealthy && this.cloudRedis) {
      promises.push(this.cloudRedis.del(key));
    }

    await Promise.allSettled(promises);
  }

  /**
   * EXISTS com verificação em ambos
   */
  async exists(key: string): Promise<boolean> {
    await this.ensureInitialized();
    
    try {
      if (this.localHealthy && this.localRedis) {
        const exists = await this.localRedis.exists(key);
        if (exists) return true;
      }

      if (this.cloudHealthy && this.cloudRedis) {
        const exists = await this.cloudRedis.exists(key);
        return exists > 0;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Obter cliente Redis preferencial
   */
  async getClient(): Promise<Redis> {
    await this.ensureInitialized();
    
    if (this.localHealthy && this.localRedis) {
      return this.localRedis;
    }
    if (this.cloudHealthy && this.cloudRedis) {
      return this.cloudRedis;
    }
    throw new Error('Nenhum Redis disponível');
  }

  /**
   * Obter ambos os clientes (para operações avançadas)
   */
  async getClients(): Promise<{ local: Redis | null; cloud: Redis | null }> {
    await this.ensureInitialized();
    
    return {
      local: this.localRedis,
      cloud: this.cloudRedis,
    };
  }

  /**
   * Status de saúde
   */
  getHealth() {
    return {
      local: {
        available: !!this.localRedis,
        healthy: this.localHealthy,
      },
      cloud: {
        available: !!this.cloudRedis,
        healthy: this.cloudHealthy,
      },
      anyAvailable: this.localHealthy || this.cloudHealthy,
    };
  }

  /**
   * Cleanup
   */
  async disconnect() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    const promises: Promise<any>[] = [];
    if (this.localRedis) promises.push(this.localRedis.quit());
    if (this.cloudRedis) promises.push(this.cloudRedis.quit());

    await Promise.allSettled(promises);
  }
}

// Singleton - instância única do gerenciador
let hybridRedisInstance: HybridRedisManager | null = null;

export function getHybridRedis(): HybridRedisManager {
  if (!hybridRedisInstance) {
    hybridRedisInstance = new HybridRedisManager();
    // Inicializar automaticamente no primeiro uso
    hybridRedisInstance.initialize().catch((error) => {
      log.error({ component: 'redis-hybrid', err: error }, 'Erro ao inicializar Redis híbrido');
    });
  }
  return hybridRedisInstance;
}

// Export default como instância singleton
const defaultInstance = getHybridRedis();
export default defaultInstance;
