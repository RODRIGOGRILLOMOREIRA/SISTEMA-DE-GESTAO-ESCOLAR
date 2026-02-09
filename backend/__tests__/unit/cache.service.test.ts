/**
 * Testes unitários para o serviço de cache (CacheService)
 * @description Testa funcionalidades de cache com Redis
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock do Redis ANTES de importar o service
jest.mock('../../src/lib/redis', () => ({
  redisGet: jest.fn<() => Promise<string | null>>(),
  redisSet: jest.fn<() => Promise<string>>(),
  redisDel: jest.fn<() => Promise<number>>(),
  redisExists: jest.fn<() => Promise<number>>(),
  redisIncr: jest.fn<() => Promise<number>>(),
  redisExpire: jest.fn<() => Promise<number>>(),
  isRedisConnected: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
  getRedisClient: jest.fn<() => Promise<any>>(),
}));

import { cacheService } from '../../src/services/cache.service';
import { redisSet, redisGet, redisDel, getRedisClient } from '../../src/lib/redis';

describe('CacheService - Testes Unitários', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('set()', () => {
    it('deve armazenar um valor no cache com sucesso', async () => {
      const key = 'test:key';
      const value = { id: 1, name: 'Test' };
      const ttl = 3600;

      (redisSet as any).mockResolvedValue('OK');

      await cacheService.set(key, value, ttl);

      expect(redisSet).toHaveBeenCalledWith(key, JSON.stringify(value), ttl);
    });

    it('deve lidar com erro ao armazenar sem lançar exceção', async () => {
      const key = 'test:key';
      const value = { id: 1 };

      (redisSet as any).mockRejectedValue(new Error('Redis error'));

      // Não deve lançar erro
      await expect(cacheService.set(key, value)).resolves.not.toThrow();
    });
  });

  describe('get()', () => {
    it('deve recuperar um valor do cache com sucesso', async () => {
      const key = 'test:key';
      const cachedValue = { id: 1, name: 'Test' };

      (redisGet as any).mockResolvedValue(JSON.stringify(cachedValue));

      const result = await cacheService.get<typeof cachedValue>(key);

      expect(result).toEqual(cachedValue);
      expect(redisGet).toHaveBeenCalledWith(key);
    });

    it('deve retornar null quando a chave não existe', async () => {
      const key = 'test:nonexistent';

      (redisGet as any).mockResolvedValue(null);

      const result = await cacheService.get(key);

      expect(result).toBeNull();
    });

    it('deve retornar null quando houver erro ao recuperar', async () => {
      const key = 'test:key';

      (redisGet as any).mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.get(key);

      expect(result).toBeNull();
    });
  });

  describe('delete()', () => {
    it('deve deletar uma chave do cache com sucesso', async () => {
      const key = 'test:key';

      (redisDel as any).mockResolvedValue(1);

      await cacheService.delete(key);

      expect(redisDel).toHaveBeenCalledWith(key);
    });

    it('deve lidar com erro ao deletar sem lançar exceção', async () => {
      const key = 'test:key';

      (redisDel as any).mockRejectedValue(new Error('Redis error'));

      // Não deve lançar erro
      await expect(cacheService.delete(key)).resolves.not.toThrow();
    });
  });

  describe('invalidate()', () => {
    it('deve invalidar cache por padrão específico', async () => {
      const pattern = 'test:*';
      const mockKeys = ['test:1', 'test:2', 'test:3'];

      // Mock do cliente Redis com método keys
      const mockClient = {
        keys: jest.fn<any>().mockResolvedValue(mockKeys)
      };
      
      const getRedisClient = require('../../src/lib/redis').getRedisClient;
      (getRedisClient as any).mockResolvedValue(mockClient);
      (redisDel as any).mockResolvedValue(1);

      await cacheService.invalidate(pattern);

      expect(mockClient.keys).toHaveBeenCalledWith(pattern);
      expect(redisDel).toHaveBeenCalledTimes(mockKeys.length);
    });

    it('deve continuar mesmo se houver erro', async () => {
      const pattern = 'test:*';

      const getRedisClient = require('../../src/lib/redis').getRedisClient;
      (getRedisClient as any).mockRejectedValue(new Error('Redis error'));

      // Não deve lançar erro
      await expect(cacheService.invalidate(pattern)).resolves.not.toThrow();
    });
  });
});

