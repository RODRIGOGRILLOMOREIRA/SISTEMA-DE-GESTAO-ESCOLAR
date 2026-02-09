# 📊 Fase 3 - Funcionalidades Avançadas

## Status Atual: 0% Iniciado

**Data de Início:** 11 de Janeiro de 2026

## ⚠️ IMPORTANTE: Gestão de Memória

Para evitar falhas do VS Code e sobrecarga do Node.js:
- ✅ Implementação **incremental** (1 funcionalidade por vez)
- ✅ Bibliotecas **leves** (evitar pacotes pesados)
- ✅ Testes de memória após cada mudança
- ✅ Commits frequentes
- ✅ Monitoramento de uso de RAM

**Limite de Memória Node:** 2GB (padrão)  
**Configuração sugerida:** `NODE_OPTIONS=--max-old-space-size=4096`

---

## 🎯 Objetivos da Fase 3 (Escopo Reduzido)

### Prioridade Alta ⭐
1. **Dashboard com Gráficos** - Visualização de dados
2. **Sistema de Auditoria** - Logs de ações
3. **Exportação Excel** - Relatórios

### Prioridade Média 🔵
4. **Backup Automático** - Segurança dos dados
5. **Modo Manutenção** - Controle de acesso

### Prioridade Baixa (Futuro) 🟡
6. ~~Relatórios PDF~~ (biblioteca pesada - adiado)
7. ~~Chat interno~~ (complexo - adiado)
8. ~~WhatsApp Business~~ (requer API externa - adiado)

---

## 📦 Dependências Planejadas (Leves)

```json
{
  "recharts": "^2.x",           // ~200KB - Gráficos React
  "xlsx-js-style": "^1.x",      // ~150KB - Export Excel
  "node-cron": "^3.x"           // ~50KB - Agendamento
}
```

**Total estimado:** 3 pacotes principais (~400KB)

---

## 🚀 Roadmap Fase 3

```
Fase 3 Progress: [░░░░░░░░░░░░░░░░░░░░] 0%

⏳ Task 1: Dashboard com gráficos (0%)
⏳ Task 2: Sistema de Auditoria (0%)
⏳ Task 3: Exportação Excel (0%)
⏳ Task 4: Backup Automático (0%)
⏳ Task 5: Modo Manutenção (0%)
```

---

## 📋 Checklist Fase 3 - 0%

### 1. Dashboard com Gráficos (0%)
- [ ] Instalar recharts
- [ ] Componente LineChart (alunos/mês)
- [ ] Componente BarChart (frequência)
- [ ] Componente PieChart (status turmas)
- [ ] Integração na página Dashboard
- [ ] Dark mode nos gráficos

### 2. Sistema de Auditoria (0%)
- [ ] Modelo AuditLog no Prisma
- [ ] Migration para tabela audit_logs
- [ ] Middleware de auditoria
- [ ] Service de logs
- [ ] Página de visualização de logs
- [ ] Filtros (usuário, ação, data)

### 3. Exportação Excel (0%)
- [ ] Instalar xlsx-js-style
- [ ] Função exportToExcel()
- [ ] Botão de exportação em Alunos
- [ ] Botão de exportação em Turmas
- [ ] Botão de exportação em Notas
- [ ] Formatação com cores e estilos

### 4. Backup Automático (0%)
- [ ] Script de backup PostgreSQL
- [ ] Configuração node-cron
- [ ] Agendamento diário (3h da manhã)
- [ ] Armazenamento de backups (últimos 7 dias)
- [ ] Logs de backup

### 5. Modo Manutenção (0%)
- [ ] Flag de manutenção no backend
- [ ] Middleware de verificação
- [ ] Página de manutenção frontend
- [ ] API para ativar/desativar

---

## 📊 Detalhamento das Funcionalidades

### 1. Dashboard com Gráficos
**Biblioteca:** recharts (leve, 200KB)

