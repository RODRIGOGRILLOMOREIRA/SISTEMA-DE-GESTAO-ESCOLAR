/**
 * Controller de Notas
 * Gerencia lançamento de notas com cache e eventos
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import cacheService from '../services/cache.service';
import eventsService from '../services/events.service';
import { z } from 'zod';
import crypto from 'crypto';
import { log } from '../lib/logger';

// Schema de validação baseado no modelo real do Prisma
const notaSchema = z.object({
  alunoId: z.string().uuid(),
  disciplinaId: z.string().uuid(),
  trimestre: z.number().int().min(1).max(3),
  anoLetivo: z.number().int().default(2025),
  avaliacao01: z.number().min(0).max(10).optional(),
  avaliacao02: z.number().min(0).max(10).optional(),
  avaliacao03: z.number().min(0).max(10).optional(),
  mediaM1: z.number().min(0).max(10).optional(),
  avaliacaoEAC: z.number().min(0).max(10).optional(),
  observacao: z.string().optional(),
});

/**
 * GET /api/notas/aluno/:alunoId - Buscar notas do aluno (com cache)
 */
export const buscarNotasAluno = async (req: Request, res: Response) => {
  try {
    const { alunoId } = req.params;
    const { trimestre, anoLetivo } = req.query;

    const cacheKey = `notas:aluno:${alunoId}:trimestre:${trimestre || 'all'}:ano:${anoLetivo || 2025}`;

    const notas = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const where: any = { alunoId };
        if (trimestre) where.trimestre = parseInt(trimestre as string);
        if (anoLetivo) where.anoLetivo = parseInt(anoLetivo as string);

        return await prisma.notas.findMany({
          where,
          include: {
            disciplinas: {
              select: {
                nome: true,
                cargaHoraria: true,
              },
            },
            alunos: {
              select: {
                nome: true,
                numeroMatricula: true,
              },
            },
          },
          orderBy: [
            { trimestre: 'asc' },
            { disciplinas: { nome: 'asc' } },
          ],
        });
      },
      600 // 10 minutos
    );

    res.json(notas);
  } catch (error) {
    log.error({ component: 'notas-controller', action: 'buscarNotasAluno', err: error }, 'Erro ao buscar notas');
    res.status(500).json({ error: 'Erro ao buscar notas' });
  }
};

/**
 * GET /api/notas/turma/:turmaId - Buscar notas da turma
 */
export const buscarNotasTurma = async (req: Request, res: Response) => {
  try {
    const { turmaId } = req.params;
    const { trimestre, disciplinaId, anoLetivo } = req.query;

    const cacheKey = `notas:turma:${turmaId}:t${trimestre || 'all'}:d${disciplinaId || 'all'}:a${anoLetivo || 2025}`;

    const notas = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const where: any = { 
          alunos: { turmaId } 
        };
        if (trimestre) where.trimestre = parseInt(trimestre as string);
        if (disciplinaId) where.disciplinaId = disciplinaId;
        if (anoLetivo) where.anoLetivo = parseInt(anoLetivo as string);

        return await prisma.notas.findMany({
          where,
          include: {
            alunos: {
              select: {
                nome: true,
                numeroMatricula: true,
              },
            },
            disciplinas: {
              select: {
                nome: true,
              },
            },
          },
          orderBy: [
            { alunos: { nome: 'asc' } },
            { trimestre: 'asc' },
          ],
        });
      },
      600 // 10 minutos
    );

    res.json(notas);
  } catch (error) {
    log.error({ component: 'notas-controller', action: 'buscarNotasTurma', err: error }, 'Erro ao buscar notas da turma');
    res.status(500).json({ error: 'Erro ao buscar notas da turma' });
  }
};

/**
 * GET /api/notas/boletim/:alunoId - Boletim completo do aluno
 */
