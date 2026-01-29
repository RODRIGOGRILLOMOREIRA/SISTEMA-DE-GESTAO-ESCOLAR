import { Router } from 'express';
import { z } from 'zod';
import { log } from '../lib/logger';
import { recordLoginAttempt } from '../lib/metrics';
import { authRateLimiter, registerAuthFailure, clearAuthFailures } from '../middlewares/rate-limit';
import authService from '../services/auth.service';

export const authRouter = Router();

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
  twoFactorToken: z.string().optional(),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

// POST /api/auth/login - VERSÃO PROFISSIONAL
authRouter.post('/login', authRateLimiter, async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  try {
    // Validar entrada
    const { email, senha, twoFactorToken } = loginSchema.parse(req.body);

    // Executar login via serviço profissional
    const result = await authService.login({ email, senha, twoFactorToken }, ip);

    if (!result.success) {
      // Registrar falha
      await registerAuthFailure(ip);
      recordLoginAttempt(false);
      
      return res.status(401).json({ 
        error: result.error || 'Falha na autenticação' 
      });
    }

    // Login bem-sucedido
    await clearAuthFailures(ip);
    recordLoginAttempt(true);

    return res.json({
      success: true,
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user,
    });

  } catch (validationError: any) {
    log.warn({ component: 'auth', err: validationError }, 'Erro de validação no login');
    return res.status(400).json({ 
      error: 'Dados inválidos',
      details: validationError.errors || validationError.message
    });
  }
});

// POST /api/auth/refresh - Renovar token
authRouter.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);

    const result = await authService.refreshToken(refreshToken);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    return res.json({
      success: true,
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user,
    });

  } catch (error: any) {
    log.warn({ component: 'auth', err: error }, 'Erro no refresh token');
    return res.status(400).json({ error: 'Token inválido' });
  }
});

// POST /api/auth/logout - Logout
authRouter.post('/logout', async (req, res) => {
  try {
    const userId = req.body.userId || (req as any).user?.userId;

    if (userId) {
      await authService.logout(userId);
    }

    return res.json({ success: true, message: 'Logout realizado com sucesso' });

  } catch (error: any) {
    log.error({ component: 'auth', err: error }, 'Erro no logout');
    return res.status(500).json({ error: 'Erro ao realizar logout' });
  }
});

// GET /api/auth/me - Obter usuário atual
authRouter.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = authService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Validar sessão
    const sessionValid = await authService.validateSession(decoded.userId, token);

    if (!sessionValid) {
      return res.status(401).json({ error: 'Sessão expirada' });
    }

    return res.json({ user: decoded });

  } catch (error: any) {
    log.error({ component: 'auth', err: error }, 'Erro ao obter usuário');
    return res.status(500).json({ error: 'Erro interno' });
  }
});

export default authRouter;