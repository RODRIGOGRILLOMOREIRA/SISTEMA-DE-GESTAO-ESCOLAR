import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

export const frequenciasRouter = Router();

const frequenciaSchema = z.object({
  alunoId: z.string(),
  turmaId: z.string(),
  data: z.string(),
  presente: z.boolean(),
  observacao: z.string().optional(),
});

// GET todas as frequências
frequenciasRouter.get('/', async (req, res) => {
  try {
    const frequencias = await prisma.frequencias.findMany({
      include: { alunos: true, turmas: true }
    });
    res.json(frequencias);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar frequências' });
  }
});

// GET frequências de um aluno
frequenciasRouter.get('/aluno/:alunoId', async (req, res) => {
  try {
    const frequencias = await prisma.frequencias.findMany({
      where: { alunoId: req.params.alunoId },
      include: { turmas: true },
      orderBy: { data: 'desc' }
    });
    res.json(frequencias);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar frequências do aluno' });
  }
});

// POST registrar frequência
frequenciasRouter.post('/', async (req, res) => {
  try {
    const data = frequenciaSchema.parse(req.body);
    
    const frequencia = await prisma.frequencias.create({
      data: {
        id: crypto.randomUUID(),
        turmaId: data.turmaId,
        alunoId: data.alunoId,
        presente: data.presente,
        data: new Date(data.data),
        updatedAt: new Date(),
        ...(data.observacao && { observacao: data.observacao }),
      }
    });
    
    res.status(201).json(frequencia);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Erro ao registrar frequência' });
  }
});

// PUT atualizar frequência
frequenciasRouter.put('/:id', async (req, res) => {
  try {
    const data = frequenciaSchema.partial().parse(req.body);
    
    const frequencia = await prisma.frequencias.update({
      where: { id: req.params.id },
      data: data.data ? {
        ...data,
        data: new Date(data.data),
      } : data
    });
    
    res.json(frequencia);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar frequência' });
  }
});

// DELETE frequência
frequenciasRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.frequencias.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar frequência' });
  }
});


