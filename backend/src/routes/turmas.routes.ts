import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export const turmasRouter = Router();

const turmaSchema = z.object({
  nome: z.string(),
  ano: z.number().int().min(1).max(9),
  anoLetivo: z.number().int().min(2020).max(2030),
  periodo: z.enum(['Manhã', 'Tarde', 'Noite', 'Integral']),
  professorId: z.string().nullable().optional(),
});

// GET todas as turmas
turmasRouter.get('/', async (req, res) => {
  try {
    const turmas = await prisma.turma.findMany({
      include: { 
        professor: true, 
        alunos: true,
        disciplinaTurmas: {
          include: {
            disciplina: true,
            professor: true
          }
        }
      }
    });
    
    // Transformar disciplinaTurmas em disciplinas com professor correto para cada turma
    const turmasComDisciplinas = turmas.map(turma => ({
      ...turma,
      disciplinas: turma.disciplinaTurmas.map(dt => ({
        ...dt.disciplina,
        professor: dt.professor
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
    const turma = await prisma.turma.findUnique({
      where: { id: req.params.id },
      include: { 
        professor: true, 
        alunos: true, 
        disciplinaTurmas: {
          include: {
            disciplina: true,
            professor: true
          }
        }
      }
    });
    
    if (!turma) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }
    
    // Transformar disciplinaTurmas em disciplinas com professor correto
    const turmaComDisciplinas = {
      ...turma,
      disciplinas: turma.disciplinaTurmas.map(dt => ({
        ...dt.disciplina,
        professor: dt.professor
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
    
    const turma = await prisma.turma.create({
      data
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
    
    const turma = await prisma.turma.update({
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
    await prisma.turma.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar turma' });
  }
});
