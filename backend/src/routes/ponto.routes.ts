import { Router } from 'express';
import { prisma } from '../lib/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const pontoRouter = Router();

// Configuração do Multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/registro-ponto');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `registro-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPEG, JPG e PNG são permitidas!'));
    }
  }
});

// Listar todos os registros de ponto com filtros
pontoRouter.get('/', async (req, res) => {
  try {
    const { pessoaId, tipoPessoa, dataInicio, dataFim, mes, ano } = req.query;

    let where: any = {};

    if (pessoaId) where.pessoaId = pessoaId as string;
    if (tipoPessoa) where.tipoPessoa = tipoPessoa as string;

    // Filtro por período
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio as string);
      if (dataFim) where.data.lte = new Date(dataFim as string);
    }

    // Filtro por mês/ano
    if (mes && ano) {
      const mesNum = parseInt(mes as string);
      const anoNum = parseInt(ano as string);
      const dataInicial = new Date(anoNum, mesNum - 1, 1);
      const dataFinal = new Date(anoNum, mesNum, 0, 23, 59, 59);
      where.data = {
        gte: dataInicial,
        lte: dataFinal
      };
    }

    const registros = await prisma.registro_ponto.findMany({
      where,
      orderBy: { data: 'desc' }
    });

    res.json(registros);
  } catch (error) {
    console.error('Erro ao listar registros:', error);
    res.status(500).json({ error: 'Erro ao listar registros' });
  }
});

// Buscar registros de uma pessoa específica
pontoRouter.get('/pessoa/:pessoaId', async (req, res) => {
  try {
    const { pessoaId } = req.params;
    const { mes, ano } = req.query;

    console.log('🔍 Buscando registros para:', { pessoaId, mes, ano });

    let where: any = { pessoaId };

    if (mes && ano) {
      const mesNum = parseInt(mes as string);
      const anoNum = parseInt(ano as string);
      const dataInicial = new Date(anoNum, mesNum - 1, 1);
      const dataFinal = new Date(anoNum, mesNum, 0, 23, 59, 59);
      where.data = {
        gte: dataInicial,
        lte: dataFinal
      };
      console.log('📅 Período:', { dataInicial, dataFinal });
    }

    const registros = await prisma.registro_ponto.findMany({
      where,
      orderBy: { data: 'desc' }
    });

    console.log(`✅ ${registros.length} registro(s) encontrado(s)`);

    res.json(registros);
  } catch (error) {
    console.error('❌ Erro ao buscar registros:', error);
    res.status(500).json({ error: 'Erro ao buscar registros' });
  }
});

// Registrar ponto
pontoRouter.post('/', upload.single('foto'), async (req, res) => {
  console.log('\n🟢 ========== NOVA REQUISIÇÃO POST /ponto ==========');
  console.log('Timestamp:', new Date().toISOString());
  try {
    console.log('📥 Recebendo registro de ponto:', {
      body: req.body,
      hasFile: !!req.file,
      fileName: req.file?.filename
    });

    const { pessoaId, tipoPessoa, tipoRegistro, horaRegistro, observacao, attestado, reconhecimentoIA, confianca } = req.body;
    const foto = req.file;

    if (!pessoaId || !tipoPessoa || !tipoRegistro) {
      console.error('❌ Dados incompletos:', { pessoaId, tipoPessoa, tipoRegistro });
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    console.log('✅ Dados validados, criando registro...');

    const registro = await prisma.registro_ponto.create({
      data: {
        pessoaId,
        tipoPessoa,
        tipoRegistro,
        data: new Date(),
        horaRegistro: horaRegistro ? new Date(horaRegistro) : new Date(),
        observacao,
        aprovado: true,
        fotoPath: foto ? foto.filename : undefined,
        attestado: attestado === 'true' || attestado === true,
        reconhecimentoIA: reconhecimentoIA === 'true' || reconhecimentoIA === true,
        confianca: confianca ? parseFloat(confianca) : undefined
      }
    });

    console.log('✅ Registro criado com sucesso:', registro.id);

    res.status(201).json(registro);
  } catch (error) {
    console.error('❌ Erro ao registrar ponto:', error);
    res.status(500).json({ error: 'Erro ao registrar ponto', details: error.message });
  }
});

// Atualizar registro de ponto
pontoRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { horaRegistro, observacao, aprovado } = req.body;

    const registro = await prisma.registro_ponto.update({
      where: { id },
      data: {
        horaRegistro: horaRegistro ? new Date(horaRegistro) : undefined,
        observacao,
        aprovado
      }
    });

    res.json(registro);
  } catch (error) {
    console.error('Erro ao atualizar registro:', error);
    res.status(500).json({ error: 'Erro ao atualizar registro' });
  }
});

