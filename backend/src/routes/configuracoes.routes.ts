import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export const configuracoesRouter = Router();

const configuracaoSchema = z.object({
  nomeEscola: z.string().min(1).optional(),
  redeEscolar: z.string().optional().nullable(),
  endereco: z.string().optional(),
  telefone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  temaModo: z.enum(['light', 'dark']).optional(),
});

// GET configurações
configuracoesRouter.get('/', async (req, res) => {
  try {
    let config = await prisma.configuracao.findFirst();
    
    // Se não existe, cria uma configuração padrão
    if (!config) {
      config = await prisma.configuracao.create({
        data: {
          nomeEscola: 'Escola Municipal',
          endereco: '',
          temaModo: 'light',
        }
      });
    }
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// PUT atualizar configurações
configuracoesRouter.put('/', async (req, res) => {
  try {
    console.log('Recebendo dados:', req.body);
    const data = configuracaoSchema.parse(req.body);
    console.log('Dados validados:', data);
    
    let config = await prisma.configuracao.findFirst();
    console.log('Config existente:', config);
    
    // Remover campos undefined antes de salvar
    const cleanData: any = {};
    Object.keys(data).forEach(key => {
      if (data[key as keyof typeof data] !== undefined) {
        cleanData[key] = data[key as keyof typeof data];
      }
    });
    
    if (!config) {
      // Se não existe, criar com valores padrão
      const createData = {
        nomeEscola: cleanData.nomeEscola || 'Escola Municipal',
        endereco: cleanData.endereco || '',
        redeEscolar: cleanData.redeEscolar || null,
        telefone: cleanData.telefone || null,
        email: cleanData.email || null,
        logoUrl: cleanData.logoUrl || null,
        temaModo: cleanData.temaModo || 'light',
      };
      console.log('Criando nova config:', createData);
      config = await prisma.configuracao.create({ data: createData });
    } else {
      console.log('Atualizando config com:', cleanData);
      config = await prisma.configuracao.update({
        where: { id: config.id },
        data: cleanData
      });
    }
    
    console.log('Config salva:', config);
    res.json(config);
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ 
      error: 'Erro ao atualizar configurações',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});
