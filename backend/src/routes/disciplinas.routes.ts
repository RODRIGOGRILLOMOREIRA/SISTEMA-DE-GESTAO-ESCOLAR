import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

export const disciplinasRouter = Router();

const disciplinaSchema = z.object({
  nome: z.string(),
  cargaHoraria: z.number().int().positive(),
  professorId: z.string().nullable().optional(),
  turmaIds: z.array(z.string()).optional(),
});

// GET todas as disciplinas
disciplinasRouter.get('/', async (req, res) => {
  try {
    const disciplinas = await prisma.disciplinas.findMany({
      include: { professores: true, turmas: true }
    });
    res.json(disciplinas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar disciplinas' });
  }
});

// GET disciplina por ID
disciplinasRouter.get('/:id', async (req, res) => {
  try {
    const disciplina = await prisma.disciplinas.findUnique({
      where: { id: req.params.id },
      include: { professores: true, turmas: true, notas: true }
    });
    
    if (!disciplina) {
      return res.status(404).json({ error: 'Disciplina não encontrada' });
    }
    
    res.json(disciplina);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar disciplina' });
  }
});

// POST criar disciplina
disciplinasRouter.post('/', async (req, res) => {
  try {
    const { turmaIds, ...data } = disciplinaSchema.parse(req.body);
    
    const disciplina = await prisma.disciplinas.create({
      data: {
        id: crypto.randomUUID(),
        nome: data.nome,
        cargaHoraria: data.cargaHoraria,
        updatedAt: new Date(),
        ...(data.professorId && { professorId: data.professorId }),
        turmas: turmaIds && turmaIds.length > 0 ? {
          connect: turmaIds.map(id => ({ id }))
        } : undefined
      },
      include: { professores: true, turmas: true }
    });
    
    res.status(201).json(disciplina);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar disciplina' });
  }
});

// PUT atualizar disciplina
disciplinasRouter.put('/:id', async (req, res) => {
  try {
    const { turmaIds, ...data } = disciplinaSchema.partial().parse(req.body);
    
    const disciplina = await prisma.disciplinas.update({
      where: { id: req.params.id },
      data: {
        ...data,
        turmas: turmaIds !== undefined ? {
          set: turmaIds.map(id => ({ id }))
        } : undefined
      },
      include: { professores: true, turmas: true }
    });
    
    res.json(disciplina);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar disciplina' });
  }
});

// DELETE disciplina
disciplinasRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.disciplinas.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar disciplina' });
  }
});


