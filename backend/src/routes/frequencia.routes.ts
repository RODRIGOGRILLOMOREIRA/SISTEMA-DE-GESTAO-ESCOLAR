import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

export const frequenciaRouter = Router();

// Função helper para calcular dias letivos considerando eventos do calendário
async function calcularDiasLetivos(dataInicio: Date, dataFim: Date): Promise<number> {
  const ano = dataInicio.getFullYear();
  
  // Buscar eventos do calendário que impactam o período
  const eventos = await prisma.eventos_calendario.findMany({
    where: {
      calendario_escolar: { ano },
      OR: [
        {
          dataInicio: {
            gte: dataInicio,
            lte: dataFim
          }
        },
        {
          dataFim: {
            gte: dataInicio,
            lte: dataFim
          }
        },
        {
          AND: [
            { dataInicio: { lte: dataInicio } },
            { dataFim: { gte: dataFim } }
          ]
        }
      ]
    }
  });

  // Tipos de eventos que NÃO são dias letivos
  const tiposNaoLetivos = ['DIA_NAO_LETIVO', 'FERIADO', 'RECESSO'];
  
  // Criar set de datas não letivas
  const datasNaoLetivas = new Set<string>();
  
  eventos.forEach(evento => {
    if (tiposNaoLetivos.includes(evento.tipo)) {
      const inicio = new Date(evento.dataInicio);
      const fim = evento.dataFim ? new Date(evento.dataFim) : inicio;
      
      // Adicionar todos os dias do período do evento
      for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
        datasNaoLetivas.add(d.toISOString().split('T')[0]);
      }
    }
  });

  // Contar dias letivos (seg-sex, excluindo não letivos)
  let diasLetivos = 0;
  for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + 1)) {
    const diaSemana = d.getDay();
    const dataStr = d.toISOString().split('T')[0];
    
    // Segunda a sexta (1-5), não é feriado/recesso
    if (diaSemana >= 1 && diaSemana <= 5 && !datasNaoLetivas.has(dataStr)) {
      diasLetivos++;
    }
  }

  // Adicionar sábados letivos
  const sabadosLetivos = eventos.filter(e => e.tipo === 'SABADO_LETIVO');
  sabadosLetivos.forEach(evento => {
    const data = new Date(evento.dataInicio);
    if (data >= dataInicio && data <= dataFim) {
      diasLetivos++;
    }
  });

  return diasLetivos;
}

const presencaAlunoSchema = z.object({
  alunoId: z.string(),
  presencas: z.array(z.boolean()), // Array de presenças por aula
  justificativa: z.string().optional(),
});

const registroFrequenciaSchema = z.object({
  turmaId: z.string(),
  data: z.string(),
  periodo: z.enum(['MANHA', 'TARDE']),
  disciplinaId: z.string().optional(),
  presencas: z.array(presencaAlunoSchema),
});

// GET registros de frequência por turma e data
frequenciaRouter.get('/turma/:turmaId', async (req, res) => {
  try {
    const { turmaId } = req.params;
    const { dataInicio, dataFim, disciplinaId } = req.query;
    
    const where: any = { turmaId };
    
    if (dataInicio && dataFim) {
      where.data = {
        gte: new Date(dataInicio as string),
        lte: new Date(dataFim as string),
      };
    }
    
    if (disciplinaId) {
      where.disciplinaId = disciplinaId as string;
    }
    
    const registros = await prisma.registro_frequencia.findMany({
      where,
      include: { turmas: true, disciplinas: true, professores: true,
        horarios_aula: true,
        presenca_aluno: {
          include: { alunos: true,
          }
        }
      },
      orderBy: { data: 'desc' }
    });
    
    res.json(registros);
  } catch (error) {
    console.error('Erro ao buscar registros de frequência:', error);
    res.status(500).json({ error: 'Erro ao buscar registros de frequência' });
  }
});

