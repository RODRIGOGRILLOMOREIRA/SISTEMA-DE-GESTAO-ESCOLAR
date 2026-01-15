import { Router } from 'express';
import { dropoutPredictionService } from '../services/dropout-prediction.service';
import { authMiddleware } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac.middleware';
import logger from '../lib/logger';

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

      // Log de successão
      console.log('Análise de predição de evasão realizada', {
        userId: req.user?.id,
        turmaId,
        totalAnalyzed: analyses.length
      });

      res.json(analyses);
    } catch (error: any) {
      logger.error('Erro ao analisar predição de evasão:', error);
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

      // Log de successão
      console.log('Análise individual de predição realizada', {
        userId: req.user?.id,
        alunoId: id,
        riskLevel: analysis.riskLevel
      });

      res.json(analysis);
    } catch (error: any) {
      logger.error('Erro ao analisar aluno:', error);
      
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

      // Log de successão
      console.log('Consulta de alunos em alto risco', {
        userId: req.user?.id,
        turmaId,
        count: highRiskStudents.length
      });

      res.json(highRiskStudents);
    } catch (error: any) {
      logger.error('Erro ao buscar alunos em alto risco:', error);
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
