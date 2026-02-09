# 🔧 Implementação Técnica Detalhada - Fase 1

## 🎯 Objetivo
Guia técnico completo para implementar as funcionalidades prioritárias da Fase 1, com foco em uma escola de 200 alunos, 30 professores/funcionários.

---

## 1️⃣ SISTEMA DE MATRÍCULAS COMPLETO

### 📐 Arquitetura de Dados

#### Schema Prisma - Atualização
```prisma
model Matricula {
  id                String    @id @default(uuid())
  numeroMatricula   String    @unique // Gerado automaticamente: 2024-001
  alunoId           String
  aluno             Aluno     @relation(fields: [alunoId], references: [id])
  turmaId           String
  turma             Turma     @relation(fields: [turmaId], references: [id])
  anoLetivo         Int       // 2024, 2025, etc
  dataMatricula     DateTime  @default(now())
  dataRematricula   DateTime?
  status            StatusMatricula @default(ATIVA)
  valorMatricula    Decimal?  @db.Decimal(10, 2)
  valorMensalidade  Decimal?  @db.Decimal(10, 2)
  observacoes       String?   @db.Text
  
  // Relacionamentos
  documentos        DocumentoMatricula[]
  pagamentos        Pagamento[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@map("matriculas")
  @@index([alunoId])
  @@index([turmaId])
  @@index([anoLetivo])
}

enum StatusMatricula {
  ATIVA
  TRANCADA
  CANCELADA
  CONCLUIDA
  TRANSFERIDA
}

model DocumentoMatricula {
  id            String    @id @default(uuid())
  matriculaId   String
  matricula     Matricula @relation(fields: [matriculaId], references: [id], onDelete: Cascade)
  tipo          TipoDocumento
  nome          String
  url           String    // URL do arquivo ou base64
  tamanho       Int       // em bytes
  formato       String    // pdf, jpg, png
  uploadedAt    DateTime  @default(now())
  
  @@map("documentos_matricula")
}

enum TipoDocumento {
  RG
  CPF
  COMPROVANTE_RESIDENCIA
  CERTIDAO_NASCIMENTO
  HISTORICO_ESCOLAR
  FOTO_3X4
  CARTEIRA_VACINACAO
  OUTROS
}
```

### 🔌 API Routes

