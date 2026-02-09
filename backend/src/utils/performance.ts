/**
 * Utilitários de Performance para Backend
 */

import { PrismaClient } from '@prisma/client';

/**
 * Paginação Helper para Prisma
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: any;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function paginate<T>(
  model: any,
  options: PaginationOptions = {},
  where: any = {}
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy: options.orderBy,
    }),
    model.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Batch Operations - Processar múltiplos registros de forma eficiente
 */
export async function batchCreate<T>(
  model: any,
  data: T[],
  batchSize: number = 100
): Promise<void> {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await model.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }
}

/**
 * Query Builder Helper
 */
export class QueryBuilder {
  private where: any = {};
  private include: any = {};
  private orderBy: any = {};
  private selectFields: any = undefined;

  filter(field: string, value: any, operator: 'equals' | 'contains' | 'in' | 'gt' | 'lt' = 'equals') {
    if (value === undefined || value === null) return this;

    if (operator === 'equals') {
      this.where[field] = value;
    } else if (operator === 'contains') {
      this.where[field] = { contains: value, mode: 'insensitive' };
    } else if (operator === 'in') {
      this.where[field] = { in: value };
    } else if (operator === 'gt') {
      this.where[field] = { gt: value };
    } else if (operator === 'lt') {
      this.where[field] = { lt: value };
    }

    return this;
  }

  relate(relation: string, include: boolean | object = true) {
    this.include[relation] = include;
    return this;
  }

  sort(field: string, direction: 'asc' | 'desc' = 'asc') {
    this.orderBy[field] = direction;
    return this;
  }

  select(fields: string[]) {
    this.selectFields = fields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as any);
    return this;
  }

  build() {
    return {
      where: Object.keys(this.where).length > 0 ? this.where : undefined,
      include: Object.keys(this.include).length > 0 ? this.include : undefined,
      orderBy: Object.keys(this.orderBy).length > 0 ? this.orderBy : undefined,
      select: this.selectFields,
    };
  }
}

/**
 * Database Connection Pool Monitor
 */
export class DatabaseMonitor {
  private prisma: PrismaClient;
  private metrics: {
    queries: number;
    errors: number;
    slowQueries: number;
    avgQueryTime: number;
  } = {
    queries: 0,
    errors: 0,
    slowQueries: 0,
    avgQueryTime: 0,
  };

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.setupMiddleware();
  }

  private setupMiddleware() {
    // @ts-ignore
    this.prisma.$use(async (params: any, next: any) => {
      const start = Date.now();
      
      try {
        const result = await next(params);
        const duration = Date.now() - start;
        
        this.metrics.queries++;
        this.metrics.avgQueryTime = 
          (this.metrics.avgQueryTime * (this.metrics.queries - 1) + duration) / 
          this.metrics.queries;
        
        if (duration > 1000) {
          this.metrics.slowQueries++;
          console.warn({
            type: 'slow_query',
            model: params.model,
            action: params.action,
            duration: `${duration}ms`,
          });
        }
        
        return result;
      } catch (error) {
        this.metrics.errors++;
        throw error;
      }
    });
  }

  getMetrics() {
    return { ...this.metrics };
  }

  reset() {
    this.metrics = {
      queries: 0,
      errors: 0,
      slowQueries: 0,
      avgQueryTime: 0,
    };
  }
}

/**
 * Background Task Queue (simples)
 */
interface Task<T = any> {
  id: string;
  fn: () => Promise<T>;
  priority: number;
  createdAt: number;
}

export class TaskQueue {
  private queue: Task[] = [];
  private processing = false;
  private maxConcurrent = 3;
  private running = 0;

  add<T>(fn: () => Promise<T>, priority: number = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: Task = {
        id: Math.random().toString(36),
        fn: async () => {
          try {
            const result = await fn();
            resolve(result);
            return result;
          } catch (error) {
            reject(error);
            throw error;
          }
        },
        priority,
        createdAt: Date.now(),
      };

      this.queue.push(task);
      this.queue.sort((a, b) => b.priority - a.priority);
      
      this.process();
    });
  }

  private async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift();
    
    if (task) {
      try {
        await task.fn();
      } catch (error) {
        console.error('Task failed:', error);
      } finally {
        this.running--;
        this.process();
      }
    }
  }

  size() {
    return this.queue.length;
  }

  clear() {
    this.queue = [];
  }
}

/**
 * Retry com Exponential Backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries) {
        const delay = baseDelay * Math.pow(2, i);
        console.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Transactions Helper
 */
export async function withTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: any) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    try {
      return await fn(tx);
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  });
}
