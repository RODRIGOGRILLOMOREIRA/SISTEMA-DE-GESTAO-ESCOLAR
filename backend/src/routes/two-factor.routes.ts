/**
 * Rotas de Two-Factor Authentication (2FA)
 * Fase 4 - Segurança Avançada
 */

import { Router, Request, Response } from 'express';
import twoFactorService from '../services/two-factor.service';
import { log } from '../lib/logger';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * GET /api/two-factor/status
 * Obter status do 2FA para o usuário atual
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const status = await twoFactorService.getStatus(userId);

    if (!status) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(status);
  } catch (error: any) {
    log.error({ err: error, endpoint: '/two-factor/status' }, 'Erro ao obter status 2FA');
    res.status(500).json({ error: 'Erro ao obter status do 2FA' });
  }
});

/**
 * POST /api/two-factor/setup
 * Gerar secret e QR code para configurar 2FA
 */
router.post('/setup', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const userEmail = (req as any).userEmail;

    const setup = await twoFactorService.generateSecret(userId, userEmail);

    res.json({
      qrCodeUrl: setup.qrCodeUrl,
      secret: setup.secret,
      backupCodes: setup.backupCodes,
      message: 'Escaneie o QR code com seu aplicativo autenticador (Google Authenticator, Authy, etc)'
    });
  } catch (error: any) {
    log.error({ err: error, endpoint: '/two-factor/setup' }, 'Erro ao configurar 2FA');
    res.status(500).json({ error: 'Erro ao configurar 2FA' });
  }
});

/**
 * POST /api/two-factor/verify
 * Verificar token e ativar 2FA
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { token } = req.body;

    if (!token || token.length !== 6) {
      return res.status(400).json({ error: 'Token inválido. Deve ter 6 dígitos.' });
    }

    const verified = await twoFactorService.verifyAndEnable(userId, token);

    if (verified) {
      res.json({
        success: true,
        message: '2FA ativado com sucesso! Guarde seus códigos de backup em local seguro.'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Token inválido. Verifique o código e tente novamente.'
      });
    }
  } catch (error: any) {
    log.error({ err: error, endpoint: '/two-factor/verify' }, 'Erro ao verificar token 2FA');
    res.status(500).json({ error: 'Erro ao verificar token' });
  }
});

/**
 * POST /api/two-factor/disable
 * Desabilitar 2FA (requer senha)
 */
router.post('/disable', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Senha obrigatória para desabilitar 2FA' });
    }

    // TODO: Verificar senha do usuário antes de desabilitar
    // Por enquanto, vamos permitir diretamente
    
    const disabled = await twoFactorService.disable(userId, password);

    if (disabled) {
      res.json({
        success: true,
        message: '2FA desabilitado com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao desabilitar 2FA'
      });
    }
  } catch (error: any) {
    log.error({ err: error, endpoint: '/two-factor/disable' }, 'Erro ao desabilitar 2FA');
    res.status(500).json({ error: 'Erro ao desabilitar 2FA' });
  }
});

/**
 * POST /api/two-factor/regenerate-backup-codes
 * Regenerar códigos de backup
 */
router.post('/regenerate-backup-codes', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const backupCodes = await twoFactorService.regenerateBackupCodes(userId);

    res.json({
      backupCodes,
      message: 'Códigos de backup regenerados. Guarde-os em local seguro. Os códigos antigos foram invalidados.'
    });
  } catch (error: any) {
    log.error({ err: error, endpoint: '/two-factor/regenerate-backup-codes' }, 
      'Erro ao regenerar códigos de backup');
    res.status(500).json({ error: 'Erro ao regenerar códigos de backup' });
  }
});

export default router;
