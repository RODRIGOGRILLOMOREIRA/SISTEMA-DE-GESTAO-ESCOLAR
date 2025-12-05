import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export const professoresRouter = Router();

const professorSchema = z.object({
  nome: z.string().min(3),
  cpf: z.string().min(11).max(14),
  email: z.string().email(),
  telefone: z.string(),
  especialidade: z.string(),
});

// GET todos os professores
professoresRouter.get('/', async (req, res) => {
  try {
    const professores = await prisma.professor.findMany({
      include: { disciplinas: true, turmas: true }
    });
    res.json(professores);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar professores' });
  }
});

// GET professor por ID
professoresRouter.get('/:id', async (req, res) => {
  try {
    const professor = await prisma.professor.findUnique({
      where: { id: req.params.id },
      include: { disciplinas: true, turmas: true }
    });
    
    if (!professor) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }
    
    res.json(professor);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar professor' });
  }
});

// POST criar professor
professoresRouter.post('/', async (req, res) => {
  try {
    const data = professorSchema.parse(req.body);
    
    const professor = await prisma.professor.create({
      data
    });
    
    res.status(201).json(professor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar professor' });
  }
});

// PUT atualizar professor
professoresRouter.put('/:id', async (req, res) => {
  try {
    const data = professorSchema.partial().parse(req.body);
    
    const professor = await prisma.professor.update({
      where: { id: req.params.id },
      data
    });
    
    res.json(professor);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar professor' });
  }
});

// DELETE professor
professoresRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.professor.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar professor' });
  }
});
