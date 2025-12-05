import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export const alunosRouter = Router();

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

// GET todos os alunos
alunosRouter.get('/', async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany({
      include: { turma: true }
    });
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

// GET aluno por ID
alunosRouter.get('/:id', async (req, res) => {
  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: req.params.id },
      include: { turma: true, notas: true, frequencias: true }
    });
    
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    res.json(aluno);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aluno' });
  }
});

// POST criar aluno
alunosRouter.post('/', async (req, res) => {
  try {
    const data = alunoSchema.parse(req.body);
    
    const aluno = await prisma.aluno.create({
      data: {
        ...data,
        dataNascimento: new Date(data.dataNascimento),
      }
    });
    
    res.status(201).json(aluno);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar aluno' });
  }
});

// PUT atualizar aluno
alunosRouter.put('/:id', async (req, res) => {
  try {
    const data = alunoSchema.partial().parse(req.body);
    
    const aluno = await prisma.aluno.update({
      where: { id: req.params.id },
      data: data.dataNascimento ? {
        ...data,
        dataNascimento: new Date(data.dataNascimento),
      } : data
    });
    
    res.json(aluno);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
});

// DELETE aluno
alunosRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.aluno.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar aluno' });
  }
});
