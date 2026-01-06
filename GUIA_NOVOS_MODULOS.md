# Guia de Implementação de Novos Módulos

Este guia demonstra como adicionar novos módulos ao Sistema de Gestão Escolar de forma escalável e padronizada.

## 📋 Exemplo: Módulo de Biblioteca

Vamos criar um módulo completo de biblioteca como exemplo.

### 1. Backend - Definir o Modelo (Prisma)

```prisma
// backend/prisma/schema.prisma

model Livro {
  id              String   @id @default(uuid())
  titulo          String
  autor           String
  isbn            String   @unique
  editora         String?
  anoPublicacao   Int?
  quantidade      Int      @default(1)
  disponivel      Int      @default(1)
  categoria       String
  localizacao     String?
  capa            String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  emprestimos     Emprestimo[]
}

model Emprestimo {
  id              String    @id @default(uuid())
  livroId         String
  alunoId         String
  dataEmprestimo  DateTime  @default(now())
  dataDevolucao   DateTime?
  dataPrevisao    DateTime
  status          String    @default("ATIVO") // ATIVO, DEVOLVIDO, ATRASADO
  observacoes     String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  livro           Livro     @relation(fields: [livroId], references: [id])
  aluno           alunos    @relation(fields: [alunoId], references: [id])
}
```

**Executar migration:**
```bash
cd backend
npx prisma migrate dev --name add_biblioteca_module
```

### 2. Backend - Criar Controller

```typescript
// backend/src/controllers/biblioteca.controller.ts

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { paginate } from '../utils/performance';

export class BibliotecaController {
  // Listar livros (com paginação e busca)
  async listarLivros(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;

      const result = await paginate(
        prisma.livro,
        { 
          page: Number(page), 
          limit: Number(limit),
          orderBy: { titulo: 'asc' }
        },
        search ? {
          OR: [
            { titulo: { contains: search as string, mode: 'insensitive' } },
            { autor: { contains: search as string, mode: 'insensitive' } },
            { isbn: { contains: search as string } },
          ]
        } : {}
      );

      res.json(result);
    } catch (error) {
      console.error('Erro ao listar livros:', error);
      res.status(500).json({ error: 'Erro ao listar livros' });
    }
  }

  // Criar livro
  async criarLivro(req: Request, res: Response) {
    try {
      const livro = await prisma.livro.create({
        data: {
          ...req.body,
          disponivel: req.body.quantidade || 1,
        },
      });

      res.status(201).json(livro);
    } catch (error) {
      console.error('Erro ao criar livro:', error);
      res.status(500).json({ error: 'Erro ao criar livro' });
    }
  }

  // Emprestar livro
  async emprestarLivro(req: Request, res: Response) {
    try {
      const { livroId, alunoId, dataPrevisao } = req.body;

      // Verificar disponibilidade
      const livro = await prisma.livro.findUnique({
        where: { id: livroId },
      });

      if (!livro || livro.disponivel <= 0) {
        return res.status(400).json({ error: 'Livro não disponível' });
      }

      // Criar empréstimo e atualizar quantidade
      const result = await prisma.$transaction([
        prisma.emprestimo.create({
          data: {
            livroId,
            alunoId,
            dataPrevisao: new Date(dataPrevisao),
          },
          include: {
            livro: true,
            aluno: true,
          },
        }),
        prisma.livro.update({
          where: { id: livroId },
          data: { disponivel: { decrement: 1 } },
        }),
      ]);

      res.status(201).json(result[0]);
    } catch (error) {
      console.error('Erro ao emprestar livro:', error);
      res.status(500).json({ error: 'Erro ao emprestar livro' });
    }
  }

  // Devolver livro
  async devolverLivro(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const emprestimo = await prisma.emprestimo.findUnique({
        where: { id },
      });

      if (!emprestimo) {
        return res.status(404).json({ error: 'Empréstimo não encontrado' });
      }

      // Atualizar empréstimo e quantidade do livro
      const result = await prisma.$transaction([
        prisma.emprestimo.update({
          where: { id },
          data: {
            dataDevolucao: new Date(),
            status: 'DEVOLVIDO',
          },
        }),
        prisma.livro.update({
          where: { id: emprestimo.livroId },
          data: { disponivel: { increment: 1 } },
        }),
      ]);

      res.json(result[0]);
    } catch (error) {
      console.error('Erro ao devolver livro:', error);
      res.status(500).json({ error: 'Erro ao devolver livro' });
    }
  }

  // Listar empréstimos
  async listarEmprestimos(req: Request, res: Response) {
    try {
      const { status, alunoId } = req.query;

      const emprestimos = await prisma.emprestimo.findMany({
        where: {
          ...(status && { status: status as string }),
          ...(alunoId && { alunoId: alunoId as string }),
        },
        include: {
          livro: true,
          aluno: {
            select: {
              id: true,
              nome: true,
              numeroMatricula: true,
            },
          },
        },
        orderBy: { dataEmprestimo: 'desc' },
      });

      res.json(emprestimos);
    } catch (error) {
      console.error('Erro ao listar empréstimos:', error);
      res.status(500).json({ error: 'Erro ao listar empréstimos' });
    }
  }
}
```