export const buscarBoletim = async (req: Request, res: Response) => {
  try {
    const { alunoId } = req.params;
    const { anoLetivo } = req.query;
    const ano = anoLetivo ? parseInt(anoLetivo as string) : 2025;
    
    const cacheKey = `boletim:aluno:${alunoId}:ano:${ano}`;

    const boletim = await cacheService.getOrSet(
      cacheKey,
      async () => {
        // Buscar aluno
        const aluno = await prisma.alunos.findUnique({
          where: { id: alunoId },
          include: {
            turmas: true,
          },
        });

        if (!aluno) {
          throw new Error('Aluno não encontrado');
        }

        // Buscar notas
        const notas = await prisma.notas.findMany({
          where: { 
            alunoId,
            anoLetivo: ano,
          },
          include: {
            disciplinas: {
              select: {
                nome: true,
                cargaHoraria: true,
              },
            },
          },
          orderBy: [
            { trimestre: 'asc' },
            { disciplinas: { nome: 'asc' } },
          ],
        });

        // Organizar por disciplina
        const notasPorDisciplina: any = {};

        notas.forEach((nota) => {
          const disciplinaId = nota.disciplinaId;
          if (!notasPorDisciplina[disciplinaId]) {
            notasPorDisciplina[disciplinaId] = {
              disciplina: nota.disciplinas.nome,
              cargaHoraria: nota.disciplinas.cargaHoraria,
              trimestres: {},
            };
          }

          notasPorDisciplina[disciplinaId].trimestres[`T${nota.trimestre}`] = {
            avaliacao01: nota.avaliacao01,
            avaliacao02: nota.avaliacao02,
            avaliacao03: nota.avaliacao03,
            mediaM1: nota.mediaM1,
            avaliacaoEAC: nota.avaliacaoEAC,
            notaFinal: nota.notaFinalTrimestre,
            observacao: nota.observacao,
          };
        });

        return {
          aluno: {
            id: aluno.id,
            nome: aluno.nome,
            matricula: aluno.numeroMatricula,
            turma: aluno.turmas?.nome,
          },
          anoLetivo: ano,
          notas: notasPorDisciplina,
          geradoEm: new Date(),
        };
      },
      600 // 10 minutos
    );

    res.json(boletim);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar boletim';
    log.error({ component: 'notas-controller', action: 'buscarBoletim', err: error }, 'Erro ao buscar boletim');
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * POST /api/notas - Lançar nova nota
 */
export const lancarNota = async (req: Request, res: Response) => {
  try {
    const validatedData = notaSchema.parse(req.body);

    const id = crypto.randomUUID();

    // Buscar dados para validação
    const [aluno, disciplina] = await Promise.all([
      prisma.alunos.findUnique({ where: { id: validatedData.alunoId } }),
      prisma.disciplinas.findUnique({ where: { id: validatedData.disciplinaId } }),
    ]);

    if (!aluno || !disciplina) {
      return res.status(404).json({ error: 'Aluno ou disciplina não encontrado' });
    }

    // Calcular nota final do trimestre
    const avaliacoes = [
      validatedData.avaliacao01,
      validatedData.avaliacao02,
      validatedData.avaliacao03,
    ].filter((v): v is number => v !== undefined);

    const notaFinalTrimestre = avaliacoes.length > 0
      ? avaliacoes.reduce((sum, nota) => sum + nota, 0) / avaliacoes.length
      : null;

    // Criar nota
    const nota = await prisma.notas.create({
      data: {
        id,
        alunoId: validatedData.alunoId,
        disciplinaId: validatedData.disciplinaId,
        trimestre: validatedData.trimestre,
        anoLetivo: validatedData.anoLetivo,
        avaliacao01: validatedData.avaliacao01 ?? null,
        avaliacao02: validatedData.avaliacao02 ?? null,
        avaliacao03: validatedData.avaliacao03 ?? null,
        mediaM1: validatedData.mediaM1 ?? null,
        avaliacaoEAC: validatedData.avaliacaoEAC ?? null,
        observacao: validatedData.observacao ?? null,
        notaFinalTrimestre,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        alunos: true,
        disciplinas: true,
      },
    });

    // Invalidar cache
    await Promise.all([
      cacheService.invalidate(`notas:aluno:${validatedData.alunoId}*`),
      cacheService.invalidate(`notas:turma:*`),
      cacheService.invalidate(`boletim:aluno:${validatedData.alunoId}*`),
    ]);

    res.status(201).json(nota);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    log.error({ component: 'notas-controller', action: 'lancarNota', err: error }, 'Erro ao lançar nota');
    res.status(500).json({ error: 'Erro ao lançar nota' });
  }
};

/**
 * PUT /api/notas/:id - Atualizar nota
 */
export const atualizarNota = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = notaSchema.partial().parse(req.body);

    // Calcular nota final se houver avaliações
    let notaFinalTrimestre;
    if (validatedData.avaliacao01 || validatedData.avaliacao02 || validatedData.avaliacao03) {
      const avaliacoes = [
        validatedData.avaliacao01,
        validatedData.avaliacao02,
        validatedData.avaliacao03,
      ].filter((v): v is number => v !== undefined);

      notaFinalTrimestre = avaliacoes.length > 0
        ? avaliacoes.reduce((sum, nota) => sum + nota, 0) / avaliacoes.length
        : undefined;
    }

    const nota = await prisma.notas.update({
      where: { id },
      data: {
        ...validatedData,
        notaFinalTrimestre,
        updatedAt: new Date(),
      },
      include: {
        alunos: true,
        disciplinas: true,
      },
    });

    // Invalidar cache
    await Promise.all([
      cacheService.invalidate(`notas:aluno:${nota.alunoId}*`),
      cacheService.invalidate(`notas:turma:*`),
      cacheService.invalidate(`boletim:aluno:${nota.alunoId}*`),
    ]);

    res.json(nota);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    log.error({ component: 'notas-controller', action: 'atualizarNota', err: error }, 'Erro ao atualizar nota');
    res.status(500).json({ error: 'Erro ao atualizar nota' });
  }
};

