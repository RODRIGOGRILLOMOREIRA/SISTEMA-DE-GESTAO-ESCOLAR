import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

export const disciplinaTurmaRouter = Router();

const disciplinaTurmaSchema = z.object({
  disciplinaId: z.string(),
  turmaId: z.string(),
  professorId: z.string().nullable().optional(),
});

// GET todas as associações disciplina-turma
disciplinaTurmaRouter.get('/', async (req, res) => {
  try {
    const { turmaId, disciplinaId } = req.query;
    
    const where: any = {};
    if (turmaId) where.turmaId = turmaId as string;
    if (disciplinaId) where.disciplinaId = disciplinaId as string;
    
    const associacoes = await prisma.disciplinas_turmas.findMany({
      where,
      include: { disciplinas: true, turmas: true, professores: true 
      }
    });
    
    res.json(associacoes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar associações' });
  }
});

// GET associação por ID
disciplinaTurmaRouter.get('/:id', async (req, res) => {
  try {
    const associacao = await prisma.disciplinas_turmas.findUnique({
      where: { id: req.params.id },
      include: { disciplinas: true, turmas: true, professores: true 
      }
    });
    
    if (!associacao) {
      return res.status(404).json({ error: 'Associação não encontrada' });
    }
    
    res.json(associacao);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar associação' });
  }
});

// POST criar ou atualizar associação disciplina-turma-professor
disciplinaTurmaRouter.post('/', async (req, res) => {
  try {
    const data = disciplinaTurmaSchema.parse(req.body);
    
    // Verificar se já existe
    const existente = await prisma.disciplinas_turmas.findUnique({
      where: {
        disciplinaId_turmaId: {
          disciplinaId: data.disciplinaId,
          turmaId: data.turmaId
        }
      }
    });
    
    let associacao;
    if (existente) {
      // Atualizar
      associacao = await prisma.disciplinas_turmas.update({
        where: { id: existente.id },
        data: { professorId: data.professorId },
        include: { disciplinas: true, turmas: true, professores: true 
        }
      });
    } else {
      // Criar novo
      associacao = await prisma.disciplinas_turmas.create({
        data: {
          id: crypto.randomUUID(),
          turmaId: data.turmaId,
          disciplinaId: data.disciplinaId,
          updatedAt: new Date(),
          ...(data.professorId && { professorId: data.professorId }),
        },
        include: { disciplinas: true, turmas: true, professores: true 
        }
      });
    }
    
    res.status(201).json(associacao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao criar associação:', error);
    res.status(500).json({ error: 'Erro ao criar associação' });
  }
});

// PUT atualizar professor da associação
disciplinaTurmaRouter.put('/:id', async (req, res) => {
  try {
    const { professorId } = z.object({
      professorId: z.string().nullable().optional()
    }).parse(req.body);
    
    const associacao = await prisma.disciplinas_turmas.update({
      where: { id: req.params.id },
      data: { professorId },
      include: { disciplinas: true, turmas: true, professores: true 
      }
    });
    
    res.json(associacao);
  } catch (error) {
    console.error('Erro ao atualizar associação:', error);
    res.status(500).json({ error: 'Erro ao atualizar associação' });
  }
});

// DELETE associação
disciplinaTurmaRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.disciplinas_turmas.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar associação' });
  }
});


