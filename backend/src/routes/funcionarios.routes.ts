import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import encryption from '../services/encryption.service';

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
    const funcionarios = await prisma.funcionarios.findMany({
      orderBy: { nome: 'asc' }
    });
    
    // Descriptografar dados sensíveis
    const funcionariosDecrypted = funcionarios.map(func => ({
      ...func,
      cpf: encryption.decrypt(func.cpf),
      telefone: func.telefone ? encryption.decrypt(func.telefone) : null,
    }));
    
    res.json(funcionariosDecrypted);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funcionários' });
  }
});

// GET funcionário por ID
funcionariosRouter.get('/:id', async (req, res) => {
  try {
    const funcionario = await prisma.funcionarios.findUnique({
      where: { id: req.params.id }
    });
    
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }
    
    // Descriptografar dados sensíveis
    const funcionarioDecrypted = {
      ...funcionario,
      cpf: encryption.decrypt(funcionario.cpf),
      telefone: funcionario.telefone ? encryption.decrypt(funcionario.telefone) : null,
    };
    
    res.json(funcionarioDecrypted);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funcionário' });
  }
});

// POST criar funcionário
funcionariosRouter.post('/', async (req, res) => {
  try {
    const data = funcionarioSchema.parse(req.body);
    
    // Criptografar dados sensíveis
    const encryptedData = {
      cpf: encryption.encrypt(data.cpf),
      telefone: data.telefone ? encryption.encrypt(data.telefone) : null,
    };
    
    const funcionario = await prisma.funcionarios.create({
      data: {
        id: crypto.randomUUID(),
        nome: data.nome,
        cpf: encryptedData.cpf,
        email: data.email,
        cargo: data.cargo,
        updatedAt: new Date(),
        ...(encryptedData.telefone && { telefone: encryptedData.telefone }),
        ...(data.setor && { setor: data.setor }),
      }
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
    
    // Criptografar dados sensíveis se fornecidos
    const encryptedData: any = { ...data };
    if (data.cpf) {
      encryptedData.cpf = encryption.encrypt(data.cpf);
    }
    if (data.telefone) {
      encryptedData.telefone = encryption.encrypt(data.telefone);
    }
    
    const funcionario = await prisma.funcionarios.update({
      where: { id: req.params.id },
      data: encryptedData
    });
    
    res.json(funcionario);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar funcionário' });
  }
});

// DELETE funcionário
funcionariosRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.funcionarios.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar funcionário' });
  }
});


