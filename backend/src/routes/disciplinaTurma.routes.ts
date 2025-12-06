import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

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
    
    const associacoes = await prisma.disciplinaTurma.findMany({
      where,
      include: { 
        disciplina: true, 
        turma: true, 
        professor: true 
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
    const associacao = await prisma.disciplinaTurma.findUnique({
      where: { id: req.params.id },
      include: { 
        disciplina: true, 
        turma: true, 
        professor: true 
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
    const existente = await prisma.disciplinaTurma.findUnique({
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
      associacao = await prisma.disciplinaTurma.update({
        where: { id: existente.id },
        data: { professorId: data.professorId },
        include: { 
          disciplina: true, 
          turma: true, 
          professor: true 
        }
      });
    } else {
      // Criar novo
      associacao = await prisma.disciplinaTurma.create({
        data,
        include: { 
          disciplina: true, 
          turma: true, 
          professor: true 
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
    
    const associacao = await prisma.disciplinaTurma.update({
      where: { id: req.params.id },
      data: { professorId },
      include: { 
        disciplina: true, 
        turma: true, 
        professor: true 
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
    await prisma.disciplinaTurma.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar associação' });
  }
});