**Gráficos planejados:**
1. **LineChart** - Evolução de alunos matriculados por mês
2. **BarChart** - Taxa de frequência por turma
3. **PieChart** - Distribuição de alunos por status
4. **AreaChart** - Média de notas por bimestre

**Arquivo:** `frontend/src/pages/Dashboard.tsx` (atualização)

**Design:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Card title="Evolução de Matrículas">
    <LineChart data={matriculas} />
  </Card>
  <Card title="Frequência por Turma">
    <BarChart data={frequencias} />
  </Card>
</div>
```

---

### 2. Sistema de Auditoria
**Objetivo:** Rastrear todas as ações importantes do sistema

**Schema Prisma:**
```prisma
model AuditLog {
  id          String   @id @default(uuid())
  userId      String
  action      String   // CREATE, UPDATE, DELETE
  resource    String   // ALUNO, TURMA, NOTA, etc
  resourceId  String
  details     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
  
  user        Usuario  @relation(fields: [userId], references: [id])
}
```

**Middleware:**
```ts
export function auditMiddleware(action: string, resource: string) {
  return async (req, res, next) => {
    // Captura ação antes
    const start = Date.now()
    
    res.on('finish', async () => {
      if (res.statusCode < 400) {
        await createAuditLog({
          userId: req.user.id,
          action,
          resource,
          resourceId: req.params.id,
          details: { body: req.body },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        })
      }
    })
    
    next()
  }
}
```

**Uso:**
```ts
router.post('/alunos', 
  auditMiddleware('CREATE', 'ALUNO'),
  createAluno
)
```

**Página de Logs:** `frontend/src/pages/AuditLogs.tsx`
- Tabela virtualizada de logs
- Filtros por usuário, ação, recurso, data
- Busca por detalhes

---

### 3. Exportação Excel
**Biblioteca:** xlsx-js-style (150KB, com estilos)

**Função utilitária:**
```ts
// frontend/src/utils/exportToExcel.ts
import * as XLSX from 'xlsx-js-style'

export function exportToExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // Aplicar estilos
  const range = XLSX.utils.decode_range(worksheet['!ref']!)
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: R }
      const cell_ref = XLSX.utils.encode_cell(cell_address)
      
      if (!worksheet[cell_ref]) continue
      
      // Header em azul
      if (R === 0) {
        worksheet[cell_ref].s = {
          fill: { fgColor: { rgb: "3B82F6" } },
          font: { color: { rgb: "FFFFFF" }, bold: true },
          alignment: { horizontal: "center" }
        }
      }
    }
  }
  
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados')
  XLSX.writeFile(workbook, `${filename}_${Date.now()}.xlsx`)
}
```

**Botões de exportação:**
```tsx
<Button
  onClick={() => exportToExcel(alunos, 'alunos')}
  icon={<Download />}
>
  Exportar Excel
</Button>
```

---

### 4. Backup Automático
**Objetivo:** Backup diário do PostgreSQL

**Script:** `backend/scripts/backup.ts`
```ts
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

export async function backupDatabase() {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `backup_${timestamp}.sql`
  const filepath = path.join(__dirname, '../../backups', filename)
  
  const command = `pg_dump -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -d ${process.env.DB_NAME} > ${filepath}`
  
  try {
    await execAsync(command)
    console.log(`✅ Backup criado: ${filename}`)
    
    // Limpar backups antigos (manter últimos 7 dias)
    await cleanOldBackups()
  } catch (error) {
    console.error('❌ Erro no backup:', error)
  }
}

async function cleanOldBackups() {
  // Implementar limpeza de arquivos com +7 dias
}
```

**Agendamento:** `backend/src/jobs/backup.job.ts`
```ts
import cron from 'node-cron'
import { backupDatabase } from '../scripts/backup'

// Todo dia às 3h da manhã
cron.schedule('0 3 * * *', async () => {
  console.log('🔄 Iniciando backup automático...')
  await backupDatabase()
})
```

---

### 5. Modo Manutenção
**Objetivo:** Bloquear acesso durante manutenções

**Backend:** Flag no Redis
```ts
// backend/src/middlewares/maintenance.ts
import { redisClient } from '../lib/redis'