// GET registro específico
frequenciaRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const registro = await prisma.registro_frequencia.findUnique({
      where: { id },
      include: { turmas: true, disciplinas: true, professores: true,
        horarios_aula: true,
        presenca_aluno: {
          include: { alunos: true,
          }
        }
      }
    });
    
    if (!registro) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    
    res.json(registro);
  } catch (error) {
    console.error('Erro ao buscar registro:', error);
    res.status(500).json({ error: 'Erro ao buscar registro' });
  }
});

// GET registro por turma/data/período/disciplina
frequenciaRouter.get('/dia/:turmaId', async (req, res) => {
  try {
    const { turmaId } = req.params;
    const { data, periodo, disciplinaId } = req.query;

    if (!data || !periodo || !disciplinaId) {
      return res.status(400).json({ error: 'Data, período e disciplinaId são obrigatórios' });
    }

    const registro = await prisma.registro_frequencia.findFirst({
      where: {
        turmaId,
        data: new Date(data as string),
        periodo: periodo as string,
        disciplinaId: disciplinaId as string,
      },
      include: {
        turmas: true,
        disciplinas: true,
        professores: true,
        presenca_aluno: {
          include: { alunos: true }
        }
      }
    });

    res.json(registro);
  } catch (error) {
    console.error('Erro ao buscar registro do dia:', error);
    res.status(500).json({ error: 'Erro ao buscar registro do dia' });
  }
});

// POST criar registro de frequência (simplificado - registro geral do período)
frequenciaRouter.post('/', async (req, res) => {
  try {
    const data = registroFrequenciaSchema.parse(req.body);
    
    // Buscar turma para pegar disciplinas e professores
    const turma = await prisma.turmas.findUnique({
      where: { id: data.turmaId },
      include: {
        disciplinas_turmas: {
          include: { disciplinas: true, professores: true
          }
        }
      }
    });
    
    if (!turma || turma.disciplinas_turmas.length === 0) {
      return res.status(400).json({ error: 'Turma não encontrada ou sem disciplinas' });
    }
    
    // Usar disciplina fornecida ou a primeira como padrão
    let disciplinaSelecionada = turma.disciplinas_turmas.find(
      (dt: any) => dt.disciplinaId === data.disciplinaId
    );
    
    if (!disciplinaSelecionada) {
      disciplinaSelecionada = turma.disciplinas_turmas[0];
    }
    
    // Verificar se já existe registro para essa turma/data/período/disciplina
    const existente = await prisma.registro_frequencia.findFirst({
      where: {
        turmaId: data.turmaId,
        data: new Date(data.data),
        periodo: data.periodo,
        disciplinaId: disciplinaSelecionada.disciplinaId,
      }
    });
    
    if (existente) {
      // Se existe, apenas atualizar as presenças
      await prisma.presencaAluno.deleteMany({
        where: { registroId: existente.id }
      });
      
      // Criar um registro de presença para cada aula
      const presencasParaCriar = data.presencas.flatMap(presenca => 
        presenca.presencas.map((presente, aulaIndex) => ({
          registroId: existente.id,
          alunoId: presenca.alunoId,
          presente,
          aulaIndex,
          justificativa: presenca.justificativa,
        }))
      );
      
      await prisma.presencaAluno.createMany({
        data: presencasParaCriar
      });
      
      const registroAtualizado = await prisma.registro_frequencia.findUnique({
        where: { id: existente.id },
        include: { turmas: true, disciplinas: true, professores: true,
          presenca_aluno: {
            include: { alunos: true }
          }
        }
      });
      
      return res.json(registroAtualizado);
    }
    
    // Validar se tem professor
    if (!disciplinaSelecionada.professorId) {
      return res.status(400).json({ error: 'Disciplina sem professor atribuído' });
    }
    
    // Criar novo registro
    const registro = await prisma.registro_frequencia.create({
      data: {
        id: crypto.randomUUID(),
        turmaId: data.turmaId,
        disciplinaId: disciplinaSelecionada.disciplinaId,
        professorId: disciplinaSelecionada.professorId,
        data: new Date(data.data),
        periodo: data.periodo,
        updatedAt: new Date(),
        presenca_aluno: {
          create: data.presencas.flatMap(presenca => 
            presenca.presencas.map((presente, aulaIndex) => ({
              alunoId: presenca.alunoId,
              presente,
              aulaIndex,
              justificativa: presenca.justificativa,
            }))
          )
        }
      },
      include: { turmas: true, disciplinas: true, professores: true,
        presenca_aluno: {
          include: { alunos: true,
          }
        }
      }
    });
    
    res.status(201).json(registro);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao criar registro de frequência:', error);
    res.status(500).json({ error: 'Erro ao criar registro de frequência' });
  }
});

