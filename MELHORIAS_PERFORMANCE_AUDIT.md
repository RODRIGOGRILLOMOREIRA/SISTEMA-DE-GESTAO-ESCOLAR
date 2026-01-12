# Melhorias de Performance - Sistema de Auditoria

## Problema Identificado
O sistema estava travando durante a exportação de logs de auditoria para Excel devido ao volume de dados.

## Soluções Implementadas

### 1. Limitação de Registros
- **Limite**: 10.000 registros por exportação
- **Motivo**: Evita sobrecarga de memória e travamentos
- **Impacto**: Processamento mais rápido e estável

### 2. Otimização da Query
```typescript
const logs = await prisma.auditLog.findMany({
  where,
  orderBy: { createdAt: 'desc' },
  take: 10000, // Limite de segurança
  include: {
    user: {
      select: {
        nome: true,
        email: true,
      }
    }
  }
})
```

### 3. Streaming de Resposta
- Headers configurados para download progressivo
- Buffer enviado diretamente para evitar acúmulo em memória

### 4. Ajuste Automático de Colunas
- Larguras predefinidas para melhor visualização
- Formatação consistente dos dados

## Endpoints Disponíveis

### GET /api/audit
Lista logs de auditoria com paginação
```
Query params:
- userId: string
- action: string
- resource: string
- startDate: ISO date
- endDate: ISO date
- page: number
- limit: number
```

### GET /api/audit/stats
Estatísticas de auditoria
```
Query params:
- startDate: ISO date
- endDate: ISO date
```

### GET /api/audit/export/excel
Exporta logs para Excel
```
Query params:
- userId: string
- action: string
- resource: string
- startDate: ISO date
- endDate: ISO date

Retorna: Arquivo .xlsx para download
```

## Recomendações para Grandes Volumes

### 1. Use Filtros de Data
```
GET /api/audit/export/excel?startDate=2026-01-01&endDate=2026-01-31
```

### 2. Filtre por Usuário ou Recurso
```
GET /api/audit/export/excel?userId=123&resource=aluno
```

### 3. Exportações Periódicas
- Exporte mensalmente em vez de todo o histórico
- Mantenha backups dos arquivos exportados

### 4. Monitoramento
- Verifique o uso de memória durante exportações
- Ajuste o limite de 10.000 registros se necessário

## Prevenção de Travamentos

### Configurações Recomendadas

1. **Node.js Memory Limit**
```json
// package.json
"scripts": {
  "dev": "node --max-old-space-size=4096 -r tsx/register src/server.ts",
  "start": "node --max-old-space-size=4096 dist/server.js"
}
```

2. **Timeout de Requisições**
```typescript
// server.ts
app.use((req, res, next) => {
  req.setTimeout(300000) // 5 minutos
  res.setTimeout(300000)
  next()
})
```

3. **Compressão de Respostas**
```typescript
import compression from 'compression'
app.use(compression())
```

## Exemplo de Uso

### Frontend (React/TypeScript)
```typescript
const exportarAuditoria = async () => {
  try {
    const params = new URLSearchParams({
      startDate: '2026-01-01',
      endDate: '2026-01-31'
    })
    
    const response = await fetch(`/api/audit/export/excel?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro ao exportar:', error)
  }
}
```

## Monitoramento de Performance

### Métricas a Observar
1. Tempo de resposta das exportações
2. Uso de memória do processo Node.js
3. Número de registros processados
4. Taxa de erros/falhas

### Logs Importantes
```typescript
console.log(`Exportando ${logs.length} registros de auditoria`)
console.log(`Tamanho do arquivo: ${buffer.length} bytes`)
```

## Próximos Passos

1. **Exportação em Background** (Worker)
   - Para volumes muito grandes (>50k registros)
   - Notificação por email quando concluído
   - Armazenamento temporário do arquivo

2. **Compressão ZIP**
   - Para múltiplos períodos
   - Redução do tamanho do arquivo

3. **Cache de Exportações**
   - Armazenar exportações recentes
   - Evitar reprocessamento

4. **Dashboard de Auditoria**
   - Visualizações gráficas
   - Filtros avançados
   - Exportação seletiva
