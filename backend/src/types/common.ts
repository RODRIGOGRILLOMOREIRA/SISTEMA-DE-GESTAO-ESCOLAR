/**
 * INTERFACES E TIPOS COMPARTILHADOS
 * 
 * Definições de tipos para substituir 'any' e melhorar
 * a segurança de tipos em todo o sistema
 * 
 * @author Sistema de Gestão Escolar
 * @since 2026-01-23
 */

/**
 * Tipos para WebSocket e Redis
 */
export interface RedisMessage {
  type: 'notification' | 'update' | 'chat' | 'achievement' | 'dashboard';
  payload: unknown;
  timestamp?: number;
  userId?: string;
}

export interface WebSocketNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  userId: string;
  timestamp: Date;
  read: boolean;
  metadata?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

export interface Achievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: Date;
}

export interface DashboardUpdate {
  type: 'aluno' | 'professor' | 'turma' | 'nota' | 'frequencia';
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Tipos para Performance Utils
 */
export interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface QueryFilter {
  field: string;
  value: unknown;
  operator: 'equals' | 'contains' | 'in' | 'gt' | 'lt' | 'gte' | 'lte';
}

export interface TransactionOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * Tipos para Notificações
 */
export interface NotificationData {
  userId: string;
  tipo: 'email' | 'sms' | 'whatsapp' | 'telegram' | 'push';
  titulo: string;
  mensagem: string;
  prioridade?: 'low' | 'normal' | 'high' | 'urgent';
  agendadoPara?: Date;
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  success: boolean;
  channel: string;
  timestamp: Date;
  error?: string;
  messageId?: string;
}

export interface NotificationJobData {
  notification: NotificationData;
  attempts: number;
  maxAttempts: number;
}

/**
 * Tipos para Relatórios
 */
export interface ReportRequest {
  type: 'alunos' | 'notas' | 'frequencias' | 'financeiro' | 'desempenho';
  format: 'pdf' | 'xlsx' | 'csv';
  filters: Record<string, unknown>;
  userId: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ReportResult {
  id: string;
  type: string;
  format: string;
  filePath: string;
  fileSize: number;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Tipos para Audit Log
 */
export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Tipos para Cache Service
 */
export interface CacheOptions {
  ttl?: number; // Time to live em segundos
  prefix?: string;
  tags?: string[];
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  ttl: number;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Tipos para File Upload
 */
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export interface UploadOptions {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  destination?: string;
}

/**
 * Tipos para Validação
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

/**
 * Tipos para API Response
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
  stack?: string; // Apenas em desenvolvimento
}

/**
 * Tipos para Prisma Middleware
 */
export interface PrismaParams {
  model?: string;
  action: string;
  args: Record<string, unknown>;
  dataPath: string[];
  runInTransaction: boolean;
}

export interface PrismaNext {
  (params: PrismaParams): Promise<unknown>;
}

/**
 * Tipos para Query Builder
 */
export interface QueryBuilderConfig {
  table: string;
  select?: string[];
  where?: Record<string, unknown>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  limit?: number;
  offset?: number;
  include?: Record<string, boolean | QueryBuilderConfig>;
}

/**
 * Tipos para Health Check
 */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    cache: ServiceHealth;
    queues?: ServiceHealth;
  };
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Tipos para Métricas
 */
export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface MetricsSummary {
  requests: {
    total: number;
    success: number;
    errors: number;
    avgResponseTime: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  database: {
    queries: number;
    avgQueryTime: number;
    slowQueries: number;
  };
}

/**
 * Export de todos os tipos
 */
export type {
  // Já exportados acima via interface
};

export default {
  // Para uso como namespace
};
