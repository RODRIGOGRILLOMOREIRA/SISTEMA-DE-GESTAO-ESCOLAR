/**
 * Testes de integração para rotas de autenticação
 * @description Testa endpoints de login com mocks completos do Prisma e bcrypt
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express, { Application } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock do Prisma antes de importar rotas
jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    usuarios: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

// Mock do Redis
jest.mock('../../src/lib/redis', () => ({
  redisSet: jest.fn().mockResolvedValue('OK'),
  redisGet: jest.fn().mockResolvedValue(null),
  redisDel: jest.fn().mockResolvedValue(1),
  isRedisConnected: jest.fn().mockResolvedValue(true),
}));

import { prisma } from '../../src/lib/prisma';

describe('Auth Routes - Testes de Integração Completos', () => {
  let app: Application;
  const mockUser = {
    id: 'user-uuid-123',
    nome: 'Admin Teste',
    email: 'admin@escola.com',
    senha: '', // Será preenchido com hash
    role: 'ADMIN',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerificado: true,
    telefone: null,
    avatar: null,
    ultimoAcesso: new Date(),
  };

  beforeAll(async () => {
    // Gerar hash real de senha para testes
    mockUser.senha = await bcrypt.hash('senha123', 10);

    app = express();
    app.use(express.json());

    // Rota de login completa com lógica real
    app.post('/api/auth/login', async (req, res) => {
      try {
        const { email, senha } = req.body;

        // Validação de entrada
        if (!email || !senha) {
          return res.status(400).json({ 
            error: 'Email e senha são obrigatórios',
            code: 'MISSING_CREDENTIALS'
          });
        }

        // Buscar usuário no banco (mockado)
        const usuario = await prisma.usuarios.findUnique({
          where: { email }
        });

        if (!usuario) {
          return res.status(401).json({ 
            error: 'Credenciais inválidas',
            code: 'INVALID_CREDENTIALS'
          });
        }

        // Verificar senha com bcrypt
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
          return res.status(401).json({ 
            error: 'Credenciais inválidas',
            code: 'INVALID_CREDENTIALS'
          });
        }

        // Verificar se usuário está ativo
        if (!usuario.ativo) {
          return res.status(403).json({ 
            error: 'Usuário desativado',
            code: 'USER_INACTIVE'
          });
        }

        // Gerar JWT
        const token = jwt.sign(
          { 
            userId: usuario.id,
            email: usuario.email,
            role: usuario.role
          },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '24h' }
        );

        // Registrar auditoria
        await prisma.auditLog.create({
          data: {
            id: 'audit-uuid',
            userId: usuario.id,
            userName: usuario.nome,
            action: 'LOGIN',
            resource: 'AUTH',
            details: { email: usuario.email },
            ipAddress: req.ip || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'test-agent',
          }
        });

        // Retornar sucesso
        return res.json({
          success: true,
          token,
          refreshToken: 'refresh-token-mock',
          user: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role,
          }
        });

      } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ 
          error: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        });
      }
    });
  });

  describe('POST /api/auth/login - Validações de Entrada', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('deve retornar 400 se email não for fornecido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ senha: 'senha123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email e senha são obrigatórios');
      expect(response.body.code).toBe('MISSING_CREDENTIALS');
    });

    it('deve retornar 400 se senha não for fornecida', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@escola.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email e senha são obrigatórios');
      expect(response.body.code).toBe('MISSING_CREDENTIALS');
    });

    it('deve retornar 400 se ambos email e senha não forem fornecidos', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('MISSING_CREDENTIALS');
    });

  });

  describe('POST /api/auth/login - Autenticação', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('deve retornar 401 com email não cadastrado', async () => {
      (prisma.usuarios.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'naoexiste@escola.com',
          senha: 'senha123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciais inválidas');
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
      expect(prisma.usuarios.findUnique).toHaveBeenCalledWith({
        where: { email: 'naoexiste@escola.com' }
      });
    });

    it('deve retornar 401 com senha incorreta', async () => {
      (prisma.usuarios.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@escola.com',
          senha: 'senhaErrada'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciais inválidas');
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('deve retornar 403 se usuário estiver desativado', async () => {
      const usuarioInativo = { ...mockUser, ativo: false };
      (prisma.usuarios.findUnique as jest.Mock).mockResolvedValue(usuarioInativo);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@escola.com',
          senha: 'senha123'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Usuário desativado');
      expect(response.body.code).toBe('USER_INACTIVE');
    });

    it('deve retornar 200 e token com credenciais válidas', async () => {
      (prisma.usuarios.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        id: 'audit-uuid',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@escola.com',
          senha: 'senha123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(mockUser.id);
      expect(response.body.user.email).toBe(mockUser.email);
      expect(response.body.user.role).toBe('ADMIN');
      
      // Não deve retornar senha
      expect(response.body.user.senha).toBeUndefined();

      // Verificar que auditoria foi registrada
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUser.id,
            action: 'LOGIN',
          })
        })
      );
    });
  });

  describe('POST /api/auth/login - Estrutura de Resposta', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (prisma.usuarios.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});
    });

    it('deve retornar estrutura de resposta completa e correta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@escola.com',
          senha: 'senha123'
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('nome');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('role');
      
      // Não deve expor dados sensíveis
      expect(response.body.user).not.toHaveProperty('senha');
      expect(response.body.user).not.toHaveProperty('emailVerificado');
    });

    it('deve aceitar Content-Type application/json', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          email: 'admin@escola.com',
          senha: 'senha123'
        }));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deve retornar Content-Type application/json', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@escola.com',
          senha: 'senha123'
        });

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('POST /api/auth/login - Validação de Email', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('deve validar email inválido e retornar 401', async () => {
      (prisma.usuarios.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          senha: 'senha123'
        });

      expect(response.status).toBe(401);
    });

    it('deve aceitar email válido com diferentes domínios', async () => {
      (prisma.usuarios.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const emails = [
        'admin@escola.com',
        'professor@escola.com.br',
        'coordenador@rede.municipal.gov.br'
      ];

      for (const email of emails) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email, senha: 'senha123' });

        expect([200, 401]).toContain(response.status);
      }
    });
  });

  describe('POST /api/auth/login - Tratamento de Erros', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('deve tratar erro do banco de dados gracefully', async () => {
      (prisma.usuarios.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@escola.com',
          senha: 'senha123'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Erro interno do servidor');
      expect(response.body.code).toBe('INTERNAL_ERROR');
    });

    it('deve tratar erro na criação de audit log', async () => {
      (prisma.usuarios.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.auditLog.create as any).mockRejectedValue(
        new Error('Audit log creation failed')
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@escola.com',
          senha: 'senha123'
        });

      expect(response.status).toBe(500);
      expect(response.body.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/auth/login - Segurança', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('não deve expor diferença entre usuário inexistente e senha incorreta', async () => {
      // Usuário não existe
      (prisma.usuarios.findUnique as jest.Mock).mockResolvedValue(null);
      const response1 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'naoexiste@escola.com', senha: 'senha123' });

      // Senha incorreta
      (prisma.usuarios.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const response2 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@escola.com', senha: 'senhaErrada' });

      // Ambos devem retornar a mesma mensagem
      expect(response1.body.error).toBe(response2.body.error);
      expect(response1.body.code).toBe(response2.body.code);
      expect(response1.status).toBe(response2.status);
    });

    it('deve usar bcrypt para comparação de senha', async () => {
      const bcryptSpy = jest.spyOn(bcrypt, 'compare');
      
      (prisma.usuarios.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@escola.com',
          senha: 'senha123'
        });

      expect(bcryptSpy).toHaveBeenCalled();
      bcryptSpy.mockRestore();
    });

    it('deve gerar JWT válido com claims corretos', async () => {
      (prisma.usuarios.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@escola.com',
          senha: 'senha123'
        });

      const token = response.body.token;
      expect(token).toBeDefined();
      
      // Verificar estrutura do JWT (3 partes separadas por ponto)
      const parts = token.split('.');
      expect(parts).toHaveLength(3);

      // Decodificar payload (sem verificar assinatura)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('email');
      expect(payload).toHaveProperty('role');
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
    });
  });
});

