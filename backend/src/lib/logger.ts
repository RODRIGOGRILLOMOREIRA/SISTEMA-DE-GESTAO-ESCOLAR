/**
 * Sistema de Logs Estruturados com Pino
 * Fase 4 - Observabilidade e Monitoramento
 */

import pino from 'pino';
import { AsyncLocalStorage } from 'async_hooks';

// AsyncLocalStorage para correlation IDs
export const requestContext = new AsyncLocalStorage<{ requestId: string }>();

// Configuração do Pino com diferentes níveis para dev e prod
const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  
  // Formatação customizada para desenvolvimento
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      messageFormat: '{levelLabel} - {msg}',
      errorLikeObjectKeys: ['err', 'error']
    }
  } : undefined,

  // Configurações para produção
  formatters: {
    level: (label) => {
      return { level: label };
    },
    bindings: (bindings) => {
      return {
        pid: bindings.pid,
        hostname: bindings.hostname,
        node_version: process.version
      };
    }
  },

  // Serializers customizados
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers?.host,
        'user-agent': req.headers?.[' user-agent'],
        'content-type': req.headers?.['content-type']
      },
      remoteAddress: req.socket?.remoteAddress,
      remotePort: req.socket?.remotePort
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: res.getHeaders?.()
    }),
    err: pino.stdSerializers.err
  },

  // Base para todos os logs
  base: {
    env: process.env.NODE_ENV || 'development',
    app: 'sge-backend'
  }
});

/**
 * Logger com correlation ID automático
 */
export const log = {
  /**
   * Log de debug (desenvolvimento)
   */
  debug: (obj: any, msg?: string) => {
    const context = requestContext.getStore();
    if (context) {
      logger.debug({ ...obj, requestId: context.requestId }, msg);
    } else {
      logger.debug(obj, msg);
    }
  },

  /**
   * Log de informação
   */
  info: (obj: any, msg?: string) => {
    const context = requestContext.getStore();
    if (context) {
      logger.info({ ...obj, requestId: context.requestId }, msg);
    } else {
      logger.info(obj, msg);
    }
  },

  /**
   * Log de warning
   */
  warn: (obj: any, msg?: string) => {
    const context = requestContext.getStore();
    if (context) {
      logger.warn({ ...obj, requestId: context.requestId }, msg);
    } else {
      logger.warn(obj, msg);
    }
  },

  /**
   * Log de erro
   */
  error: (obj: any, msg?: string) => {
    const context = requestContext.getStore();
    if (context) {
      logger.error({ ...obj, requestId: context.requestId }, msg);
    } else {
      logger.error(obj, msg);
    }
  },

  /**
   * Log fatal (erro crítico que pode causar shutdown)
   */
  fatal: (obj: any, msg?: string) => {
    const context = requestContext.getStore();
    if (context) {
      logger.fatal({ ...obj, requestId: context.requestId }, msg);
    } else {
      logger.fatal(obj, msg);
    }
  },

  /**
   * Log child com contexto adicional
   */
  child: (bindings: any) => {
    return logger.child(bindings);
  }
};

/**
 * Middleware para adicionar correlation ID e logs de request/response
 */
export const loggerMiddleware = (req: any, res: any, next: any) => {
  // Gerar requestId único
  const requestId = req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Armazenar no contexto
  requestContext.run({ requestId }, () => {
    // Adicionar requestId no request
    req.requestId = requestId;
    
    // Adicionar requestId no response header
    res.setHeader('X-Request-ID', requestId);

    // Log de início da requisição
    log.info({
      type: 'request',
      method: req.method,
      url: req.url,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    }, `${req.method} ${req.url}`);

    // Capturar tempo de resposta
    const startTime = Date.now();

    // Hook no finish para log de response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      const logData = {
        type: 'response',
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        contentLength: res.get('content-length')
      };

      // Log baseado no status code
      if (res.statusCode >= 500) {
        log.error(logData, `${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
      } else if (res.statusCode >= 400) {
        log.warn(logData, `${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
      } else {
        log.info(logData, `${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
      }
    });

    next();
  });
};

/**
 * Logger específico para auditoria
 */
export const auditLogger = log.child({ type: 'audit' });

/**
 * Logger específico para segurança
 */
export const securityLogger = log.child({ type: 'security' });

/**
 * Logger específico para performance
 */
export const performanceLogger = log.child({ type: 'performance' });

export default log;