// Deletar registro de ponto
pontoRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.registro_ponto.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar registro:', error);
    res.status(500).json({ error: 'Erro ao deletar registro' });
  }
});

// Configuração de jornada - Listar
pontoRouter.get('/jornada/:pessoaId', async (req, res) => {
  try {
    const { pessoaId } = req.params;

    const jornada = await prisma.configuracao_jornada.findUnique({
      where: { pessoaId }
    });

    if (!jornada) {
      return res.status(404).json({ error: 'Jornada não encontrada' });
    }

    res.json(jornada);
  } catch (error) {
    console.error('Erro ao buscar jornada:', error);
    res.status(500).json({ error: 'Erro ao buscar jornada' });
  }
});

// Configuração de jornada - Criar ou atualizar
pontoRouter.post('/jornada', async (req, res) => {
  try {
    const {
      pessoaId,
      tipoPessoa,
      cargaHorariaSemanal,
      cargaHorariaDiaria,
      horarioEntrada,
      horarioSaida,
      horarioIntervaloInicio,
      horarioIntervaloFim,
      diasTrabalho
    } = req.body;

    if (!pessoaId || !tipoPessoa) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Remover duplicatas dos dias de trabalho
    const diasUnicos = diasTrabalho ? Array.from(new Set(diasTrabalho)) : ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA'];

    const jornada = await prisma.configuracao_jornada.upsert({
      where: { pessoaId },
      create: {
        pessoaId,
        tipoPessoa,
        cargaHorariaSemanal: cargaHorariaSemanal || 40,
        cargaHorariaDiaria: cargaHorariaDiaria || 8,
        horarioEntrada,
        horarioSaida,
        horarioIntervaloInicio,
        horarioIntervaloFim,
        diasTrabalho: diasUnicos
      },
      update: {
        cargaHorariaSemanal,
        cargaHorariaDiaria,
        horarioEntrada,
        horarioSaida,
        horarioIntervaloInicio,
        horarioIntervaloFim,
        diasTrabalho: diasUnicos
      }
    });

    res.json(jornada);
  } catch (error) {
    console.error('Erro ao salvar jornada:', error);
    res.status(500).json({ error: 'Erro ao salvar jornada' });
  }
});

// Banco de horas - Buscar por pessoa e período
pontoRouter.get('/banco-horas/:pessoaId', async (req, res) => {
  try {
    const { pessoaId } = req.params;
    const { mes, ano } = req.query;

    let where: any = { pessoaId };

    if (mes && ano) {
      where.mes = parseInt(mes as string);
      where.ano = parseInt(ano as string);
    }

    const bancoHoras = await prisma.banco_horas.findMany({
      where,
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }]
    });

    res.json(bancoHoras);
  } catch (error) {
    console.error('Erro ao buscar banco de horas:', error);
    res.status(500).json({ error: 'Erro ao buscar banco de horas' });
  }
});

