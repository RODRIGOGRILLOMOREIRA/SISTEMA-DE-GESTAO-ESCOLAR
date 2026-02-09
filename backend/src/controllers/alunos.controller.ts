/**
 * Controller de Alunos
 * Gerencia operações CRUD de alunos com cache e paginação
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import cacheService from '../services/cache.service';
import { paginatedResponse, getCacheKey } from '../middlewares/pagination';
import { z } from 'zod';
import crypto from 'crypto';

// Schema de validação
const alunoSchema = z.object({
  nome: z.string().min(3),
  cpf: z.string().min(11).max(14),
  dataNascimento: z.string(),
  email: z.string().email(),
  telefone: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  responsavel: z.string(),
  telefoneResp: z.string(),
  turmaId: z.string().nullable().optional(),
});

/**
 * GET /api/alunos - Listar todos os alunos (com cache e paginação)
 */
export const listarAlunos = async (req: Request, res: Response) => {
  try {
    const pagination = (req as any).pagination;
    const { search, turmaId, statusMatricula } = req.query;

    // Construir chave de cache
    const cacheKey = getCacheKey('alunos', pagination, {
      search: search as string,
      turmaId: turmaId as string,
      status: statusMatricula as string,
    });

    // Tentar buscar do cache
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Construir filtro
    const where: any = {};
    if (search) {
      where.OR = [
        { nome: { contains: search as string, mode: 'insensitive' } },
        { cpf: { contains: search as string } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (turmaId) where.turmaId = turmaId;
    if (statusMatricula) where.statusMatricula = statusMatricula;

    // Buscar com paginação
    const [alunos, total] = await Promise.all([
      prisma.alunos.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { [pagination.sort]: pagination.order },
        select: {
          id: true,
          nome: true,
          cpf: true,
          email: true,
          telefone: true,
          responsavel: true,
          telefoneResp: true,
          turmaId: true,
          statusMatricula: true,
          numeroMatricula: true,
          createdAt: true,
          turmas: {
            select: {
              nome: true,
              ano: true,
              periodo: true,
            },
          },
        },
      }),
      prisma.alunos.count({ where }),
    ]);

    const response = paginatedResponse(alunos, total, pagination.page, pagination.limit);

    // Armazenar no cache (30 minutos)
    await cacheService.set(cacheKey, response, 1800);

    res.json(response);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
};

/**
 * GET /api/alunos/turma/:turmaId - Listar alunos por turma (com cache)
 */
export const listarAlunosPorTurma = async (req: Request, res: Response) => {
  try {
    const { turmaId } = req.params;
    const cacheKey = `alunos:turma:${turmaId}`;

    const alunos = await cacheService.getOrSet(
      cacheKey,
      async () => {
        return await prisma.alunos.findMany({
          where: { turmaId },
          orderBy: { nome: 'asc' },
          select: {
            id: true,
            nome: true,
            cpf: true,
            email: true,
            statusMatricula: true,
            numeroMatricula: true,
            turmas: {
              select: {
                nome: true,
                ano: true,
                periodo: true,
              },
            },
          },
        });
      },
      1800 // 30 minutos
    );

    res.json(alunos);
  } catch (error) {
    console.error('Erro ao buscar alunos da turma:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos da turma' });
  }
};

/**
 * GET /api/alunos/:id - Buscar aluno por ID (com cache)
 */
export const buscarAlunoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `aluno:${id}`;

    const aluno = await cacheService.getOrSet(
      cacheKey,
      async () => {
        return await prisma.alunos.findUnique({
          where: { id },
          include: {
            turmas: true,
            notas: {
              include: {
                disciplinas: {
                  select: {
                    nome: true,
                  },
                },
              },
              orderBy: {
                trimestre: 'asc',
              },
            },
            frequencias: {
              orderBy: {
                data: 'desc',
              },
              take: 30, // Últimos 30 registros
            },
          },
        });
      },
      600 // 10 minutos
    );

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    res.json(aluno);
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({ error: 'Erro ao buscar aluno' });
  }
};

/**
 * POST /api/alunos - Criar novo aluno
 */
export const criarAluno = async (req: Request, res: Response) => {
  try {
    // Validar dados
    const validatedData = alunoSchema.parse(req.body);

    // Gerar ID único
    const id = crypto.randomUUID();

    // Criar aluno
    const aluno = await prisma.alunos.create({
      data: {
        id,
        ...validatedData,
        dataNascimento: new Date(validatedData.dataNascimento),
        numeroMatricula: `MAT${Date.now()}`,
        statusMatricula: 'ATIVO',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        turmas: true,
      },
    });

    // Invalidar cache de alunos
    await cacheService.invalidate('alunos:*');

    res.status(201).json(aluno);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ error: 'Erro ao criar aluno' });
  }
};

/**
 * PUT /api/alunos/:id - Atualizar aluno
 */
export const atualizarAluno = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar dados (parcial)
    const validatedData = alunoSchema.partial().parse(req.body);

    // Atualizar aluno
    const aluno = await prisma.alunos.update({
      where: { id },
      data: {
        ...validatedData,
        dataNascimento: validatedData.dataNascimento
          ? new Date(validatedData.dataNascimento)
          : undefined,
        updatedAt: new Date(),
      },
      include: {
        turmas: true,
      },
    });

    // Invalidar cache
    await cacheService.invalidate('alunos:*');
    await cacheService.delete(`aluno:${id}`);

    res.json(aluno);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Erro ao atualizar aluno:', error);
    res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
};

/**
 * DELETE /api/alunos/:id - Deletar aluno
 */
export const deletarAluno = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Deletar aluno (soft delete - atualizar status)
    const aluno = await prisma.alunos.update({
      where: { id },
      data: {
        statusMatricula: 'INATIVO',
        updatedAt: new Date(),
      },
    });

    // Invalidar cache
    await cacheService.invalidate('alunos:*');
    await cacheService.delete(`aluno:${id}`);

    res.json({ message: 'Aluno desativado com sucesso', aluno });
  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({ error: 'Erro ao deletar aluno' });
  }
};

/**
 * GET /api/alunos/stats/geral - Estatísticas gerais (com cache)
 */
export const estatisticasAlunos = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'alunos:stats:geral';

    const stats = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const [total, ativos, inativos, porTurma] = await Promise.all([
          prisma.alunos.count(),
          prisma.alunos.count({ where: { statusMatricula: 'ATIVO' } }),
          prisma.alunos.count({ where: { statusMatricula: 'INATIVO' } }),
          prisma.alunos.groupBy({
            by: ['turmaId'],
            _count: true,
            where: {
              statusMatricula: 'ATIVO',
            },
          }),
        ]);

        return {
          total,
          ativos,
          inativos,
          porTurma,
        };
      },
      3600 // 1 hora
    );

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};