export async function maintenanceMiddleware(req, res, next) {
  const isMaintenanceMode = await redisClient.get('maintenance_mode')
  
  if (isMaintenanceMode === 'true') {
    // Permitir apenas admins
    if (req.user?.role !== 'ADMIN') {
      return res.status(503).json({
        message: 'Sistema em manutenção. Tente novamente mais tarde.',
        estimatedTime: await redisClient.get('maintenance_eta')
      })
    }
  }
  
  next()
}
```

**API:**
```ts
// POST /api/system/maintenance
router.post('/maintenance', isAdmin, async (req, res) => {
  const { enabled, estimatedTime } = req.body
  
  await redisClient.set('maintenance_mode', enabled ? 'true' : 'false')
  if (estimatedTime) {
    await redisClient.set('maintenance_eta', estimatedTime)
  }
  
  res.json({ success: true })
})
```

**Frontend:** `frontend/src/pages/Maintenance.tsx`
```tsx
export function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <WrenchIcon className="mx-auto h-24 w-24 text-blue-500" />
        <h1 className="text-4xl font-bold mt-6">Sistema em Manutenção</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-4">
          Estamos atualizando o sistema. Voltamos em breve!
        </p>
        <p className="text-sm mt-2">
          Previsão: {estimatedTime}
        </p>
      </div>
    </div>
  )
}
```

---

## ⚡ Estratégia de Implementação (Evitar Falhas)

### Passo a Passo Seguro:
1. **Commit antes de começar** ✅
2. **Instalar 1 dependência por vez** ✅
3. **Testar após cada mudança** ✅
4. **Monitorar uso de memória** ✅
5. **Commits incrementais** ✅

### Comandos de Monitoramento:
```bash
# Verificar memória do Node
node --max-old-space-size=4096 server.ts

# Monitorar uso de RAM (Windows)
Get-Process node | Select-Object WorkingSet64

# Limpar cache npm (se travar)
npm cache clean --force
```

---

## 📊 Métricas Esperadas

| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| Páginas com gráficos | 0 | 1 | Dashboard interativo |
| Auditoria de ações | ❌ | ✅ | 100% rastreável |
| Exportação de dados | ❌ | ✅ | Excel formatado |
| Backups automáticos | ❌ | ✅ | Diário às 3h |
| Modo manutenção | ❌ | ✅ | Controlável |

---

## 🎯 Definição de Pronto (DoD)

Para considerar a Fase 3 completa:
- [ ] 5 funcionalidades implementadas e testadas
- [ ] Documentação atualizada
- [ ] Sem regressões nas Fases 1 e 2
- [ ] Performance mantida (60 FPS)
- [ ] Zero memory leaks
- [ ] Testes manuais em todas as novas features

---

## 🚨 Plano de Contingência

Se o VS Code/Node travar novamente:
1. **Salvar trabalho imediatamente** (Ctrl+S em todos os arquivos)
2. **Commit das mudanças** (git add . && git commit -m "WIP")
3. **Fechar VS Code**
4. **Limpar cache:** `npm cache clean --force`
5. **Aumentar memória Node:** Adicionar em `.env`:
   ```
   NODE_OPTIONS=--max-old-space-size=4096
   ```
6. **Reabrir VS Code**

---

## 📝 Próximos Passos Imediatos

1. ✅ Criar este documento (FASE3_STATUS.md)
2. ⏳ Instalar recharts (gradualmente)
3. ⏳ Criar gráfico simples de teste
4. ⏳ Verificar memória
5. ⏳ Prosseguir se estável

---

**Última atualização:** 11 de Janeiro de 2026  
**Autor:** GitHub Copilot + Rodrigo Grillo Moreira  
**Versão:** 3.0.0 - FASE 3 INICIADA (Implementação Cautelosa)
