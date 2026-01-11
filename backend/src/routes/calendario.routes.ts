import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import multer from 'multer';
import * as XLSX from 'xlsx';

export const calendarioRouter = Router();

// Configuração do Multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel (.xls, .xlsx) são permitidos'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

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

// POST importar eventos do Excel
calendarioRouter.post('/importar-excel', upload.single('arquivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    const { ano, substituir } = req.body;
    
    if (!ano) {
      return res.status(400).json({ error: 'Ano é obrigatório' });
    }

    const anoInt = parseInt(ano);
    
    // Ler o arquivo Excel
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converter para JSON
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('📊 Dados importados do Excel:', data.length, 'linhas');
    
    // Mapear colunas do Excel para o formato do banco
    // Espera-se colunas: data, tipo, descricao (ou similares)
    const eventos = data
      .map((row, index) => {
        try {
          // Tentar identificar as colunas automaticamente (case-insensitive)
          const keys = Object.keys(row).map(k => k.toLowerCase());
          
          const dataKey = keys.find(k => k.includes('data') || k.includes('dia') || k.includes('date')) || keys[0];
          const tipoKey = keys.find(k => k.includes('tipo') || k.includes('type') || k.includes('evento')) || keys[1];
          const descricaoKey = keys.find(k => k.includes('descr') || k.includes('obs') || k.includes('desc')) || keys[2];
          
          let dataInicio: Date;
          const dataValue = row[Object.keys(row).find(k => k.toLowerCase() === dataKey) || ''];
          
          // Se for número (serial date do Excel)
          if (typeof dataValue === 'number') {
            // Converter serial date do Excel para Date
            const excelEpoch = new Date(1899, 11, 30);
            dataInicio = new Date(excelEpoch.getTime() + dataValue * 86400000);
          } else if (typeof dataValue === 'string') {
            // Tentar parsear string de data em formato brasileiro DD/MM/YYYY
            const dataStr = dataValue.trim();
            
            // Regex para DD/MM/YYYY ou DD-MM-YYYY ou DD.MM.YYYY
            const brDateRegex = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/;
            const match = dataStr.match(brDateRegex);
            
            if (match) {
              const [, dia, mes, ano] = match;
              // Criar data no formato ISO (YYYY-MM-DD) para evitar problemas de timezone
              dataInicio = new Date(`${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T12:00:00`);
            } else {
              // Tentar parsear formato ISO ou outros formatos
              dataInicio = new Date(dataValue);
            }
          } else {
            throw new Error('Formato de data inválido');
          }
          
          if (isNaN(dataInicio.getTime())) {
            console.error(`❌ Data inválida na linha ${index + 1}:`, dataValue);
            throw new Error('Data inválida');
          }
          
          // Obter valores originais do Excel
          const tipoOriginalKey = Object.keys(row).find(k => k.toLowerCase() === tipoKey);
          const descricaoOriginalKey = Object.keys(row).find(k => k.toLowerCase() === descricaoKey);
          
          const tipoValue = tipoOriginalKey ? row[tipoOriginalKey] : '';
          const descricaoValue = descricaoOriginalKey ? row[descricaoOriginalKey] : '';
          
          // Log para debug
          console.log(`📝 Linha ${index + 1}:`, {
            data: dataInicio.toLocaleDateString('pt-BR'),
            tipoOriginal: tipoValue,
            descricaoOriginal: descricaoValue
          });
          
          // IMPORTANTE: Todas as chaves devem estar SEM ACENTOS (já normalizadas)
          // pois a função normalizarTipo remove acentos antes de buscar no mapa
          const tipoMap: Record<string, string> = {
            // Inicio Ano Letivo (SEM acentos)
            'inicio ano letivo': 'INICIO_ANO_LETIVO',
            'inicio do ano letivo': 'INICIO_ANO_LETIVO',
            'inicio do ano': 'INICIO_ANO_LETIVO',
            'inicio das aulas': 'INICIO_ANO_LETIVO',
            
            // Fim Ano Letivo
            'fim ano letivo': 'FIM_ANO_LETIVO',
            'fim do ano letivo': 'FIM_ANO_LETIVO',
            'fim do ano': 'FIM_ANO_LETIVO',
            'encerramento': 'FIM_ANO_LETIVO',
            'encerramento do ano': 'FIM_ANO_LETIVO',
            
            // Dia Letivo
            'dia letivo': 'DIA_LETIVO',
            'aula': 'DIA_LETIVO',
            'letivo': 'DIA_LETIVO',
            
            // Dia Não Letivo
            'dia nao letivo': 'DIA_NAO_LETIVO',
            'nao letivo': 'DIA_NAO_LETIVO',
            
            // Parada Pedagógica e Jornada (SEM acentos!)
            'parada pedagogica': 'PARADA_PEDAGOGICA',
            'parada': 'PARADA_PEDAGOGICA',
            'formacao': 'PARADA_PEDAGOGICA',
            'jornada pedagogica': 'PARADA_PEDAGOGICA',
            'jornada': 'PARADA_PEDAGOGICA',
            'planejamento': 'PARADA_PEDAGOGICA',
            
            // Recesso
            'recesso': 'RECESSO',
            'ferias': 'RECESSO',
            
            // Sábado Letivo (SEM acento!)
            'sabado letivo': 'SABADO_LETIVO',
            
            // Feriado
            'feriado': 'FERIADO',
            
            // Início Trimestre (SEM acentos!)
            'inicio trimestre': 'INICIO_TRIMESTRE',
            'inicio de trimestre': 'INICIO_TRIMESTRE',
            'inicio 1o trimestre': 'INICIO_TRIMESTRE',
            'inicio 1 trimestre': 'INICIO_TRIMESTRE',
            'inicio primeiro trimestre': 'INICIO_TRIMESTRE',
            'inicio 2o trimestre': 'INICIO_TRIMESTRE',
            'inicio 2 trimestre': 'INICIO_TRIMESTRE',
            'inicio segundo trimestre': 'INICIO_TRIMESTRE',
            'inicio 3o trimestre': 'INICIO_TRIMESTRE',
            'inicio 3 trimestre': 'INICIO_TRIMESTRE',
            'inicio terceiro trimestre': 'INICIO_TRIMESTRE',
            
            // Fim Trimestre
            'fim trimestre': 'FIM_TRIMESTRE',
            'fim de trimestre': 'FIM_TRIMESTRE',
            'fim 1o trimestre': 'FIM_TRIMESTRE',
            'fim 1 trimestre': 'FIM_TRIMESTRE',
            'fim primeiro trimestre': 'FIM_TRIMESTRE',
            'fim 2o trimestre': 'FIM_TRIMESTRE',
            'fim 2 trimestre': 'FIM_TRIMESTRE',
            'fim segundo trimestre': 'FIM_TRIMESTRE',
            'fim 3o trimestre': 'FIM_TRIMESTRE',
            'fim 3 trimestre': 'FIM_TRIMESTRE',
            'fim terceiro trimestre': 'FIM_TRIMESTRE',
            
            // Conselho de Classe / EAC (SEM acentos!)
            'conselho de classe': 'PERIODO_EAC',
            'conselho': 'PERIODO_EAC',
            'conselho extraordinario': 'PERIODO_EAC',
            'periodo eac': 'PERIODO_EAC',
            'eac': 'PERIODO_EAC',
          };
          
          // Normalizar o tipo: lowercase, remover acentos, trim
          const normalizarTipo = (str: string) => {
            return String(str || '')
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') // Remove acentos
              .trim();
          };
          
          const tipoString = normalizarTipo(tipoValue);
          const tipo = tipoMap[tipoString] || 'FERIADO';
          
          console.log(`🔍 Mapeamento:`, {
            original: tipoValue,
            normalizado: tipoString,
            tipoFinal: tipo
          });
          
          // SEMPRE usar a descrição do Excel se existir, senão usar o tipo original
          let descricaoFinal = '';
          if (descricaoValue && String(descricaoValue).trim()) {
            // Se tem descrição na coluna de descrição, usar ela
            descricaoFinal = String(descricaoValue).trim();
          } else if (tipoValue && String(tipoValue).trim()) {
            // Se não tem descrição mas tem tipo, usar o tipo
            descricaoFinal = String(tipoValue).trim();
          } else {
            // Fallback
            descricaoFinal = 'Evento importado';
          }
          
          console.log(`✅ Processado:`, {
            tipo,
            descricao: descricaoFinal
          });
          
          return {
            tipo,
            descricao: descricaoFinal,
            dataInicio,
            dataFim: dataInicio, // Por padrão, usa a mesma data
          };
        } catch (err) {
          console.warn(`⚠️ Erro ao processar linha ${index + 1}:`, err);
          return null;
        }
      })
      .filter(e => e !== null) as Array<{
        tipo: string;
        descricao: string;
        dataInicio: Date;
        dataFim: Date;
      }>;
    
    console.log('✅ Eventos processados:', eventos.length);
    
    if (eventos.length === 0) {
      return res.status(400).json({ 
        error: 'Nenhum evento válido foi encontrado no arquivo',
        detalhes: 'Verifique se as colunas do Excel estão corretas (data, tipo, descrição)'
      });
    }
    
    // Verificar se já existe calendário para o ano
    let calendario = await prisma.calendario_escolar.findUnique({
      where: { ano: anoInt }
    });
    
    if (calendario) {
      if (substituir === 'true') {
        // Deletar eventos existentes
        await prisma.eventos_calendario.deleteMany({
          where: { calendarioId: calendario.id }
        });
        console.log('🗑️ Eventos existentes removidos');
      }
    } else {
      // Criar novo calendário
      calendario = await prisma.calendario_escolar.create({
        data: {
          id: crypto.randomUUID(),
          ano: anoInt,
          updatedAt: new Date(),
        }
      });
      console.log('📅 Novo calendário criado para', anoInt);
    }
    
    // Inserir eventos
    const eventosInseridos = await prisma.eventos_calendario.createMany({
      data: eventos.map(evento => ({
        id: crypto.randomUUID(),
        calendarioId: calendario!.id,
        tipo: evento.tipo,
        descricao: evento.descricao,
        dataInicio: evento.dataInicio,
        dataFim: evento.dataFim,
        updatedAt: new Date(),
      }))
    });
    
    console.log('✨ Importação concluída:', eventosInseridos.count, 'eventos');
    
    // Buscar calendário completo para retornar
    const calendarioCompleto = await prisma.calendario_escolar.findUnique({
      where: { id: calendario.id },
      include: {
        eventos_calendario: {
          orderBy: { dataInicio: 'asc' }
        }
      }
    });
    
    res.json({
      success: true,
      message: `${eventosInseridos.count} eventos importados com sucesso`,
      calendario: calendarioCompleto,
      eventosImportados: eventosInseridos.count,
      eventosTotal: calendarioCompleto?.eventos_calendario.length || 0
    });
    
  } catch (error) {
    console.error('❌ Erro ao importar Excel:', error);
    res.status(500).json({ 
      error: 'Erro ao importar arquivo Excel',
      detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});