### 3. Backend - Criar Rotas

```typescript
// backend/src/routes/biblioteca.routes.ts

import { Router } from 'express';
import { BibliotecaController } from '../controllers/biblioteca.controller';
// import { authMiddleware } from '../middlewares/auth'; // Se tiver autenticação

const router = Router();
const controller = new BibliotecaController();

// Rotas de Livros
router.get('/livros', controller.listarLivros);
router.post('/livros', controller.criarLivro);
router.put('/livros/:id', controller.atualizarLivro);
router.delete('/livros/:id', controller.deletarLivro);

// Rotas de Empréstimos
router.get('/emprestimos', controller.listarEmprestimos);
router.post('/emprestimos', controller.emprestarLivro);
router.put('/emprestimos/:id/devolver', controller.devolverLivro);

export { router as bibliotecaRouter };
```

### 4. Backend - Registrar no Server

```typescript
// backend/src/server.ts

import { bibliotecaRouter } from './routes/biblioteca.routes';

// ... outras importações

app.use('/api/biblioteca', bibliotecaRouter);
```

### 5. Frontend - Criar Types

```typescript
// frontend/src/types/biblioteca.ts

export interface Livro {
  id: string;
  titulo: string;
  autor: string;
  isbn: string;
  editora?: string;
  anoPublicacao?: number;
  quantidade: number;
  disponivel: number;
  categoria: string;
  localizacao?: string;
  capa?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Emprestimo {
  id: string;
  livroId: string;
  alunoId: string;
  dataEmprestimo: string;
  dataDevolucao?: string;
  dataPrevisao: string;
  status: 'ATIVO' | 'DEVOLVIDO' | 'ATRASADO';
  observacoes?: string;
  livro?: Livro;
  aluno?: {
    id: string;
    nome: string;
    numeroMatricula?: string;
  };
}
```

### 6. Frontend - Criar Service

```typescript
// frontend/src/services/biblioteca.service.ts

import { api } from '../lib/api';
import { Livro, Emprestimo } from '../types/biblioteca';

export const bibliotecaService = {
  // Livros
  listarLivros: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get('/biblioteca/livros', { params });
    return data;
  },

  buscarLivro: async (id: string) => {
    const { data } = await api.get(`/biblioteca/livros/${id}`);
    return data;
  },

  criarLivro: async (livro: Partial<Livro>) => {
    const { data } = await api.post('/biblioteca/livros', livro);
    return data;
  },

  atualizarLivro: async (id: string, livro: Partial<Livro>) => {
    const { data } = await api.put(`/biblioteca/livros/${id}`, livro);
    return data;
  },

  deletarLivro: async (id: string) => {
    const { data } = await api.delete(`/biblioteca/livros/${id}`);
    return data;
  },

  // Empréstimos
  listarEmprestimos: async (params?: { status?: string; alunoId?: string }) => {
    const { data } = await api.get('/biblioteca/emprestimos', { params });
    return data;
  },

  emprestarLivro: async (emprestimo: {
    livroId: string;
    alunoId: string;
    dataPrevisao: string;
  }) => {
    const { data } = await api.post('/biblioteca/emprestimos', emprestimo);
    return data;
  },

  devolverLivro: async (id: string) => {
    const { data } = await api.put(`/biblioteca/emprestimos/${id}/devolver`);
    return data;
  },
};
```

