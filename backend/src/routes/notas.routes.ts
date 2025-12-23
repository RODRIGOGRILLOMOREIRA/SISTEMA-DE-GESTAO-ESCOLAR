import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

export const notasRouter = Router();

const notaSchema = z.object({
  alunoId: z.string(),
  disciplinaId: z.string(),
  trimestre: z.number().int().min(1).max(3),
  anoLetivo: z.number().int().optional().default(new Date().getFullYear()),
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
function calcularMediaFinal(t1: number | null | undefined, t2: number | null | undefined, t3: number | null | undefined): number | null {
  if (t1 !== null && t1 !== undefined && t2 !== null && t2 !== undefined && t3 !== null && t3 !== undefined) {
    // Fórmula: (T1*3 + T2*3 + T3*4) / 10
    const mediaFinal = (t1 * 3 + t2 * 3 + t3 * 4) / 10;
    return parseFloat(mediaFinal.toFixed(2));
  }
  return null;
}

// Função para determinar status de aprovação
function determinarStatusAprovacao(media: number | null): { aprovado: boolean; status: string; cor: string } {
  if (media === null) {
    return { aprovado: false, status: 'Pendente', cor: 'gray' };
  }
  
  if (media >= 8.0) {
    return { aprovado: true, status: 'Aprovado Excelente', cor: 'green-dark' };
  } else if (media >= 6.0) {
    return { aprovado: true, status: 'Aprovado - Pode Evoluir', cor: 'green-light' };
  } else if (media >= 4.0) {
    return { aprovado: false, status: 'Reprovado - Pode Evoluir', cor: 'yellow' };
  } else {
    return { aprovado: false, status: 'Reprovado - Intervenção Urgente', cor: 'red' };
  }
}

// Função para atualizar a nota final do aluno na disciplina
async function atualizarNotaFinal(alunoId: string, disciplinaId: string, anoLetivo: number = new Date().getFullYear()) {
  // Buscar todas as notas dos 3 trimestres para o ano letivo específico
  const notas = await prisma.notas.findMany({
    where: {
      alunoId,
      disciplinaId,
      anoLetivo
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
  const statusInfo = determinarStatusAprovacao(mediaFinal);
  const aprovado = statusInfo.aprovado;

  // Upsert na tabela NotaFinal
  await prisma.notas_finais.upsert({
    where: {
      alunoId_disciplinaId_anoLetivo: {
        alunoId,
        disciplinaId,
        anoLetivo
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
      id: crypto.randomUUID(),
      alunoId,
      disciplinaId,
      anoLetivo,
      trimestre1: t1,
      trimestre2: t2,
      trimestre3: t3,
      mediaFinal,
      aprovado,
      updatedAt: new Date(),
    },
  });

  return { trimestre1: t1, trimestre2: t2, trimestre3: t3, mediaFinal, aprovado };
}

// GET todas as notas de um aluno em uma disciplina
notasRouter.get('/aluno/:alunoId/disciplina/:disciplinaId', async (req, res) => {
  try {
    const { alunoId, disciplinaId } = req.params;
    const anoLetivo = req.query.anoLetivo ? parseInt(req.query.anoLetivo as string) : new Date().getFullYear();

    const notas = await prisma.notas.findMany({
      where: { 
        alunoId, 
        disciplinaId,
        anoLetivo 
      },
      orderBy: { trimestre: 'asc' }
    });

    const notaFinal = await prisma.notas_finais.findUnique({
      where: {
        alunoId_disciplinaId_anoLetivo: { 
          alunoId, 
          disciplinaId,
          anoLetivo 
        }
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
    const notasFinais = await prisma.notas_finais.findMany({
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
    const anoLetivo = data.anoLetivo || new Date().getFullYear();
    
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
    const nota = await prisma.notas.upsert({
      where: {
        alunoId_disciplinaId_trimestre_anoLetivo: {
          alunoId: data.alunoId,
          disciplinaId: data.disciplinaId,
          trimestre: data.trimestre,
          anoLetivo
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
        id: crypto.randomUUID(),
        alunoId: data.alunoId,
        disciplinaId: data.disciplinaId,
        trimestre: data.trimestre,
        anoLetivo,
        avaliacao01: data.avaliacao01 ?? null,
        avaliacao02: data.avaliacao02 ?? null,
        avaliacao03: data.avaliacao03 ?? null,
        mediaM1,
        avaliacaoEAC: data.avaliacaoEAC ?? null,
        notaFinalTrimestre,
        observacao: data.observacao ?? null,
        updatedAt: new Date(),
      },
      include: { alunos: true, disciplinas: true
      }
    });

    // Atualizar nota final anual
    const notaFinal = await atualizarNotaFinal(data.alunoId, data.disciplinaId, anoLetivo);

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
    const notas = await prisma.notas.findMany({
      include: { alunos: true, disciplinas: true },
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

// GET /api/notas/turma/:turmaId - Buscar notas de uma turma
notasRouter.get('/turma/:turmaId', async (req, res) => {
  try {
    const { turmaId } = req.params;
    const anoLetivo = req.query.anoLetivo ? parseInt(req.query.anoLetivo as string) : new Date().getFullYear();

    // Buscar alunos da turma
    const alunos = await prisma.alunos.findMany({
      where: { turmaId }
    });

    if (alunos.length === 0) {
      return res.json([]);
    }

    const alunoIds = alunos.map(a => a.id);

    // Buscar todas as notas dos alunos da turma para o ano letivo específico
    const notas = await prisma.notas.findMany({
      where: {
        alunoId: {
          in: alunoIds
        },
        anoLetivo
      },
      include: {
        alunos: true,
        disciplinas: true
      },
      orderBy: [
        { alunoId: 'asc' },
        { disciplinaId: 'asc' },
        { trimestre: 'asc' }
      ]
    });

    // Transformar para incluir o período no formato esperado pelo frontend
    const notasFormatadas = notas.map(nota => ({
      ...nota,
      periodo: nota.trimestre === 1 ? 'trim1' : nota.trimestre === 2 ? 'trim2' : nota.trimestre === 3 ? 'trim3' : 'final',
      valor: nota.notaFinalTrimestre || 0
    }));

    // Adicionar notas finais do ano letivo específico
    const notasFinaisDB = await prisma.notas_finais.findMany({
      where: {
        alunoId: {
          in: alunoIds
        },
        anoLetivo
      }
    });

    const notasFinaisFormatadas = notasFinaisDB.map(nf => {
      const aluno = alunos.find(a => a.id === nf.alunoId);
      return {
        id: nf.id,
        alunoId: nf.alunoId,
        disciplinaId: nf.disciplinaId,
        periodo: 'final',
        valor: nf.mediaFinal || 0,
        alunos: aluno
      };
    });

    const todasNotas = [...notasFormatadas, ...notasFinaisFormatadas];

    console.log('📊 GET /notas/turma/:turmaId', {
      turmaId,
      anoLetivo,
      alunosNaTurma: alunos.length,
      notasEncontradas: notas.length,
      notasFinais: notasFinaisDB.length,
      totalNotas: todasNotas.length,
      amostra: todasNotas.length > 0 ? {
        alunoId: todasNotas[0].alunoId,
        alunoNome: todasNotas[0].alunos?.nome,
        disciplinaId: todasNotas[0].disciplinaId,
        periodo: todasNotas[0].periodo,
        valor: todasNotas[0].valor
      } : null
    });

    res.json(todasNotas);
  } catch (error) {
    console.error('Erro ao buscar notas da turma:', error);
    res.status(500).json({ error: 'Erro ao buscar notas da turma' });
  }
});

// DELETE nota
notasRouter.delete('/:id', async (req, res) => {
  try {
    const nota = await prisma.notas.findUnique({
      where: { id: req.params.id }
    });

    if (!nota) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }

    await prisma.notas.delete({
      where: { id: req.params.id }
    });

    // Atualizar nota final após deletar
    await atualizarNotaFinal(nota.alunoId, nota.disciplinaId);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar nota' });
  }
});


