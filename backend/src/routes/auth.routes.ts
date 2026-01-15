import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import { log, securityLogger } from '../lib/logger';
import { recordLoginAttempt } from '../lib/metrics';
import { authRateLimiter, registerAuthFailure, clearAuthFailures } from '../middlewares/rate-limit';
import twoFactorService from '../services/two-factor.service';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-secreto-aqui-123';

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
  twoFactorToken: z.string().optional(), // Token 2FA (se habilitado)
});

const registerSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(6),
  tipo: z.enum(['admin', 'usuario']).optional(),
  cargo: z.string().optional(),
});

const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  novaSenha: z.string().min(6),
});

// POST /api/auth/login
authRouter.post('/login', authRateLimiter, async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress;
  
  try {
    log.info({ event: 'login_attempt', email: req.body.email, ip }, 'Tentativa de login');
    const { email, senha, twoFactorToken } = loginSchema.parse(req.body);

    // Buscar usuário (com fallback caso 2FA não esteja configurado)
    let usuario;
    try {
      usuario = await prisma.usuarios.findUnique({
        where: { email },
        include: {
          twoFactorAuth: true // Incluir informações de 2FA
        }
      });
    } catch (relationError) {
      // Fallback: se a relação 2FA não existir, buscar apenas o usuário
      log.warn({ event: 'relation_error', err: relationError }, '2FA relation error, falling back');
      usuario = await prisma.usuarios.findUnique({
        where: { email }
      });
    }

    log.debug({ event: 'user_lookup', email, found: !!usuario }, 'Busca de usuário');

    if (!usuario) {
      securityLogger.warn({ event: 'login_failed', email, ip, reason: 'user_not_found' }, 'Usuário não encontrado');
      await registerAuthFailure(ip);
      recordLoginAttempt(false);
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    if (!usuario.ativo) {
      securityLogger.warn({ event: 'login_failed', email, ip, reason: 'user_inactive' }, 'Usuário inativo');
      await registerAuthFailure(ip);
      recordLoginAttempt(false);
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Verificar senha
    log.debug({ event: 'password_check', email }, 'Verificando senha');
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      securityLogger.warn({ event: 'login_failed', email, ip, reason: 'invalid_password' }, 'Senha inválida');
      await registerAuthFailure(ip);
      recordLoginAttempt(false);
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // FASE 4: Verificar 2FA se habilitado (com tratamento de erro robusto)
    try {
      if (usuario.twoFactorAuth?.enabled) {
        if (!twoFactorToken) {
          // Senha correta, mas precisa de 2FA
          log.info({ event: 'login_2fa_required', userId: usuario.id, email }, 'Login requer 2FA');
          return res.status(200).json({ 
            requires2FA: true,
            message: 'Digite o código do seu aplicativo autenticador' 
          });
        }

        // Verificar token 2FA
        const tokenValido = await twoFactorService.verifyToken(usuario.id, twoFactorToken);
        
        if (!tokenValido) {
          securityLogger.warn({ 
            event: 'login_2fa_failed', 
            userId: usuario.id, 
            email, 
            ip 
          }, 'Token 2FA inválido');
          await registerAuthFailure(ip);
          recordLoginAttempt(false);
          return res.status(401).json({ error: 'Código 2FA inválido' });
        }

        securityLogger.info({ 
          event: 'login_2fa_success', 
          userId: usuario.id, 
          email, 
          ip 
        }, '2FA verificado com sucesso');
      }
    } catch (twoFactorError: any) {
      // Se houver erro no 2FA (serviço não disponível, etc), apenas loga e continua
      log.warn({ event: '2fa_error', err: twoFactorError }, 'Erro no 2FA, continuando sem verificação');
    }

    // Limpar falhas de autenticação após login bem-sucedido
    await clearAuthFailures(ip);
    recordLoginAttempt(true);

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: usuario.id, // FASE 4: Padronizar como userId
        id: usuario.id, 
        email: usuario.email,
        tipo: usuario.tipo,
        cargo: usuario.cargo
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    securityLogger.info({ 
      event: 'login_success', 
      userId: usuario.id, 
      email, 
      ip,
      userAgent: req.headers['user-agent']
    }, 'Login realizado com sucesso');

    // Retornar dados do usuário (sem a senha)
    res.json({
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
      log.warn({ event: 'validation_error', errors: error.errors }, 'Erro de validação no login');
      return res.status(400).json({ error: error.errors });
    }
    log.error({ err: error, event: 'login_error' }, 'Erro no processo de login');
    res.status(500).json({ error: 'Erro ao fazer login' });
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


