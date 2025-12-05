import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export const notasRouter = Router();

const notaSchema = z.object({
  alunoId: z.string(),
  disciplinaId: z.string(),
  trimestre: z.number().int().min(1).max(3),
  avaliacao01: z.number().min(0).max(10).nullable().optional(),
  avaliacao02: z.number().min(0).max(10).nullable().optional(),
  avaliacao03: z.number().min(0).max(10).nullable().optional(),
  avaliacaoEAC: z.number().min(0).max(10).nullable().optional(),
  observacao: z.string().optional().nullable(),
});

// Função para calcular a média do Momento 1
function calcularMediaM1(av1: number | null, av2: number | null, av3: number | null): number | null {
  if (av1 !== null && av2 !== null && av3 !== null) {
    return parseFloat((av1 + av2 + av3).toFixed(2));
  }
  return null;
}

// Função para calcular a nota final do trimestre (maior entre M1 e EAC)
function calcularNotaFinalTrimestre(mediaM1: number | null, avaliacaoEAC: number | null): number | null {
  if (mediaM1 !== null && avaliacaoEAC !== null) {
    return Math.max(mediaM1, avaliacaoEAC);
  }
  if (mediaM1 !== null) return mediaM1;
  if (avaliacaoEAC !== null) return avaliacaoEAC;
  return null;
}

// Função para calcular a média final anual
function calcularMediaFinal(t1: number | null, t2: number | null, t3: number | null): number | null {
  if (t1 !== null && t2 !== null && t3 !== null) {
    // Fórmula: (T1*1 + T2*2 + T3*3) / 6
    const mediaFinal = (t1 * 1 + t2 * 2 + t3 * 3) / 6;
    return parseFloat(mediaFinal.toFixed(2));
  }
  return null;
}

// Função para atualizar a nota final do aluno na disciplina
async function atualizarNotaFinal(alunoId: string, disciplinaId: string) {
  // Buscar todas as notas dos 3 trimestres
  const notas = await prisma.nota.findMany({
    where: {
      alunoId,
      disciplinaId
    },
    orderBy: { trimestre: 'asc' }
  });

  const notaTri1 = notas.find(n => n.trimestre === 1);
  const notaTri2 = notas.find(n => n.trimestre === 2);
  const notaTri3 = notas.find(n => n.trimestre === 3);

  const t1 = notaTri1?.notaFinalTrimestre;
  const t2 = notaTri2?.notaFinalTrimestre;
  const t3 = notaTri3?.notaFinalTrimestre;

  const mediaFinal = calcularMediaFinal(t1, t2, t3);
  const aprovado = mediaFinal !== null && mediaFinal >= 6.0;

  // Upsert na tabela NotaFinal
  await prisma.notaFinal.upsert({
    where: {
      alunoId_disciplinaId: {
        alunoId,
        disciplinaId
      }
    },
    update: {
      trimestre1: t1,
      trimestre2: t2,
      trimestre3: t3,
      mediaFinal,
      aprovado,
      updatedAt: new Date()
    },
    create: {
      alunoId,
      disciplinaId,
      trimestre1: t1,
      trimestre2: t2,
      trimestre3: t3,
      mediaFinal,
      aprovado
    }
  });

  return { trimestre1: t1, trimestre2: t2, trimestre3: t3, mediaFinal, aprovado };
}

// GET todas as notas de um aluno em uma disciplina
notasRouter.get('/aluno/:alunoId/disciplina/:disciplinaId', async (req, res) => {
  try {
    const { alunoId, disciplinaId } = req.params;

    const notas = await prisma.nota.findMany({
      where: { alunoId, disciplinaId },
      orderBy: { trimestre: 'asc' }
    });

    const notaFinal = await prisma.notaFinal.findUnique({
      where: {
        alunoId_disciplinaId: { alunoId, disciplinaId }
      }
    });

    res.json({ notas, notaFinal });
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    res.status(500).json({ error: 'Erro ao buscar notas' });
  }
});

// GET nota final de um aluno
notasRouter.get('/final/aluno/:alunoId', async (req, res) => {
  try {
    const notasFinais = await prisma.notaFinal.findMany({
      where: { alunoId: req.params.alunoId }
    });
    res.json(notasFinais);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar notas finais' });
  }
});

// POST/PUT salvar ou atualizar nota (Upsert)
notasRouter.post('/salvar', async (req, res) => {
  try {
    const data = notaSchema.parse(req.body);
    
    // Calcular média M1
    const mediaM1 = calcularMediaM1(
      data.avaliacao01 ?? null,
      data.avaliacao02 ?? null,
      data.avaliacao03 ?? null
    );

    // Calcular nota final do trimestre
    const notaFinalTrimestre = calcularNotaFinalTrimestre(
      mediaM1,
      data.avaliacaoEAC ?? null
    );

    // Upsert na tabela Nota
    const nota = await prisma.nota.upsert({
      where: {
        alunoId_disciplinaId_trimestre: {
          alunoId: data.alunoId,
          disciplinaId: data.disciplinaId,
          trimestre: data.trimestre
        }
      },
      update: {
        avaliacao01: data.avaliacao01 ?? null,
        avaliacao02: data.avaliacao02 ?? null,
        avaliacao03: data.avaliacao03 ?? null,
        mediaM1,
        avaliacaoEAC: data.avaliacaoEAC ?? null,
        notaFinalTrimestre,
        observacao: data.observacao ?? null,
        updatedAt: new Date()
      },
      create: {
        alunoId: data.alunoId,
        disciplinaId: data.disciplinaId,
        trimestre: data.trimestre,
        avaliacao01: data.avaliacao01 ?? null,
        avaliacao02: data.avaliacao02 ?? null,
        avaliacao03: data.avaliacao03 ?? null,
        mediaM1,
        avaliacaoEAC: data.avaliacaoEAC ?? null,
        notaFinalTrimestre,
        observacao: data.observacao ?? null
      },
      include: {
        aluno: true,
        disciplina: true
      }
    });

    // Atualizar nota final anual
    const notaFinal = await atualizarNotaFinal(data.alunoId, data.disciplinaId);

    res.json({ nota, notaFinal });
  } catch (error) {
    console.error('Erro ao salvar nota:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Erro ao salvar nota' });
  }
});

// GET todas as notas
notasRouter.get('/', async (req, res) => {
  try {
    const notas = await prisma.nota.findMany({
      include: { aluno: true, disciplina: true },
      orderBy: [
        { alunoId: 'asc' },
        { disciplinaId: 'asc' },
        { trimestre: 'asc' }
      ]
    });
    res.json(notas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar notas' });
  }
});

// DELETE nota
notasRouter.delete('/:id', async (req, res) => {
  try {
    const nota = await prisma.nota.findUnique({
      where: { id: req.params.id }
    });

    if (!nota) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }

    await prisma.nota.delete({
      where: { id: req.params.id }
    });

    // Atualizar nota final após deletar
    await atualizarNotaFinal(nota.alunoId, nota.disciplinaId);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar nota' });
  }
});
