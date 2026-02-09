/**
 * Sistema de Cache para Frontend
 * Reduz chamadas desnecessárias à API
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos

  /**
   * Armazena dados no cache
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl,
    });
  }

  /**
   * Recupera dados do cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > entry.expiresIn;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Remove item do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Limpa cache expirado
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.expiresIn) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Verifica se tem item no cache
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Retorna tamanho do cache
   */
  size(): number {
    return this.cache.size;
  }
}

export const cache = new CacheManager();

/**
 * Hook para cache de dados com React Query-like behavior
 */
interface UseCacheOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  ttl?: number;
  enabled?: boolean;
}

export const useCache = <T>({
  key,
  fetcher,
  ttl,
  enabled = true,
}: UseCacheOptions<T>) => {
  const [data, setData] = React.useState<T | null>(cache.get(key));
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchData = React.useCallback(async () => {
    if (!enabled) return;
    
    // Tentar cache primeiro
    const cached = cache.get<T>(key);
    if (cached) {
      setData(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      cache.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl, enabled]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    cache.delete(key);
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
};

/**
 * Decorator para cache de funções
 */
export const withCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  generateKey: (...args: Parameters<T>) => string,
  ttl?: number
): T => {
  return (async (...args: Parameters<T>) => {
    const key = generateKey(...args);
    const cached = cache.get(key);
    
    if (cached) return cached;
    
    const result = await fn(...args);
    cache.set(key, result, ttl);
    
    return result;
  }) as T;
};

// Auto-cleanup a cada 10 minutos
setInterval(() => {
  cache.clearExpired();
}, 10 * 60 * 1000);

// Limpar cache ao deslogar
export const clearAuthCache = () => {
  cache.clear();
};

import React from 'react';
