/**
 * Sistema de Rate Limiting Avançado
 * Fase 4 - Segurança
 */

import rateLimit, { type Options as RateLimitOptions } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../lib/redis';
import { log, securityLogger } from '../lib/logger';

// Desabilitar a validação IPv6 (para desenvolvimento local)
const rateLimitOptions: Partial<RateLimitOptions> = {
  validate: false
};

/**
 * Store do Redis para rate limiting (se disponível)
 * Fallback para MemoryStore se Redis não estiver disponível
 */
let redisStore: any = undefined;

// Tentar criar RedisStore
try {
  if (redis.status === 'ready') {
    redisStore = new RedisStore({
      // @ts-ignore - RedisStore aceita client do ioredis
      client: redis,
      prefix: 'rl:',
    });
    log.info({ component: 'rate-limit' }, 'Rate limiting usando Redis Store');
  }
} catch (error) {
  log.warn({ component: 'rate-limit', err: error }, 'Rate limiting usando Memory Store (fallback)');
}

/**
 * Handler customizado para quando o limite é excedido
 */
const rateLimitHandler = (req: any, res: any) => {
  const ip = req.ip || req.socket.remoteAddress;
  const userId = req.user?.id || 'anonymous';
  
  securityLogger.warn({
    event: 'rate_limit_exceeded',
    ip,
    userId,
    endpoint: req.path,
    method: req.method
  }, `Rate limit excedido: ${req.method} ${req.path}`);

  res.status(429).json({
    error: 'Too Many Requests',
    message: 'Você excedeu o limite de requisições. Por favor, tente novamente mais tarde.',
    retryAfter: res.getHeader('Retry-After')
  });
};

/**
 * Rate limiting para autenticação (mais restritivo)
 * 5 tentativas a cada 15 minutos
 */
export const authRateLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: {
    error: 'Too Many Requests',
    message: 'Muitas tentativas de login. Por favor, tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
  handler: rateLimitHandler,
  skip: (req) => {
    // Não aplicar rate limit para endpoints de saúde
    return req.path === '/health' || req.path === '/api/health';
  },
  keyGenerator: (req) => {
    // Rate limit por IP + endpoint
    return `${req.ip || 'unknown'}:${req.path}`;
  }
});

/**
 * Rate limiting para API geral
 * 100 requisições por minuto
 */
export const apiRateLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requisições
  message: {
    error: 'Too Many Requests',
    message: 'Limite de requisições excedido. Por favor, aguarde um momento.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
  handler: rateLimitHandler,
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/health' || req.path === '/metrics';
  },
  keyGenerator: (req) => {
    // Rate limit por IP
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }
});

/**
 * Rate limiting para exportações (mais restritivo)
 * 10 exportações a cada 5 minutos
 */
export const exportRateLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // 10 exportações
  message: {
    error: 'Too Many Requests',
    message: 'Limite de exportações excedido. Por favor, aguarde alguns minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
  handler: rateLimitHandler,
  keyGenerator: (req: any) => {
    // Rate limit por usuário (se autenticado) ou IP
    const userId = req.user?.id || req.ip || 'unknown';
    return `export:${userId}`;
  }
});

/**
 * Rate limiting para uploads
 * 20 uploads a cada 10 minutos
 */
export const uploadRateLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20, // 20 uploads
  message: {
    error: 'Too Many Requests',
    message: 'Limite de uploads excedido. Por favor, aguarde alguns minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
  handler: rateLimitHandler,
  keyGenerator: (req: any) => {
    const userId = req.user?.id || req.ip || 'unknown';
    return `upload:${userId}`;
  }
});

/**
 * Rate limiting para notificações em massa
 * 5 envios a cada 30 minutos
 */
export const notificationRateLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 30 * 60 * 1000, // 30 minutos
  max: 5, // 5 envios em massa
  message: {
    error: 'Too Many Requests',
    message: 'Limite de envio de notificações excedido. Por favor, aguarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
  handler: rateLimitHandler,
  keyGenerator: (req: any) => {
    const userId = req.user?.id || req.ip || 'unknown';
    return `notification:${userId}`;
  }
});

