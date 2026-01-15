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
import healthRouter from './routes/health.routes';
import metricsRouter from './routes/metrics.routes';
import twoFactorRouter from './routes/two-factor.routes';
import { rbacRouter } from './routes/rbac.routes'; // FASE 4: RBAC Granular
import { dropoutPredictionRouter } from './routes/dropout-prediction.routes'; // FASE 3: Predição de Evasão
import communicationRouter from './routes/communication.routes'; // FASE 5: Central de Comunicação
import excelImportRouter from './routes/excel-import.routes'; // FASE 5: Importação de Excel
import { backupService } from './services/backup.service'; // Serviço de backup
import { maintenanceMiddleware } from './middlewares/maintenance'; // Middleware de manutenção
import { loggerMiddleware, log } from './lib/logger'; // Sistema de logs estruturados
import { metricsMiddleware } from './lib/metrics'; // Sistema de métricas
import { apiRateLimiter, securityMiddleware } from './middlewares/rate-limit'; // Rate limiting
import redis from './lib/redis';

// Inicializar workers e notificações apenas se Redis estiver disponível
let redisAvailable = false;
let workersInitialized = false;

// Verificar disponibilidade do Redis
redis.ping().then(() => {
  redisAvailable = true;
  log.info({ component: 'redis' }, 'Redis disponível e conectado');
  
  // Inicializar serviços dependentes do Redis
  try {
    require('./services/notification.service');
    log.info({ component: 'notifications' }, 'Notification Service: Listeners inicializados');
    
    require('./workers/notification.worker');
    log.info({ component: 'workers' }, 'Notification Worker iniciado');
    
    require('./workers/report.worker');
    log.info({ component: 'workers' }, 'Report Worker iniciado');
    
    // FASE 5: Inicializar worker de mensagens agendadas
    const { scheduleRecurringJob } = require('./workers/scheduled-messages.worker');
    scheduleRecurringJob();
    log.info({ component: 'workers' }, 'Scheduled Messages Worker iniciado');
    
    workersInitialized = true;
    log.info({ component: 'workers' }, 'Todos os workers inicializados com sucesso');
  } catch (error: any) {
    log.warn({ component: 'workers', err: error }, 'Erro ao inicializar workers');
  }
}).catch(() => {
  log.warn({ component: 'redis' }, 'Redis não disponível - Sistema operando em modo básico');
  log.info({ component: 'system' }, 'Funcionalidades de fila e notificações em tempo real desabilitadas');
});

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

// FASE 4: Middlewares de Observabilidade e Segurança
app.use(loggerMiddleware); // Logs estruturados com correlation ID
app.use(metricsMiddleware); // Coleta de métricas Prometheus
app.use(securityMiddleware); // Verificação de IPs bloqueados

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

// FASE 4: Rotas de Observabilidade (sem rate limit)
app.use('/api/health', healthRouter); // Health checks
app.use('/api', metricsRouter); // Métricas Prometheus

// FASE 4: Aplicar rate limiting nas rotas da API
app.use('/api', apiRateLimiter); // Rate limit global para a API

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
app.use('/api/two-factor', twoFactorRouter); // FASE 4: Autenticação 2FA
app.use('/api/rbac', rbacRouter); // FASE 4: RBAC Granular
app.use('/api/dropout-prediction', dropoutPredictionRouter); // FASE 3: Predição de Evasão
app.use('/api/communication', communicationRouter); // FASE 5: Central de Comunicação Unificada
app.use('/api/excel-import', excelImportRouter); // FASE 5: Importação de Excel
app.use('/api/queues', queuesRouter); // Dashboard de filas
app.use('/api/audit', auditRouter); // Logs de auditoria
app.use('/api/backup', backupRouter); // Backup automático
app.use('/api/maintenance', maintenanceRouter); // Modo de manutenção

// Start server
const port = typeof PORT === 'string' ? parseInt(PORT) : PORT;
app.listen(port, '0.0.0.0', async () => {
  log.info({ 
    component: 'server',
    port: PORT,
    env: process.env.NODE_ENV || 'development'
  }, `Servidor iniciado na porta ${PORT}`);
  
  log.info({ 
    component: 'server',
    ip: '192.168.5.19',
    port: PORT 
  }, 'Acesse de outros dispositivos: http://192.168.5.19:' + PORT);
  
  if (workersInitialized) {
    log.info({ component: 'workers' }, 'Bull Queue workers ativos');
    log.info({ component: 'workers', queue: 'notifications', concurrency: 10 }, 'Notifications Worker: 10 jobs concorrentes');
    log.info({ component: 'workers', queue: 'reports', concurrency: 3 }, 'Reports Worker: 3 jobs concorrentes');
  }
  
  // Inicializar serviço de backup automático
  try {
    await backupService.initialize();
    log.info({ component: 'backup' }, 'Serviço de backup inicializado');
  } catch (error: any) {
    log.error({ component: 'backup', err: error }, 'Erro ao inicializar serviço de backup');
  }

  // FASE 4: Informações sobre novas funcionalidades
  log.info({ component: 'fase4' }, '🔐 Segurança: Rate limiting ativo');
  log.info({ component: 'fase4' }, '📊 Observabilidade: Logs estruturados (Pino)');
  log.info({ component: 'fase4' }, '📈 Métricas: Prometheus em /api/metrics');
  log.info({ component: 'fase4' }, '🏥 Health checks: /api/health, /api/health/live, /api/health/ready');
  log.info({ component: 'fase4' }, '✅ Sistema pronto para produção');
});
