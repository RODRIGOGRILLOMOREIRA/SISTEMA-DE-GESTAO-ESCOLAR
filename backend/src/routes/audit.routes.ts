import { Router, Request, Response } from 'express'
import { AuditService } from '../services/audit.service'
import * as XLSX from 'xlsx'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/audit - Lista logs de auditoria com filtros
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      action,
      resource,
      startDate,
      endDate,
      page,
      limit,
    } = req.query

    const filters: any = {}

    if (userId) filters.userId = userId as string
    if (action) filters.action = action as string
    if (resource) filters.resource = resource as string
    if (startDate) filters.startDate = new Date(startDate as string)
    if (endDate) filters.endDate = new Date(endDate as string)
    if (page) filters.page = parseInt(page as string)
    if (limit) filters.limit = parseInt(limit as string)

    const result = await AuditService.getLogs(filters)

    res.json(result)
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error)
    res.status(500).json({ error: 'Erro ao buscar logs de auditoria' })
  }
})

// GET /api/audit/stats - Estatísticas de auditoria
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query

    const filters: any = {}

    if (startDate) filters.startDate = new Date(startDate as string)
    if (endDate) filters.endDate = new Date(endDate as string)

    const stats = await AuditService.getStats(filters)

    res.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas de auditoria:', error)
    res.status(500).json({ error: 'Erro ao buscar estatísticas' })
  }
})

// GET /api/audit/timeline - Timeline de atividades
router.get('/timeline', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, groupBy } = req.query

    const filters: any = {}

    if (startDate) filters.startDate = new Date(startDate as string)
    if (endDate) filters.endDate = new Date(endDate as string)
    if (groupBy) filters.groupBy = groupBy as 'hour' | 'day' | 'week' | 'month'

    const timeline = await AuditService.getActivityTimeline(filters)

    res.json(timeline)
  } catch (error) {
    console.error('Erro ao buscar timeline de auditoria:', error)
    res.status(500).json({ error: 'Erro ao buscar timeline' })
  }
})

// GET /api/audit/export/excel - Exporta logs de auditoria para Excel
router.get('/export/excel', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      action,
      resource,
      startDate,
      endDate,
    } = req.query

    const where: any = {}

    if (userId) where.userId = userId as string
    if (action) where.action = action as string
    if (resource) where.resource = resource as string
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate as string)
      if (endDate) where.createdAt.lte = new Date(endDate as string)
    }

    // Buscar logs com limite para evitar sobrecarga
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000, // Limite de 10k registros para evitar travamento
      include: {
        user: {
          select: {
            nome: true,
            email: true,
          }
        }
      }
    })

    // Preparar dados para o Excel
    const data = logs.map(log => ({
      'ID': log.id,
      'Usuário': log.user?.nome || 'N/A',
      'Email': log.user?.email || 'N/A',
      'Ação': log.action,
      'Recurso': log.resource,
      'Descrição': log.details || '',
      'IP': log.ipAddress || 'N/A',
      'Data/Hora': log.createdAt.toLocaleString('pt-BR'),
    }))

    // Criar workbook
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs de Auditoria')

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 15 }, // ID
      { wch: 25 }, // Usuário
      { wch: 30 }, // Email
      { wch: 20 }, // Ação
      { wch: 20 }, // Recurso
      { wch: 40 }, // Descrição
      { wch: 15 }, // IP
      { wch: 20 }, // Data/Hora
    ]
    worksheet['!cols'] = colWidths

    // Gerar buffer do Excel
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Configurar headers para download
    const filename = `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', buffer.length.toString())

    // Enviar arquivo
    res.send(buffer)
  } catch (error) {
    console.error('Erro ao exportar logs de auditoria:', error)
    res.status(500).json({ error: 'Erro ao exportar logs de auditoria' })
  }
})

export default router
