/**
 * Serviço de Cache Inteligente
 * Gerencia cache com Redis para otimizar performance
 * 
 * @class CacheService
 * @description Fornece abstração para operações de cache usando Redis
 * com fallback automático caso Redis não esteja disponível
 * 
 * @example
 * ```typescript
 * // Armazenar no cache
 * await cacheService.set('user:123', userData, 3600);
 * 
 * // Buscar do cache
 * const user = await cacheService.get<User>('user:123');
 * 
 * // Invalidar cache por padrão
 * await cacheService.invalidate('user:*');
 * ```
 */

import { redisGet, redisSet, redisDel, redisExists, redisIncr, redisExpire, getRedisClient, isRedisConnected } from '../lib/redis';
import { logInfo, logWarn, logError, logDebug } from '../lib/logger';

class CacheService {
  private isRedisAvailable: boolean = false;

  constructor() {
    // Verificar se Redis está disponível
    this.checkRedisAvailability();
  }

  /**
   * Verifica disponibilidade do Redis
   * @private
   * @returns {Promise<void>}
   */
  private async checkRedisAvailability(): Promise<void> {
    try {
      this.isRedisAvailable = await isRedisConnected();
      if (this.isRedisAvailable) {
        logInfo('Redis disponível', { component: 'cache' });
      } else {
        logWarn('Redis não disponível, cache desabilitado', { component: 'cache' });
      }
    } catch (error) {
      this.isRedisAvailable = false;
      logWarn('Redis não disponível, cache desabilitado', { component: 'cache' });
    }
  }

  /**
   * Armazena valor no cache com TTL configurável
   * 
   * @param {string} key - Chave única para identificar o valor
   * @param {any} value - Valor a ser armazenado (será serializado em JSON)
   * @param {number} [ttlSeconds=300] - Tempo de vida em segundos (padrão: 5 minutos)
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * await cacheService.set('alunos:lista', alunos, 600); // 10 minutos
   * ```
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.isRedisAvailable) return;

    try {
      const serialized = JSON.stringify(value);
      await redisSet(key, serialized, ttlSeconds);
      logDebug(`Cache SET: ${key}`, { component: 'cache', key, ttl: ttlSeconds });
    } catch (error) {
      logError('Erro ao armazenar no cache', error, { component: 'cache', key });
    }
  }

  /**
   * Obtém valor do cache
   * 
   * @template T - Tipo do valor retornado
   * @param {string} key - Chave única do valor
   * @returns {Promise<T | null>} Valor deserializado ou null se não existir
   * 
   * @example
   * ```typescript
   * const alunos = await cacheService.get<Aluno[]>('alunos:lista');
   * if (alunos) {
   *   // Usar dados do cache
   * } else {
   *   // Buscar do banco
   * }
   * ```
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isRedisAvailable) return null;

    try {
      const cached = await redisGet(key);
      
      if (!cached) {
        logDebug(`Cache MISS: ${key}`, { component: 'cache', key });
        return null;
      }

      logDebug(`Cache HIT: ${key}`, { component: 'cache', key });
      return JSON.parse(cached) as T;
    } catch (error) {
      logError('Erro ao buscar do cache', error, { component: 'cache', key });
      return null;
    }
  }

  /**
   * Invalida cache por padrão (wildcard)
   * 
   * @param {string} pattern - Padrão de chaves com wildcard (ex: "alunos:*", "user:123:*")
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * // Invalidar todos os caches de alunos
   * await cacheService.invalidate('alunos:*');
   * 
   * // Invalidar cache de um usuário específico
   * await cacheService.invalidate('user:123:*');
   * ```
   */
  async invalidate(pattern: string): Promise<void> {
    if (!this.isRedisAvailable) return;

    try {
      const client = await getRedisClient();
      const keys = await client.keys(pattern);
      
      if (keys.length > 0) {
        await Promise.all(keys.map(key => redisDel(key)));
        logInfo(`Cache invalidado: ${pattern}`, { component: 'cache', pattern, count: keys.length });
      }
    } catch (error) {
      logError('Erro ao invalidar cache', error, { component: 'cache', pattern });
    }
  }

  /**
   * Deletar uma chave específica
   * @param key Chave a ser deletada
   */
  async delete(key: string): Promise<void> {
    if (!this.isRedisAvailable) return;

    try {
      await redisDel(key);
      console.log(`🗑️ Cache DELETE: ${key}`);
    } catch (error) {
      console.error('❌ Erro ao deletar do cache:', error);
    }
  }

