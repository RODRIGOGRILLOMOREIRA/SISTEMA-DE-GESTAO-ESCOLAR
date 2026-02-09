/**
 * Rotas de Health Check e Métricas
 * Fase 4 - Observabilidade
 */

import { Router } from 'express';
import healthService from '../services/health.service';
import { log } from '../lib/logger';

const router = Router();

/**
 * GET /health - Health check completo
 * Retorna status detalhado de todos os serviços
 */
router.get('/health', async (req, res) => {
  try {
    const health = await healthService.performHealthCheck();
    
    // Status code baseado no status geral
    const statusCode = health.status === 'healthy' ? 200 : 
                       health.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error: any) {
    log.error({ err: error, endpoint: '/health' }, 'Erro ao executar health check');
    
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /health/live - Liveness probe (Kubernetes)
 * Verifica se o processo está rodando
 */
router.get('/health/live', async (req, res) => {
  try {
    const isAlive = await healthService.livenessProbe();
    
    if (isAlive) {
      res.status(200).json({ status: 'alive' });
    } else {
      res.status(503).json({ status: 'dead' });
    }
  } catch (error) {
    res.status(503).json({ status: 'dead' });
  }
});

/**
 * GET /health/ready - Readiness probe (Kubernetes)
 * Verifica se está pronto para receber tráfego
 */
router.get('/health/ready', async (req, res) => {
  try {
    const isReady = await healthService.readinessProbe();
    
    if (isReady) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not_ready' });
    }
  } catch (error) {
    res.status(503).json({ status: 'not_ready' });
  }
});

/**
 * GET /metrics/system - Métricas do sistema
 * Informações sobre recursos (CPU, memória, etc)
 */
router.get('/metrics/system', (req, res) => {
  try {
    const metrics = healthService.getSystemMetrics();
    res.json(metrics);
  } catch (error: any) {
    log.error({ err: error, endpoint: '/metrics/system' }, 'Erro ao coletar métricas do sistema');
    res.status(500).json({ error: error.message });
  }
});

export default router;