### 7. Frontend - Criar Página

```tsx
// frontend/src/pages/Biblioteca.tsx

import React, { useState, useEffect } from 'react';
import { bibliotecaService } from '../services/biblioteca.service';
import { Livro } from '../types/biblioteca';
import { useFeature } from '../config/features';
import './Biblioteca.css';

export default function Biblioteca() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const bibliotecaEnabled = useFeature('biblioteca');

  useEffect(() => {
    if (!bibliotecaEnabled) return;
    carregarLivros();
  }, [page, bibliotecaEnabled]);

  const carregarLivros = async () => {
    try {
      setLoading(true);
      const data = await bibliotecaService.listarLivros({ page, search });
      setLivros(data.data);
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!bibliotecaEnabled) {
    return (
      <div className="biblioteca-disabled">
        <h2>Módulo Biblioteca</h2>
        <p>Este módulo não está habilitado. Entre em contato com o administrador.</p>
      </div>
    );
  }

  return (
    <div className="biblioteca-container">
      <header className="biblioteca-header">
        <h1>📚 Biblioteca</h1>
        <button className="btn-primary">Adicionar Livro</button>
      </header>

      <div className="biblioteca-search">
        <input
          type="text"
          placeholder="Buscar por título, autor ou ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && carregarLivros()}
        />
        <button onClick={carregarLivros}>Buscar</button>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="livros-grid">
          {livros.map((livro) => (
            <div key={livro.id} className="livro-card">
              <h3>{livro.titulo}</h3>
              <p className="autor">{livro.autor}</p>
              <p className="disponibilidade">
                Disponível: {livro.disponivel}/{livro.quantidade}
              </p>
              <button className="btn-secondary">Ver Detalhes</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 8. Frontend - Adicionar Rota

```tsx
// frontend/src/App.tsx

import Biblioteca from './pages/Biblioteca';

// Dentro de <Routes>
<Route path="biblioteca" element={<Biblioteca />} />
```

### 9. Frontend - Adicionar ao Menu

```tsx
// frontend/src/components/Layout.tsx

import { useFeature } from '../config/features';

// Dentro do componente
const bibliotecaEnabled = useFeature('biblioteca');

// No menu
{bibliotecaEnabled && (
  <Link to="/biblioteca" className="nav-item">
    <span className="icon">📚</span>
    <span>Biblioteca</span>
  </Link>
)}
```

### 10. Habilitar o Módulo

```typescript
// frontend/src/config/features.ts

export const defaultFeatures: FeatureFlags = {
  // ... outros módulos
  biblioteca: true, // HABILITAR
};
```

## ✅ Checklist de Implementação

- [ ] Criar modelos no Prisma
- [ ] Executar migration
- [ ] Criar controller no backend
- [ ] Criar rotas no backend
- [ ] Registrar rotas no server.ts
- [ ] Criar types no frontend
- [ ] Criar service no frontend
- [ ] Criar página no frontend
- [ ] Adicionar rota no App.tsx
- [ ] Adicionar no menu do Layout
- [ ] Habilitar feature flag
- [ ] Testar funcionalidades
- [ ] Adicionar testes unitários (opcional)
- [ ] Documentar API (opcional)

## 🎯 Boas Práticas

1. **Sempre usar paginação** em listagens
2. **Validar dados** no backend
3. **Tratar erros** adequadamente
4. **Usar TypeScript** para type safety
5. **Componentizar** UI reutilizável
6. **Adicionar loading states**
7. **Implementar feedback** ao usuário
8. **Seguir padrões** existentes
9. **Documentar** código complexo
10. **Testar** funcionalidades principais

---

**Com este guia, você pode criar quantos módulos precisar, mantendo a aplicação escalável e organizada!**
