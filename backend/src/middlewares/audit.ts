import { Request, Response, NextFunction } from 'express'
import { AuditService } from '../services/audit.service'

interface AuditOptions {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW'
  resource: string
  getResourceId?: (req: Request) => string | undefined
  getDetails?: (req: Request) => any
}

export function auditMiddleware(options: AuditOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Captura a resposta original
    const originalSend = res.send

    res.send = function (data: any): Response {
      // Restaura o método original
      res.send = originalSend

      // Se a resposta foi bem-sucedida (2xx), cria o log
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Executa de forma assíncrona sem bloquear a resposta
        setImmediate(async () => {
          try {
            const user = (req as any).user
            if (!user) return

            const requestInfo = AuditService.extractRequestInfo(req)

            await AuditService.createLog({
              userId: user.id,
              userName: user.nome || user.email,
              action: options.action,
              resource: options.resource,
              resourceId: options.getResourceId ? options.getResourceId(req) : req.params.id,
              details: options.getDetails ? options.getDetails(req) : { body: req.body },
              ipAddress: requestInfo.ipAddress,
              userAgent: requestInfo.userAgent,
            })
          } catch (error) {
            console.error('Erro no middleware de auditoria:', error)
          }
        })
      }

      return originalSend.call(this, data)
    }

    next()
  }
}

// Middleware simplificado para ações comuns
export const audit = {
  create: (resource: string) => auditMiddleware({ action: 'CREATE', resource }),
  update: (resource: string) => auditMiddleware({ action: 'UPDATE', resource }),
  delete: (resource: string) => auditMiddleware({ action: 'DELETE', resource }),
  view: (resource: string) => auditMiddleware({ action: 'VIEW', resource }),
}
