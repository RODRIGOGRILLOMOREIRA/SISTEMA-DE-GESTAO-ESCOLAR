import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';

export class AuditController {
  /**
   * Lista logs de auditoria com filtros
   */
  static async getLogs(req: Request, res: Response) {
    try {
      const {
        userId,
        action,
        resource,
        startDate,
        endDate,
        page,
        limit,
      } = req.query;

      const filters: any = {};

      if (userId) filters.userId = userId as string;
      if (action) filters.action = action as string;
      if (resource) filters.resource = resource as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const result = await AuditService.getLogs(filters);

      res.json(result);
    } catch (error: any) {
      console.error('Erro ao buscar logs:', error);
      res.status(500).json({ error: 'Erro ao buscar logs de auditoria' });
    }
  }

  /**
   * Busca estatísticas de auditoria
   */
  static async getStats(req: Request, res: Response) {
    try {
      const { userId, startDate, endDate } = req.query;

      const filters: any = {};

      if (userId) filters.userId = userId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const stats = await AuditService.getStats(filters);

      res.json(stats);
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas de auditoria' });
    }
  }

  /**
   * Busca um log específico
   */
  static async getLogById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const log = await AuditService.getLogById(id);

      if (!log) {
        return res.status(404).json({ error: 'Log não encontrado' });
      }

      res.json(log);
    } catch (error: any) {
      console.error('Erro ao buscar log:', error);
      res.status(500).json({ error: 'Erro ao buscar log de auditoria' });
    }
  }
}
