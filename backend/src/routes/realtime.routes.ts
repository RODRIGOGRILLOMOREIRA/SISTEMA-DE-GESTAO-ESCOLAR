/**
 * =====================================
 * ROTAS - RECURSOS TEMPO REAL
 * =====================================
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import gamificationService from '../services/gamification.service';
import autocompleteService from '../services/autocomplete.service';
import presenceService from '../services/presence.service';
import { emitNotification, emitDashboardUpdate, getChatHistory } from '../lib/websocket';

const router = Router();

// ======================
// GAMIFICAÇÃO
// ======================

/**
 * GET /api/realtime/gamification/profile/:alunoId
 * Obter perfil de gamificação do aluno
 */
router.get('/gamification/profile/:alunoId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { alunoId } = req.params;
    
    const profile = await gamificationService.getGamificationProfile(alunoId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Erro ao obter perfil de gamificação:', error);
    res.status(500).json({ error: 'Erro ao obter perfil' });
  }
});

/**
 * GET /api/realtime/gamification/leaderboard
 * Obter ranking geral
 */
router.get('/gamification/leaderboard', authMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const leaderboard = await gamificationService.getLeaderboard(limit);
    
    res.json({
      leaderboard,
      total: leaderboard.length,
    });
  } catch (error) {
    console.error('Erro ao obter leaderboard:', error);
    res.status(500).json({ error: 'Erro ao obter ranking' });
  }
});

/**
 * POST /api/realtime/gamification/points
 * Adicionar pontos a um aluno (admin/professor)
 */
router.post('/gamification/points', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { alunoId, points, reason } = req.body;
    
    if (!alunoId || !points || !reason) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    await gamificationService.addPoints(alunoId, points, reason);
    
    res.json({ 
      success: true,
      message: 'Pontos adicionados com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao adicionar pontos:', error);
    res.status(500).json({ error: 'Erro ao adicionar pontos' });
  }
});

/**
 * POST /api/realtime/gamification/badge
 * Conceder badge a um aluno
 */
router.post('/gamification/badge', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { alunoId, badgeType } = req.body;
    
    if (!alunoId || !badgeType) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    await gamificationService.awardBadge(alunoId, badgeType);
    
    res.json({ 
      success: true,
      message: 'Badge concedido com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao conceder badge:', error);
    res.status(500).json({ error: 'Erro ao conceder badge' });
  }
});

// ======================
// BUSCA AUTOCOMPLETE
// ======================

/**
 * GET /api/realtime/search/autocomplete
 * Busca com autocomplete
 */
router.get('/search/autocomplete', authMiddleware, async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const type = (req.query.type as any) || 'all';
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [], results: [] });
    }
    
    const results = await autocompleteService.autocomplete(query, type, limit);
    
    res.json(results);
  } catch (error) {
    console.error('Erro no autocomplete:', error);
    res.status(500).json({ error: 'Erro na busca' });
  }
});

/**
 * GET /api/realtime/search/advanced
 * Busca avançada
 */
router.get('/search/advanced', authMiddleware, async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const filters = {
      includeAlunos: req.query.alunos !== 'false',
      includeProfessores: req.query.professores !== 'false',
      includeTurmas: req.query.turmas !== 'false',
    };
    
    if (!query || query.length < 2) {
      return res.json({ alunos: [], professores: [], turmas: [] });
    }
    
    const results = await autocompleteService.advancedSearch(query, filters);
    
    res.json(results);
  } catch (error) {
    console.error('Erro na busca avançada:', error);
    res.status(500).json({ error: 'Erro na busca' });
  }
});

/**
 * POST /api/realtime/search/reindex
 * Reindexar dados (admin)
 */
router.post('/search/reindex', authMiddleware, async (req: Request, res: Response) => {
  try {
    // TODO: Verificar se usuário é admin
    
    // Executar reindexação em background
    autocompleteService.reindexAll().catch(console.error);
    
    res.json({ 
      success: true,
      message: 'Reindexação iniciada em background' 
    });
  } catch (error) {
    console.error('Erro ao reindexar:', error);
    res.status(500).json({ error: 'Erro ao iniciar reindexação' });
  }
});

// ======================
// PRESENÇA ONLINE
// ======================

/**
 * GET /api/realtime/presence/online
 * Obter usuários online
 */
router.get('/presence/online', authMiddleware, async (req: Request, res: Response) => {
  try {
    const users = await presenceService.getOnlineUsers();
    
    res.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Erro ao obter usuários online:', error);
    res.status(500).json({ error: 'Erro ao obter usuários online' });
  }
});

/**
 * GET /api/realtime/presence/stats
 * Obter estatísticas de presença
 */
router.get('/presence/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const stats = await presenceService.getPresenceStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

/**
 * GET /api/realtime/presence/user/:userId
 * Verificar se usuário está online e obter last seen
 */
router.get('/presence/user/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const isOnline = await presenceService.isUserOnline(userId);
    const lastSeen = await presenceService.getUserLastSeen(userId);
    
    res.json({
      userId,
      isOnline,
      lastSeen,
    });
  } catch (error) {
    console.error('Erro ao verificar presença:', error);
    res.status(500).json({ error: 'Erro ao verificar presença' });
  }
});

/**
 * POST /api/realtime/presence/status
 * Mudar status do usuário
 */
router.post('/presence/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    if (!['online', 'away', 'busy'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    await presenceService.changeUserStatus(userId, status);
    
    res.json({ 
      success: true,
      status 
    });
  } catch (error) {
    console.error('Erro ao mudar status:', error);
    res.status(500).json({ error: 'Erro ao mudar status' });
  }
});

// ======================
// CHAT
// ======================

/**
 * GET /api/realtime/chat/:chatId/history
 * Obter histórico de mensagens
 */
router.get('/chat/:chatId/history', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const messages = await getChatHistory(chatId, limit);
    
    res.json({
      chatId,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error('Erro ao obter histórico de chat:', error);
    res.status(500).json({ error: 'Erro ao obter histórico' });
  }
});

/**
 * GET /api/realtime/chat/:chatId/typing
 * Obter quem está digitando
 */
router.get('/chat/:chatId/typing', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    
    const typingUsers = await presenceService.getTypingUsers(chatId);
    
    res.json({
      chatId,
      typingUsers,
      count: typingUsers.length,
    });
  } catch (error) {
    console.error('Erro ao obter typing users:', error);
    res.status(500).json({ error: 'Erro ao obter typing users' });
  }
});

// ======================
// NOTIFICAÇÕES
// ======================

/**
 * POST /api/realtime/notifications/send
 * Enviar notificação para usuário
 */
router.post('/notifications/send', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, title, message, type, data } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    await emitNotification(userId, {
      title,
      message,
      type: type || 'info',
      data: data || {},
    });
    
    res.json({ 
      success: true,
      message: 'Notificação enviada' 
    });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    res.status(500).json({ error: 'Erro ao enviar notificação' });
  }
});

// ======================
// DASHBOARD
// ======================

/**
 * POST /api/realtime/dashboard/update
 * Emitir atualização de dashboard
 */
router.post('/dashboard/update', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { metric, value, label } = req.body;
    
    if (!metric || value === undefined) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    await emitDashboardUpdate({
      metric,
      value,
      label: label || metric,
      timestamp: new Date(),
    });
    
    res.json({ 
      success: true,
      message: 'Dashboard atualizado' 
    });
  } catch (error) {
    console.error('Erro ao atualizar dashboard:', error);
    res.status(500).json({ error: 'Erro ao atualizar dashboard' });
  }
});

export default router;
