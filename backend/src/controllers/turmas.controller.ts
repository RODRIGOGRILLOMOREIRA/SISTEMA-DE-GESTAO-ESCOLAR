import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import cacheService from '../services/cache.service';
import crypto from 'crypto';

// Schema de validação para criar/atualizar turma
const turmaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  ano: z.number().int().min(1).max(9),
  periodo: z.enum(['MATUTINO', 'VESPERTINO', 'NOTURNO']),
  professorId: z.string().uuid().optional(),
  anoLetivo: z.number().int().default(2025),
});

/**
 * Lista todas as turmas com paginação, busca e filtros
 */
export async function listarTurmas(req: Request, res: Response) {
  try {
    const { page, limit, skip, sort, order } = (req as any).pagination;
    const { busca, ano, periodo, anoLetivo } = req.query;

    // Gera chave de cache única baseada em todos os parâmetros
    const cacheKey = `turmas:list:${page}:${limit}:${sort}:${order}:${busca || ''}:${ano || ''}:${periodo || ''}:${anoLetivo || ''}`;

    // Tenta buscar do cache (30 min TTL)
    const cached = await cacheService.getOrSet(
      cacheKey,
      async () => {
        // Monta filtros dinâmicos
        const where: any = {};
        
        if (busca) {
          where.nome = { contains: busca as string, mode: 'insensitive' };
        }
        
        if (ano) {
          where.ano = parseInt(ano as string);
        }
        
        if (periodo) {
          where.periodo = periodo as string;
        }
        
        if (anoLetivo) {
          where.anoLetivo = parseInt(anoLetivo as string);
        }

        // Busca paginada
        const [turmas, total] = await Promise.all([
          prisma.turmas.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sort]: order },
            include: {
              professores: {
                select: {
                  id: true,
                  nome: true,
                  email: true,
                },
              },
              _count: {
                select: {
                  alunos: true,
                  disciplinas_turmas: true,
                },
              },
            },
          }),
          prisma.turmas.count({ where }),
        ]);

        return {
          turmas,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
      1800 // 30 minutos
    );

    return res.json(cached);
  } catch (error) {
    console.error('Erro ao listar turmas:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar turmas',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

/**
 * Busca turma por ID com alunos, disciplinas e grade horária
 */
export async function buscarTurmaPorId(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const cacheKey = `turma:${id}`;

    const turma = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const turmaBuscada = await prisma.turmas.findUnique({
          where: { id },
          include: {
            professores: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
              },
            },
            alunos: {
              where: { statusMatricula: 'ATIVO' },
              select: {
                id: true,
                nome: true,
                numeroMatricula: true,
                statusMatricula: true,
              },
              orderBy: { nome: 'asc' },
            },
            disciplinas_turmas: {
              include: {
                disciplinas: {
                  select: {
                    id: true,
                    nome: true,
                    cargaHoraria: true,
                  },
                },
                professores: {
                  select: {
                    id: true,
                    nome: true,
                  },
                },
              },
            },
            grade_horaria: {
              select: {
                id: true,
                turmaId: true,
                updatedAt: true,
              },
            },
            _count: {
              select: {
                alunos: true,
                disciplinas_turmas: true,
                frequencias: true,
              },
            },
          },
        });

        if (!turmaBuscada) {
          return null;
        }

        return turmaBuscada;
      },
      600 // 10 minutos
    );

    if (!turma) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    return res.json(turma);
  } catch (error) {
    console.error('Erro ao buscar turma:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar turma',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

/**
 * Cria nova turma
 */
export async function criarTurma(req: Request, res: Response) {
  try {
    const validatedData = turmaSchema.parse(req.body);

    // Verifica se já existe turma com mesmo nome e ano letivo
    const turmaExistente = await prisma.turmas.findFirst({
      where: {
        nome: validatedData.nome,
        anoLetivo: validatedData.anoLetivo,
      },
    });

    if (turmaExistente) {
      return res.status(409).json({ 
        error: 'Já existe uma turma com este nome neste ano letivo' 
      });
    }

    // Cria a turma
    const turmaCriada = await prisma.turmas.create({
      data: {
        id: crypto.randomUUID(),
        nome: validatedData.nome,
        ano: validatedData.ano,
        periodo: validatedData.periodo,
        professorId: validatedData.professorId,
        anoLetivo: validatedData.anoLetivo,
        updatedAt: new Date(),
      },
      include: {
        professores: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    // Invalida cache de listagem
    await cacheService.invalidate('turmas:*');

    return res.status(201).json(turmaCriada);
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    return res.status(500).json({ 
      error: 'Erro ao criar turma',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

/**
 * Atualiza turma existente
 */
export async function atualizarTurma(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = turmaSchema.partial().parse(req.body);

    // Verifica se turma existe
    const turmaExistente = await prisma.turmas.findUnique({
      where: { id },
    });

    if (!turmaExistente) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    // Se está alterando nome, verifica duplicação
    if (validatedData.nome && validatedData.nome !== turmaExistente.nome) {
      const turmaDuplicada = await prisma.turmas.findFirst({
        where: {
          nome: validatedData.nome,
          anoLetivo: validatedData.anoLetivo || turmaExistente.anoLetivo,
          id: { not: id },
        },
      });

      if (turmaDuplicada) {
        return res.status(409).json({ 
          error: 'Já existe outra turma com este nome neste ano letivo' 
        });
      }
    }

    // Atualiza a turma
    const turmaAtualizada = await prisma.turmas.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        professores: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        _count: {
          select: {
            alunos: true,
            disciplinas_turmas: true,
          },
        },
      },
    });

    // Invalida cache específico e de listagem
    await Promise.all([
      cacheService.delete(`turma:${id}`),
      cacheService.invalidate('turmas:*'),
    ]);

    return res.json(turmaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    return res.status(500).json({ 
      error: 'Erro ao atualizar turma',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

/**
 * Deleta turma (soft delete se houver alunos matriculados)
 */
export async function deletarTurma(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Verifica se turma existe
    const turma = await prisma.turmas.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            alunos: true,
            frequencias: true,
          },
        },
      },
    });

    if (!turma) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    // Se turma tem alunos ou frequências, não permite exclusão
    if (turma._count.alunos > 0 || turma._count.frequencias > 0) {
      return res.status(409).json({ 
        error: 'Não é possível excluir turma com alunos matriculados ou frequências registradas',
        details: {
          alunos: turma._count.alunos,
          frequencias: turma._count.frequencias,
        },
      });
    }

    // Deleta a turma e registros relacionados
    await prisma.$transaction([
      prisma.disciplinas_turmas.deleteMany({ where: { turmaId: id } }),
      prisma.turmas.delete({ where: { id } }),
    ]);

    // Invalida cache
    await Promise.all([
      cacheService.delete(`turma:${id}`),
      cacheService.invalidate('turmas:*'),
    ]);

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar turma:', error);
    return res.status(500).json({ 
      error: 'Erro ao deletar turma',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

/**
 * Retorna estatísticas agregadas de uma turma
 */
export async function estatisticasTurma(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { trimestre } = req.query;
    
    const cacheKey = `turma:${id}:stats:${trimestre || 'all'}`;

    const stats = await cacheService.getOrSet(
      cacheKey,
      async () => {
        // Verifica se turma existe
        const turma = await prisma.turmas.findUnique({
          where: { id },
        });

        if (!turma) {
          return null;
        }

        // Busca estatísticas em paralelo
        const [
          totalAlunos,
          alunosAtivos,
          totalDisciplinas,
          mediaPresenca,
          mediaNotasTurma,
        ] = await Promise.all([
          // Total de alunos
          prisma.alunos.count({
            where: { turmaId: id },
          }),
          
          // Alunos ativos
          prisma.alunos.count({
            where: { 
              turmaId: id,
              statusMatricula: 'ATIVO',
            },
          }),
          
          // Total de disciplinas
          prisma.disciplinas_turmas.count({
            where: { turmaId: id },
          }),
          
          // Média de presença
          prisma.frequencias.aggregate({
            where: { 
              turmaId: id,
              ...(trimestre && { 
                data: {
                  gte: getTrimestreStartDate(parseInt(trimestre as string)),
                  lte: getTrimestreEndDate(parseInt(trimestre as string)),
                },
              }),
            },
            _count: { presente: true },
          }),
          
          // Média geral das notas da turma
          prisma.notas.aggregate({
            where: { 
              alunos: { turmaId: id },
              ...(trimestre && { trimestre: parseInt(trimestre as string) }),
            },
            _avg: { notaFinalTrimestre: true },
          }),
        ]);

        return {
          turmaId: id,
          turmaNome: turma.nome,
          alunos: {
            total: totalAlunos,
            ativos: alunosAtivos,
            inativos: totalAlunos - alunosAtivos,
          },
          disciplinas: {
            total: totalDisciplinas,
          },
          desempenho: {
            mediaPresenca: 'N/A', // Calcular manualmente se necessário
            mediaNotas: mediaNotasTurma._avg.notaFinalTrimestre 
              ? mediaNotasTurma._avg.notaFinalTrimestre.toFixed(2)
              : 'N/A',
          },
          trimestre: trimestre ? parseInt(trimestre as string) : null,
        };
      },
      1800 // 30 minutos
    );

    if (!stats) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    return res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas da turma:', error);
    return res.status(500).json({ 
      error: 'Erro ao calcular estatísticas',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

// Helper functions para datas de trimestre
function getTrimestreStartDate(trimestre: number): Date {
  const year = new Date().getFullYear();
  const dates = [
    new Date(year, 1, 1),  // Trimestre 1: 1 fev
    new Date(year, 4, 1),  // Trimestre 2: 1 mai
    new Date(year, 7, 1),  // Trimestre 3: 1 ago
  ];
  return dates[trimestre - 1] || dates[0];
}

function getTrimestreEndDate(trimestre: number): Date {
  const year = new Date().getFullYear();
  const dates = [
    new Date(year, 3, 30),  // Trimestre 1: 30 abr
    new Date(year, 6, 31),  // Trimestre 2: 31 jul
    new Date(year, 10, 30), // Trimestre 3: 30 nov
  ];
  return dates[trimestre - 1] || dates[2];
}
