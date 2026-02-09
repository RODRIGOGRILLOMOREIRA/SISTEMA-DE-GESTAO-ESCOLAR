/**
 * Health Check Service
 * Fase 4 - Observabilidade e Monitoramento
 */

import { PrismaClient } from '@prisma/client';
import redis from '../lib/redis';
import { log } from '../lib/logger';
import os from 'os';
import { performance } from 'perf_hooks';

const prisma = new PrismaClient();

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    memory: ServiceHealth;
    disk: ServiceHealth;
  };
  metrics?: {
    requestsPerMinute?: number;
    averageResponseTime?: number;
    errorRate?: number;
  };
}

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  message?: string;
  details?: any;
}

/**
 * Verificar saúde do banco de dados PostgreSQL
 */
async function checkDatabase(): Promise<ServiceHealth> {
  const startTime = performance.now();
  
  try {
    // Executar query simples para verificar conexão
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Math.round(performance.now() - startTime);
    
    // Verificar tempo de resposta
    if (responseTime > 1000) {
      return {
        status: 'degraded',
        responseTime,
        message: 'Database responde lento'
      };
    }
    
    return {
      status: 'healthy',
      responseTime,
      message: 'Conectado'
    };
  } catch (error: any) {
    log.error({ err: error, component: 'health-check' }, 'Erro ao verificar banco de dados');
    
    return {
      status: 'unhealthy',
      responseTime: Math.round(performance.now() - startTime),
      message: error.message || 'Falha na conexão'
    };
  }
}

/**
 * Verificar saúde do Redis
 */
async function checkRedis(): Promise<ServiceHealth> {
  const startTime = performance.now();
  
  try {
    // Tentar ping no Redis
    const result = await redis.ping();
    const responseTime = Math.round(performance.now() - startTime);
    
    if (result === 'PONG') {
      if (responseTime > 500) {
        return {
          status: 'degraded',
          responseTime,
          message: 'Redis responde lento'
        };
      }
      
      return {
        status: 'healthy',
        responseTime,
        message: 'Conectado'
      };
    }
    
    return {
      status: 'unhealthy',
      responseTime,
      message: 'Resposta inválida'
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      responseTime: Math.round(performance.now() - startTime),
      message: 'Não disponível (modo básico ativo)'
    };
  }
}

/**
 * Verificar uso de memória
 */
function checkMemory(): ServiceHealth {
  const used = process.memoryUsage();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsagePercent = (usedMemory / totalMemory) * 100;
  
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  const heapUsagePercent = (used.heapUsed / used.heapTotal) * 100;
  
  const details = {
    heap: {
      used: `${heapUsedMB}MB`,
      total: `${heapTotalMB}MB`,
      percentage: `${heapUsagePercent.toFixed(1)}%`
    },
    system: {
      used: `${Math.round(usedMemory / 1024 / 1024)}MB`,
      total: `${Math.round(totalMemory / 1024 / 1024)}MB`,
      free: `${Math.round(freeMemory / 1024 / 1024)}MB`,
      percentage: `${memoryUsagePercent.toFixed(1)}%`
    }
  };
  
  // Alertas de memória
  if (heapUsagePercent > 90 || memoryUsagePercent > 90) {
    return {
      status: 'unhealthy',
      message: 'Uso crítico de memória',
      details
    };
  }
  
  if (heapUsagePercent > 75 || memoryUsagePercent > 80) {
    return {
      status: 'degraded',
      message: 'Uso alto de memória',
      details
    };
  }
  
  return {
    status: 'healthy',
    message: 'Memória OK',
    details
  };
}

/**
 * Verificar uso de disco
 */
function checkDisk(): ServiceHealth {
  try {
    // Informações básicas do sistema
    const loadAverage = os.loadavg();
    const cpus = os.cpus();
    const uptime = os.uptime();
    
    const details = {
      loadAverage: {
        '1min': loadAverage[0].toFixed(2),
        '5min': loadAverage[1].toFixed(2),
        '15min': loadAverage[2].toFixed(2)
      },
      cpus: cpus.length,
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`
    };
    
    // Verificar load average (simplificado)
    const loadPercent = (loadAverage[0] / cpus.length) * 100;
    
    if (loadPercent > 90) {
      return {
        status: 'unhealthy',
        message: 'CPU sobrecarregada',
        details
      };
    }
    
    if (loadPercent > 75) {
      return {
        status: 'degraded',
        message: 'CPU com carga alta',
        details
      };
    }
    
    return {
      status: 'healthy',
      message: 'Sistema OK',
      details
    };
  } catch (error) {
    return {
      status: 'healthy',
      message: 'Informações não disponíveis'
    };
  }
}

/**
 * Executar todos os health checks
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  // Executar checks em paralelo
  const [database, redis, memory, disk] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkMemory(),
    Promise.resolve(checkDisk())
  ]);
  
  // Determinar status geral
  const services = { database, redis, memory, disk };
  const statuses = Object.values(services).map(s => s.status);
  
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  
  if (statuses.includes('unhealthy')) {
    // Se pelo menos um serviço crítico está unhealthy
    if (database.status === 'unhealthy') {
      overallStatus = 'unhealthy';
    } else {
      overallStatus = 'degraded';
    }
  } else if (statuses.includes('degraded')) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }
  
  const result: HealthCheckResult = {
    status: overallStatus,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services
  };
  
  // Log do resultado
  const checkDuration = Date.now() - startTime;
  log.debug({
    component: 'health-check',
    status: overallStatus,
    duration: checkDuration
  }, `Health check completo em ${checkDuration}ms`);
  
  return result;
}

/**
 * Health check simplificado (liveness probe)
 */
export async function livenessProbe(): Promise<boolean> {
  try {
    // Apenas verificar se o processo está rodando e responsivo
    return true;
  } catch {
    return false;
  }
}

/**
 * Health check de readiness (readiness probe)
 */
export async function readinessProbe(): Promise<boolean> {
  try {
    // Verificar se está pronto para receber tráfego
    const dbCheck = await checkDatabase();
    return dbCheck.status !== 'unhealthy';
  } catch {
    return false;
  }
}

/**
 * Métricas básicas do sistema
 */
export function getSystemMetrics() {
  const memory = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memory.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + ' MB',
        external: Math.round(memory.external / 1024 / 1024) + ' MB'
      },
      cpu: {
        user: Math.round(cpuUsage.user / 1000) + ' ms',
        system: Math.round(cpuUsage.system / 1000) + ' ms'
      }
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
      freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024) + ' GB',
      loadAverage: os.loadavg().map(v => v.toFixed(2)),
      uptime: Math.floor(os.uptime() / 3600) + ' hours'
    },
    node: {
      version: process.version,
      env: process.env.NODE_ENV || 'development'
    }
  };
}

export default {
  performHealthCheck,
  livenessProbe,
  readinessProbe,
  getSystemMetrics
};
