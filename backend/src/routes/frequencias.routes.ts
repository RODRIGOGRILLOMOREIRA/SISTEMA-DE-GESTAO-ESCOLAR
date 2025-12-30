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
    const { alunoId } = req.params;
    const { anoLetivo } = req.query;
    
    // Se tiver ano letivo, calcular estatísticas dos registros de frequência
    if (anoLetivo) {
      const ano = parseInt(anoLetivo as string);
      
      // Buscar todos os registros de frequência do aluno no ano letivo
      const registros = await prisma.registro_frequencia.findMany({
        where: {
          data: {
            gte: new Date(`${ano}-01-01`),
            lte: new Date(`${ano}-12-31`)
          },
          presenca_aluno: {
            some: {
              alunoId: alunoId
            }
          }
        },
        include: {
          disciplina: true,
          presenca_aluno: {
            where: {
              alunoId: alunoId
            }
          }
        }
      });

      // Agrupar por disciplina e calcular estatísticas por trimestre
      const frequenciasPorDisciplina = new Map<string, any>();

      registros.forEach(registro => {
        const disciplinaId = registro.disciplinaId;
        const disciplinaNome = registro.disciplina?.nome || 'Sem disciplina';
        const mes = new Date(registro.data).getMonth() + 1;
        
        // Determinar trimestre (ajustar conforme calendário escolar)
        let trimestre = 1;
        if (mes >= 5 && mes <= 8) trimestre = 2;
        else if (mes >= 9 && mes <= 12) trimestre = 3;

        if (!frequenciasPorDisciplina.has(disciplinaId)) {
          frequenciasPorDisciplina.set(disciplinaId, {
            disciplina: { nome: disciplinaNome },
            trimestre1Presencas: 0,
            trimestre1Total: 0,
            trimestre2Presencas: 0,
            trimestre2Total: 0,
            trimestre3Presencas: 0,
            trimestre3Total: 0,
            percentualAnual: 0
          });
        }

        const freq = frequenciasPorDisciplina.get(disciplinaId);
        
        // Contar presenças e total de aulas
        registro.presenca_aluno.forEach(presenca => {
          if (trimestre === 1) {
            freq.trimestre1Total++;
            if (presenca.presente) freq.trimestre1Presencas++;
          } else if (trimestre === 2) {
            freq.trimestre2Total++;
            if (presenca.presente) freq.trimestre2Presencas++;
          } else if (trimestre === 3) {
            freq.trimestre3Total++;
            if (presenca.presente) freq.trimestre3Presencas++;
          }
        });
      });

      // Calcular percentual anual
      const resultado = Array.from(frequenciasPorDisciplina.values()).map(freq => {
        const totalPresencas = freq.trimestre1Presencas + freq.trimestre2Presencas + freq.trimestre3Presencas;
        const totalAulas = freq.trimestre1Total + freq.trimestre2Total + freq.trimestre3Total;
        freq.percentualAnual = totalAulas > 0 ? (totalPresencas / totalAulas) * 100 : 0;
        return freq;
      });

      return res.json(resultado);
    }

    // Se não tiver ano letivo, buscar frequências antigas do sistema antigo
    const frequencias = await prisma.frequencias.findMany({
      where: { alunoId: req.params.alunoId },
      include: { turmas: true },
      orderBy: { data: 'desc' }
    });
    res.json(frequencias);
  } catch (error) {
    console.error('Erro ao buscar frequências do aluno:', error);
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


