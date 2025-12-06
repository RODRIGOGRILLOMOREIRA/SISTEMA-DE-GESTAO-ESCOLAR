import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export const funcionariosRouter = Router();

const funcionarioSchema = z.object({
  nome: z.string().min(3),
  cpf: z.string().min(11).max(14),
  email: z.string().email(),
  telefone: z.string().optional(),
  cargo: z.string().min(3),
  setor: z.string().optional(),
});

// GET todos os funcionários
funcionariosRouter.get('/', async (req, res) => {
  try {
    const funcionarios = await prisma.funcionario.findMany({
      orderBy: { nome: 'asc' }
    });
    res.json(funcionarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funcionários' });
  }
});

// GET funcionário por ID
funcionariosRouter.get('/:id', async (req, res) => {
  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: req.params.id }
    });
    
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }
    
    res.json(funcionario);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funcionário' });
  }
});

// POST criar funcionário
funcionariosRouter.post('/', async (req, res) => {
  try {
    const data = funcionarioSchema.parse(req.body);
    
    const funcionario = await prisma.funcionario.create({
      data
    });
    
    res.status(201).json(funcionario);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar funcionário' });
  }
});

// PUT atualizar funcionário
funcionariosRouter.put('/:id', async (req, res) => {
  try {
    const data = funcionarioSchema.partial().parse(req.body);
    
    const funcionario = await prisma.funcionario.update({
      where: { id: req.params.id },
      data
    });
    
    res.json(funcionario);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar funcionário' });
  }
});

// DELETE funcionário
funcionariosRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.funcionario.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar funcionário' });
  }
});
