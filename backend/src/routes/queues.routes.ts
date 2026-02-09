import { Router } from 'express';
import queueService from '../services/queue.service';

export const queuesRouter = Router();

/**
 * GET /api/queues/stats
 * Retorna estatísticas de todas as filas
 */
queuesRouter.get('/stats', async (req, res) => {
  try {
    const stats = await queueService.obterEstatisticasFilas();
    return res.json(stats);
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar estatísticas',
      details: error.message,
    });
  }
});

/**
 * GET /api/queues/:fila/:jobId
 * Busca status de um job específico
 */
queuesRouter.get('/:fila/:jobId', async (req, res) => {
  try {
    const { fila, jobId } = req.params;
    
    if (!['notifications', 'reports', 'emails', 'scheduled'].includes(fila)) {
      return res.status(400).json({ 
        error: 'Fila inválida',
        valid: ['notifications', 'reports', 'emails', 'scheduled'],
      });
    }

    const status = await queueService.buscarStatusJob(jobId, fila as any);
    return res.json(status);
  } catch (error: any) {
    console.error('Erro ao buscar job:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar job',
      details: error.message,
    });
  }
});

/**
 * POST /api/queues/notificacao
 * Adiciona job de notificação à fila
 */
queuesRouter.post('/notificacao', async (req, res) => {
  try {
    const result = await queueService.adicionarNotificacao(req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    console.error('Erro ao adicionar notificação:', error);
    return res.status(500).json({ 
      error: 'Erro ao adicionar notificação',
      details: error.message,
    });
  }
});

/**
 * POST /api/queues/relatorio
 * Adiciona job de relatório à fila
 */
queuesRouter.post('/relatorio', async (req, res) => {
  try {
    const result = await queueService.adicionarRelatorio(req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    console.error('Erro ao adicionar relatório:', error);
    return res.status(500).json({ 
      error: 'Erro ao adicionar relatório',
      details: error.message,
    });
  }
});

/**
 * POST /api/queues/email
 * Adiciona job de e-mail à fila
 */
queuesRouter.post('/email', async (req, res) => {
  try {
    const result = await queueService.adicionarEmail(req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    console.error('Erro ao adicionar e-mail:', error);
    return res.status(500).json({ 
      error: 'Erro ao adicionar e-mail',
      details: error.message,
    });
  }
});

/**
 * POST /api/queues/agendar
 * Agenda job recorrente
 */
queuesRouter.post('/agendar', async (req, res) => {
  try {
    const result = await queueService.agendarJob(req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    console.error('Erro ao agendar job:', error);
    return res.status(500).json({ 
      error: 'Erro ao agendar job',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/queues/:fila/:jobId
 * Cancela um job pendente
 */
queuesRouter.delete('/:fila/:jobId', async (req, res) => {
  try {
    const { fila, jobId } = req.params;
    
    if (!['notifications', 'reports', 'emails', 'scheduled'].includes(fila)) {
      return res.status(400).json({ 
        error: 'Fila inválida',
      });
    }

    const result = await queueService.cancelarJob(jobId, fila as any);
    return res.json(result);
  } catch (error: any) {
    console.error('Erro ao cancelar job:', error);
    return res.status(500).json({ 
      error: 'Erro ao cancelar job',
      details: error.message,
    });
  }
});

/**
 * POST /api/queues/limpar
 * Remove jobs antigos completos/falhos
 */
queuesRouter.post('/limpar', async (req, res) => {
  try {
    const { diasAntigos = 7 } = req.body;
    const result = await queueService.limparJobsAntigos(diasAntigos);
    return res.json(result);
  } catch (error: any) {
    console.error('Erro ao limpar jobs:', error);
    return res.status(500).json({ 
      error: 'Erro ao limpar jobs',
      details: error.message,
    });
  }
});

export default queuesRouter;
