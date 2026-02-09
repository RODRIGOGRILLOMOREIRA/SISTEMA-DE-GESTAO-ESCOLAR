/**
 * ========================================
 * SISTEMA DE GESTÃO ESCOLAR (SGE)
 * Backend API Server
 * ========================================
 * 
 * @copyright Copyright (c) 2026 Rodrigo Grillo Moreira
 * @license PROPRIETARY - Todos os direitos reservados
 * 
 * CONFIDENCIAL E PROPRIETÁRIO
 * 
 * Este código é propriedade exclusiva e contém informações
 * confidenciais. Uso não autorizado, cópia, modificação ou
 * distribuição são estritamente proibidos e sujeitos a
 * ações legais.
 * 
 * Licenciado para: [Cliente/Instituição]
 * 
 * @author Rodrigo Grillo Moreira
 * @version 1.0.0
 * @since 2026-01-10
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes';
import { alunosRouter } from './routes/alunos.routes';
import { professoresRouter } from './routes/professores.routes';
import { turmasRouter } from './routes/turmas.routes';
import { disciplinasRouter } from './routes/disciplinas.routes';
import { disciplinaTurmaRouter } from './routes/disciplinaTurma.routes';
import { notasRouter } from './routes/notas.routes';
import { frequenciasRouter } from './routes/frequencias.routes';
import { configuracoesRouter } from './routes/configuracoes.routes';
import { equipeDiretivaRouter } from './routes/equipeDiretiva.routes';
import { funcionariosRouter } from './routes/funcionarios.routes';
import { calendarioRouter } from './routes/calendario.routes';
import { gradeHorariaRouter } from './routes/grade-horaria.routes';
import { frequenciaRouter } from './routes/frequencia.routes';
import { pontoRouter } from './routes/ponto.routes';
import reconhecimentoFacialRouter from './routes/reconhecimento-facial.routes';
import { notificacoesRouter } from './routes/notificacoes.routes';
import { queuesRouter } from './routes/queues.routes';
import auditRouter from './routes/audit.routes';
import backupRouter from './routes/backup.routes';
import maintenanceRouter from './routes/maintenance.routes';
import './services/notification.service'; // Inicializar listeners de notificações
import { backupService } from './services/backup.service'; // Serviço de backup
import { maintenanceMiddleware } from './middlewares/maintenance'; // Middleware de manutenção

// Inicializar workers de filas em background
import './workers/notification.worker';
import './workers/report.worker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Permite qualquer origem da rede local ou localhost
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
    ];
    
    if (!origin || allowedPatterns.some(pattern => pattern.test(origin))) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todas as origens em desenvolvimento
    }
  },
  credentials: true
}));
// Desabilitar cache para garantir sincronização entre dispositivos
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
// Aumentar limite para aceitar imagens em base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware de modo de manutenção (aplicado globalmente)
app.use(maintenanceMiddleware);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API Sistema de Gestão Escolar' });
});

app.use('/api/auth', authRouter);
app.use('/api/alunos', alunosRouter);
app.use('/api/professores', professoresRouter);
app.use('/api/turmas', turmasRouter);
app.use('/api/disciplinas', disciplinasRouter);
app.use('/api/disciplinas-turmas', disciplinaTurmaRouter);
app.use('/api/notas', notasRouter);
app.use('/api/frequencias', frequenciasRouter);
app.use('/api/configuracoes', configuracoesRouter);
app.use('/api/equipe-diretiva', equipeDiretivaRouter);
app.use('/api/funcionarios', funcionariosRouter);
app.use('/api/calendario', calendarioRouter);
app.use('/api/grade-horaria', gradeHorariaRouter);
app.use('/api/registro-frequencia', frequenciaRouter);
app.use('/api/ponto', pontoRouter);
app.use('/api/reconhecimento-facial', reconhecimentoFacialRouter);
app.use('/api/notificacoes', notificacoesRouter);
app.use('/api/queues', queuesRouter); // Dashboard de filas
app.use('/api/audit', auditRouter); // Logs de auditoria
app.use('/api/backup', backupRouter); // Backup automático
app.use('/api/maintenance', maintenanceRouter); // Modo de manutenção

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Acesse de outros dispositivos: http://192.168.5.19:${PORT}`);
  console.log(`📊 Bull Queue workers ativos`);
  console.log(`   - Notifications Worker: 10 jobs concorrentes`);
  console.log(`   - Reports Worker: 3 jobs concorrentes`);
  
  // Inicializar serviço de backup automático
  try {
    await backupService.initialize();
  } catch (error) {
    console.error('❌ Erro ao inicializar serviço de backup:', error);
  }
});
