/**
 * Testes unitários para validação de variáveis de ambiente
 * @description Testa o sistema de validação com Zod
 */

import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';

// Mock das variáveis de ambiente antes do import
const mockEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  JWT_SECRET: 'test-secret-key-minimum-32-chars-long',
  REDIS_URL: 'redis://localhost:6379',
};

Object.assign(process.env, mockEnv);

describe('Validação de Variáveis de Ambiente', () => {
  const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    REDIS_URL: z.string().url(),
  });

  it('deve validar todas as variáveis obrigatórias corretamente', () => {
    const result = envSchema.safeParse(mockEnv);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NODE_ENV).toBe('test');
      expect(result.data.JWT_SECRET).toBe(mockEnv.JWT_SECRET);
    }
  });

  it('deve falhar se JWT_SECRET for muito curto', () => {
    const invalidEnv = {
      ...mockEnv,
      JWT_SECRET: 'short',
    };

    const result = envSchema.safeParse(invalidEnv);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('JWT_SECRET');
    }
  });

  it('deve falhar se DATABASE_URL estiver ausente', () => {
    const invalidEnv = {
      ...mockEnv,
      DATABASE_URL: '',
    };

    const result = envSchema.safeParse(invalidEnv);

    expect(result.success).toBe(false);
  });

  it('deve aplicar valores padrão quando não fornecidos', () => {
    const minimalEnv = {
      DATABASE_URL: mockEnv.DATABASE_URL,
      JWT_SECRET: mockEnv.JWT_SECRET,
      REDIS_URL: mockEnv.REDIS_URL,
    };

    const result = envSchema.parse(minimalEnv);

    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe('3000');
  });

  it('deve validar formato de URL para REDIS_URL', () => {
    const invalidEnv = {
      ...mockEnv,
      REDIS_URL: 'not-a-valid-url',
    };

    const result = envSchema.safeParse(invalidEnv);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('REDIS_URL');
    }
  });
});
