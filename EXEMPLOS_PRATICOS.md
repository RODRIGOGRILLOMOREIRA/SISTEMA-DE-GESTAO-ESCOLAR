# Exemplos Práticos de Uso - Recursos de Escalabilidade

Este documento contém exemplos práticos de como usar os recursos de escalabilidade implementados.

## 📱 Responsividade

### Exemplo 1: Componente Responsivo com Hooks

```tsx
import React from 'react';
import { useIsMobile, useIsTablet, useIsDesktop } from '../config/responsive';

export default function MyComponent() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  return (
    <div className="container">
      {/* Renderização condicional por dispositivo */}
      {isMobile && (
        <div className="mobile-view">
          <h2>Visão Mobile</h2>
          <p>Layout simplificado para celular</p>
        </div>
      )}

      {isTablet && (
        <div className="tablet-view">
          <h2>Visão Tablet</h2>
          <p>Layout intermediário</p>
        </div>
      )}

      {isDesktop && (
        <div className="desktop-view">
          <h2>Visão Desktop</h2>
          <p>Layout completo com todos os recursos</p>
        </div>
      )}

      {/* Grid responsivo automático */}
      <div className={`grid ${isMobile ? 'grid-1' : isTablet ? 'grid-2' : 'grid-3'}`}>
        {/* Cards... */}
      </div>
    </div>
  );
}
```

### Exemplo 2: CSS Responsivo com Media Queries

```css
/* Mobile First */
.card {
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .card {
    width: calc(50% - 1rem);
    display: inline-block;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .card {
    width: calc(33.333% - 1rem);
  }
}
```

## 💾 Sistema de Cache

### Exemplo 3: Cache de Listagem de Alunos

```tsx
import { useCache } from '../utils/cache';
import { api } from '../lib/api';

export default function Alunos() {
  const { data: alunos, loading, refetch } = useCache({
    key: 'alunos-list',
    fetcher: async () => {
      const response = await api.get('/alunos');
      return response.data;
    },
    ttl: 5 * 60 * 1000, // Cache por 5 minutos
  });

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <button onClick={refetch}>Atualizar</button>
      {alunos?.map(aluno => (
        <div key={aluno.id}>{aluno.nome}</div>
      ))}
    </div>
  );
}
```

### Exemplo 4: Cache Manual

```typescript
import { cache } from '../utils/cache';

// Salvar no cache
const dados = await fetchDados();
cache.set('meus-dados', dados, 10 * 60 * 1000); // 10 minutos

// Recuperar do cache
const dadosCached = cache.get('meus-dados');
if (dadosCached) {
  console.log('Usando cache:', dadosCached);
} else {
  console.log('Cache expirado, buscar novamente');
}

// Limpar cache específico
cache.delete('meus-dados');

// Limpar todo o cache
cache.clear();
```

## 🎯 Feature Flags

### Exemplo 5: Habilitar/Desabilitar Módulos

```typescript
// Configurar features
// frontend/src/config/features.ts
export const defaultFeatures: FeatureFlags = {
  biblioteca: true,     // HABILITADO
  financeiro: false,    // DESABILITADO
  transporte: false,    // DESABILITADO
};
```

```tsx
// Usar em componentes
import { useFeature } from '../config/features';

export default function Menu() {
  const bibliotecaEnabled = useFeature('biblioteca');
  const financeiroEnabled = useFeature('financeiro');

  return (
    <nav>
      <Link to="/alunos">Alunos</Link>
      <Link to="/professores">Professores</Link>
      
      {bibliotecaEnabled && (
        <Link to="/biblioteca">Biblioteca</Link>
      )}
      
      {financeiroEnabled && (
        <Link to="/financeiro">Financeiro</Link>
      )}
    </nav>
  );
}
```

### Exemplo 6: HOC com Feature Flag

```tsx
import { withFeature } from '../config/features';

function BibliotecaModule() {
  return <div>Módulo Biblioteca</div>;
}

// Exportar apenas se feature estiver habilitada
export default withFeature(BibliotecaModule, 'biblioteca');
```

## ⚡ Performance

### Exemplo 7: Debounce em Campo de Busca

```tsx
import { debounce } from '../utils/performance';

export default function SearchInput() {
  const [search, setSearch] = useState('');

  // Buscar apenas após 500ms sem digitação
  const buscar = debounce(async (termo: string) => {
    const resultados = await api.get(`/alunos?search=${termo}`);
    console.log('Resultados:', resultados.data);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setSearch(valor);
    buscar(valor);
  };

  return (
    <input
      type="text"
      value={search}
      onChange={handleChange}
      placeholder="Buscar alunos..."
    />
  );
}
```

### Exemplo 8: Compressão de Imagem antes do Upload

```tsx
import { compressImage } from '../utils/performance';

export default function UploadFoto() {
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Comprimir imagem (max 1920x1080, qualidade 80%)
      const compressedBlob = await compressImage(file, 1920, 1080, 0.8);
      
      // Converter para base64 ou enviar diretamente
      const formData = new FormData();
      formData.append('foto', compressedBlob, file.name);
      
      await api.post('/alunos/foto', formData);
      
      console.log('Tamanho original:', file.size);
      console.log('Tamanho comprimido:', compressedBlob.size);
    } catch (error) {
      console.error('Erro ao comprimir:', error);
    }
  };

  return <input type="file" accept="image/*" onChange={handleFileSelect} />;
}
```

### Exemplo 9: Paginação

