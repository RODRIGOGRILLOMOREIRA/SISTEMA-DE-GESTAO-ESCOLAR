/**
 * Rate Limiting por Usuário - Prioridade 3
 * Sistema avançado com limites personalizados por role e usuário
 * 
 * @module middlewares/user-rate-limit
 * @description Implementa rate limiting específico por userId com limites diferenciados por perfil
 */

import rateLimit, { type Options as RateLimitOptions } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Request, Response, NextFunction } from 'express';
import redis from '../lib/redis';
import { log, securityLogger } from '../lib/logger';

/**
 * Configuração de limites por role
 * Define quantas requisições cada tipo de usuário pode fazer
 */
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

/**
 * Limites por role (requisições por minuto)
 * ADMIN: 500 req/min
 * DIRETOR: 300 req/min  
 * COORDENADOR: 200 req/min
 * PROFESSOR: 150 req/min
 * RESPONSAVEL: 100 req/min
 * ALUNO: 80 req/min
 * DEFAULT: 50 req/min (não autenticado)
 */
const RATE_LIMITS_BY_ROLE: Record<string, RateLimitConfig> = {
  ADMIN: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 500,
    message: 'Limite de requisições excedido para administrador. Aguarde 1 minuto.'
  },
  DIRETOR: {
    windowMs: 1 * 60 * 1000,
    max: 300,
    message: 'Limite de requisições excedido para diretor. Aguarde 1 minuto.'
  },
  COORDENADOR: {
    windowMs: 1 * 60 * 1000,
    max: 200,
    message: 'Limite de requisições excedido para coordenador. Aguarde 1 minuto.'
  },
  PROFESSOR: {
    windowMs: 1 * 60 * 1000,
    max: 150,
    message: 'Limite de requisições excedido para professor. Aguarde 1 minuto.'
  },
  RESPONSAVEL: {
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Limite de requisições excedido para responsável. Aguarde 1 minuto.'
  },
  ALUNO: {
    windowMs: 1 * 60 * 1000,
    max: 80,
    message: 'Limite de requisições excedido para aluno. Aguarde 1 minuto.'
  },
  DEFAULT: {
    windowMs: 1 * 60 * 1000,
    max: 50,
    message: 'Limite de requisições excedido. Aguarde 1 minuto.'
  }
};

/**
 * Store do Redis para rate limiting por usuário
 */
let userRedisStore: any;

try {
  if (redis.status === 'ready') {
    userRedisStore = new RedisStore({
      // @ts-ignore - RedisStore aceita client do ioredis
      client: redis,
      prefix: 'user_rl:',
    });
    log.info({ component: 'user-rate-limit' }, 'User rate limiting usando Redis Store');
  }
} catch (error) {
  log.warn({ component: 'user-rate-limit', err: error }, 'User rate limiting usando Memory Store (fallback)');
}

/**
 * Middleware: Rate limiting por usuário com limites personalizados por role
 * 
 * @description
 * - Identifica usuário autenticado via req.user
 * - Aplica limite baseado no role do usuário
 * - Fallback para IP se não autenticado
 * - Registra violações no security log
 * 
 * @example
 * ```typescript
 * app.use('/api/alunos', userRateLimiter, alunosRouter);
 * ```
 */
export const userRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  // Extrair informações do usuário
  const user = (req as any).user;
  const userId = user?.id || null;
  const userRole = user?.role || 'DEFAULT';
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';

  // Obter configuração de limite para o role
  const config = RATE_LIMITS_BY_ROLE[userRole] || RATE_LIMITS_BY_ROLE.DEFAULT;

  // Criar rate limiter dinâmico para o usuário
  const dynamicLimiter = rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    store: userRedisStore,
    keyGenerator: (req) => {
      // Usar userId se autenticado, senão IP
      const user = (req as any).user;
      return user?.id ? `user:${user.id}` : `ip:${req.ip || 'unknown'}`;
    },
    handler: (req, res) => {
      const user = (req as any).user;
      
      // Log de segurança
      securityLogger.warn({
        event: 'user_rate_limit_exceeded',
        userId: user?.id || 'anonymous',
        userRole: user?.role || 'none',
        ip: req.ip,
        endpoint: req.path,
        method: req.method,
        limit: config.max,
        window: `${config.windowMs / 1000}s`
      }, `Rate limit por usuário excedido: ${req.method} ${req.path}`);

      res.status(429).json({
        error: 'Too Many Requests',
        message: config.message,
        userId: user?.id || null,
        role: user?.role || 'anonymous',
        limit: config.max,
        windowSeconds: config.windowMs / 1000,
        retryAfter: res.getHeader('Retry-After')
      });
    },
    skip: (req) => {
      // Não aplicar rate limit para health checks e métricas
      return req.path === '/health' || 
             req.path === '/api/health' || 
             req.path === '/metrics' ||
             req.path === '/api/metrics';
    }
  });

  // Aplicar rate limiter dinâmico
  dynamicLimiter(req, res, next);
};