  /**
   * Cache com função de fallback
   * Tenta pegar do cache, se não existir executa a função e armazena o resultado
   * 
   * @param key Chave única
   * @param fetchFn Função para buscar dados (se não estiver no cache)
   * @param ttl Tempo de vida em segundos
   * @returns Dados (do cache ou função)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    // Tentar pegar do cache
    const cached = await this.get<T>(key);
    if (cached) return cached;

    // Se não está no cache, buscar dos dados originais
    const fresh = await fetchFn();
    
    // Armazenar no cache
    await this.set(key, fresh, ttl);
    
    return fresh;
  }

  /**
   * Verificar se uma chave existe
   * @param key Chave a verificar
   * @returns true se existe, false caso contrário
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isRedisAvailable) return false;

    try {
      return await redisExists(key);
    } catch (error) {
      console.error('❌ Erro ao verificar existência no cache:', error);
      return false;
    }
  }

  /**
   * Obter tempo de vida restante de uma chave
   * @param key Chave a verificar
   * @returns Segundos restantes ou -1 se não existir
   */
  async ttl(key: string): Promise<number> {
    if (!this.isRedisAvailable) return -1;

    try {
      const client = await getRedisClient();
      return await client.ttl(key);
    } catch (error) {
      console.error('❌ Erro ao obter TTL do cache:', error);
      return -1;
    }
  }

  /**
   * Limpar todo o cache (usar com cuidado!)
   */
  async flush(): Promise<void> {
    if (!this.isRedisAvailable) return;

    try {
      const client = await getRedisClient();
      await client.flushDb();
      console.log('🗑️ Cache FLUSH: Tudo limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }

  /**
   * Obter estatísticas do cache
   */
  async getStats(): Promise<any> {
    if (!this.isRedisAvailable) {
      return {
        available: false,
        message: 'Redis não disponível',
      };
    }

    try {
      const client = await getRedisClient();
      const info = await client.info('stats');
      const dbSize = await client.dbSize();
      
      return {
        available: true,
        dbSize,
        info: info.split('\n').reduce((acc, line) => {
          const [key, value] = line.split(':');
          if (key && value) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        }, {} as Record<string, string>),
      };
    } catch (error: any) {
      console.error('❌ Erro ao obter stats do cache:', error);
      return {
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Incrementar valor numérico
   * @param key Chave
   * @param increment Valor a incrementar (padrão: 1)
   * @returns Novo valor
   */
  async increment(key: string, increment: number = 1): Promise<number> {
    if (!this.isRedisAvailable) return 0;

    try {
      if (increment === 1) {
        return await redisIncr(key);
      } else {
        const client = await getRedisClient();
        return await client.incrBy(key, increment);
      }
    } catch (error) {
      console.error('❌ Erro ao incrementar no cache:', error);
      return 0;
    }
  }

  /**
   * Armazenar múltiplos valores de uma vez
   * @param entries Array de [chave, valor, ttl?]
   */
  async setMany(entries: Array<[string, any, number?]>): Promise<void> {
    if (!this.isRedisAvailable) return;

    try {
      const client = await getRedisClient();
      const pipeline = client.pipeline();

      for (const [key, value, ttl = 300] of entries) {
        const serialized = JSON.stringify(value);
        pipeline.setEx(key, ttl, serialized);
      }

      await pipeline.exec();
      console.log(`📦 Cache SET MANY: ${entries.length} chaves`);
    } catch (error) {
      console.error('❌ Erro ao armazenar múltiplos valores no cache:', error);
    }
  }

  /**
   * Obter múltiplos valores de uma vez
   * @param keys Array de chaves
   * @returns Array de valores (null para chaves não existentes)
   */
  async getMany<T>(keys: string[]): Promise<Array<T | null>> {
    if (!this.isRedisAvailable) return keys.map(() => null);

    try {
      const client = await getRedisClient();
      const values = await client.mGet(keys);
      
      return values.map((value, index) => {
        if (!value) {
          console.log(`📦 Cache MISS: ${keys[index]}`);
          return null;
        }
        console.log(`📦 Cache HIT: ${keys[index]}`);
        return JSON.parse(value) as T;
      });
    } catch (error) {
      console.error('❌ Erro ao buscar múltiplos valores do cache:', error);
      return keys.map(() => null);
    }
  }
}

export const cacheService = new CacheService();
export default cacheService;
