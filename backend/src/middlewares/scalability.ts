/**
 * Middleware de Rate Limiting
 * Previne abuso da API limitando número de requisições
 */

import type { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private windowMs: number = 15 * 60 * 1000, // 15 minutos
    private max: number = 100 // máximo de requisições
  ) {
    // Limpar registros expirados a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.getKey(req);
      const now = Date.now();
      
      let record = this.store[key];
      
      if (!record || now > record.resetTime) {
        record = {
          count: 0,
          resetTime: now + this.windowMs,
        };
        this.store[key] = record;
      }
      
      record.count++;
      
      res.setHeader('X-RateLimit-Limit', this.max.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.max - record.count).toString());
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
      
      if (record.count > this.max) {
        res.status(429).json({
          error: 'Too Many Requests',
          message: 'Você excedeu o limite de requisições. Tente novamente mais tarde.',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        });
        return;
      }
      
      next();
    };
  }

  private getKey(req: Request): string {
    // Usar IP + User ID (se autenticado) como chave
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userId = (req as any).user?.id || 'anonymous';
    return `${ip}:${userId}`;
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// Criar instâncias com diferentes limites
export const generalLimiter = new RateLimiter(15 * 60 * 1000, 100); // 100 req/15min
export const authLimiter = new RateLimiter(15 * 60 * 1000, 5); // 5 tentativas de login/15min
export const uploadLimiter = new RateLimiter(60 * 60 * 1000, 10); // 10 uploads/hora

/**
 * Middleware de Logging Estruturado
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log da requisição
  console.log({
    type: 'request',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  
  // Interceptar resposta
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    console.log({
      type: 'response',
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
    });
  });
  
  next();
};

/**
 * Middleware de Compressão de Resposta
 */
import compression from 'compression';

export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Nível de compressão (0-9)
});

/**
 * Middleware de Timeout
 */
export const timeoutMiddleware = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request Timeout',
          message: 'A requisição demorou muito tempo para processar',
        });
      }
    }, timeoutMs);
    
    res.on('finish', () => {
      clearTimeout(timeout);
    });
    
    next();
  };
};

/**
 * Middleware de Error Handler Global
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error({
    type: 'error',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: error.message,
    stack: error.stack,
  });
  
  // Não expor detalhes de erro em produção
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    error: error.name || 'Internal Server Error',
    message: isDevelopment ? error.message : 'Ocorreu um erro interno',
    ...(isDevelopment && { stack: error.stack }),
  });
};

/**
 * Middleware de Sanitização de Dados
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Remover propriedades potencialmente perigosas
  const sanitize = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;
    
    const cleaned: any = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      // Ignorar __proto__, constructor, prototype
      if (['__proto__', 'constructor', 'prototype'].includes(key)) {
        continue;
      }
      
      cleaned[key] = sanitize(obj[key]);
    }
    
    return cleaned;
  };
  
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
};

/**
 * Middleware de Cache Headers
 */
export const cacheControl = (maxAge: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${maxAge}`);
    } else {
      res.set('Cache-Control', 'no-store');
    }
    next();
  };
};