#### Backend - `backend/src/routes/matriculas.routes.ts`
```typescript
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware } from '../middlewares/auth';

export const matriculasRouter = Router();

// Schemas
const createMatriculaSchema = z.object({
  alunoId: z.string().uuid(),
  turmaId: z.string().uuid(),
  anoLetivo: z.number().int().min(2020).max(2100),
  valorMatricula: z.number().optional(),
  valorMensalidade: z.number().optional(),
  observacoes: z.string().optional(),
});

// POST /api/matriculas - Criar matrícula
matriculasRouter.post('/', authMiddleware, async (req, res) => {
  try {
    const data = createMatriculaSchema.parse(req.body);
    
    // Gerar número de matrícula
    const lastMatricula = await prisma.matricula.findFirst({
      where: { anoLetivo: data.anoLetivo },
      orderBy: { numeroMatricula: 'desc' },
    });
    
    let numeroSequencial = 1;
    if (lastMatricula) {
      const lastNumero = parseInt(lastMatricula.numeroMatricula.split('-')[1]);
      numeroSequencial = lastNumero + 1;
    }
    
    const numeroMatricula = `${data.anoLetivo}-${numeroSequencial.toString().padStart(4, '0')}`;
    
    // Verificar se aluno já tem matrícula ativa na turma
    const matriculaExistente = await prisma.matricula.findFirst({
      where: {
        alunoId: data.alunoId,
        turmaId: data.turmaId,
        anoLetivo: data.anoLetivo,
        status: 'ATIVA',
      },
    });
    
    if (matriculaExistente) {
      return res.status(400).json({ 
        error: 'Aluno já possui matrícula ativa nesta turma' 
      });
    }
    
    const matricula = await prisma.matricula.create({
      data: {
        ...data,
        numeroMatricula,
      },
      include: {
        aluno: true,
        turma: true,
      },
    });
    
    res.status(201).json(matricula);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao criar matrícula:', error);
    res.status(500).json({ error: 'Erro ao criar matrícula' });
  }
});

// GET /api/matriculas - Listar com filtros
matriculasRouter.get('/', authMiddleware, async (req, res) => {
  try {
    const { alunoId, turmaId, anoLetivo, status, page = '1', limit = '20' } = req.query;
    
    const where: any = {};
    if (alunoId) where.alunoId = alunoId;
    if (turmaId) where.turmaId = turmaId;
    if (anoLetivo) where.anoLetivo = parseInt(anoLetivo as string);
    if (status) where.status = status;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const [matriculas, total] = await Promise.all([
      prisma.matricula.findMany({
        where,
        include: {
          aluno: true,
          turma: true,
          documentos: true,
        },
        orderBy: { dataMatricula: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.matricula.count({ where }),
    ]);
    
    res.json({
      data: matriculas,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Erro ao listar matrículas:', error);
    res.status(500).json({ error: 'Erro ao listar matrículas' });
  }
});

// GET /api/matriculas/:id - Buscar por ID
matriculasRouter.get('/:id', authMiddleware, async (req, res) => {
  try {
    const matricula = await prisma.matricula.findUnique({
      where: { id: req.params.id },
      include: {
        aluno: true,
        turma: { include: { professor: true } },
        documentos: true,
      },
    });
    
    if (!matricula) {
      return res.status(404).json({ error: 'Matrícula não encontrada' });
    }
    
    res.json(matricula);
  } catch (error) {
    console.error('Erro ao buscar matrícula:', error);
    res.status(500).json({ error: 'Erro ao buscar matrícula' });
  }
});

// PUT /api/matriculas/:id/status - Atualizar status
matriculasRouter.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = z.object({ 
      status: z.enum(['ATIVA', 'TRANCADA', 'CANCELADA', 'CONCLUIDA', 'TRANSFERIDA']) 
    }).parse(req.body);
    
    const matricula = await prisma.matricula.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        aluno: true,
        turma: true,
      },
    });
    
    res.json(matricula);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// POST /api/matriculas/:id/documentos - Upload documento
matriculasRouter.post('/:id/documentos', authMiddleware, async (req, res) => {
  try {
    const { tipo, nome, url, tamanho, formato } = z.object({
      tipo: z.enum(['RG', 'CPF', 'COMPROVANTE_RESIDENCIA', 'CERTIDAO_NASCIMENTO', 
                    'HISTORICO_ESCOLAR', 'FOTO_3X4', 'CARTEIRA_VACINACAO', 'OUTROS']),
      nome: z.string(),
      url: z.string(),
      tamanho: z.number(),
      formato: z.string(),
    }).parse(req.body);
    
    const documento = await prisma.documentoMatricula.create({
      data: {
        matriculaId: req.params.id,
        tipo,
        nome,
        url,
        tamanho,
        formato,
      },
    });
    
    res.status(201).json(documento);
  } catch (error) {
    console.error('Erro ao adicionar documento:', error);
    res.status(500).json({ error: 'Erro ao adicionar documento' });
  }
});

// Estatísticas
matriculasRouter.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const { anoLetivo } = req.query;
    const ano = anoLetivo ? parseInt(anoLetivo as string) : new Date().getFullYear();
    
    const [ativas, trancadas, canceladas, concluidas, total] = await Promise.all([
      prisma.matricula.count({ where: { anoLetivo: ano, status: 'ATIVA' } }),
      prisma.matricula.count({ where: { anoLetivo: ano, status: 'TRANCADA' } }),
      prisma.matricula.count({ where: { anoLetivo: ano, status: 'CANCELADA' } }),
      prisma.matricula.count({ where: { anoLetivo: ano, status: 'CONCLUIDA' } }),
      prisma.matricula.count({ where: { anoLetivo: ano } }),
    ]);
    
    res.json({
      anoLetivo: ano,
      ativas,
      trancadas,
      canceladas,
      concluidas,
      total,
      taxaAtivas: total > 0 ? ((ativas / total) * 100).toFixed(2) : 0,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});
```

### 🎨 Frontend Component

