import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-secreto-aqui-123';

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
});

const registerSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(6),
  tipo: z.enum(['admin', 'usuario']).optional(),
});

const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  novaSenha: z.string().min(6),
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    console.log('📥 Login request:', { email: req.body.email, senha: '***' });
    const { email, senha } = loginSchema.parse(req.body);

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    console.log('👤 Usuário encontrado:', usuario ? 'Sim' : 'Não');

    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    if (!usuario.ativo) {
      console.log('❌ Usuário inativo');
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Verificar senha
    console.log('🔐 Verificando senha...');
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    console.log('✓ Senha válida:', senhaValida);
    
    if (!senhaValida) {
      console.log('❌ Senha inválida');
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        tipo: usuario.tipo 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retornar dados do usuário (sem a senha)
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Verificar se o email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(data.senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: senhaHash,
        tipo: 'USUARIO',
      },
    });

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        tipo: usuario.tipo 
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

    const usuario = await prisma.usuario.findUnique({
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
    await prisma.usuario.update({
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
    const usuario = await prisma.usuario.findUnique({
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
    await prisma.usuario.update({
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
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha
    await prisma.usuario.update({
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
    
    const usuario = await prisma.usuario.findUnique({
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
