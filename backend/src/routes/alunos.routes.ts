import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

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
    const alunos = await prisma.alunos.findMany({
      include: { turmas: true }
    });
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

// GET alunos por turma
alunosRouter.get('/turma/:turmaId', async (req, res) => {
  try {
    const { turmaId } = req.params;
    
    const alunos = await prisma.alunos.findMany({
      where: { turmaId },
      include: { turmas: true },
      orderBy: { nome: 'asc' }
    });
    
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar alunos da turma' });
  }
});

// GET aluno por ID
alunosRouter.get('/:id', async (req, res) => {
  try {
    const aluno = await prisma.alunos.findUnique({
      where: { id: req.params.id },
      include: { turmas: true, notas: true, frequencias: true }
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
    
    const aluno = await prisma.alunos.create({
      data: {
        id: crypto.randomUUID(),
        nome: data.nome,
        cpf: data.cpf,
        email: data.email,
        responsavel: data.responsavel,
        telefoneResp: data.telefoneResp,
        dataNascimento: new Date(data.dataNascimento),
        updatedAt: new Date(),
        ...(data.telefone && { telefone: data.telefone }),
        ...(data.endereco && { endereco: data.endereco }),
        ...(data.turmaId && { turmaId: data.turmaId }),
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
    
    const aluno = await prisma.alunos.update({
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
    const alunoId = req.params.id;
    
    // Deletar registros relacionados primeiro
    await prisma.$transaction([
      prisma.notas.deleteMany({ where: { alunoId } }),
      prisma.notas_finais.deleteMany({ where: { alunoId } }),
      prisma.frequencias.deleteMany({ where: { alunoId } }),
      prisma.matriculas.deleteMany({ where: { alunoId } }),
      prisma.alunos.delete({ where: { id: alunoId } })
    ]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({ error: 'Erro ao deletar aluno' });
  }
});


