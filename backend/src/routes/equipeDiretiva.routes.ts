import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

export const equipeDiretivaRouter = Router();

const equipeDiretivaSchema = z.object({
  nome: z.string().min(3),
  cpf: z.string().min(11).max(14),
  email: z.string().email(),
  telefone: z.string().optional(),
  cargo: z.string().min(3),
});

// GET todos os membros da equipe diretiva
equipeDiretivaRouter.get('/', async (req, res) => {
  try {
    const equipe = await prisma.equipe_diretiva.findMany({
      orderBy: { nome: 'asc' }
    });
    res.json(equipe);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar equipe diretiva' });
  }
});

// GET membro da equipe diretiva por ID
equipeDiretivaRouter.get('/:id', async (req, res) => {
  try {
    const membro = await prisma.equipe_diretiva.findUnique({
      where: { id: req.params.id }
    });
    
    if (!membro) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }
    
    res.json(membro);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar membro' });
  }
});

// POST criar membro da equipe diretiva
equipeDiretivaRouter.post('/', async (req, res) => {
  try {
    const data = equipeDiretivaSchema.parse(req.body);
    
    const membro = await prisma.equipe_diretiva.create({
      data: {
        id: crypto.randomUUID(),
        nome: data.nome,
        cpf: data.cpf,
        email: data.email,
        cargo: data.cargo,
        updatedAt: new Date(),
        ...(data.telefone && { telefone: data.telefone }),
      }
    });
    
    res.status(201).json(membro);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar membro' });
  }
});

// PUT atualizar membro da equipe diretiva
equipeDiretivaRouter.put('/:id', async (req, res) => {
  try {
    const data = equipeDiretivaSchema.partial().parse(req.body);
    
    const membro = await prisma.equipe_diretiva.update({
      where: { id: req.params.id },
      data
    });
    
    res.json(membro);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar membro' });
  }
});

// DELETE membro da equipe diretiva
equipeDiretivaRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.equipe_diretiva.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar membro' });
  }
});


