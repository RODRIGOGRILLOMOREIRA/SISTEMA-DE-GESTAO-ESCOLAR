import { Router } from 'express';
import { prisma } from '../lib/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const reconhecimentoFacialRouter = Router();

// Configuração do Multer para upload de fotos de cadastro
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/reconhecimento-facial');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `face-${uniqueSuffix}${path.extname(file.originalname)}`);
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

// Cadastrar reconhecimento facial
reconhecimentoFacialRouter.post('/', upload.array('fotos', 5), async (req, res) => {
  try {
    const { pessoaId, tipoPessoa, descritores } = req.body;
    const fotos = req.files as Express.Multer.File[];

    console.log('📥 Recebendo cadastro facial...');
    console.log('  pessoaId:', pessoaId);
    console.log('  tipoPessoa:', tipoPessoa);
    console.log('  fotos:', fotos?.length);

    if (!pessoaId || !tipoPessoa) {
      return res.status(400).json({ error: 'pessoaId e tipoPessoa são obrigatórios' });
    }

    if (!fotos || fotos.length < 3) {
      return res.status(400).json({ error: 'São necessárias pelo menos 3 fotos' });
    }

    // Salvar caminhos das fotos
    const fotosPath = fotos.map(f => f.filename);
    console.log('📷 Fotos salvas:', fotosPath);

    // Descritores são opcionais (para compatibilidade)
    const descritoresData = descritores || '[]';

    // Verificar se já existe cadastro
    const existente = await prisma.reconhecimento_facial.findUnique({
      where: { pessoaId }
    });

    let cadastro;
    if (existente) {
      console.log('🔄 Atualizando cadastro existente...');
      // Atualizar cadastro existente
      cadastro = await prisma.reconhecimento_facial.update({
        where: { pessoaId },
        data: {
          descritores: descritoresData,
          fotos: fotosPath,
          ativo: true
        }
      });

      // Deletar fotos antigas
      if (existente.fotos && existente.fotos.length > 0) {
        for (const foto of existente.fotos) {
          const fotoPath = path.join(__dirname, '../../uploads/reconhecimento-facial', foto);
          if (fs.existsSync(fotoPath)) {
            fs.unlinkSync(fotoPath);
            console.log('🗑️ Foto antiga deletada:', foto);
          }
        }
      }
    } else {
      console.log('➕ Criando novo cadastro...');
      // Criar novo cadastro
      cadastro = await prisma.reconhecimento_facial.create({
        data: {
          pessoaId,
          tipoPessoa,
          descritores: descritoresData,
          fotos: fotosPath,
          ativo: true
        }
      });
    }

    console.log('✅ Cadastro salvo com sucesso!');
    res.status(201).json(cadastro);
  } catch (error) {
    console.error('❌ Erro ao cadastrar reconhecimento facial:', error);
    res.status(500).json({ error: 'Erro ao cadastrar reconhecimento facial' });
  }
});

// Buscar cadastro facial de uma pessoa
reconhecimentoFacialRouter.get('/:pessoaId', async (req, res) => {
  try {
    const { pessoaId } = req.params;

    const cadastro = await prisma.reconhecimento_facial.findUnique({
      where: { pessoaId }
    });

    if (!cadastro) {
      return res.status(404).json({ error: 'Cadastro não encontrado' });
    }

    res.json(cadastro);
  } catch (error) {
    console.error('Erro ao buscar cadastro facial:', error);
    res.status(500).json({ error: 'Erro ao buscar cadastro facial' });
  }
});

// Listar todos os cadastros faciais ativos
reconhecimentoFacialRouter.get('/', async (req, res) => {
  try {
    const { tipoPessoa } = req.query;
    
    let where: any = { ativo: true };
    if (tipoPessoa) {
      where.tipoPessoa = tipoPessoa;
    }

    const cadastros = await prisma.reconhecimento_facial.findMany({
      where,
      select: {
        id: true,
        pessoaId: true,
        tipoPessoa: true,
        descritores: true,
        cadastradoEm: true,
        atualizadoEm: true,
        ativo: true
      }
    });

    res.json(cadastros);
  } catch (error) {
    console.error('Erro ao listar cadastros faciais:', error);
    res.status(500).json({ error: 'Erro ao listar cadastros faciais' });
  }
});

// Desativar cadastro facial
reconhecimentoFacialRouter.delete('/:pessoaId', async (req, res) => {
  try {
    const { pessoaId } = req.params;

    const cadastro = await prisma.reconhecimento_facial.update({
      where: { pessoaId },
      data: { ativo: false }
    });

    res.json({ message: 'Cadastro desativado com sucesso', cadastro });
  } catch (error) {
    console.error('Erro ao desativar cadastro facial:', error);
    res.status(500).json({ error: 'Erro ao desativar cadastro facial' });
  }
});

export default reconhecimentoFacialRouter;