#### `frontend/src/pages/Matriculas.tsx`
```tsx
import { useState, useEffect } from 'react';
import { Plus, Search, Filter, FileText, Download } from 'lucide-react';
import { matriculasAPI, Matricula } from '../lib/api';
import './CommonPages.css';

const Matriculas = () => {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    anoLetivo: new Date().getFullYear(),
    status: 'TODAS',
    search: '',
  });
  const [stats, setStats] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadMatriculas();
    loadStats();
  }, [filters]);

  const loadMatriculas = async () => {
    try {
      setLoading(true);
      const params: any = { anoLetivo: filters.anoLetivo };
      if (filters.status !== 'TODAS') params.status = filters.status;
      
      const response = await matriculasAPI.getAll(params);
      setMatriculas(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar matrículas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await matriculasAPI.getStats(filters.anoLetivo);
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      ATIVA: { label: 'Ativa', class: 'badge-success' },
      TRANCADA: { label: 'Trancada', class: 'badge-warning' },
      CANCELADA: { label: 'Cancelada', class: 'badge-danger' },
      CONCLUIDA: { label: 'Concluída', class: 'badge-info' },
      TRANSFERIDA: { label: 'Transferida', class: 'badge-secondary' },
    };
    const badge = badges[status] || { label: status, class: '' };
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Matrículas</h1>
          {stats && (
            <div className="stats-inline">
              <span className="stat-badge stat-success">
                {stats.ativas} Ativas
              </span>
              <span className="stat-badge stat-warning">
                {stats.trancadas} Trancadas
              </span>
              <span className="stat-badge stat-info">
                Total: {stats.total}
              </span>
            </div>
          )}
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Nova Matrícula
        </button>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <label>Ano Letivo:</label>
          <select
            value={filters.anoLetivo}
            onChange={(e) => setFilters({ ...filters, anoLetivo: parseInt(e.target.value) })}
          >
            {[2024, 2025, 2026].map(ano => (
              <key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="TODAS">Todas</option>
            <option value="ATIVA">Ativas</option>
            <option value="TRANCADA">Trancadas</option>
            <option value="CANCELADA">Canceladas</option>
            <option value="CONCLUIDA">Concluídas</option>
          </select>
        </div>

        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por aluno..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <button className="btn-secondary">
          <Download size={20} />
          Exportar
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nº Matrícula</th>
              <th>Aluno</th>
              <th>Turma</th>
              <th>Ano Letivo</th>
              <th>Data Matrícula</th>
              <th>Mensalidade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {matriculas
              .filter(m => 
                !filters.search || 
                m.aluno.nome.toLowerCase().includes(filters.search.toLowerCase())
              )
              .map((matricula) => (
                <tr key={matricula.id}>
                  <td><strong>{matricula.numeroMatricula}</strong></td>
                  <td>{matricula.aluno.nome}</td>
                  <td>{matricula.turma.nome}</td>
                  <td>{matricula.anoLetivo}</td>
                  <td>{new Date(matricula.dataMatricula).toLocaleDateString('pt-BR')}</td>
                  <td>
                    {matricula.valorMensalidade 
                      ? formatCurrency(matricula.valorMensalidade) 
                      : '-'}
                  </td>
                  <td>{getStatusBadge(matricula.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Ver detalhes">
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Criação - implementar */}
      {showModal && <MatriculaModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Matriculas;
```

---

## 2️⃣ BOLETIM ESCOLAR COMPLETO

### 📐 Schema Prisma
```prisma
// Adicionar ao model Nota
model Nota {
  // ... campos existentes
  peso          Float?   @default(1.0) // Peso da avaliação
  tipoAvaliacao String?  // Prova, Trabalho, Seminário, etc
  recuperacao   Boolean  @default(false)
}

// Nova view ou endpoint calculado
// Não precisa de model, será calculado via query
```

