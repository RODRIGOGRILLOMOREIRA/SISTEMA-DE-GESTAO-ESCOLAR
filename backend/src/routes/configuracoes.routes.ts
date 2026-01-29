import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { log } from '../lib/logger';

export const configuracoesRouter = Router();

/**
 * Schema de validação para configurações da escola
 * @description Define os campos e tipos aceitos para configurações gerais
 */
const configuracaoSchema = z.object({
  nomeEscola: z.string().min(1).optional(),
  redeEscolar: z.string().optional().nullable(),
  endereco: z.string().optional(),
  telefone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  temaModo: z.enum(['light', 'dark']).optional(),
});

/**
 * GET /api/configuracoes
 * @description Obtém as configurações gerais da escola. Cria configurações padrão se não existirem.
 * @returns {Object} 200 - Objeto com configurações da escola
 * @returns {Object} 500 - Erro ao buscar configurações
 * @example
 * // Response
 * {
 *   "id": "uuid",
 *   "nomeEscola": "Escola Municipal XYZ",
 *   "endereco": "Rua Exemplo, 123",
 *   "temaModo": "light"
 * }
 */
configuracoesRouter.get('/', async (req, res) => {
  try {
    log.info({ component: 'configuracoes.routes' }, 'Buscando configurações');
    let config = await prisma.configuracoes.findFirst();
    log.info({ component: 'configuracoes.routes', hasConfig: !!config }, 'Configurações encontradas');
    
    // Se não existe, cria uma configuração padrão
    if (!config) {
      log.warn({ component: 'configuracoes.routes' }, 'Nenhuma configuração encontrada. Criando padrão');
      config = await prisma.configuracoes.create({
        data: {
          id: crypto.randomUUID(),
          nomeEscola: 'Sistema de Gestão Escolar',
          redeEscolar: 'Rede Municipal',
          endereco: 'Rua Exemplo, 123 - Centro',
          telefone: '(00) 0000-0000',
          email: 'contato@escola.com',
          temaModo: 'light',
          updatedAt: new Date(),
        }
      });
      log.info({ component: 'configuracoes.routes', configId: config.id }, 'Configuração padrão criada');
    }
    
    res.json(config);
  } catch (error) {
    log.error({ component: 'configuracoes.routes', error }, 'Erro ao buscar configurações');
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

/**
 * PUT /api/configuracoes
 * @description Atualiza as configurações gerais da escola
 * @param {Object} req.body - Dados para atualizar (nomeEscola, endereco, telefone, etc.)
 * @returns {Object} 200 - Configurações atualizadas
 * @returns {Object} 400 - Erro de validação (Zod)
 * @returns {Object} 500 - Erro ao atualizar configurações
 * @example
 * // Request body
 * {
 *   "nomeEscola": "Nova Escola",
 *   "temaModo": "dark"
 * }
 * // Response
 * {
 *   "id": "uuid",
 *   "nomeEscola": "Nova Escola",
 *   "temaModo": "dark",
 *   "updatedAt": "2024-01-21T10:00:00.000Z"
 * }
 */
configuracoesRouter.put('/', async (req, res) => {
  try {
    log.info({ component: 'configuracoes.routes' }, 'Recebendo dados para atualização');
    const data = configuracaoSchema.parse(req.body);
    log.info({ component: 'configuracoes.routes' }, 'Dados validados');
    
    let config = await prisma.configuracoes.findFirst();
    log.info({ component: 'configuracoes.routes', hasConfig: !!config }, 'Config existente');
    
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
        id: crypto.randomUUID(),
        nomeEscola: cleanData.nomeEscola || 'Escola Municipal',
        endereco: cleanData.endereco || '',
        redeEscolar: cleanData.redeEscolar || null,
        telefone: cleanData.telefone || null,
        email: cleanData.email || null,
        logoUrl: cleanData.logoUrl || null,
        temaModo: cleanData.temaModo || 'light',
        updatedAt: new Date(),
      };
      log.info({ component: 'configuracoes.routes' }, 'Criando nova configuração');
      config = await prisma.configuracoes.create({ data: createData });
    } else {
      log.info({ component: 'configuracoes.routes' }, 'Atualizando configuração existente');
      config = await prisma.configuracoes.update({
        where: { id: config.id },
        data: cleanData
      });
    }
    
    log.info({ component: 'configuracoes.routes', configId: config.id }, 'Configuração salva com sucesso');
    res.json(config);
  } catch (error) {
    log.error({ component: 'configuracoes.routes', error }, 'Erro ao salvar configurações');
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ 
      error: 'Erro ao atualizar configurações',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});


