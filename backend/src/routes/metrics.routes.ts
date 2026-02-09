/**
 * Rotas de Métricas (Prometheus)
 * Fase 4 - Observabilidade
 */

import { Router } from 'express';
import metrics from '../lib/metrics';
import { log } from '../lib/logger';

const router = Router();

/**
 * GET /metrics - Endpoint para Prometheus scraping
 * Retorna métricas no formato Prometheus
 */
router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    const metricsData = await metrics.getMetrics();
    res.send(metricsData);
  } catch (error: any) {
    log.error({ err: error, endpoint: '/metrics' }, 'Erro ao coletar métricas');
    res.status(500).send('Error collecting metrics');
  }
});

export default router;