```tsx
import { useState } from 'react';
import { calculatePagination } from '../utils/performance';

export default function ListaPaginada() {
  const [page, setPage] = useState(1);
  const [dados, setDados] = useState([]);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const pagination = calculatePagination({ page, limit, total });

  const carregarDados = async () => {
    const response = await api.get(`/alunos?page=${page}&limit=${limit}`);
    setDados(response.data.data);
    setTotal(response.data.pagination.total);
  };

  return (
    <div>
      {dados.map(item => <div key={item.id}>{item.nome}</div>)}
      
      <div className="pagination">
        <button 
          disabled={!pagination.hasPrevPage}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </button>
        
        <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
        
        <button 
          disabled={!pagination.hasNextPage}
          onClick={() => setPage(page + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
```

## 🔧 Backend - Rate Limiting

### Exemplo 10: Aplicar Rate Limiting

```typescript
// backend/src/server.ts
import { generalLimiter, authLimiter, uploadLimiter } from './middlewares/scalability';

// Rate limiting geral (100 req/15min)
app.use('/api', generalLimiter.middleware());

// Rate limiting específico para autenticação (5 tentativas/15min)
app.use('/api/auth/login', authLimiter.middleware());
app.use('/api/auth/register', authLimiter.middleware());

// Rate limiting para uploads (10 uploads/hora)
app.use('/api/*/upload', uploadLimiter.middleware());
```

## 🗄️ Backend - Paginação

### Exemplo 11: Paginação no Backend

```typescript
import { paginate } from '../utils/performance';
import { prisma } from '../lib/prisma';

export class AlunosController {
  async listar(req: Request, res: Response) {
    const { page = 1, limit = 10, search = '' } = req.query;

    const result = await paginate(
      prisma.alunos,
      {
        page: Number(page),
        limit: Number(limit),
        orderBy: { nome: 'asc' },
      },
      search ? {
        OR: [
          { nome: { contains: search as string, mode: 'insensitive' } },
          { cpf: { contains: search as string } },
          { email: { contains: search as string } },
        ],
      } : {}
    );

    res.json(result);
    // Retorna: { data: [...], pagination: { total, page, limit, ... } }
  }
}
```

### Exemplo 12: Query Builder

```typescript
import { QueryBuilder } from '../utils/performance';
import { prisma } from '../lib/prisma';

export class AlunosController {
  async buscar(req: Request, res: Response) {
    const { nome, turmaId, statusMatricula } = req.query;

    const query = new QueryBuilder()
      .filter('nome', nome, 'contains')
      .filter('turmaId', turmaId, 'equals')
      .filter('statusMatricula', statusMatricula, 'equals')
      .relate('turmas', true)
      .sort('nome', 'asc')
      .select(['id', 'nome', 'email', 'cpf'])
      .build();

    const alunos = await prisma.alunos.findMany(query);
    
    res.json(alunos);
  }
}
```

### Exemplo 13: Batch Operations

```typescript
import { batchCreate } from '../utils/performance';
import { prisma } from '../lib/prisma';

export class ImportController {
  async importarAlunos(req: Request, res: Response) {
    const alunos = req.body; // Array com 1000 alunos

    // Criar em lotes de 100 por vez
    await batchCreate(prisma.alunos, alunos, 100);

    res.json({ message: 'Importação concluída' });
  }
}
```

## 🔄 Online/Offline Detection

### Exemplo 14: Detectar Status de Conexão

```tsx
import { useOnlineStatus } from '../utils/performance';

export default function App() {
  const isOnline = useOnlineStatus();

  return (
    <div>
      {!isOnline && (
        <div className="offline-banner">
          ⚠️ Você está offline. Algumas funcionalidades podem não estar disponíveis.
        </div>
      )}
      
      {/* Resto da aplicação */}
    </div>
  );
}
```

## 👁️ Page Visibility

### Exemplo 15: Pausar Operações quando Página está Oculta

```tsx
import { usePageVisibility } from '../utils/performance';
import { useEffect } from 'react';

export default function Dashboard() {
  const isVisible = usePageVisibility();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isVisible) {
      // Atualizar dados apenas quando página está visível
      interval = setInterval(() => {
        console.log('Atualizando dados...');
        // fetchDados();
      }, 30000); // A cada 30 segundos
    }

    return () => clearInterval(interval);
  }, [isVisible]);

  return <div>Dashboard</div>;
}
```

## 📊 Monitoramento

### Exemplo 16: Monitor de Performance no Backend

```typescript
import { DatabaseMonitor } from '../utils/performance';
import { prisma } from '../lib/prisma';

const monitor = new DatabaseMonitor(prisma);

// Endpoint para métricas
app.get('/api/metrics', (req, res) => {
  const metrics = monitor.getMetrics();
  res.json(metrics);
  // { queries: 1523, errors: 2, slowQueries: 15, avgQueryTime: 45 }
});

// Reset metrics
app.post('/api/metrics/reset', (req, res) => {
  monitor.reset();
  res.json({ message: 'Metrics reset' });
});
```

## 🎭 Retry com Backoff

### Exemplo 17: Retry Automático em Falhas

```typescript
import { retryWithBackoff } from '../utils/performance';

async function buscarDadosExternos() {
  // Tentar até 3 vezes com delay exponencial
  const dados = await retryWithBackoff(
    async () => {
      const response = await fetch('https://api.externa.com/dados');
      if (!response.ok) throw new Error('Falha na API');
      return response.json();
    },
    3,        // máximo de tentativas
    1000      // delay inicial (1s, 2s, 4s)
  );

  return dados;
}
```

## ✅ Resumo

Com estes exemplos, você pode:

- ✅ Criar interfaces totalmente responsivas
- ✅ Implementar cache eficiente
- ✅ Controlar features dinamicamente
- ✅ Otimizar performance
- ✅ Paginar grandes volumes de dados
- ✅ Monitorar aplicação
- ✅ Detectar estado de conexão
- ✅ Implementar retry automático

**Explore os arquivos de configuração para mais opções!**

---

**Última atualização:** 02/01/2026
