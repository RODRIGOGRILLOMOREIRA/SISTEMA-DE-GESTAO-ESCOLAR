import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac.middleware';
import { ExcelParser } from '../utils/excel-parser';
import { ExcelImportService } from '../services/excel-import.service';

const router = Router();

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo inválido. Use .xls ou .xlsx'));
    }
  }
});

const parser = new ExcelParser();
const importService = new ExcelImportService();

/**
 * POST /api/excel-import/analyze
 * Analisa o arquivo Excel e retorna estrutura detectada pela IA
 */
router.post(
  '/analyze',
  authMiddleware,
  requireRole(['ADMIN', 'COORDENADOR', 'PROFESSOR', 'DIRETOR', 'SECRETARIO']),
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const analysis = parser.parse(req.file.buffer);
      
      // Salva o buffer em memória temporária para uso posterior
      // (Em produção, considere usar Redis ou storage temporário)
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      (global as any).__tempFiles = (global as any).__tempFiles || {};
      (global as any).__tempFiles[fileId] = req.file.buffer;

      // Limpa arquivos antigos (mais de 1 hora)
      setTimeout(() => {
        delete (global as any).__tempFiles[fileId];
      }, 60 * 60 * 1000);

      res.json({
        fileId,
        analysis
      });
    } catch (error) {
      console.error('Erro ao analisar Excel:', error);
      res.status(500).json({
        error: 'Erro ao analisar arquivo',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
);

/**
 * POST /api/excel-import/preview
 * Gera preview da importação com validações
 */
router.post(
  '/preview',
  authMiddleware,
  requireRole(['ADMIN', 'COORDENADOR', 'PROFESSOR', 'DIRETOR', 'SECRETARIO']),
  async (req: Request, res: Response) => {
    try {
      const { fileId, sheetIndex, columnMapping } = req.body;

      if (!fileId || sheetIndex === undefined || !columnMapping) {
        return res.status(400).json({
          error: 'Parâmetros inválidos',
          required: ['fileId', 'sheetIndex', 'columnMapping']
        });
      }

      // Recupera o buffer do arquivo
      const buffer = (global as any).__tempFiles?.[fileId];
      if (!buffer) {
        return res.status(404).json({
          error: 'Arquivo não encontrado ou expirado',
          hint: 'Faça upload novamente'
        });
      }

      const preview = await importService.preview(buffer, sheetIndex, columnMapping);

      res.json(preview);
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      res.status(500).json({
        error: 'Erro ao gerar preview',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
);

/**
 * POST /api/excel-import/execute
 * Executa a importação dos dados
 */
router.post(
  '/execute',
  authMiddleware,
  requireRole(['ADMIN', 'COORDENADOR', 'PROFESSOR', 'DIRETOR', 'SECRETARIO']),
  async (req: Request, res: Response) => {
    try {
      const { fileId, sheetIndex, columnMapping, options } = req.body;

      if (!fileId || sheetIndex === undefined || !columnMapping || !options) {
        return res.status(400).json({
          error: 'Parâmetros inválidos',
          required: ['fileId', 'sheetIndex', 'columnMapping', 'options']
        });
      }

      // Valida opções obrigatórias
      if (!options.anoLetivo) {
        return res.status(400).json({
          error: 'Ano letivo é obrigatório',
          field: 'options.anoLetivo'
        });
      }

      // Recupera o buffer do arquivo
      const buffer = (global as any).__tempFiles?.[fileId];
      if (!buffer) {
        return res.status(404).json({
          error: 'Arquivo não encontrado ou expirado',
          hint: 'Faça upload novamente'
        });
      }

      const result = await importService.import(buffer, sheetIndex, columnMapping, options);

      // Limpa o arquivo temporário
      delete (global as any).__tempFiles[fileId];

      res.json(result);
    } catch (error) {
      console.error('Erro ao executar importação:', error);
      res.status(500).json({
        error: 'Erro ao executar importação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
);

/**
 * GET /api/excel-import/history
 * Retorna histórico de importações
 */
router.get(
  '/history',
  authMiddleware,
  requireRole(['ADMIN', 'COORDENADOR', 'PROFESSOR', 'DIRETOR', 'SECRETARIO']),
  async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await importService.getImportHistory(limit);

      res.json(history);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({
        error: 'Erro ao buscar histórico',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
);

/**
 * GET /api/excel-import/template
 * Baixa template de Excel para importação
 */
router.get(
  '/template',
  authMiddleware,
  requireRole(['ADMIN', 'COORDENADOR', 'PROFESSOR', 'DIRETOR', 'SECRETARIO']),
  async (req: Request, res: Response) => {
    try {
      // TODO: Gerar template Excel com colunas padrão
      res.status(501).json({
        message: 'Template em desenvolvimento',
        hint: 'Use suas planilhas existentes e ajuste o mapeamento'
      });
    } catch (error) {
      console.error('Erro ao gerar template:', error);
      res.status(500).json({
        error: 'Erro ao gerar template',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
);

export default router;
