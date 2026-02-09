import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

interface MaintenanceMode {
  enabled: boolean
  message?: string
  startTime?: Date
  endTime?: Date
  allowedIPs?: string[]
}

class MaintenanceService {
  private cache: MaintenanceMode | null = null
  private cacheTime = 0
  private cacheTTL = 30000 // 30 segundos

  async isMaintenanceMode(): Promise<MaintenanceMode> {
    // Usar cache para evitar muitas queries
    const now = Date.now()
    if (this.cache && (now - this.cacheTime) < this.cacheTTL) {
      return this.cache
    }

    try {
      // Buscar configuração de manutenção
      const config = await prisma.$queryRaw<Array<{
        enabled: boolean
        message: string | null
        start_time: Date | null
        end_time: Date | null
        allowed_ips: string | null
      }>>`
        SELECT 
          enabled,
          message,
          start_time,
          end_time,
          allowed_ips
        FROM maintenance_mode
        WHERE id = 1
      `

      if (config.length === 0) {
        // Criar configuração padrão se não existir
        await this.initializeMaintenanceTable()
        
        this.cache = { enabled: false }
        this.cacheTime = now
        return this.cache
      }

      const row = config[0]
      this.cache = {
        enabled: row.enabled,
        message: row.message || undefined,
        startTime: row.start_time || undefined,
        endTime: row.end_time || undefined,
        allowedIPs: row.allowed_ips ? row.allowed_ips.split(',') : undefined,
      }
      this.cacheTime = now

      return this.cache
    } catch (error) {
      console.error('Erro ao verificar modo de manutenção:', error)
      return { enabled: false }
    }
  }

  async setMaintenanceMode(
    enabled: boolean,
    options?: {
      message?: string
      startTime?: Date
      endTime?: Date
      allowedIPs?: string[]
    }
  ): Promise<void> {
    try {
      await this.initializeMaintenanceTable()

      await prisma.$executeRaw`
        UPDATE maintenance_mode
        SET 
          enabled = ${enabled},
          message = ${options?.message || null},
          start_time = ${options?.startTime || null},
          end_time = ${options?.endTime || null},
          allowed_ips = ${options?.allowedIPs?.join(',') || null},
          updated_at = NOW()
        WHERE id = 1
      `

      // Limpar cache
      this.cache = null
      
      console.log(`🔧 Modo de manutenção ${enabled ? 'ATIVADO' : 'DESATIVADO'}`)
    } catch (error) {
      console.error('Erro ao configurar modo de manutenção:', error)
      throw error
    }
  }

  private async initializeMaintenanceTable() {
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS maintenance_mode (
          id INTEGER PRIMARY KEY DEFAULT 1,
          enabled BOOLEAN NOT NULL DEFAULT false,
          message TEXT,
          start_time TIMESTAMP,
          end_time TIMESTAMP,
          allowed_ips TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          CONSTRAINT maintenance_mode_single_row CHECK (id = 1)
        )
      `

      await prisma.$executeRaw`
        INSERT INTO maintenance_mode (id, enabled)
        VALUES (1, false)
        ON CONFLICT (id) DO NOTHING
      `
    } catch (error) {
      // Ignorar erro se tabela já existir
    }
  }

  clearCache() {
    this.cache = null
  }
}

export const maintenanceService = new MaintenanceService()

// Middleware para verificar modo de manutenção
export async function maintenanceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const maintenance = await maintenanceService.isMaintenanceMode()

    if (!maintenance.enabled) {
      return next()
    }

    // Verificar se o IP está na lista de IPs permitidos
    const clientIP = req.ip || req.socket.remoteAddress
    if (maintenance.allowedIPs && clientIP) {
      const isAllowed = maintenance.allowedIPs.some(ip => 
        clientIP.includes(ip) || ip === clientIP
      )
      
      if (isAllowed) {
        return next()
      }
    }

    // Verificar se está fora do período de manutenção
    if (maintenance.startTime && maintenance.endTime) {
      const now = new Date()
      if (now < maintenance.startTime || now > maintenance.endTime) {
        return next()
      }
    }

    // Sistema em manutenção
    res.status(503).json({
      error: 'Sistema em manutenção',
      message: maintenance.message || 'O sistema está temporariamente indisponível para manutenção. Por favor, tente novamente mais tarde.',
      maintenance: true,
      estimatedEndTime: maintenance.endTime,
    })
  } catch (error) {
    console.error('Erro no middleware de manutenção:', error)
    next() // Em caso de erro, permitir acesso
  }
}

// Middleware para rotas administrativas (não aplica manutenção)
export function skipMaintenanceCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Adicionar flag para pular verificação de manutenção
  (req as any).skipMaintenance = true
  next()
}
