import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import cacheService from '../services/cache.service';
import eventsService from '../services/events.service';import crypto from 'crypto';
// Schema de validação para registrar frequência
const frequenciaSchema = z.object({
  alunoId: z.string().uuid(),
  turmaId: z.string().uuid(),
  data: z.string().datetime(),
  presente: z.boolean().default(true),
  observacao: z.string().optional(),
});

/**
 * Lista frequências com filtros e paginação
 */
export async function listarFrequencias(req: Request, res: Response) {
  try {
    const { page, limit, skip, sort, order } = (req as any).pagination;
    const { turmaId, alunoId, dataInicio, dataFim, presente } = req.query;

    const cacheKey = `frequencias:list:${page}:${limit}:${turmaId || ''}:${alunoId || ''}:${dataInicio || ''}:${dataFim || ''}:${presente || ''}`;

    const cached = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const where: any = {};

        if (turmaId) where.turmaId = turmaId as string;
        if (alunoId) where.alunoId = alunoId as string;
        if (presente !== undefined) where.presente = presente === 'true';

        if (dataInicio || dataFim) {
          where.data = {};
          if (dataInicio) where.data.gte = new Date(dataInicio as string);
          if (dataFim) where.data.lte = new Date(dataFim as string);
        }

        const [frequencias, total] = await Promise.all([
          prisma.frequencias.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sort]: order },
            include: {
              alunos: {
                select: {
                  id: true,
                  nome: true,
                  numeroMatricula: true,
                },
              },
              turmas: {
                select: {
                  id: true,
                  nome: true,
                  ano: true,
                  periodo: true,
                },
              },
            },
          }),
          prisma.frequencias.count({ where }),
        ]);

        return {
          frequencias,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
      600 // 10 minutos
    );

    return res.json(cached);
  } catch (error) {
    console.error('Erro ao listar frequências:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar frequências',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

/**
 * Busca frequências de um aluno específico
 */
export async function buscarFrequenciasAluno(req: Request, res: Response) {
  try {
    const { alunoId } = req.params;
    const { mes, ano } = req.query;
    
    const cacheKey = `frequencias:aluno:${alunoId}:${mes || 'all'}:${ano || new Date().getFullYear()}`;

    const frequencias = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const where: any = { alunoId };

        // Filtro por mês/ano se fornecido
        if (mes && ano) {
          const dataInicio = new Date(parseInt(ano as string), parseInt(mes as string) - 1, 1);
          const dataFim = new Date(parseInt(ano as string), parseInt(mes as string), 0);
          where.data = { gte: dataInicio, lte: dataFim };
        }

        const result = await prisma.frequencias.findMany({
          where,
          orderBy: { data: 'desc' },
          include: {
            turmas: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        });

        // Calcula estatísticas
        const totalRegistros = result.length;
        const totalPresencas = result.filter(f => f.presente).length;
        const percentualPresenca = totalRegistros > 0 
          ? ((totalPresencas / totalRegistros) * 100).toFixed(2)
          : '0.00';

        return {
          frequencias: result,
          estatisticas: {
            total: totalRegistros,
            presencas: totalPresencas,
            faltas: totalRegistros - totalPresencas,
            percentualPresenca: `${percentualPresenca}%`,
          },
        };
      },
      600 // 10 minutos
    );

    return res.json(frequencias);
  } catch (error) {
    console.error('Erro ao buscar frequências do aluno:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar frequências',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

/**
 * Busca frequências de uma turma em uma data específica
 */
export async function buscarFrequenciasTurmaDia(req: Request, res: Response) {
  try {
    const { turmaId } = req.params;
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({ error: 'Data é obrigatória' });
    }

    const cacheKey = `frequencias:turma:${turmaId}:dia:${data}`;

    const result = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const dataConsulta = new Date(data as string);
        
        // Busca frequências da turma na data
        const frequencias = await prisma.frequencias.findMany({
          where: {
            turmaId,
            data: {
              gte: new Date(dataConsulta.setHours(0, 0, 0, 0)),
              lt: new Date(dataConsulta.setHours(23, 59, 59, 999)),
            },
          },
          include: {
            alunos: {
              select: {
                id: true,
                nome: true,
                numeroMatricula: true,
              },
            },
          },
          orderBy: {
            alunos: {
              nome: 'asc',
            },
          },
        });

        // Calcula estatísticas
        const totalAlunos = frequencias.length;
        const presentes = frequencias.filter(f => f.presente).length;
        const ausentes = totalAlunos - presentes;
        const percentualPresenca = totalAlunos > 0
          ? ((presentes / totalAlunos) * 100).toFixed(2)
          : '0.00';

        return {
          turmaId,
          data: data as string,
          frequencias,
          resumo: {
            totalAlunos,
            presentes,
            ausentes,
            percentualPresenca: `${percentualPresenca}%`,
          },
        };
      },
      600 // 10 minutos
    );

    return res.json(result);
  } catch (error) {
    console.error('Erro ao buscar frequências da turma:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar frequências',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

/**
 * Registra frequência de um aluno
 */
export async function registrarFrequencia(req: Request, res: Response) {
  try {
    const validatedData = frequenciaSchema.parse(req.body);

    // Verifica se aluno e turma existem
    const [aluno, turma] = await Promise.all([
      prisma.alunos.findUnique({
        where: { id: validatedData.alunoId },
      }),
      prisma.turmas.findUnique({
        where: { id: validatedData.turmaId },
      }),
    ]);

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    if (!turma) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    // Verifica se já existe registro para este aluno nesta data
    const dataConsulta = new Date(validatedData.data);
    const frequenciaExistente = await prisma.frequencias.findFirst({
      where: {
        alunoId: validatedData.alunoId,
        turmaId: validatedData.turmaId,
        data: {
          gte: new Date(dataConsulta.setHours(0, 0, 0, 0)),
          lt: new Date(dataConsulta.setHours(23, 59, 59, 999)),
        },
      },
    });

    let frequencia;

    if (frequenciaExistente) {
      // Atualiza registro existente
      frequencia = await prisma.frequencias.update({
        where: { id: frequenciaExistente.id },
        data: {
          presente: validatedData.presente,
          observacao: validatedData.observacao,
          updatedAt: new Date(),
        },
      });
    } else {
      // Cria novo registro
      frequencia = await prisma.frequencias.create({
        data: {
          id: crypto.randomUUID(),
          alunoId: validatedData.alunoId,
          turmaId: validatedData.turmaId,
          data: new Date(validatedData.data),
          presente: validatedData.presente,
          observacao: validatedData.observacao,
          updatedAt: new Date(),
        },
      });
    }

    // Emite evento de frequência registrada (para notificações)
    if (!validatedData.presente) {
      // Só notifica em caso de falta
      eventsService.emitirFaltaRegistrada({
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        turmaId: turma.id,
        turmaNome: turma.nome,
        data: new Date(validatedData.data),
        observacao: validatedData.observacao,
      });
    }

    // Invalida cache relacionado
    await Promise.all([
      cacheService.invalidate(`frequencias:aluno:${validatedData.alunoId}*`),
      cacheService.invalidate(`frequencias:turma:${validatedData.turmaId}*`),
      cacheService.invalidate('frequencias:list:*'),
    ]);

    return res.status(frequenciaExistente ? 200 : 201).json(frequencia);
  } catch (error) {
    console.error('Erro ao registrar frequência:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    return res.status(500).json({ 
      error: 'Erro ao registrar frequência',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

/**
 * Registra frequência em lote para uma turma
 */
export async function registrarFrequenciaLote(req: Request, res: Response) {
  try {
    const { turmaId, data, frequencias } = req.body;

    const batchSchema = z.object({
      turmaId: z.string().uuid(),
      data: z.string().datetime(),
      frequencias: z.array(z.object({
        alunoId: z.string().uuid(),
        presente: z.boolean(),
        observacao: z.string().optional(),
      })),
    });

    const validatedData = batchSchema.parse({ turmaId, data, frequencias });

    // Verifica se turma existe
    const turma = await prisma.turmas.findUnique({
      where: { id: validatedData.turmaId },
    });

    if (!turma) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    const dataRegistro = new Date(validatedData.data);
    const registrosCriados: any[] = [];
    const alunosComFalta: any[] = [];

    // Processa cada frequência em transação
    await prisma.$transaction(async (tx) => {
      for (const freq of validatedData.frequencias) {
        // Verifica se aluno existe e pertence à turma
        const aluno = await tx.alunos.findFirst({
          where: {
            id: freq.alunoId,
            turmaId: validatedData.turmaId,
          },
        });

        if (!aluno) {
          console.warn(`Aluno ${freq.alunoId} não encontrado ou não pertence à turma`);
          continue;
        }

        // Verifica se já existe registro
        const existente = await tx.frequencias.findFirst({
          where: {
            alunoId: freq.alunoId,
            turmaId: validatedData.turmaId,
            data: {
              gte: new Date(dataRegistro.setHours(0, 0, 0, 0)),
              lt: new Date(dataRegistro.setHours(23, 59, 59, 999)),
            },
          },
        });

        let registro;
        if (existente) {
          registro = await tx.frequencias.update({
            where: { id: existente.id },
            data: {
              presente: freq.presente,
              observacao: freq.observacao,
              updatedAt: new Date(),
            },
          });
        } else {
          registro = await tx.frequencias.create({
            data: {
              id: crypto.randomUUID(),
              alunoId: freq.alunoId,
              turmaId: validatedData.turmaId,
              data: dataRegistro,
              presente: freq.presente,
              observacao: freq.observacao,
              updatedAt: new Date(),
            },
          });
        }

        registrosCriados.push(registro);

        // Armazena alunos com falta para notificar depois
        if (!freq.presente) {
          alunosComFalta.push({
            alunoId: aluno.id,
            alunoNome: aluno.nome,
            observacao: freq.observacao,
          });
        }
      }
    });

    // Emite eventos de falta para notificações (após transação)
    for (const alunoFalta of alunosComFalta) {
      eventsService.emitirFaltaRegistrada({
        alunoId: alunoFalta.alunoId,
        alunoNome: alunoFalta.alunoNome,
        turmaId: turma.id,
        turmaNome: turma.nome,
        data: dataRegistro,
        observacao: alunoFalta.observacao,
      });
    }

    // Invalida cache
    await Promise.all([
      cacheService.invalidate(`frequencias:turma:${validatedData.turmaId}*`),
      cacheService.invalidate('frequencias:list:*'),
      ...validatedData.frequencias.map(f => 
        cacheService.invalidate(`frequencias:aluno:${f.alunoId}*`)
      ),
    ]);

    return res.status(201).json({
      message: 'Frequências registradas com sucesso',
      total: registrosCriados.length,
      faltasRegistradas: alunosComFalta.length,
      registros: registrosCriados,
    });
  } catch (error) {
    console.error('Erro ao registrar frequências em lote:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    return res.status(500).json({ 
      error: 'Erro ao registrar frequências em lote',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

/**
 * Deleta registro de frequência
 */
export async function deletarFrequencia(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const frequencia = await prisma.frequencias.findUnique({
      where: { id },
    });

    if (!frequencia) {
      return res.status(404).json({ error: 'Frequência não encontrada' });
    }

    await prisma.frequencias.delete({
      where: { id },
    });

    // Invalida cache
    await Promise.all([
      cacheService.invalidate(`frequencias:aluno:${frequencia.alunoId}*`),
      cacheService.invalidate(`frequencias:turma:${frequencia.turmaId}*`),
      cacheService.invalidate('frequencias:list:*'),
    ]);

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar frequência:', error);
    return res.status(500).json({ 
      error: 'Erro ao deletar frequência',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

/**
 * Relatório de frequências por período
 */
export async function relatorioFrequencias(req: Request, res: Response) {
  try {
    const { turmaId, dataInicio, dataFim } = req.query;

    if (!turmaId || !dataInicio || !dataFim) {
      return res.status(400).json({ 
        error: 'turmaId, dataInicio e dataFim são obrigatórios' 
      });
    }

    const cacheKey = `frequencias:relatorio:${turmaId}:${dataInicio}:${dataFim}`;

    const relatorio = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const turma = await prisma.turmas.findUnique({
          where: { id: turmaId as string },
          select: {
            id: true,
            nome: true,
            ano: true,
            periodo: true,
          },
        });

        if (!turma) {
          return null;
        }

        // Busca todas as frequências do período
        const frequencias = await prisma.frequencias.findMany({
          where: {
            turmaId: turmaId as string,
            data: {
              gte: new Date(dataInicio as string),
              lte: new Date(dataFim as string),
            },
          },
          include: {
            alunos: {
              select: {
                id: true,
                nome: true,
                numeroMatricula: true,
              },
            },
          },
          orderBy: [
            { data: 'asc' },
            { alunos: { nome: 'asc' } },
          ],
        });

        // Agrupa por aluno
        const alunosMap = new Map();
        frequencias.forEach(freq => {
          const alunoId = freq.alunoId;
          if (!alunosMap.has(alunoId)) {
            alunosMap.set(alunoId, {
              aluno: freq.alunos,
              presencas: 0,
              faltas: 0,
              total: 0,
              frequencias: [],
            });
          }
          
          const alunoData = alunosMap.get(alunoId);
          alunoData.total++;
          if (freq.presente) {
            alunoData.presencas++;
          } else {
            alunoData.faltas++;
          }
          alunoData.frequencias.push({
            data: freq.data,
            presente: freq.presente,
            observacao: freq.observacao,
          });
        });

        // Converte Map para array e calcula percentuais
        const alunosRelatorio = Array.from(alunosMap.values()).map(data => ({
          ...data,
          percentualPresenca: data.total > 0 
            ? ((data.presencas / data.total) * 100).toFixed(2) + '%'
            : '0.00%',
        }));

        return {
          turma,
          periodo: {
            inicio: dataInicio,
            fim: dataFim,
          },
          alunos: alunosRelatorio,
          totalRegistros: frequencias.length,
        };
      },
      1800 // 30 minutos
    );

    if (!relatorio) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    return res.json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório de frequências:', error);
    return res.status(500).json({ 
      error: 'Erro ao gerar relatório',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
