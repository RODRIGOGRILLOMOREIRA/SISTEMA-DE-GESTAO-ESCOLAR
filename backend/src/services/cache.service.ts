/**
 * Serviço de Cache Inteligente
 * Gerencia cache com Redis para otimizar performance
 */

import { redisGet, redisSet, redisDel, redisExists, redisIncr, redisExpire, getRedisClient, isRedisConnected } from '../lib/redis';

class CacheService {
  private isRedisAvailable: boolean = false;

  constructor() {
    // Verificar se Redis está disponível
    this.checkRedisAvailability();
  }

  private async checkRedisAvailability() {
    try {
      this.isRedisAvailable = await isRedisConnected();
      if (this.isRedisAvailable) {
        console.log('✅ CacheService: Redis disponível');
      } else {
        console.warn('⚠️ CacheService: Redis não disponível, cache desabilitado');
      }
    } catch (error) {
      this.isRedisAvailable = false;
      console.warn('⚠️ CacheService: Redis não disponível, cache desabilitado');
    }
  }

  /**
   * Armazenar valor no cache
   * @param key Chave única
   * @param value Valor a ser armazenado (será serializado)
   * @param ttlSeconds Tempo de vida em segundos (padrão: 5 minutos)
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.isRedisAvailable) return;

    try {
      const serialized = JSON.stringify(value);
      await redisSet(key, serialized, ttlSeconds);
      console.log(`📦 Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      console.error('❌ Erro ao armazenar no cache:', error);
    }
  }

  /**
   * Obter valor do cache
   * @param key Chave única
   * @returns Valor deserializado ou null se não existir
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isRedisAvailable) return null;

    try {
      const cached = await redisGet(key);
      
      if (!cached) {
        console.log(`📦 Cache MISS: ${key}`);
        return null;
      }

      console.log(`📦 Cache HIT: ${key}`);
      return JSON.parse(cached) as T;
    } catch (error) {
      console.error('❌ Erro ao buscar do cache:', error);
      return null;
    }
  }

  /**
   * Invalidar cache por padrão
   * @param pattern Padrão de chaves (ex: "alunos:*")
   */
  async invalidate(pattern: string): Promise<void> {
    if (!this.isRedisAvailable) return;

    try {
      const client = await getRedisClient();
      const keys = await client.keys(pattern);
      
      if (keys.length > 0) {
        await Promise.all(keys.map(key => redisDel(key)));
        console.log(`🗑️ Cache INVALIDATED: ${pattern} (${keys.length} chaves)`);
      }
    } catch (error) {
      console.error('❌ Erro ao invalidar cache:', error);
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