// Banco de horas - Calcular e atualizar
pontoRouter.post('/banco-horas/calcular', async (req, res) => {
  try {
    const { pessoaId, tipoPessoa, mes, ano } = req.body;

    if (!pessoaId || !tipoPessoa || !mes || !ano) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Buscar configuração de jornada
    const jornada = await prisma.configuracao_jornada.findUnique({
      where: { pessoaId }
    });

    if (!jornada) {
      return res.status(404).json({ error: 'Configuração de jornada não encontrada' });
    }

    // Buscar registros de ponto do mês
    const dataInicial = new Date(ano, mes - 1, 1);
    const dataFinal = new Date(ano, mes, 0, 23, 59, 59);

    const registros = await prisma.registro_ponto.findMany({
      where: {
        pessoaId,
        data: {
          gte: dataInicial,
          lte: dataFinal
        }
      },
      orderBy: { horaRegistro: 'asc' }
    });

    // Agrupar por dia e calcular horas
    const registrosPorDia: { [key: string]: any[] } = {};
    registros.forEach(r => {
      const dia = r.data.toISOString().split('T')[0];
      if (!registrosPorDia[dia]) registrosPorDia[dia] = [];
      registrosPorDia[dia].push(r);
    });

    let totalHorasTrabalhadas = 0;

    Object.values(registrosPorDia).forEach(registrosDia => {
      const entradas = registrosDia.filter(r => r.tipoRegistro === 'ENTRADA');
      const saidas = registrosDia.filter(r => r.tipoRegistro === 'SAIDA');

      for (let i = 0; i < Math.min(entradas.length, saidas.length); i++) {
        const entrada = entradas[i].horaRegistro.getTime();
        const saida = saidas[i].horaRegistro.getTime();
        const horas = (saida - entrada) / (1000 * 60 * 60);
        totalHorasTrabalhadas += horas;
      }
    });

    // Calcular dias úteis do mês (simplificado)
    const diasUteis = 22; // Pode ser refinado
    const horasDevidas = (jornada.cargaHorariaSemanal / 5) * diasUteis;
    const saldo = totalHorasTrabalhadas - horasDevidas;

    // Salvar ou atualizar banco de horas
    const bancoHoras = await prisma.banco_horas.upsert({
      where: {
        pessoaId_mes_ano: { pessoaId, mes, ano }
      },
      create: {
        pessoaId,
        tipoPessoa,
        mes,
        ano,
        horasTrabalhadas: totalHorasTrabalhadas,
        horasDevidas,
        saldo
      },
      update: {
        horasTrabalhadas: totalHorasTrabalhadas,
        horasDevidas,
        saldo
      }
    });

    res.json(bancoHoras);
  } catch (error) {
    console.error('Erro ao calcular banco de horas:', error);
    res.status(500).json({ error: 'Erro ao calcular banco de horas' });
  }
});

// Relatório de ponto - Resumo por pessoa
pontoRouter.get('/relatorio/:pessoaId', async (req, res) => {
  try {
    const { pessoaId } = req.params;
    const { mes, ano } = req.query;

    if (!mes || !ano) {
      return res.status(400).json({ error: 'Mês e ano são obrigatórios' });
    }

    const mesNum = parseInt(mes as string);
    const anoNum = parseInt(ano as string);
    const dataInicial = new Date(anoNum, mesNum - 1, 1);
    const dataFinal = new Date(anoNum, mesNum, 0, 23, 59, 59);

    // Buscar registros
    const registros = await prisma.registro_ponto.findMany({
      where: {
        pessoaId,
        data: {
          gte: dataInicial,
          lte: dataFinal
        }
      },
      orderBy: { horaRegistro: 'asc' }
    });

    // Buscar jornada
    const jornada = await prisma.configuracao_jornada.findUnique({
      where: { pessoaId }
    });

    // Buscar banco de horas
    const bancoHoras = await prisma.banco_horas.findUnique({
      where: {
        pessoaId_mes_ano: { pessoaId, mes: mesNum, ano: anoNum }
      }
    });

    res.json({
      registros,
      jornada,
      bancoHoras
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

export { pontoRouter };
