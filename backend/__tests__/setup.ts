/**
 * Setup global para testes Jest
 * Configuração de mocks e variáveis de ambiente
 */

import '@jest/globals';

// Mock de variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5433/test_db';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.UPSTASH_REDIS_URL = 'redis://localhost:6379';
process.env.UPSTASH_REDIS_TOKEN = 'test-token';

// Configuração global de timeout
jest.setTimeout(10000);

// Mock do logger para evitar poluição nos testes
jest.mock('../src/lib/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  logInfo: jest.fn(),
  logError: jest.fn(),
  logWarn: jest.fn(),
  logDebug: jest.fn(),
}));

// Limpar todos os mocks antes de cada teste
beforeEach(() => {
  jest.clearAllMocks();
});

// Cleanup após todos os testes
afterAll(async () => {
  // Aguardar um pouco para garantir que conexões sejam fechadas
  await new Promise(resolve => setTimeout(resolve, 500));
});
