/**
 * Sistema de Métricas com Prometheus
 * Fase 4 - Observabilidade e Monitoramento
 */

import client, { register, Counter, Histogram, Gauge } from 'prom-client';
import { Request, Response, NextFunction } from 'express';
import { log } from '../lib/logger';

// Habilitar coleta de métricas padrão (CPU, memória, etc)
client.collectDefaultMetrics({
  prefix: 'sge_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

/**
 * Contador de requisições HTTP
 */
export const httpRequestsTotal = new Counter({
  name: 'sge_http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status_code']
});

/**
 * Histograma de duração das requisições
 */
export const httpRequestDuration = new Histogram({
  name: 'sge_http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

/**
 * Gauge de usuários ativos
 */
export const activeUsers = new Gauge({
  name: 'sge_active_users',
  help: 'Número de usuários ativos no sistema'
});

/**
 * Contador de logins
 */
export const loginAttemptsTotal = new Counter({
  name: 'sge_login_attempts_total',
  help: 'Total de tentativas de login',
  labelNames: ['status'] // success, failed
});

/**
 * Contador de operações no banco de dados
 */
export const databaseOperationsTotal = new Counter({
  name: 'sge_database_operations_total',
  help: 'Total de operações no banco de dados',
  labelNames: ['operation', 'table', 'status'] // operation: create, read, update, delete
});

/**
 * Histograma de duração de queries no banco
 */
export const databaseQueryDuration = new Histogram({
  name: 'sge_database_query_duration_seconds',
  help: 'Duração das queries no banco de dados',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2]
});

/**
 * Contador de cache hits/misses
 */
export const cacheOperations = new Counter({
  name: 'sge_cache_operations_total',
  help: 'Total de operações de cache',
  labelNames: ['operation'] // hit, miss, set, delete
});

/**
 * Contador de jobs processados nas filas
 */
export const queueJobsProcessed = new Counter({
  name: 'sge_queue_jobs_processed_total',
  help: 'Total de jobs processados nas filas',
  labelNames: ['queue', 'status'] // completed, failed
});

/**
 * Gauge de jobs pendentes nas filas
 */
export const queueJobsPending = new Gauge({
  name: 'sge_queue_jobs_pending',
  help: 'Número de jobs pendentes nas filas',
  labelNames: ['queue']
});

/**
 * Contador de notificações enviadas
 */
export const notificationsSent = new Counter({
  name: 'sge_notifications_sent_total',
  help: 'Total de notificações enviadas',
  labelNames: ['type', 'channel', 'status'] // type: individual, bulk; channel: whatsapp, sms, email
});

/**
 * Contador de erros
 */
export const errorsTotal = new Counter({
  name: 'sge_errors_total',
  help: 'Total de erros no sistema',
  labelNames: ['type', 'endpoint'] // type: validation, database, external, internal
});

/**
 * Gauge de conexões ativas
 */
export const activeConnections = new Gauge({
  name: 'sge_active_connections',
  help: 'Número de conexões ativas'
});

/**
 * Métricas de negócio
 */

// Contador de alunos matriculados
export const studentsEnrolled = new Counter({
  name: 'sge_students_enrolled_total',
  help: 'Total de alunos matriculados'
});

// Contador de notas lançadas
export const gradesRecorded = new Counter({
  name: 'sge_grades_recorded_total',
  help: 'Total de notas lançadas'
});

// Contador de frequências registradas
export const attendanceRecorded = new Counter({
  name: 'sge_attendance_recorded_total',
  help: 'Total de frequências registradas'
});

// Gauge de turmas ativas
export const activeClasses = new Gauge({
  name: 'sge_active_classes',
  help: 'Número de turmas ativas'
});

/**
 * Middleware para coletar métricas de requisições HTTP
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Não coletar métricas para o próprio endpoint de métricas
  if (req.path === '/metrics' || req.path === '/api/metrics') {
    return next();
  }

  const startTime = Date.now();

  // Incrementar conexões ativas
  activeConnections.inc();

  // Hook no finish da resposta
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000; // em segundos
    const route = req.route?.path || req.path;
    const method = req.method;
    const statusCode = res.statusCode.toString();

    // Registrar métricas
    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);

    // Decrementar conexões ativas
    activeConnections.dec();

    // Log de performance para requests lentos
    if (duration > 1) {
      log.warn({
        type: 'slow_request',
        method,
        route,
        duration,
        statusCode
      }, `Request lento: ${method} ${route} - ${duration.toFixed(2)}s`);
    }
  });

  next();
};

/**
 * Helper para registrar operação de banco de dados
 */
export const recordDatabaseOperation = (
  operation: 'create' | 'read' | 'update' | 'delete',
  table: string,
  durationMs: number,
  success: boolean = true
) => {
  const status = success ? 'success' : 'error';
  databaseOperationsTotal.inc({ operation, table, status });
  databaseQueryDuration.observe({ operation, table }, durationMs / 1000);
};

/**
 * Helper para registrar operação de cache
 */
export const recordCacheOperation = (operation: 'hit' | 'miss' | 'set' | 'delete') => {
  cacheOperations.inc({ operation });
};

/**
 * Helper para registrar login
 */
export const recordLoginAttempt = (success: boolean) => {
  const status = success ? 'success' : 'failed';
  loginAttemptsTotal.inc({ status });
};

/**
 * Helper para registrar erro
 */
export const recordError = (type: string, endpoint: string = 'unknown') => {
  errorsTotal.inc({ type, endpoint });
};

/**
 * Helper para registrar notificação enviada
 */
export const recordNotification = (
  type: 'individual' | 'bulk',
  channel: 'whatsapp' | 'sms' | 'email',
  success: boolean
) => {
  const status = success ? 'success' : 'failed';
  notificationsSent.inc({ type, channel, status });
};

/**
 * Helper para registrar job processado
 */
export const recordQueueJob = (queue: string, success: boolean) => {
  const status = success ? 'completed' : 'failed';
  queueJobsProcessed.inc({ queue, status });
};

/**
 * Atualizar gauge de jobs pendentes
 */
export const updateQueuePending = (queue: string, count: number) => {
  queueJobsPending.set({ queue }, count);
};

/**
 * Endpoint para expor métricas no formato Prometheus
 */
export const getMetrics = async (): Promise<string> => {
  return register.metrics();
};

/**
 * Limpar todas as métricas (útil para testes)
 */
export const clearMetrics = () => {
  register.clear();
};

/**
 * Obter registry completo (para testes)
 */
export const getRegistry = () => register;

export default {
  metricsMiddleware,
  getMetrics,
  clearMetrics,
  getRegistry,
  // Helpers
  recordDatabaseOperation,
  recordCacheOperation,
  recordLoginAttempt,
  recordError,
  recordNotification,
  recordQueueJob,
  updateQueuePending,
  // Métricas individuais para uso direto
  httpRequestsTotal,
  httpRequestDuration,
  activeUsers,
  loginAttemptsTotal,
  databaseOperationsTotal,
  databaseQueryDuration,
  cacheOperations,
  queueJobsProcessed,
  queueJobsPending,
  notificationsSent,
  errorsTotal,
  activeConnections,
  studentsEnrolled,
  gradesRecorded,
  attendanceRecorded,
  activeClasses
};
