#  Documentação Técnica Completa - Sistema de Gestão Escolar

**Última Atualização:** 14/01/2026 20:29  
**Versão:** 2.0.0  
**Autor:** Rodrigo Grillo Moreira

---

##  Índice Geral

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Arquitetura Detalhada](#2-arquitetura-detalhada)
3. [Backend - API REST](#3-backend---api-rest)
4. [Frontend - React SPA](#4-frontend---react-spa)
5. [Banco de Dados](#5-banco-de-dados)
6. [Segurança e Autenticação](#6-segurança-e-autenticação)
7. [Integrações Externas](#7-integrações-externas)
8. [Deploy e DevOps](#8-deploy-e-devops)
9. [Guia de Desenvolvimento](#9-guia-de-desenvolvimento)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Visão Geral do Sistema

### 1.1 Propósito

Sistema completo de gestão escolar desenvolvido para automatizar e otimizar processos administrativos e acadêmicos de instituições de ensino.

### 1.2 Características Principais

- **Full-Stack TypeScript**: Mesmo linguagem no frontend e backend
- **Event-Driven**: Arquitetura orientada a eventos
- **API-First**: Design focado em APIs REST
- **Real-Time**: WebSocket para comunicação instantânea
- **Offline-First**: PWA com cache inteligente
- **AI-Powered**: Integração com GPT-4 e ML

### 1.3 Casos de Uso Principais

1. **Gestão Acadêmica**: Notas, frequência, turmas, disciplinas
2. **Gestão Administrativa**: Professores, funcionários, ponto
3. **Comunicação**: Notificações multi-canal (WhatsApp, SMS, Email)
4. **Analytics**: Dashboards, relatórios, predições ML
5. **Segurança**: RBAC, 2FA, auditoria completa

---

## 2. Arquitetura Detalhada

### 2.1 Diagrama de Arquitetura

```

                      CLIENTE (Browser)                    
                 React 18 + TypeScript + PWA              
   
    Service Worker (Cache Offline)                      
    Context API: Auth, Theme, WebSocket, AnoLetivo      
    Rotas: 50+ páginas com React Router 6              
   

                           HTTP/REST + WebSocket

                     API GATEWAY                          
              Express + Middlewares                       
   
   Auth JWT  RBAC  Rate Limit  Audit  Routes      
   

                          

                 CAMADA DE SERVIÇOS                       
   
   Services    Event System  Background Jobs (Bull)  
   (18 total)  EventEmitter  Workers + Queues        
   

                          

  PostgreSQL       Redis         Integrações           
  (Prisma ORM)     (Cache)     WhatsApp | SMS | GPT-4 

```

### 2.2 Fluxo de Requisição Completo

1. **Cliente** envia requisição HTTP
2. **Express** recebe e passa por middlewares:
   - cors: Habilita CORS
   - json: Parse JSON body
   - loggerMiddleware: Log estruturado
   - uthMiddleware: Valida JWT
   - bacMiddleware: Verifica permissões
   - ateLimitMiddleware: Controla taxa
   - uditMiddleware: Registra ação
3. **Router** direciona para controller
4. **Controller** orquestra lógica de negócio
5. **Service** executa operações
6. **Prisma** consulta/modifica banco
7. **Event** emitido se necessário
8. **Queue** adiciona job background
9. **Response** retorna ao cliente

### 2.3 Event-Driven Architecture

```typescript
// Exemplo de fluxo de eventos
POST /api/notas  NotasController.create()
  
NotasService.criarNota()
  
prisma.notas.create()
  
eventsService.emit('nota:lancada', { alunoId, nota, ... })
  
NotificationService.onNotaLancada()
  
queueService.addJob('notification', { ... })
  
NotificationWorker processa em background
  
WhatsApp API envia mensagem ao responsável
```

---

## 3. Backend - API REST

### 3.1 Estrutura de Pastas

```
backend/
 prisma/
    schema.prisma          # 40+ modelos, 15+ enums
    migrations/            # Histórico de migrações
    seed.ts                # Dados iniciais (RBAC, config)
    seed-rbac.ts           # Seed específico RBAC
 src/
    server.ts              # Entry point da aplicação
    controllers/           # Orquestração de requisições
       alunos.controller.ts
       notas.controller.ts
       frequencias.controller.ts
       turmas.controller.ts
       audit.controller.ts
    services/              # Lógica de negócio
       audit.service.ts
       cache.service.ts
       communication.service.ts
       dropout-prediction.service.ts
       encryption.service.ts
       events.service.ts
       health.service.ts
       ia.service.ts
       notification.service.ts
       permission.service.ts
       rbac.service.ts
       reconhecimento-facial.service.ts
       role.service.ts
       sms.service.ts
       two-factor.service.ts
       whatsapp.service.ts
    routes/                # Definição de rotas
    middlewares/           # Interceptadores
       auth.middleware.ts
       rbac.middleware.ts
       audit.middleware.ts
       rate-limit.ts
       maintenance.ts
    lib/                   # Bibliotecas core
       logger.ts          # Pino logger
       redis.ts           # Redis client
       prisma.ts          # Prisma client
       metrics.ts         # Prometheus metrics
    queues/                # Bull queues
       notification.queue.ts
       report.queue.ts
    workers/               # Background processors
       notification.worker.ts
       report.worker.ts
       scheduled-messages.worker.ts
    utils/                 # Utilitários
        encryption.ts
        validators.ts
 uploads/                   # Arquivos enviados
 logs/                      # Logs da aplicação
 backups/                   # Backups do banco
 package.json
```

---

### 3.2 Controllers Principais


#### 3.2.1 Alunos Controller
- **Arquivo**: `src/controllers/alunos.controller.ts`
- **Rotas**: `/api/alunos/*`
- **Funções**: CRUD completo + busca + matrícula

#### 3.2.2 Notas Controller
- **Arquivo**: `src/controllers/notas.controller.ts`
- **Rotas**: `/api/notas/*`
- **Funções**: Lançamento, consulta, boletim, alertas

#### 3.2.3 Frequências Controller
- **Arquivo**: `src/controllers/frequencias.controller.ts`
- **Rotas**: `/api/frequencias/*`
- **Funções**: Registro, cálculo, relatórios

#### 3.2.4 Turmas Controller
- **Arquivo**: `src/controllers/turmas.controller.ts`
- **Rotas**: `/api/turmas/*`
- **Funções**: Gestão de turmas, alunos, disciplinas

#### 3.2.5 Audit Controller
- **Arquivo**: `src/controllers/audit.controller.ts`
- **Rotas**: `/api/audit/*`
- **Funções**: Consulta de logs de auditoria

### 3.3 Services Principais

#### Cache Service
```typescript
// Funções principais
- get(key): Busca valor no cache
- set(key, value, ttl): Armazena com TTL
- invalidate(pattern): Limpa cache por padrão
- remember(key, fn, ttl): Cache memoization
```

#### Notification Service
```typescript
// Eventos observados
- 'nota:lancada': Notifica lançamento de nota
- 'frequencia:falta': Notifica falta do aluno
- 'alerta:media-baixa': Alerta média abaixo de 7.0
- 'alerta:frequencia-baixa': Alerta frequência < 75%
```

#### Communication Service (FASE 5)
```typescript
// Funcionalidades
- sendMessage(): Envio multi-canal
- createTemplate(): Templates reutilizáveis
- scheduleMessage(): Agendamento
- getAnalytics(): Estatísticas de envio
```

#### Dropout Prediction Service (ML)
```typescript
// Machine Learning
- predictDropoutRisk(): Prediz risco de evasão
- getStudentFeatures(): Extrai features do aluno
- trainModel(): Treina modelo (offline)
```

---

## 4. Frontend - React SPA

### 4.1 Estrutura de Pastas

```
frontend/
 src/
    main.tsx               # Entry point
    App.tsx                # Rotas principais
    index.css              # Estilos globais
    pages/                 # 50+ páginas
       Dashboard.tsx
       Alunos.tsx
       Notas.tsx
       FrequenciaPage.tsx
       CommunicationCenter.tsx
       RBAC.tsx
       AuditLogs.tsx
       ...
    components/            # Componentes reutilizáveis
       Layout.tsx
       Topbar.tsx
       BottomNav.tsx
       BackButton.tsx
       Modal.tsx
       CalendarioEscolar.tsx
       GradeHoraria.tsx
       RegistroFrequencia.tsx
       ReconhecimentoFacialIA.tsx
       charts/
    contexts/              # Estado global
       AuthContext.tsx
       ThemeContext.tsx
       AnoLetivoContext.tsx
       WebSocketContext.tsx
    lib/                   # Configurações
       axios.ts
       face-api.ts
       websocket.ts
    utils/                 # Utilitários
       formatters.ts
       validators.ts
       constants.ts
    data/                  # Dados estáticos
 public/                    # Assets
 vite.config.ts             # Config Vite + PWA
```

### 4.2 Contexts

#### AuthContext
```typescript
// Gerencia autenticação
- user: Dados do usuário logado
- login(): Autentica usuário
- logout(): Faz logout
- checkAuth(): Verifica se está autenticado
- permissions: Permissões do usuário (RBAC)
```

#### ThemeContext
```typescript
// Gerencia tema dark/light
- theme: 'light' | 'dark'
- toggleTheme(): Alterna tema
```

#### WebSocketContext
```typescript
// Comunicação real-time
- socket: Instância do Socket.IO
- emit(): Envia mensagem
- on(): Escuta eventos
```

---

## 5. Banco de Dados

### 5.1 Modelos Principais

Total: **40+ modelos** no Prisma Schema

#### Acadêmicos
- `alunos`: 15 campos + relações
- `professores`: 12 campos + relações
- `turmas`: 8 campos + relações
- `disciplinas`: 7 campos + relações
- `notas`: 13 campos + relações
- `frequencias`: 8 campos + relações
- `matriculas`: 7 campos

#### Administrativos
- `funcionarios`: 10 campos
- `equipe_diretiva`: 10 campos
- `registro_ponto`: 13 campos
- `banco_horas`: 9 campos
- `configuracao_jornada`: 12 campos

#### Calendário
- `calendario_escolar`: 5 campos
- `eventos_calendario`: 8 campos
- `grade_horaria`: 5 campos
- `horarios_aula`: 11 campos

#### Comunicação (FASE 5)
- `MessageTemplate`: 11 campos
- `Message`: 15 campos
- `MessageSchedule`: 13 campos
- `CommunicationChannel`: 7 campos
- `MessageAnalytics`: 10 campos

#### Notificações
- `configuracao_notificacao`: 15 campos
- `log_notificacao`: 13 campos
- `webhook_message`: 9 campos

#### Segurança (FASE 4)
- `usuarios`: 13 campos
- `TwoFactorAuth`: 7 campos
- `ApiKey`: 10 campos
- `AuditLog`: 11 campos
- `Permission`: 6 campos
- `Role`: 7 campos
- `UserRole`: 5 campos

#### Machine Learning
- `StudentPrediction`: 9 campos
- `MLModel`: 9 campos
- `reconhecimento_facial`: 8 campos

### 5.2 Índices Estratégicos

```prisma
// Exemplos de índices para performance

model alunos {
  @@index([turmaId])
  @@index([statusMatricula])
  @@index([turmaId, statusMatricula])
  @@index([nome])
  @@index([createdAt])
}

model notas {
  @@index([alunoId])
  @@index([disciplinaId])
  @@index([trimestre])
  @@index([alunoId, disciplinaId, trimestre])
  @@unique([alunoId, disciplinaId, trimestre, anoLetivo])
}
```

---

## 6. Segurança e Autenticação

### 6.1 JWT (JSON Web Tokens)

```typescript
// Geração de token
const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
    tipo: user.tipo,
  },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);
```

### 6.2 2FA (Two-Factor Authentication)

- **Protocolo**: TOTP (Time-based One-Time Password)
- **Biblioteca**: `speakeasy`
- **QR Code**: `qrcode`
- **Códigos de Backup**: 10 códigos únicos

### 6.3 RBAC (Role-Based Access Control)

#### Hierarquia de Roles
```
SUPER_ADMIN (level 100)
   ADMIN (level 80)
      COORDENADOR (level 60)
         PROFESSOR (level 40)
         SECRETARIA (level 30)
      FINANCEIRO (level 30)
   USUARIO (level 10)
```

#### Permissões Granulares
```
Formato: resource.action
Exemplos:
- alunos.create
- alunos.read
- alunos.update
- alunos.delete
- notas.read
- notas.update
- turmas.*  (todas as ações)
```

### 6.4 Criptografia de Dados

```typescript
// Dados sensíveis criptografados
- CPF: AES-256-GCM
- Telefones: AES-256-GCM
- Senhas: bcrypt (hash irreversível)

// Arquivo de chaves
ENCRYPTION_KEY: 32 bytes hexadecimal
NEVER COMMIT TO GIT!
```

### 6.5 Rate Limiting

```typescript
// Configuração
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
  message: 'Muitas requisições, tente novamente mais tarde'
});
```

---


## 7. Integrações Externas

### 7.1 OpenAI GPT-4 (Chatbot IA)

```typescript
// Configuração
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Uso
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: pergunta }],
  temperature: 0.7,
});
```

### 7.2 WhatsApp Business API

- **Provider**: Meta (Facebook)
- **Endpoint**: `https://graph.facebook.com/v18.0`
- **Autenticação**: Bearer token
- **Funcionalidades**: Envio de mensagens, templates, mídia

### 7.3 SMS (Twilio)

```typescript
// Configuração
const twilioClient = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Envio
await twilioClient.messages.create({
  body: mensagem,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: telefone
});
```

---

## 8. Deploy e DevOps

### 8.1 Docker Compose

```yaml
services:
  db:
    image: postgres:15
    ports: ["5432:5432"]
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    
  backend:
    build: ./backend
    ports: ["3333:3333"]
    depends_on: [db, redis]
    
  frontend:
    build: ./frontend
    ports: ["5173:5173"]
```

### 8.2 Variáveis de Ambiente

#### Backend (.env)
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
ENCRYPTION_KEY="..."
REDIS_HOST="localhost"
REDIS_PORT="6379"
OPENAI_API_KEY="sk-..."
WHATSAPP_API_TOKEN="..."
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
```

#### Frontend (.env)
```bash
VITE_API_URL="http://localhost:3333"
VITE_WS_URL="ws://localhost:3333"
```

### 8.3 Scripts de Inicialização

#### Windows (PowerShell)
- `start-all.ps1`: Inicia backend + frontend + Redis
- `start-backend.ps1`: Apenas backend
- `start-frontend.ps1`: Apenas frontend
- `reiniciar-sistema.ps1`: Reinicia tudo

---

## 9. Guia de Desenvolvimento

### 9.1 Adicionando uma Nova Rota

```typescript
// 1. Criar o controller
// backend/src/controllers/exemplo.controller.ts
export const create = async (req: Request, res: Response) => {
  // lógica aqui
};

// 2. Criar a rota
// backend/src/routes/exemplo.routes.ts
import { Router } from 'express';
import * as controller from '../controllers/exemplo.controller';

const router = Router();
router.post('/', controller.create);

export { router as exemploRouter };

// 3. Registrar no server.ts
import { exemploRouter } from './routes/exemplo.routes';
app.use('/api/exemplo', authMiddleware, exemploRouter);
```

### 9.2 Adicionando uma Nova Página

```typescript
// 1. Criar a página
// frontend/src/pages/Exemplo.tsx
import React from 'react';

export default function Exemplo() {
  return <div>Minha nova página</div>;
}

// 2. Adicionar rota no App.tsx
import Exemplo from './pages/Exemplo';

<Route path="exemplo" element={<Exemplo />} />
```

### 9.3 Usando Cache

```typescript
import { cacheService } from '../services/cache.service';

// Armazenar
await cacheService.set('chave', dados, 3600); // 1 hora

// Buscar
const dados = await cacheService.get('chave');

// Remember (busca ou executa)
const resultado = await cacheService.remember(
  'chave',
  async () => {
    // função pesada
    return await buscarDoBanco();
  },
  3600
);
```

---

## 10. Troubleshooting

### 10.1 Problemas Comuns

#### "Cannot connect to database"
```bash
# Verifique se o PostgreSQL está rodando
# Windows
Get-Service postgresql*

# Verifique as credenciais no .env
DATABASE_URL="postgresql://user:password@localhost:5432/sge_db"
```

#### "Redis connection failed"
```bash
# O sistema funciona sem Redis, mas com funcionalidades limitadas
# Para instalar Redis no Windows:
.\install-redis.ps1

# Ou use Docker:
docker run -d -p 6379:6379 redis:7-alpine
```

#### "Port already in use"
```bash
# Backend (3333)
netstat -ano | findstr :3333
taskkill /PID <PID> /F

# Frontend (5173)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

#### "Prisma Client not generated"
```bash
cd backend
npx prisma generate
```

### 10.2 Logs

#### Backend Logs
- **Localização**: `backend/logs/`
- `combined.log`: Todos os logs
- `error.log`: Apenas erros

#### Visualizar Logs
```bash
# Tempo real
Get-Content backend/logs/combined.log -Wait -Tail 50
```

### 10.3 Health Checks

Verifique status dos serviços:

```bash
# Geral
curl http://localhost:3333/health

# Liveness (K8s)
curl http://localhost:3333/health/liveness

# Readiness (K8s)
curl http://localhost:3333/health/readiness
```

### 10.4 Métricas Prometheus

```bash
# Endpoint de métricas
curl http://localhost:3333/metrics
```

---

## 11. Changelog e Histórico

### Fase 1: Performance (Completa) 
- Cache Redis
- Paginação
- Índices otimizados
- Background jobs

### Fase 2: UX (Completa) 
- PWA
- Interface responsiva
- Skeleton screens
- Dark mode

### Fase 3: IA (80%) 
- Reconhecimento facial 
- Chatbot GPT-4 
- Notificações inteligentes 
- Predição de evasão 

### Fase 4: Segurança (Completa) 
- Logs estruturados 
- Auditoria avançada 
- Health checks 
- Métricas Prometheus 
- 2FA 
- RBAC 
- Criptografia 
- API Keys 

### Fase 5: Comunicação (70%) 
- Models Prisma 
- Service completo 
- Interface frontend 
- Templates 
- Agendamento 
- Analytics 

---

## 12. Glossário

- **PWA**: Progressive Web App
- **RBAC**: Role-Based Access Control
- **2FA**: Two-Factor Authentication
- **TOTP**: Time-based One-Time Password
- **JWT**: JSON Web Token
- **ORM**: Object-Relational Mapping
- **SPA**: Single Page Application
- **ML**: Machine Learning
- **IA**: Inteligência Artificial
- **LGPD**: Lei Geral de Proteção de Dados

---

## 13. Contatos e Suporte

**Desenvolvedor**: Rodrigo Grillo Moreira  
**Email**: contato@sge.com.br  
**GitHub**: @RODRIGOGRILLOMOREIRA  
**Repositório**: SISTEMA-DE-GESTAO-ESCOLAR

---

## 14. Licença

Copyright  2026 Rodrigo Grillo Moreira  
**PROPRIETARY LICENSE** - Todos os direitos reservados.

Este documento e o código-fonte associado são confidenciais e proprietários.  
Uso não autorizado é proibido e sujeito a ações legais.

---

**Fim da Documentação Técnica**

*Documento gerado automaticamente em 14/01/2026 20:32*
