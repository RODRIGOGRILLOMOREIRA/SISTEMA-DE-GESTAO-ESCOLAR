import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

export const calendarioRouter = Router();

const eventoSchema = z.object({
  tipo: z.enum([
    'INICIO_ANO_LETIVO', 'FIM_ANO_LETIVO', 'DIA_LETIVO', 'DIA_NAO_LETIVO',
    'PARADA_PEDAGOGICA', 'RECESSO', 'SABADO_LETIVO', 'FERIADO',
    'INICIO_TRIMESTRE', 'FIM_TRIMESTRE', 'PERIODO_EAC', 'OUTRO'
  ]),
  descricao: z.string().optional(),
  dataInicio: z.string(),
  dataFim: z.string().optional(),
});

const calendarioSchema = z.object({
  ano: z.number(),
  eventos: z.array(eventoSchema).optional(),
});

// GET todos os calendários
calendarioRouter.get('/', async (req, res) => {
  try {
    const calendarios = await prisma.calendario_escolar.findMany({
      include: {
        eventos_calendario: {
          orderBy: { dataInicio: 'asc' }
        }
      },
      orderBy: { ano: 'desc' }
    });
    res.json(calendarios);
  } catch (error) {
    console.error('Erro ao buscar calendários:', error);
    res.status(500).json({ error: 'Erro ao buscar calendários' });
  }
});

// GET calendário por ano
calendarioRouter.get('/ano/:ano', async (req, res) => {
  try {
    const ano = parseInt(req.params.ano);
    const calendario = await prisma.calendario_escolar.findUnique({
      where: { ano },
      include: {
        eventos_calendario: {
          orderBy: { dataInicio: 'asc' }
        }
      }
    });
    
    if (!calendario) {
      return res.status(404).json({ error: 'Calendário não encontrado' });
    }
    
    res.json(calendario);
  } catch (error) {
    console.error('Erro ao buscar calendário:', error);
    res.status(500).json({ error: 'Erro ao buscar calendário' });
  }
});

// GET eventos por período (para cálculo de frequência)
calendarioRouter.get('/eventos/periodo', async (req, res) => {
  try {
    const { dataInicio, dataFim, ano } = req.query;
    
    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'dataInicio e dataFim são obrigatórios' });
    }

    const whereClause: any = {
      OR: [
        {
          dataInicio: {
            gte: new Date(dataInicio as string),
            lte: new Date(dataFim as string)
          }
        },
        {
          dataFim: {
            gte: new Date(dataInicio as string),
            lte: new Date(dataFim as string)
          }
        },
        {
          AND: [
            { dataInicio: { lte: new Date(dataInicio as string) } },
            { dataFim: { gte: new Date(dataFim as string) } }
          ]
        }
      ]
    };

    // Se o ano for especificado, buscar apenas eventos do calendário daquele ano
    if (ano) {
      const calendario = await prisma.calendario_escolar.findUnique({
        where: { ano: parseInt(ano as string) }
      });
      
      if (calendario) {
        whereClause.calendarioId = calendario.id;
      }
    }

    const eventos = await prisma.eventos_calendario.findMany({
      where: whereClause,
      orderBy: { dataInicio: 'asc' }
    });

    res.json(eventos);
  } catch (error) {
    console.error('Erro ao buscar eventos por período:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos por período' });
  }
});

// POST criar calendário
calendarioRouter.post('/', async (req, res) => {
  try {
    const data = calendarioSchema.parse(req.body);
    
    // Verificar se já existe calendário para esse ano
    const existe = await prisma.calendario_escolar.findUnique({
      where: { ano: data.ano }
    });
    
    if (existe) {
      return res.status(400).json({ error: 'Já existe um calendário para este ano' });
    }
    
    const calendario = await prisma.calendario_escolar.create({
      data: {
        id: crypto.randomUUID(),
        ano: data.ano,
        updatedAt: new Date(),
        eventos_calendario: data.eventos ? {
          create: data.eventos.map(evento => ({
            id: crypto.randomUUID(),
            tipo: evento.tipo,
            descricao: evento.descricao,
            dataInicio: new Date(evento.dataInicio),
            dataFim: evento.dataFim ? new Date(evento.dataFim) : undefined,
            updatedAt: new Date(),
          }))
        } : undefined
      },
      include: {
        eventos_calendario: true
      }
    });
    
    res.status(201).json(calendario);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao criar calendário:', error);
    res.status(500).json({ error: 'Erro ao criar calendário' });
  }
});

// PUT atualizar calendário
calendarioRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = calendarioSchema.partial().parse(req.body);
    
    const calendario = await prisma.calendario_escolar.update({
      where: { id },
      data: {
        ano: data.ano,
      },
      include: {
        eventos_calendario: true
      }
    });
    
    res.json(calendario);
  } catch (error) {
    console.error('Erro ao atualizar calendário:', error);
    res.status(500).json({ error: 'Erro ao atualizar calendário' });
  }
});

// POST adicionar evento ao calendário
calendarioRouter.post('/:id/eventos', async (req, res) => {
  try {
    const { id } = req.params;
    const eventoData = eventoSchema.parse(req.body);
    
    const evento = await prisma.eventos_calendario.create({
      data: {
        id: crypto.randomUUID(),
        calendarioId: id,
        tipo: eventoData.tipo,
        descricao: eventoData.descricao,
        dataInicio: new Date(eventoData.dataInicio),
        dataFim: eventoData.dataFim ? new Date(eventoData.dataFim) : undefined,
        updatedAt: new Date(),
      }
    });
    
    res.status(201).json(evento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao adicionar evento:', error);
    res.status(500).json({ error: 'Erro ao adicionar evento' });
  }
});

// PUT atualizar evento
calendarioRouter.put('/eventos/:eventoId', async (req, res) => {
  try {
    const { eventoId } = req.params;
    const eventoData = eventoSchema.partial().parse(req.body);
    
    const evento = await prisma.eventos_calendario.update({
      where: { id: eventoId },
      data: {
        tipo: eventoData.tipo,
        descricao: eventoData.descricao,
        dataInicio: eventoData.dataInicio ? new Date(eventoData.dataInicio) : undefined,
        dataFim: eventoData.dataFim ? new Date(eventoData.dataFim) : undefined,
      }
    });
    
    res.json(evento);
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
});

// DELETE evento
calendarioRouter.delete('/eventos/:eventoId', async (req, res) => {
  try {
    const { eventoId } = req.params;
    await prisma.eventos_calendario.delete({
      where: { id: eventoId }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    res.status(500).json({ error: 'Erro ao deletar evento' });
  }
});

// DELETE calendário
calendarioRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.calendario_escolar.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar calendário:', error);
    res.status(500).json({ error: 'Erro ao deletar calendário' });
  }
});


