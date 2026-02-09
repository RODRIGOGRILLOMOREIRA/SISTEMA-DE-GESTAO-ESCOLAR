# 📚 Guia Completo de Uso do Redis no Sistema

> **Sistema de Gestão Escolar** - Documentação de Features Redis

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Sistema de Cache](#sistema-de-cache)
3. [Rate Limiting](#rate-limiting)
4. [Sistema de Filas](#sistema-de-filas)
5. [Segurança e Blacklist](#segurança-e-blacklist)
6. [Monitoramento](#monitoramento)
7. [Boas Práticas](#boas-práticas)

---

## 🎯 Visão Geral

O sistema utiliza Redis para:

- **✅ Cache de Dados** - Reduz carga no banco de dados
- **✅ Rate Limiting** - Proteção contra abuso de API
- **✅ Filas de Processos** - Processamento assíncrono
- **✅ Blacklist de IPs** - Segurança avançada
- **✅ Sessões** - Gerenciamento de usuários

### 🔄 Status Atual

```bash
✅ Conectado ao Upstash Cloud como fallback
```

O sistema está rodando com **Upstash Cloud** (fallback automático).

---

## 📦 Sistema de Cache

### 🎨 Como Funciona

O cache é gerenciado pelo `CacheService` e funciona automaticamente:

```typescript
// Arquivo: backend/src/services/cache.service.ts
```

### 💡 Padrões de Uso

#### 1️⃣ **Cache Simples (SET/GET)**

```typescript
import cacheService from '../services/cache.service';

// Armazenar no cache (5 minutos padrão)
await cacheService.set('usuario:123', userData, 300);

// Buscar do cache
const user = await cacheService.get('usuario:123');
```

#### 2️⃣ **Cache com Fallback (GetOrSet)**

```typescript
// Busca do cache OU executa função se não existir
const turmas = await cacheService.getOrSet(
  'turmas:list:page1',
  async () => {
    // Busca do banco de dados
    return await prisma.turma.findMany();
  },
  1800 // 30 minutos
);
```

#### 3️⃣ **Invalidar Cache**

```typescript
// Invalidar cache específico
await cacheService.delete('turma:123');

// Invalidar múltiplos caches por padrão
await cacheService.invalidate('turmas:*');
```

### 📊 Exemplos Reais do Sistema

**Controller de Turmas** ([turmas.controller.ts](backend/src/controllers/turmas.controller.ts)):

```typescript
// GET /api/turmas - Lista com cache
const cacheKey = `turmas:list:${page}:${limit}:${sort}`;

const cached = await cacheService.getOrSet(
  cacheKey,
  async () => {
    // Busca complexa do banco
    return await prisma.turma.findMany({...});
  },
  1800 // 30 min
);

// POST/PUT/DELETE - Invalida cache
await cacheService.invalidate('turmas:*');
```

### ⚙️ TTL (Time To Live) Recomendados

| Tipo de Dado | TTL | Razão |
|--------------|-----|-------|
| Listagens gerais | 30 min | Dados que mudam pouco |
| Detalhes de entidade | 15 min | Podem ser atualizados |
| Estatísticas | 1 hora | Cálculos pesados |
| Configurações | 24 horas | Raramente mudam |
| Dados em tempo real | 1-5 min | Precisam ser frescos |

---

## 🛡️ Rate Limiting

### 🎯 O que é?

Rate Limiting protege a API contra:
- ❌ Ataques DDoS
- ❌ Força bruta em login
- ❌ Abuso de recursos
- ❌ Scraping excessivo

### 📝 Limitadores Configurados

#### 1️⃣ **Auth Rate Limiter** (Login/Registro)

```typescript
// 100 tentativas por minuto por IP
export const authRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Muitas tentativas de login...'
});
```

**Uso:**
```typescript
// Em auth.routes.ts
router.post('/login', authRateLimiter, authController.login);
```

#### 2️⃣ **API Rate Limiter** (Geral)

```typescript
// 100 requisições por minuto
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100
});
```

#### 3️⃣ **Export Rate Limiter** (Exportações)

```typescript
// 10 exportações a cada 5 minutos
export const exportRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10
});
```

#### 4️⃣ **Upload Rate Limiter**

```typescript
// 20 uploads a cada 10 minutos
export const uploadRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20
});
```

#### 5️⃣ **Notification Rate Limiter**

```typescript
// 5 envios em massa a cada 30 minutos
export const notificationRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5
});
```

### 🔧 Criar Limitador Customizado

```typescript
import { createRateLimiter } from '../middlewares/rate-limit';

const customLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // 50 requisições
  message: 'Limite customizado excedido',
  keyPrefix: 'custom-endpoint'
});

router.get('/minha-rota', customLimiter, controller);
```

### 📊 Monitorar Rate Limits

Quando um limite é excedido:

```bash
⚠️ Rate limit excedido: POST /api/auth/login
{
  "error": "Too Many Requests",
  "message": "Você excedeu o limite...",
  "retryAfter": "60"
}
```

---

## 🔒 Segurança e Blacklist

### 🛡️ Sistema de Blacklist Automático

O sistema bloqueia automaticamente IPs suspeitos:

```typescript
// Após 10 falhas de autenticação
if (failures >= 10) {
  await redis.setex(`blacklist:${ip}`, 3600, 'auto-blocked');
  // IP bloqueado por 1 hora
}
```

### 📝 Funções de Segurança

#### Registrar Falha de Autenticação

```typescript
import { registerAuthFailure } from '../middlewares/rate-limit';

// No controller de login
if (senhaIncorreta) {
  await registerAuthFailure(req.ip);
  return res.status(401).json({ error: 'Senha incorreta' });
}
```

#### Limpar Falhas (Login Bem-Sucedido)

```typescript
import { clearAuthFailures } from '../middlewares/rate-limit';

// Após login correto
await clearAuthFailures(req.ip);
```

#### Adicionar à Whitelist

```typescript
import { addToWhitelist } from '../middlewares/rate-limit';

// Exempto de rate limiting
await addToWhitelist('192.168.1.100', 'IP da escola', 86400);
```

#### Remover da Blacklist

```typescript
import { removeFromBlacklist } from '../middlewares/rate-limit';

// Desbloquear IP manualmente
await removeFromBlacklist('192.168.1.50');
```

### 🔍 Verificar Status de IP

```typescript
// Verificar se IP está bloqueado
const isBlocked = await redis.get(`blacklist:${ip}`);

// Verificar falhas de autenticação
const failures = await redis.get(`auth_failures:${ip}`);
```

---

## ⚡ Sistema de Filas

### 🎯 Para que serve?

Processos que levam tempo são executados em background:

- 📧 Envio de emails em massa
- 📱 Notificações WhatsApp/Telegram
- 📊 Geração de relatórios pesados
- 🔄 Importação de dados Excel
- 📸 Processamento de imagens

### 📝 Arquivo de Filas

```typescript
// backend/src/queues/index.ts
```

### 💡 Como Usar (Exemplo Básico)

```typescript
import Queue from 'bull';
import redis from '../lib/redis';

// Criar fila
const emailQueue = new Queue('emails', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }
});

// Adicionar job à fila
await emailQueue.add({
  to: 'aluno@escola.com',
  subject: 'Boletim Disponível',
  body: 'Seu boletim está pronto!'
});

// Processar jobs
emailQueue.process(async (job) => {
  const { to, subject, body } = job.data;
  await sendEmail(to, subject, body);
});
```

### 📊 Monitorar Filas

```typescript
// Obter estatísticas
const waiting = await emailQueue.getWaitingCount();
const active = await emailQueue.getActiveCount();
const completed = await emailQueue.getCompletedCount();
const failed = await emailQueue.getFailedCount();

console.log({
  waiting,
  active,
  completed,
  failed
});
```

---

## 📊 Monitoramento

### 🔍 Verificar Status do Redis

```typescript
import redis, { getRedisInfo } from '../lib/redis';

// Informações da conexão
const info = getRedisInfo();
console.log(info);
// {
//   source: 'upstash',
//   isConnected: true,
//   host: 'Upstash Cloud'
// }
```

### 📈 Estatísticas do Cache

```typescript
import cacheService from '../services/cache.service';

const stats = await cacheService.getStats();
console.log(stats);
// {
//   available: true,
//   dbSize: 1234,
//   info: { ... }
// }
```

### 🔎 Comandos Úteis do Redis

```typescript
// Listar todas as chaves
const keys = await redis.keys('*');

// Contar chaves
const count = await redis.dbsize();

// Informações do servidor
const info = await redis.info();

// Monitorar comandos em tempo real
await redis.monitor((time, args) => {
  console.log(time, args);
});
```

---

## ✅ Boas Práticas

### 1️⃣ **Nomenclatura de Chaves**

Use padrões consistentes:

```typescript
// ✅ BOM
'usuario:123'
'turma:456:alunos'
'cache:turmas:list:page1'

// ❌ RUIM
'user123'
'turma456alunos'
'cacheturmaslistpage1'
```

### 2️⃣ **Sempre Defina TTL**

Evite chaves que nunca expiram:

```typescript
// ✅ BOM
await redis.setex('key', 3600, value);

// ❌ RUIM
await redis.set('key', value); // Nunca expira!
```

### 3️⃣ **Invalidação Inteligente**

Invalide cache quando dados mudam:

```typescript
// Ao atualizar turma
async updateTurma(id: string, data: any) {
  const turma = await prisma.turma.update({...});
  
  // Invalidar caches relacionados
  await cacheService.delete(`turma:${id}`);
  await cacheService.invalidate('turmas:*');
  
  return turma;
}
```

### 4️⃣ **Fallback Gracioso**

Sempre tenha fallback se Redis falhar:

```typescript
try {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
} catch (error) {
  // Se Redis falhar, buscar do banco
  console.warn('Redis indisponível, usando fallback');
}

return await prisma.findMany();
```

### 5️⃣ **Não Cache Tudo**

Evite cache para:
- ❌ Dados que mudam constantemente
- ❌ Dados sensíveis (senhas, tokens)
- ❌ Dados muito grandes (> 1MB)
- ❌ Queries simples e rápidas

Cache apenas:
- ✅ Listagens complexas
- ✅ Cálculos pesados
- ✅ Agregações custosas
- ✅ Dados acessados frequentemente

### 6️⃣ **Monitoramento Constante**

```typescript
// Endpoint de health check
router.get('/health', async (req, res) => {
  const redisInfo = getRedisInfo();
  const cacheStats = await cacheService.getStats();
  
  res.json({
    redis: redisInfo,
    cache: cacheStats
  });
});
```

---

## 🎯 Comandos Rápidos

### Verificar Conexão

```bash
# No terminal
npm run dev
# Veja: ✅ Conectado ao Upstash Cloud como fallback
```

### Limpar Todo o Cache

```typescript
await cacheService.flush();
```

### Ver Todas as Chaves

```typescript
const keys = await redis.keys('*');
console.log(keys);
```

### Tempo de Vida de uma Chave

```typescript
const ttl = await redis.ttl('turma:123');
console.log(`Expira em ${ttl} segundos`);
```

---

## 📚 Referências

- [Redis Documentation](https://redis.io/docs/)
- [ioredis (Cliente Node.js)](https://github.com/luin/ioredis)
- [Upstash Documentation](https://docs.upstash.com/)
- [Bull (Filas)](https://github.com/OptimalBits/bull)
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)

---

## 🆘 Suporte

Problemas com Redis?

1. Verifique [REDIS_SETUP.md](./REDIS_SETUP.md) para configuração
2. Veja [REDIS_QUICKSTART.md](./REDIS_QUICKSTART.md) para início rápido
3. Consulte os logs do sistema

---

**✅ Sistema configurado e funcionando com Upstash Cloud!**
