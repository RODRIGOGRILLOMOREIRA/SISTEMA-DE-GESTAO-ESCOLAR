import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { paginationMiddleware } from '../middlewares/pagination';
import { audit } from '../middlewares/audit';
import * as turmasController from '../controllers/turmas.controller';

export const turmasRouter = Router();

const turmaSchema = z.object({
  nome: z.string(),
  ano: z.number().int().min(1).max(9),
  anoLetivo: z.number().int().min(2020).max(2030),
  periodo: z.enum(['Manhã', 'Tarde', 'Noite', 'Integral']),
  professorId: z.string().nullable().optional(),
});

// === ROTAS COM CONTROLLER (NOVAS - COM CACHE E AUDITORIA) ===
turmasRouter.get('/v2', paginationMiddleware, turmasController.listarTurmas);
turmasRouter.get('/v2/:id', turmasController.buscarTurmaPorId);
turmasRouter.get('/v2/:id/estatisticas', turmasController.estatisticasTurma);
turmasRouter.post('/v2', audit.create('TURMA'), turmasController.criarTurma);
turmasRouter.put('/v2/:id', audit.update('TURMA'), turmasController.atualizarTurma);
turmasRouter.delete('/v2/:id', audit.delete('TURMA'), turmasController.deletarTurma);

// === ROTAS ANTIGAS (MANTIDAS PARA COMPATIBILIDADE) ===
// GET todas as turmas
turmasRouter.get('/', async (req, res) => {
  try {
    const turmas = await prisma.turmas.findMany({
      include: { 
        professores: true, 
        alunos: true,
        disciplinas_turmas: {
          include: {
            disciplinas: true,
            professores: true
          }
        }
      }
    });
    
    // Transformar disciplinas_turmas em disciplinas com professor correto para cada turma
    const turmasComDisciplinas = turmas.map(turma => ({
      ...turma,
      disciplinas: turma.disciplinas_turmas?.map(dt => ({
        ...dt.disciplinas, 
        professor: dt.professores,
        professorId: dt.professorId
      }))
    }));
    
    res.json(turmasComDisciplinas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar turmas' });
  }
});

// GET turma por ID
turmasRouter.get('/:id', async (req, res) => {
  try {
    const turma = await prisma.turmas.findUnique({
      where: { id: req.params.id },
      include: { professores: true, 
        alunos: true, 
        disciplinas_turmas: {
          include: { disciplinas: true, professores: true
          }
        }
      }
    });
    
    if (!turma) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }
    
    // Transformar disciplinas_turmas em disciplinas com professor correto
    const turmaComDisciplinas = {
      ...turma,
      disciplinas: (turma as any).disciplinas_turmas.map((dt: any) => ({
        ...dt.disciplinas, 
        professor: dt.professores,
        professorId: dt.professorId
      }))
    };
    
    res.json(turmaComDisciplinas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar turma' });
  }
});

// POST criar turma
turmasRouter.post('/', async (req, res) => {
  try {
    const data = turmaSchema.parse(req.body);
    
    const turma = await prisma.turmas.create({
      data: {
        id: crypto.randomUUID(),
        nome: data.nome,
        ano: data.ano,
        periodo: data.periodo,
        anoLetivo: data.anoLetivo,
        updatedAt: new Date(),
        ...(data.professorId && { professorId: data.professorId }),
      }
    });
    
    res.status(201).json(turma);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar turma' });
  }
});

// PUT atualizar turma
turmasRouter.put('/:id', async (req, res) => {
  try {
    const data = turmaSchema.partial().parse(req.body);
    
    const turma = await prisma.turmas.update({
      where: { id: req.params.id },
      data
    });
    
    res.json(turma);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar turma' });
  }
});

// DELETE turma
turmasRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.turmas.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar turma' });
  }
});