// PUT atualizar registro de frequência
frequenciaRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { presencas } = z.object({
      presencas: z.array(presencaAlunoSchema)
    }).parse(req.body);
    
    // Deletar presenças antigas
    await prisma.presencaAluno.deleteMany({
      where: { registroId: id }
    });
    
    // Criar novas presenças
    const presencasParaCriar = presencas.flatMap(presenca => 
      presenca.presencas.map((presente, aulaIndex) => ({
        alunoId: presenca.alunoId,
        presente,
        aulaIndex,
        justificativa: presenca.justificativa,
      }))
    );
    
    const registro = await prisma.registro_frequencia.update({
      where: { id },
      data: {
        presenca_aluno: {
          create: presencasParaCriar
        }
      },
      include: { turmas: true, disciplinas: true, professores: true,
        horarios_aula: true,
        presenca_aluno: {
          include: { alunos: true,
          }
        }
      }
    });
    
    res.json(registro);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao atualizar registro de frequência:', error);
    res.status(500).json({ error: 'Erro ao atualizar registro de frequência' });
  }
});

// DELETE registro de frequência
frequenciaRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.registro_frequencia.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar registro de frequência:', error);
    res.status(500).json({ error: 'Erro ao deletar registro de frequência' });
  }
});

// GET estatísticas de frequência por aluno
frequenciaRouter.get('/aluno/:alunoId/estatisticas', async (req, res) => {
  try {
    const { alunoId } = req.params;
    const { dataInicio, dataFim, disciplinaId } = req.query;
    
    const whereRegistro: any = {};
    
    if (dataInicio && dataFim) {
      whereRegistro.data = {
        gte: new Date(dataInicio as string),
        lte: new Date(dataFim as string),
      };
    }
    
    if (disciplinaId) {
      whereRegistro.disciplinaId = disciplinaId as string;
    }
    
    const presencas = await prisma.presencaAluno.findMany({
      where: {
        alunoId,
        registro_frequencia: whereRegistro
      },
      include: {
        registro_frequencia: {
          include: { disciplinas: true,
          }
        }
      }
    });
    
    const total = presencas.length;
    const presentes = presencas.filter((p: any) => p.presente).length;
    const faltas = total - presentes;
    const percentual = total > 0 ? (presentes / total) * 100 : 0;
    
    res.json({
      total,
      presentes,
      faltas,
      percentual: percentual.toFixed(2),
      presencas,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// GET resumo de frequência por turma (dia/semana/mês/trimestre/ano)
frequenciaRouter.get('/turma/:turmaId/resumo', async (req, res) => {
  try {
    const { turmaId } = req.params;
    const { visualizacao, disciplinaId } = req.query;
    
    // Buscar turma com alunos
    const turma = await prisma.turmas.findUnique({
      where: { id: turmaId },
      include: { alunos: true }
    });
    
    if (!turma) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }
    
    // Buscar TODOS os registros da turma para detectar o ano letivo em uso
    const whereBase: any = { turmaId };
    if (disciplinaId) {
      whereBase.disciplinaId = disciplinaId as string;
    }
    
    const todosRegistros = await prisma.registro_frequencia.findMany({
      where: whereBase,
      orderBy: { data: 'desc' }
    });
    
    // Determinar o ano letivo baseado no registro mais recente ou usar o da turma
    let anoLetivoAtual: number;
    if (todosRegistros.length > 0) {
      const ultimoRegistro = new Date(todosRegistros[0].data);
      anoLetivoAtual = ultimoRegistro.getFullYear();
    } else {
      anoLetivoAtual = turma.anoLetivo || new Date().getFullYear();
    }
    
    // Buscar o calendário escolar do ano letivo detectado
    const calendario = await prisma.calendario_escolar.findFirst({
      where: { ano: anoLetivoAtual },
      include: { eventos_calendario: true }
    });
    
    if (!calendario) {
      return res.status(404).json({ 
        error: `Calendário escolar não encontrado para o ano ${anoLetivoAtual}. Por favor, cadastre o calendário primeiro.`
      });
    }
    
    // Buscar as datas de início e fim do ano letivo pelos eventos
    // Procurar pelo evento INICIO_ANO_LETIVO e FIM_ANO_LETIVO
    const eventoInicio = calendario.eventos_calendario.find(e => e.tipo === 'INICIO_ANO_LETIVO');
    const eventoFim = calendario.eventos_calendario.find(e => e.tipo === 'FIM_ANO_LETIVO');
    
    // Se não encontrar os eventos específicos, usar a primeira e última data de todos os eventos
    let dataInicioAnoLetivo: Date;
    let dataFimAnoLetivo: Date;
    
    if (eventoInicio && eventoFim) {
      dataInicioAnoLetivo = new Date(eventoInicio.dataInicio);
      dataFimAnoLetivo = new Date(eventoFim.dataFim);
    } else if (calendario.eventos_calendario.length > 0) {
      // Pegar a menor e maior data de todos os eventos
      const todasDatas = calendario.eventos_calendario.flatMap(e => [
        new Date(e.dataInicio),
        new Date(e.dataFim)
      ]);
      dataInicioAnoLetivo = new Date(Math.min(...todasDatas.map(d => d.getTime())));
      dataFimAnoLetivo = new Date(Math.max(...todasDatas.map(d => d.getTime())));
    } else {
      // Se não há eventos, usar o ano inteiro
      dataInicioAnoLetivo = new Date(anoLetivoAtual, 0, 1);
      dataFimAnoLetivo = new Date(anoLetivoAtual, 11, 31);
    }
    
    let dataInicio: Date;
    let dataFim: Date;
    
    // Se há registros, usar o mais recente como referência
    const dataReferencia = todosRegistros.length > 0 
      ? new Date(todosRegistros[0].data) 
      : dataInicioAnoLetivo;
    
    switch (visualizacao) {
      case 'semana':
        // Semana do registro mais recente
        dataInicio = new Date(dataReferencia);
        dataInicio.setDate(dataReferencia.getDate() - dataReferencia.getDay() + 1); // Segunda-feira
        dataFim = new Date(dataInicio);
        dataFim.setDate(dataInicio.getDate() + 6); // Domingo
        break;
      case 'mes':
        // Mês do registro mais recente
        dataInicio = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth(), 1);
        dataFim = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth() + 1, 0);
        break;
      case 'trimestre':
        // Trimestre do registro mais recente
        const trimestreAtual = Math.floor(dataReferencia.getMonth() / 3);
        dataInicio = new Date(dataReferencia.getFullYear(), trimestreAtual * 3, 1);
        dataFim = new Date(dataReferencia.getFullYear(), (trimestreAtual + 1) * 3, 0);
        break;
      case 'ano':
        // Todo o ano letivo conforme calendário escolar
        dataInicio = dataInicioAnoLetivo;
        dataFim = dataFimAnoLetivo;
        break;
      default:
        dataInicio = dataReferencia;
        dataFim = dataReferencia;
    }
    
    // Garantir que as datas estejam dentro do período do calendário escolar
    if (dataInicio < dataInicioAnoLetivo) dataInicio = dataInicioAnoLetivo;
    if (dataFim > dataFimAnoLetivo) dataFim = dataFimAnoLetivo;
    
    // Calcular dias letivos considerando eventos do calendário
    const diasLetivos = await calcularDiasLetivos(dataInicio, dataFim);
    
    // Buscar registros de frequência no período calculado
    const whereRegistro: any = {
      turmaId,
      data: { gte: dataInicio, lte: dataFim }
    };
    
    if (disciplinaId) {
      whereRegistro.disciplinaId = disciplinaId as string;
    }
    
    const registros = await prisma.registro_frequencia.findMany({
      where: whereRegistro,
      include: {
        presenca_aluno: true
      }
    });
    
    // Calcular estatísticas para cada aluno
    const frequenciaAlunos = turma.alunos.map(aluno => {
      let presencasAulas = 0;
      let faltasAulas = 0;
      
      // Contar cada presença/falta individual por aula
      registros.forEach((registro: any) => {
        const presencasDoAluno = registro.presenca_aluno.filter((p: any) => p.alunoId === aluno.id);
        
        presencasDoAluno.forEach((presenca: any) => {
          if (presenca.presente) {
            presencasAulas++;
          } else {
            faltasAulas++;
          }
        });
      });
      
      const totalAulas = presencasAulas + faltasAulas;
      const percentualPresenca = totalAulas > 0 ? (presencasAulas / totalAulas) * 100 : 0;
      
      return {
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        presencas: presencasAulas,
        faltas: faltasAulas,
        totalAulas,
        percentualPresenca: Math.round(percentualPresenca * 10) / 10,
        diasLetivos,
      };
    });
    
    console.log('📊 RESUMO FREQUÊNCIA:', {
      turmaId,
      anoLetivoTurma: turma.anoLetivo,
      anoLetivoDetectado: anoLetivoAtual,
      visualizacao,
      disciplinaId,
      calendarioEscolar: {
        ano: anoLetivoAtual,
        inicio: dataInicioAnoLetivo.toISOString().split('T')[0],
        fim: dataFimAnoLetivo.toISOString().split('T')[0]
      },
      periodoCalculado: `${dataInicio.toISOString().split('T')[0]} - ${dataFim.toISOString().split('T')[0]}`,
      totalRegistrosNaTurma: todosRegistros.length,
      registrosNoPeriodo: registros.length,
      alunosNaTurma: turma.alunos.length,
      alunosComDados: frequenciaAlunos.filter(a => a.totalAulas > 0).length,
      diasLetivos,
      amostra: frequenciaAlunos.slice(0, 2)
    });

    res.json({
      alunos: frequenciaAlunos,
      periodo: {
        dataInicio: dataInicio.toISOString().split('T')[0],
        dataFim: dataFim.toISOString().split('T')[0],
        diasLetivos,
        visualizacao,
        anoLetivo: anoLetivoAtual,
        calendarioEscolar: {
          dataInicio: dataInicioAnoLetivo.toISOString().split('T')[0],
          dataFim: dataFimAnoLetivo.toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar resumo de frequência:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo de frequência' });
  }
});

// GET /api/registro-frequencia/turma/:turmaId - Buscar registros de uma turma por período
frequenciaRouter.get('/registro-frequencia/turma/:turmaId', async (req, res) => {
  try {
    const { turmaId } = req.params;
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'dataInicio e dataFim são obrigatórios' });
    }

    const registros = await prisma.registro_frequencia.findMany({
      where: {
        turmaId,
        data: {
          gte: new Date(dataInicio as string),
          lte: new Date(dataFim as string)
        }
      },
      include: {
        turmas: true,
        disciplinas: true,
        professores: true,
        presenca_aluno: {
          include: {
            alunos: true
          }
        }
      },
      orderBy: {
        data: 'desc'
      }
    });

    console.log('📊 GET /registro-frequencia/turma/:turmaId', {
      turmaId,
      dataInicio,
      dataFim,
      registrosEncontrados: registros.length,
      amostra: registros.length > 0 ? {
        data: registros[0].data,
        presencas: registros[0].presenca_aluno.length
      } : null
    });

    res.json(registros);
  } catch (error) {
    console.error('Erro ao buscar registros de frequência:', error);
    res.status(500).json({ error: 'Erro ao buscar registros de frequência' });
  }
});


