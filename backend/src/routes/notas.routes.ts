import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export const notasRouter = Router();

const notaSchema = z.object({
  alunoId: z.string(),
  disciplinaId: z.string(),
  nota: z.number().min(0).max(10),
  bimestre: z.number().int().min(1).max(4),
  observacao: z.string().optional(),
});

// GET todas as notas
notasRouter.get('/', async (req, res) => {
  try {
    const notas = await prisma.nota.findMany({
      include: { aluno: true, disciplina: true }
    });
    res.json(notas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar notas' });
  }
});

// GET notas de um aluno
notasRouter.get('/aluno/:alunoId', async (req, res) => {
  try {
    const notas = await prisma.nota.findMany({
      where: { alunoId: req.params.alunoId },
      include: { disciplina: true }
    });
    res.json(notas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar notas do aluno' });
  }
});

// POST criar nota
notasRouter.post('/', async (req, res) => {
  try {
    const data = notaSchema.parse(req.body);
    
    const nota = await prisma.nota.create({
      data
    });
    
    res.status(201).json(nota);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar nota' });
  }
});

// PUT atualizar nota
notasRouter.put('/:id', async (req, res) => {
  try {
    const data = notaSchema.partial().parse(req.body);
    
    const nota = await prisma.nota.update({
      where: { id: req.params.id },
      data
    });
    
    res.json(nota);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar nota' });
  }
});

// DELETE nota
notasRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.nota.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar nota' });
  }
});
