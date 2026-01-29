import { Router } from 'express';
import { dropoutPredictionService } from '../services/dropout-prediction.service';
import { authMiddleware } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac.middleware';
import { log } from '../lib/logger';

const router = Router();

/**
 * @route GET /api/dropout-prediction/analyze
 * @desc Analisa todos os alunos e retorna predição de evasão
 * @access Private (ADMIN, GESTOR, COORDENADOR, DIRETOR)
 */
router.get(
  '/analyze',
  authMiddleware,
  requireRole(['ADMIN', 'COORDENADOR', 'DIRETOR']), // Permissão para visualizar relatórios
  async (req, res) => {
    try {
      const { turmaId } = req.query;

      const analyses = await dropoutPredictionService.analyzeAllStudents(
        turmaId as string | undefined
      );

      log.info({ 
        component: 'dropout-prediction.routes',
        userId: req.user?.id,
        turmaId,
        totalAnalyzed: analyses.length
      }, 'Análise de predição de evasão realizada');

      res.json(analyses);
    } catch (error: any) {
      log.error({ component: 'dropout-prediction.routes', error }, 'Erro ao analisar predição de evasão');
      res.status(500).json({ 
        error: 'Erro ao processar análise de predição',
        message: error.message 
      });
    }
  }
);

/**
 * @route GET /api/dropout-prediction/student/:id
 * @desc Analisa um aluno específico
 * @access Private
 */
router.get(
  '/student/:id',
  authMiddleware,
  requireRole(['ADMIN', 'COORDENADOR', 'DIRETOR', 'PROFESSOR']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const analysis = await dropoutPredictionService.analyzeStudent(id);

      log.info({ 
        component: 'dropout-prediction.routes',
        userId: req.user?.id,
        alunoId: id,
        riskLevel: analysis.riskLevel
      }, 'Análise individual de predição realizada');

      res.json(analysis);
    } catch (error: any) {
      log.error({ component: 'dropout-prediction.routes', error }, 'Erro ao analisar aluno');
      
      if (error.message === 'Aluno não encontrado') {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }
      
      res.status(500).json({ 
        error: 'Erro ao processar análise',
        message: error.message 
      });
    }
  }
);

/**
 * @route GET /api/dropout-prediction/high-risk
 * @desc Retorna apenas alunos em alto risco ou risco crítico
 * @access Private
 */
router.get(
  '/high-risk',
  authMiddleware,
  requireRole(['ADMIN', 'COORDENADOR', 'DIRETOR']),
  async (req, res) => {
    try {
      const { turmaId } = req.query;

      const highRiskStudents = await dropoutPredictionService.getHighRiskStudents(
        turmaId as string | undefined
      );

      log.info({ 
        component: 'dropout-prediction.routes',
        userId: req.user?.id,
        turmaId,
        count: highRiskStudents.length
      }, 'Consulta de alunos em alto risco');

      res.json(highRiskStudents);
    } catch (error: any) {
      log.error({ component: 'dropout-prediction.routes', error }, 'Erro ao buscar alunos em alto risco');
      res.status(500).json({ 
        error: 'Erro ao processar consulta',
        message: error.message 
      });
    }
  }
);

/**
 * @route GET /api/dropout-prediction/statistics
 * @desc Retorna estatísticas gerais de risco de evasão
 * @access Private
 */
router.get(
  '/statistics',
  authMiddleware,
  requireRole(['ADMIN', 'COORDENADOR', 'DIRETOR']),
  async (req, res) => {
    try {
      const { turmaId } = req.query;

      const statistics = await dropoutPredictionService.getRiskStatistics(
        turmaId as string | undefined
      );

      // Log de successão
      console.log('Estatísticas de predição consultadas', {
        userId: req.user?.id,
        turmaId,
        stats: statistics
      });

      res.json(statistics);
    } catch (error: any) {
      logger.error('Erro ao gerar estatísticas:', error);
      res.status(500).json({ 
        error: 'Erro ao processar estatísticas',
        message: error.message 
      });
    }
  }
);

export { router as dropoutPredictionRouter };
