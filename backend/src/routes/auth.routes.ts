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
  const ip = req.ip || req.socket.remoteAddress;
  
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

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Verificar se o email já existe
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { email: data.email },
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(data.senha, 10);

    // Criar usuário
    const usuario = await prisma.usuarios.create({
      data: {
        id: crypto.randomUUID(),
        nome: data.nome,
        email: data.email,
        senha: senhaHash,
        tipo: 'USUARIO',
        cargo: data.cargo || null,
        updatedAt: new Date(),
      },
    });

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        tipo: usuario.tipo,
        cargo: usuario.cargo
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        cargo: usuario.cargo,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao registrar:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = resetPasswordRequestSchema.parse(req.body);

    const usuario = await prisma.usuarios.findUnique({
      where: { email },
    });

    if (!usuario) {
      // Por segurança, não informar se o email existe ou não
      return res.json({ message: 'Se o email existir, um link de recuperação será enviado' });
    }

    // Gerar token de reset (válido por 1 hora)
    const resetToken = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetTokenExpira = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no banco
    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: {
        resetToken,
        resetTokenExpira,
      },
    });

    // TODO: Enviar email com o link de reset
    // Por enquanto, retornar o token (em produção, enviar por email)
    res.json({ 
      message: 'Link de recuperação enviado',
      // REMOVER EM PRODUÇÃO:
      resetToken 
    });
  } catch (error) {
    console.error('Erro ao solicitar reset:', error);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, novaSenha } = resetPasswordSchema.parse(req.body);

    // Verificar token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    // Buscar usuário
    const usuario = await prisma.usuarios.findUnique({
      where: { id: decoded.id },
    });

    if (!usuario || usuario.resetToken !== token) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    if (usuario.resetTokenExpira && usuario.resetTokenExpira < new Date()) {
      return res.status(400).json({ error: 'Token expirado' });
    }

    // Atualizar senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: {
        senha: senhaHash,
        resetToken: null,
        resetTokenExpira: null,
      },
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({ error: 'Erro ao resetar senha' });
  }
});

// POST /api/auth/reset-password-direct (resetar senha sem token)
authRouter.post('/reset-password-direct', async (req, res) => {
  try {
    const { email, novaSenha } = req.body;

    if (!email || !novaSenha) {
      return res.status(400).json({ error: 'Email e nova senha são obrigatórios' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }

    // Buscar usuário pelo email
    const usuario = await prisma.usuarios.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha
    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: {
        senha: senhaHash,
      },
    });

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

// GET /api/auth/me (verificar autenticação)
authRouter.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const usuario = await prisma.usuarios.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        ativo: true,
      },
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});


