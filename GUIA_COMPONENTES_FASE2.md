# 📚 Guia de Componentes - Fase 2

## 🎯 Componentes Implementados

### 1. VirtualizedTable
**Arquivo:** `frontend/src/components/VirtualizedTable.tsx`

**Uso:**
```tsx
import { VirtualizedTable } from '../components/VirtualizedTable'

<VirtualizedTable
  data={alunos}
  columns={[
    { key: 'nome', label: 'Nome', render: (a) => a.nome },
    { key: 'matricula', label: 'Matrícula', render: (a) => a.numeroMatricula }
  ]}
  searchable={true}
  searchKeys={['nome', 'numeroMatricula']}
  onRowClick={(aluno) => console.log(aluno)}
/>
```

**Performance:** Renderiza apenas linhas visíveis (~30 de cada vez)

---

### 2. ThemeToggle
**Arquivo:** `frontend/src/components/ThemeToggle.tsx`

**Uso:**
```tsx
import { ThemeToggle } from '../components/ThemeToggle'

<ThemeToggle />
```

**Recursos:** Animações suaves, persistência em localStorage

---

### 3. Toaster (Notificações)
**Arquivo:** `frontend/src/components/Toaster.tsx`

**Uso:**
```tsx
import { toast } from 'react-hot-toast'

// Loading
const id = toast.loading('Salvando...')

// Success
toast.success('Salvo!', { id })

// Error
toast.error('Erro!', { id })

// Info
toast('Informação', { icon: '💡' })
```

---

### 4. TableSkeleton
**Arquivo:** `frontend/src/components/skeletons/TableSkeleton.tsx`

**Uso:**
```tsx
import { TableSkeleton } from '../components/skeletons'

{loading ? (
  <TableSkeleton rows={8} columns={4} />
) : (
  <VirtualizedTable data={data} columns={columns} />
)}
```

---

### 5. CardSkeleton
**Arquivo:** `frontend/src/components/skeletons/CardSkeleton.tsx`

**Uso:**
```tsx
import { CardSkeleton } from '../components/skeletons'

{loading ? (
  <CardSkeleton count={4} />
) : (
  <div className="stats-grid">
    {stats.map(stat => <StatCard {...stat} />)}
  </div>
)}
```

---

### 6. WebSocketContext
**Arquivo:** `frontend/src/contexts/WebSocketContext.tsx`

**Uso:**
```tsx
import { useWebSocket } from '../contexts/WebSocketContext'

const { connected, notificationCount, emit, on, off } = useWebSocket()

// Emitir evento
emit('custom-event', { data: 'value' })

// Escutar evento
useEffect(() => {
  const handler = (data) => console.log(data)
  on('custom-event', handler)
  return () => off('custom-event', handler)
}, [])
```

**Eventos automáticos:**
- `nova-nota`: Notificação quando nota é lançada
- `nova-frequencia`: Notificação de frequência registrada
- `aviso-geral`: Avisos gerais do sistema
- `lembrete-evento`: Lembretes de eventos

---

## 🚀 PWA (Progressive Web App)

### Configuração
Configurado em `vite.config.ts` com:
- Service Worker automático
- Cache de assets estáticos
- Cache de API (NetworkFirst)
- Manifest.json para instalação

### Instalação
O navegador exibirá prompt para instalar o app:
- Chrome: Botão "Instalar" na barra de endereços
- Edge: Ícone de aplicativo na barra
- Mobile: "Adicionar à tela inicial"

---

## 📊 Métricas

| Recurso | Status |
|---------|--------|
| Virtualização | ✅ 94% menos DOM |
| Dark Mode | ✅ Completo |
| PWA | ✅ Instalável |
| WebSockets | ✅ Real-time |
| Toast | ✅ Profissional |
| Skeleton | ✅ Loading UX |

---

## 🎨 Padrões de Código

### Loading State
```tsx
{loading ? <TableSkeleton /> : <DataTable />}
```

### Toast Notifications
```tsx
const id = toast.loading('Ação em andamento...')
try {
  await action()
  toast.success('Sucesso!', { id })
} catch (error) {
  toast.error('Erro!', { id })
}
```

### Dark Mode Classes
```tsx
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
```

---

**Última atualização:** 2026-01-11  
**Versão:** 2.0.0
