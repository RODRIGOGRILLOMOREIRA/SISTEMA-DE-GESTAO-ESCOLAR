import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

export const gradeHorariaRouter = Router();

const horarioAulaSchema = z.object({
  diaSemana: z.enum(['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO']),
  periodo: z.enum(['MANHA', 'TARDE']),
  ordem: z.number().int().min(1),
  horaInicio: z.string(),
  horaFim: z.string(),
  disciplinaId: z.string(),
  professorId: z.string(),
});

const gradeHorariaSchema = z.object({
  turmaId: z.string(),
  horarios: z.array(horarioAulaSchema),
});

// GET grade horária por turma
gradeHorariaRouter.get('/turma/:turmaId', async (req, res) => {
  try {
    const { turmaId } = req.params;
    
    let gradeHoraria = await prisma.grade_horaria.findUnique({
      where: { turmaId },
      include: {
        horarios_aula: {
          include: { disciplinas: true, professores: true,
          },
          orderBy: [
            { diaSemana: 'asc' },
            { periodo: 'asc' },
            { ordem: 'asc' }
          ]
        }, turmas: true,
      }
    });
    
    // Se não existe, criar uma grade vazia
    if (!gradeHoraria) {
      gradeHoraria = await prisma.grade_horaria.create({
        data: {
          id: crypto.randomUUID(),
          turmaId,
          updatedAt: new Date(),
        },
        include: {
          horarios_aula: {
            include: { disciplinas: true, professores: true,
            }
          }, turmas: true,
        }
      });
    }
    
    res.json(gradeHoraria);
  } catch (error) {
    console.error('Erro ao buscar grade horária:', error);
    res.status(500).json({ error: 'Erro ao buscar grade horária' });
  }
});

// POST criar grade horária
gradeHorariaRouter.post('/', async (req, res) => {
  try {
    const data = gradeHorariaSchema.parse(req.body);
    
    // Verificar se já existe grade para esta turma
    let gradeHoraria = await prisma.grade_horaria.findUnique({
      where: { turmaId: data.turmaId }
    });
    
    if (!gradeHoraria) {
      gradeHoraria = await prisma.grade_horaria.create({
        data: {
          id: crypto.randomUUID(),
          turmaId: data.turmaId,
          updatedAt: new Date(),
        }
      });
    }
    
    // Criar os horários
    const horarios = await Promise.all(
      data.horarios.map(horario =>
        prisma.horarios_aula.create({
          data: {
            id: crypto.randomUUID(),
            gradeId: gradeHoraria.id,
            diaSemana: horario.diaSemana,
            periodo: horario.periodo,
            ordem: horario.ordem,
            horaInicio: horario.horaInicio,
            horaFim: horario.horaFim,
            disciplinaId: horario.disciplinaId,
            professorId: horario.professorId,
            updatedAt: new Date(),
          },
          include: { disciplinas: true, professores: true,
          }
        })
      )
    );
    
    const resultado = await prisma.grade_horaria.findUnique({
      where: { id: gradeHoraria.id },
      include: {
        horarios_aula: {
          include: { disciplinas: true, professores: true,
          },
          orderBy: [
            { diaSemana: 'asc' },
            { periodo: 'asc' },
            { ordem: 'asc' }
          ]
        }, turmas: true,
      }
    });
    
    res.status(201).json(resultado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao criar grade horária:', error);
    res.status(500).json({ error: 'Erro ao criar grade horária' });
  }
});

// PUT atualizar grade horária (substitui todos os horários)
gradeHorariaRouter.put('/turma/:turmaId', async (req, res) => {
  try {
    const { turmaId } = req.params;
    const { horarios } = z.object({ horarios: z.array(horarioAulaSchema) }).parse(req.body);
    
    // Buscar ou criar grade horária
    let gradeHoraria = await prisma.grade_horaria.findUnique({
      where: { turmaId }
    });
    
    if (!gradeHoraria) {
      gradeHoraria = await prisma.grade_horaria.create({
        data: { 
          id: crypto.randomUUID(),
          turmaId,
          updatedAt: new Date(),
        }
      });
    }
    
    // Deletar horários antigos
    await prisma.horarios_aula.deleteMany({
      where: { gradeId: gradeHoraria.id }
    });
    
    // Criar novos horários
    await Promise.all(
      horarios.map(horario =>
        prisma.horarios_aula.create({
          data: {
            id: crypto.randomUUID(),
            gradeId: gradeHoraria.id,
            diaSemana: horario.diaSemana,
            periodo: horario.periodo,
            ordem: horario.ordem,
            horaInicio: horario.horaInicio,
            horaFim: horario.horaFim,
            disciplinaId: horario.disciplinaId,
            professorId: horario.professorId,
            updatedAt: new Date(),
          }
        })
      )
    );
    
    const resultado = await prisma.grade_horaria.findUnique({
      where: { id: gradeHoraria.id },
      include: {
        horarios_aula: {
          include: { disciplinas: true, professores: true,
          },
          orderBy: [
            { diaSemana: 'asc' },
            { periodo: 'asc' },
            { ordem: 'asc' }
          ]
        }, turmas: true,
      }
    });
    
    res.json(resultado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao atualizar grade horária:', error);
    res.status(500).json({ error: 'Erro ao atualizar grade horária' });
  }
});

// DELETE horário específico
gradeHorariaRouter.delete('/horario/:horarioId', async (req, res) => {
  try {
    const { horarioId } = req.params;
    await prisma.horarios_aula.delete({
      where: { id: horarioId }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar horário:', error);
    res.status(500).json({ error: 'Erro ao deletar horário' });
  }
});

// DELETE grade horária completa
gradeHorariaRouter.delete('/turma/:turmaId', async (req, res) => {
  try {
    const { turmaId } = req.params;
    const grade = await prisma.grade_horaria.findUnique({
      where: { turmaId }
    });
    
    if (grade) {
      await prisma.grade_horaria.delete({
        where: { id: grade.id }
      });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar grade horária:', error);
    res.status(500).json({ error: 'Erro ao deletar grade horária' });
  }
});