### 🔌 API Routes - `backend/src/routes/boletim.routes.ts`
```typescript
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middlewares/auth';

export const boletimRouter = Router();

// GET /api/boletim/aluno/:alunoId/ano/:anoLetivo
boletimRouter.get('/aluno/:alunoId/ano/:anoLetivo', authMiddleware, async (req, res) => {
  try {
    const { alunoId, anoLetivo } = req.params;
    
    // Buscar aluno
    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
      include: { turma: true },
    });
    
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    // Buscar todas as disciplinas da turma
    const disciplinas = await prisma.disciplina.findMany({
      where: {
        turmas: {
          some: { id: aluno.turmaId },
        },
      },
      include: { professor: true },
    });
    
    // Buscar notas do aluno por disciplina e bimestre
    const notasAluno = await prisma.nota.findMany({
      where: {
        alunoId,
        disciplina: {
          turmas: {
            some: { id: aluno.turmaId },
          },
        },
      },
      include: { disciplina: true },
      orderBy: [
        { disciplinaId: 'asc' },
        { bimestre: 'asc' },
      ],
    });
    
    // Buscar frequência
    const frequencias = await prisma.frequencia.findMany({
      where: {
        alunoId,
        turmaId: aluno.turmaId,
      },
    });
    
    const totalAulas = frequencias.length;
    const aulasPresentes = frequencias.filter(f => f.presente).length;
    const percentualFrequencia = totalAulas > 0 
      ? ((aulasPresentes / totalAulas) * 100).toFixed(2) 
      : 0;
    
    // Organizar boletim por disciplina
    const boletim = disciplinas.map(disciplina => {
      const notasDisciplina = notasAluno.filter(
        n => n.disciplinaId === disciplina.id
      );
      
      const notasPorBimestre = [1, 2, 3, 4].map(bim => {
        const nota = notasDisciplina.find(n => n.bimestre === bim);
        return nota ? nota.nota : null;
      });
      
      const notasValidas = notasPorBimestre.filter(n => n !== null);
      const mediaFinal = notasValidas.length > 0
        ? notasValidas.reduce((acc, n) => acc! + n!, 0)! / notasValidas.length
        : 0;
      
      const situacao = mediaFinal >= 6 && parseFloat(percentualFrequencia as string) >= 75
        ? 'APROVADO'
        : mediaFinal < 6
        ? 'REPROVADO'
        : 'REPROVADO_FALTA';
      
      return {
        disciplina: disciplina.nome,
        professor: disciplina.professor?.nome || '-',
        bimestre1: notasPorBimestre[0],
        bimestre2: notasPorBimestre[1],
        bimestre3: notasPorBimestre[2],
        bimestre4: notasPorBimestre[3],
        mediaFinal: parseFloat(mediaFinal.toFixed(2)),
        situacao,
      };
    });
    
    res.json({
      aluno: {
        nome: aluno.nome,
        cpf: aluno.cpf,
        turma: aluno.turma?.nome,
      },
      anoLetivo: parseInt(anoLetivo),
      frequencia: {
        totalAulas,
        aulasPresentes,
        percentual: parseFloat(percentualFrequencia as string),
      },
      boletim,
      resumo: {
        totalDisciplinas: boletim.length,
        aprovadas: boletim.filter(b => b.situacao === 'APROVADO').length,
        reprovadas: boletim.filter(b => b.situacao !== 'APROVADO').length,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar boletim:', error);
    res.status(500).json({ error: 'Erro ao gerar boletim' });
  }
});

// GET /api/boletim/aluno/:alunoId/pdf
boletimRouter.get('/aluno/:alunoId/pdf', authMiddleware, async (req, res) => {
  try {
    // Implementar geração de PDF usando PDFKit
    // Exemplo básico:
    const { alunoId } = req.params;
    const anoLetivo = req.query.anoLetivo || new Date().getFullYear();
    
    // Buscar dados do boletim (reutilizar lógica acima)
    // Gerar PDF
    // Retornar como download
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=boletim-${alunoId}.pdf`);
    
    // ... código de geração do PDF
    
    res.send('PDF generation not implemented yet');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
});
```

---

## 📦 DEPENDÊNCIAS ADICIONAIS NECESSÁRIAS

### Backend
```json
{
  "dependencies": {
    "pdfkit": "^0.14.0",
    "sharp": "^0.33.0",
    "date-fns": "^3.0.0",
    "bull": "^4.12.0",
    "ioredis": "^5.3.2"
  },
  "devDependencies": {
    "@types/pdfkit": "^0.13.0"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "react-hook-form": "^7.49.0",
    "yup": "^1.3.3",
    "@hookform/resolvers": "^3.3.3",
    "react-query": "^3.39.3",
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "react-hot-toast": "^2.4.1"
  }
}
```

---

## 🚀 COMANDOS DE MIGRAÇÃO

```bash
# Backend
cd backend

# Gerar migration das novas tabelas
npx prisma migrate dev --name add_matriculas_documentos

# Gerar Prisma Client
npx prisma generate

# Seed inicial (opcional)
npx ts-node prisma/seed-matriculas.ts
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO - FASE 1

### Matrículas
- [ ] Atualizar schema Prisma
- [ ] Criar migrations
- [ ] Implementar rotas backend
- [ ] Criar component frontend
- [ ] Implementar modal de criação
- [ ] Sistema de upload de documentos.[ ] Validações e tratamento de erros
- [ ] Testes unitários

### Boletim
- [ ] Criar rota de geração de boletim
- [ ] Implementar cálculos de média
- [ ] Integrar frequência
- [ ] Criar component de visualização
- [ ] Implementar geração de PDF
- [ ] Adicionar gráficos de desempenho
- [ ] Testes de cálculo

### Calendário (próximo documento)
### Comunicação (próximo documento)

---

**Tempo estimado Fase 1:** 6-8 semanas
**Desenvolvedores necessários:** 1-2 fullstack
**Prioridade:** ⭐⭐⭐ CRÍTICA