/**
 * Rate limiting customizável
 */
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
}) => {
  return rateLimit({
    ...rateLimitOptions,
    windowMs: options.windowMs,
    max: options.max,
    message: {
      error: 'Too Many Requests',
      message: options.message || 'Limite de requisições excedido.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStore,
    handler: rateLimitHandler,
    keyGenerator: (req: any) => {
      const userId = req.user?.id || req.ip || 'unknown';
      const prefix = options.keyPrefix || 'custom';
      return `${prefix}:${userId}`;
    }
  });
};

/**
 * Middleware para detectar e bloquear IPs suspeitos
 * (Complementar ao rate limiting)
 */
export const securityMiddleware = async (req: any, res: any, next: any) => {
  const ip = req.ip || req.socket.remoteAddress;
  
  try {
    // Verificar se IP está na blacklist
    const isBlacklisted = await redis.get(`blacklist:${ip}`);
    
    if (isBlacklisted) {
      securityLogger.error({
        event: 'blocked_ip',
        ip,
        endpoint: req.path
      }, `IP bloqueado tentou acessar: ${req.path}`);
      
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Seu IP foi bloqueado devido a atividades suspeitas.'
      });
    }

    // Verificar múltiplas falhas de autenticação
    const failureKey = `auth_failures:${ip}`;
    const failures = await redis.get(failureKey);
    
    if (failures && parseInt(failures) >= 10) {
      // Bloquear IP por 1 hora
      await redis.setex(`blacklist:${ip}`, 3600, 'auto-blocked');
      
      securityLogger.error({
        event: 'auto_blocked_ip',
        ip,
        failures: parseInt(failures)
      }, `IP bloqueado automaticamente após ${failures} falhas`);
      
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Seu IP foi bloqueado temporariamente devido a múltiplas falhas de autenticação.'
      });
    }

    next();
  } catch (error) {
    // Se Redis não estiver disponível, continuar sem verificação
    next();
  }
};

/**
 * Registrar falha de autenticação
 */
export const registerAuthFailure = async (ip: string) => {
  try {
    const key = `auth_failures:${ip}`;
    const current = await redis.get(key);
    const failures = current ? parseInt(current) + 1 : 1;
    
    // Incrementar contador com TTL de 1 hora
    await redis.setex(key, 3600, failures.toString());
    
    securityLogger.warn({
      event: 'auth_failure',
      ip,
      failures
    }, `Falha de autenticação registrada (${failures}/10)`);
    
    return failures;
  } catch (error) {
    // Falha silenciosa se Redis não disponível
    return 0;
  }
};

/**
 * Limpar falhas de autenticação (após login bem-sucedido)
 */
export const clearAuthFailures = async (ip: string) => {
  try {
    await redis.del(`auth_failures:${ip}`);
    log.debug({ event: 'auth_failures_cleared', ip }, 'Falhas de autenticação limpas');
  } catch (error) {
    // Falha silenciosa
  }
};

/**
 * Adicionar IP à whitelist (exempto de rate limiting)
 */
export const addToWhitelist = async (ip: string, reason: string, duration: number = 86400) => {
  try {
    await redis.setex(`whitelist:${ip}`, duration, reason);
    log.info({ event: 'ip_whitelisted', ip, reason, duration }, 'IP adicionado à whitelist');
  } catch (error) {
    log.error({ err: error, ip }, 'Erro ao adicionar IP à whitelist');
  }
};

/**
 * Remover IP da blacklist
 */
export const removeFromBlacklist = async (ip: string) => {
  try {
    await redis.del(`blacklist:${ip}`);
    log.info({ event: 'ip_unblocked', ip }, 'IP removido da blacklist');
  } catch (error) {
    log.error({ err: error, ip }, 'Erro ao remover IP da blacklist');
  }
};

export default {
  authRateLimiter,
  apiRateLimiter,
  exportRateLimiter,
  uploadRateLimiter,
  notificationRateLimiter,
  createRateLimiter,
  securityMiddleware,
  registerAuthFailure,
  clearAuthFailures,
  addToWhitelist,
  removeFromBlacklist
};