/**
 * DELETE /api/notas/:id - Deletar nota
 */
export const deletarNota = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const nota = await prisma.notas.delete({
      where: { id },
    });

    // Invalidar cache
    await Promise.all([
      cacheService.invalidate(`notas:aluno:${nota.alunoId}*`),
      cacheService.invalidate(`notas:turma:*`),
      cacheService.invalidate(`boletim:aluno:${nota.alunoId}*`),
    ]);

    res.json({ message: 'Nota deletada com sucesso' });
  } catch (error) {
    log.error({ component: 'notas-controller', action: 'deletarNota', err: error }, 'Erro ao deletar nota');
    res.status(500).json({ error: 'Erro ao deletar nota' });
  }
};

/**
 * GET /api/notas/stats/aluno/:alunoId - Estatísticas do aluno
 */
export const estatisticasAluno = async (req: Request, res: Response) => {
  try {
    const { alunoId } = req.params;
    const { anoLetivo } = req.query;
    const ano = anoLetivo ? parseInt(anoLetivo as string) : 2025;
    
    const cacheKey = `notas:stats:aluno:${alunoId}:ano:${ano}`;

    const stats = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const notas = await prisma.notas.findMany({
          where: { 
            alunoId,
            anoLetivo: ano,
          },
          include: {
            disciplinas: {
              select: {
                nome: true,
              },
            },
          },
        });

        // Calcular médias por disciplina
        const mediasPorDisciplina: any = {};
        notas.forEach((nota) => {
          const disc = nota.disciplinaId;
          if (!mediasPorDisciplina[disc]) {
            mediasPorDisciplina[disc] = {
              disciplina: nota.disciplinas.nome,
              notas: [],
              media: 0,
            };
          }
          if (nota.notaFinalTrimestre) {
            mediasPorDisciplina[disc].notas.push(nota.notaFinalTrimestre);
          }
        });

        Object.keys(mediasPorDisciplina).forEach((disc) => {
          const notasDisc = mediasPorDisciplina[disc].notas;
          mediasPorDisciplina[disc].media =
            notasDisc.length > 0
              ? notasDisc.reduce((a: number, b: number) => a + b, 0) / notasDisc.length
              : 0;
        });

        // Média geral
        const todasNotas = notas
          .map((n) => n.notaFinalTrimestre)
          .filter((n): n is number => n !== null);
        const mediaGeral =
          todasNotas.length > 0
            ? todasNotas.reduce((a, b) => a + b, 0) / todasNotas.length
            : 0;

        const disciplinasArray = Object.values(mediasPorDisciplina);

        return {
          totalNotas: notas.length,
          mediaGeral: parseFloat(mediaGeral.toFixed(2)),
          mediasPorDisciplina,
          melhorDisciplina: disciplinasArray.length > 0
            ? disciplinasArray.sort((a: any, b: any) => b.media - a.media)[0]
            : null,
          piorDisciplina: disciplinasArray.length > 0
            ? disciplinasArray.sort((a: any, b: any) => a.media - b.media)[0]
            : null,
        };
      },
      1800 // 30 minutos
    );

    res.json(stats);
  } catch (error) {
    log.error({ component: 'notas-controller', action: 'estatisticasAluno', err: error }, 'Erro ao buscar estatísticas');
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};