/**
 * Middleware: Rate limiting para operações críticas (CREATE, UPDATE, DELETE)
 * Mais restritivo que operações de leitura
 * 
 * @description
 * - ADMIN: 200 req/min
 * - Outros: 50 req/min
 * - Protege contra SPAM de modificações
 */
export const mutationRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const userRole = user?.role || 'DEFAULT';
  
  // Limites reduzidos para mutações
  const mutationMax = userRole === 'ADMIN' ? 200 : 50;
  
  const dynamicLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: mutationMax,
    standardHeaders: true,
    legacyHeaders: false,
    store: userRedisStore,
    keyGenerator: (req) => {
      const user = (req as any).user;
      return user?.id ? `mutation:${user.id}` : `mutation:${req.ip || 'unknown'}`;
    },
    handler: (req, res) => {
      securityLogger.warn({
        event: 'mutation_rate_limit_exceeded',
        userId: user?.id || 'anonymous',
        userRole,
        method: req.method,
        endpoint: req.path
      }, `Mutation rate limit excedido: ${req.method} ${req.path}`);

      res.status(429).json({
        error: 'Too Many Requests',
        message: `Limite de operações de modificação excedido (${mutationMax}/min). Aguarde 1 minuto.`,
        role: userRole,
        limit: mutationMax
      });
    }
  });

  dynamicLimiter(req, res, next);
};

/**
 * Middleware: Rate limiting para exportações por usuário
 * Previne abuso de exportações em massa
 * 
 * @description
 * - ADMIN/DIRETOR: 50 exportações/hora
 * - Outros: 20 exportações/hora
 */
export const userExportRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const userRole = user?.role || 'DEFAULT';
  
  const exportMax = ['ADMIN', 'DIRETOR'].includes(userRole) ? 50 : 20;
  
  const dynamicLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: exportMax,
    standardHeaders: true,
    legacyHeaders: false,
    store: userRedisStore,
    keyGenerator: (req) => {
      const user = (req as any).user;
      return user?.id ? `export:${user.id}` : `export:${req.ip || 'unknown'}`;
    },
    handler: (req, res) => {
      securityLogger.warn({
        event: 'export_rate_limit_exceeded',
        userId: user?.id || 'anonymous',
        userRole,
        endpoint: req.path
      }, `Export rate limit excedido: ${req.path}`);

      res.status(429).json({
        error: 'Too Many Requests',
        message: `Limite de exportações excedido (${exportMax}/hora). Aguarde.`,
        role: userRole,
        limit: exportMax
      });
    }
  });

  dynamicLimiter(req, res, next);
};

/**
 * Função auxiliar: Obter estatísticas de rate limit por usuário
 * 
 * @param userId - ID do usuário
 * @returns Estatísticas de uso
 */
export async function getUserRateLimitStats(userId: string): Promise<{
  userId: string;
  role: string;
  limit: number;
  remaining: number | null;
  resetAt: Date | null;
}> {
  try {
    const key = `user_rl:user:${userId}`;
    
    // Buscar dados do Redis
    const data = await redis.get(key);
    
    if (!data) {
      return {
        userId,
        role: 'UNKNOWN',
        limit: 0,
        remaining: null,
        resetAt: null
      };
    }

    // Parse dos dados (formato do rate-limit-redis)
    const parsed = JSON.parse(data);
    
    return {
      userId,
      role: parsed.role || 'UNKNOWN',
      limit: parsed.limit || 0,
      remaining: parsed.remaining || null,
      resetAt: parsed.resetAt ? new Date(parsed.resetAt) : null
    };
  } catch (error) {
    log.error({ err: error, userId }, 'Erro ao obter stats de rate limit por usuário');
    return {
      userId,
      role: 'ERROR',
      limit: 0,
      remaining: null,
      resetAt: null
    };
  }
}

/**
 * Função auxiliar: Resetar rate limit de um usuário (admin only)
 * 
 * @param userId - ID do usuário
 */
export async function resetUserRateLimit(userId: string): Promise<boolean> {
  try {
    const keys = await redis.keys(`user_rl:*${userId}*`);
    
    if (keys.length > 0) {
      await redis.del(...keys);
      log.info({ userId, keysDeleted: keys.length }, 'Rate limit do usuário resetado');
      return true;
    }
    
    return false;
  } catch (error) {
    log.error({ err: error, userId }, 'Erro ao resetar rate limit do usuário');
    return false;
  }
}

export default {
  userRateLimiter,
  mutationRateLimiter,
  userExportRateLimiter,
  getUserRateLimitStats,
  resetUserRateLimit
};
