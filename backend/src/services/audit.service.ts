import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'
import { Request } from 'express'

interface AuditLogData {
  userId: string
  userName: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW'
  resource: string
  resourceId?: string
  details?: any
  ipAddress?: string
  userAgent?: string
}

export class AuditService {
  static async createLog(data: AuditLogData) {
    try {
      const log = await prisma.auditLog.create({
        data: {
          userId: data.userId,
          userName: data.userName,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId || null,
          details: data.details || null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
        },
      })
      return log
    } catch (error) {
      console.error('Erro ao criar log de auditoria:', error)
      // Não lançar erro para não interromper fluxo principal
      return null
    }
  }

  static async getLogs(filters?: {
    userId?: string
    action?: string
    resource?: string
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  }) {
    const page = filters?.page || 1
    const limit = filters?.limit || 50
    const skip = (page - 1) * limit

    const where: any = {}

    if (filters?.userId) {
      where.userId = filters.userId
    }

    if (filters?.action) {
      where.action = filters.action
    }

    if (filters?.resource) {
      where.resource = filters.resource
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  static extractRequestInfo(req: Request) {
    return {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    }
  }

  static async getStats(filters?: {
    startDate?: Date
    endDate?: Date
  }) {
    const where: any = {}

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate
      }
    }

    // Estatísticas agregadas
    const [
      totalLogs,
      actionStats,
      resourceStats,
      topUsers,
      recentActivity,
    ] = await Promise.all([
      // Total de logs
      prisma.auditLog.count({ where }),

      // Logs por ação
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: {
          action: true,
        },
        orderBy: {
          _count: {
            action: 'desc',
          },
        },
      }),

      // Logs por recurso
      prisma.auditLog.groupBy({
        by: ['resource'],
        where,
        _count: {
          resource: true,
        },
        orderBy: {
          _count: {
            resource: 'desc',
          },
        },
        take: 10,
      }),

      // Top 10 usuários mais ativos
      prisma.auditLog.groupBy({
        by: ['userId', 'userName'],
        where,
        _count: {
          userId: true,
        },
        orderBy: {
          _count: {
            userId: 'desc',
          },
        },
        take: 10,
      }),

      // Atividade recente (últimas 24h)
      prisma.auditLog.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    return {
      totalLogs,
      recentActivity,
      actionStats: actionStats.map(stat => ({
        action: stat.action,
        count: stat._count.action,
      })),
      resourceStats: resourceStats.map(stat => ({
        resource: stat.resource,
        count: stat._count.resource,
      })),
      topUsers: topUsers.map(user => ({
        userId: user.userId,
        userName: user.userName,
        count: user._count.userId,
      })),
    }
  }

  static async getActivityTimeline(filters?: {
    startDate?: Date
    endDate?: Date
    groupBy?: 'hour' | 'day' | 'week' | 'month'
  }) {
    const groupBy = filters?.groupBy || 'day'
    const where: any = {}

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate
      }
    }

    // Query SQL direta para agregação por período
    const timeline = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT 
        DATE_TRUNC(${groupBy}, "createdAt") as date,
        COUNT(*) as count
      FROM "audit_logs"
      ${where.createdAt ? 
        Prisma.sql`WHERE "createdAt" >= ${where.createdAt.gte || new Date(0)} 
                   AND "createdAt" <= ${where.createdAt.lte || new Date()}` : 
        Prisma.empty}
      GROUP BY DATE_TRUNC(${groupBy}, "createdAt")
      ORDER BY date ASC
    `

    return timeline.map(item => ({
      date: item.date,
      count: Number(item.count),
    }))
  }

  static async getLogById(id: string) {
    try {
      return await prisma.auditLog.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Erro ao buscar log:', error);
      return null;
    }
  }
}
