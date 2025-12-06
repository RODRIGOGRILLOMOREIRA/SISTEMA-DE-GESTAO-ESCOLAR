# 🎨 Frontend - Sistema de Gestão Escolar

Interface moderna, responsiva e otimizada para gerenciamento escolar, desenvolvida com React 18, TypeScript e Vite, com sistema de notas com média parcial progressiva.

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Páginas Principais](#páginas-principais)
- [Componentes](#componentes)
- [Estilização](#estilização)
- [API Integration](#api-integration)
- [Instalação](#instalação)

## 🛠️ Tecnologias

### Core
- **React** 18.2.0 - Biblioteca para interfaces de usuário
- **TypeScript** 5.3.3 - JavaScript com tipagem estática
- **Vite** 5.4.21 - Build tool de alta performance

### Roteamento
- **React Router DOM** 6.20.1 - Roteamento SPA completo
- Navegação programática com hooks (`useNavigate`)
- Rotas protegidas por autenticação

### HTTP Client
- **Axios** 1.6.2 - Cliente HTTP configurado
- Interceptors para logs e tratamento de erros
- Base URL configurável via variável de ambiente

### UI e Ícones
- **Lucide React** 0.294.0 - +1000 ícones modernos
- Ícones usados: Home, Users, BookOpen, FileText, Calendar, Settings, LogOut, Save, X, Edit, Trash2, Plus, ArrowLeft, CheckCircle, XCircle, GraduationCap, School

### Desenvolvimento
- **ESLint** - Linter para qualidade de código
- **@vitejs/plugin-react** - Plugin React com Fast Refresh

## 🎯 Funcionalidades Principais

### 📊 Sistema de Notas com Média Parcial Progressiva (DESTAQUE!)
- ✅ **Navegação em 3 níveis**: Turma → Aluno → Disciplina
- ✅ **4 Cards Visuais**: 3 trimestres + Média Final do Ano
- ✅ **Média Parcial Progressiva**:
  - Apenas T1: Exibe "Média Parcial do Ano (T1)" = T1
  - T1+T2: Exibe "Média Parcial do Ano (T1+T2)" = (T1×1 + T2×2) ÷ 3
  - T1+T2+T3: Exibe "Média Parcial do Ano" = (T1×1 + T2×2 + T3×3) ÷ 6
- ✅ **Badge Destacado**: Média parcial em azul com borda entre T3 e Média Final
- ✅ **Código de Cores Automático**:
  - Verde: ≥ 7.0 (ótimo desempenho)
  - Amarelo: 5.0 - 6.9 (atenção)
  - Vermelho: < 5.0 (recuperação necessária)
- ✅ **Cálculos em Tempo Real**: Todas as médias calculadas automaticamente
- ✅ **Status Visual**: APROVADO (verde ✓) ou REPROVADO (vermelho ✗)
- ✅ **Modal Compacto**: 88vh sem barra de rolagem, tema cinza moderno

### 🎨 Interface Modernizada
- ✅ **Modal Redesenhado**:
  - Fundo: Degradê cinza (#e2e8f0 → #cbd5e1 → #94a3b8)
  - Header: Cinza escuro (#475569 → #334155) com título branco
  - Labels: Azul forte (#1e40af) para campos, cinza (#334155) para seções
  - Botões: Cancelar vermelho claro (#fee2e2), Salvar verde
  - Campos: Fundo claro (#f8fafc) com borda cinza (#64748b)
- ✅ **Botões Compactos**: Padding 8px×14px, fonte 0.875rem, ícones 16px
- ✅ **Grid Responsivo**: Auto-fit minmax(120px, 1fr) para turmas
- ✅ **Badges Estilizados**: Títulos com fundo cinza claro e borda

### 👨‍🏫 Gestão Professor-Centric
- ✅ **Cadastro Avançado**:
  - Seleção de área (Anos Iniciais/Anos Finais/Ambos)
  - Checkboxes para 10 componentes curriculares
  - Vinculação a múltiplas turmas simultaneamente
- ✅ **Criação Automática**: DisciplinaTurma criado ao salvar
- ✅ **Modal Grande**: 1200px com layout em duas colunas
- ✅ **Autocomplete**: Busca de professores ao vincular disciplinas

### 📚 Navegação por Categorias (Disciplinas)
- ✅ **3 Níveis de Navegação**: Categoria (Anos Iniciais/Finais) → Turma → Disciplinas
- ✅ **Ordenação Inteligente**: Turmas ordenadas por ano e nome (6ª, 7ª, 8ª, 9ª)
- ✅ **Botões Modernos**: Voltar e Nova Disciplina com estilos compactos
- ✅ **Badge de Título**: Nome da turma destacado com estilo cinza

### 🏫 Gestão Completa de Entidades
- ✅ **Alunos**: CRUD com CPF, responsável, data de nascimento, turma
- ✅ **Turmas**: Cadastro com ano, nome, período, anoLetivo (2025)
- ✅ **Disciplinas**: 10 padronizadas (ARTES, CIÊNCIAS, EDUCAÇÃO FÍSICA, etc.)
- ✅ **Deleção em Cascata**: Remove notas automaticamente ao deletar aluno

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
frontend/
├── public/                          # Arquivos públicos estáticos
├── src/
│   ├── components/
│   │   ├── Modal.tsx                # Modal reutilizável com tema cinza
│   │   ├── Modal.css                # Estilos globais do modal (degradê cinza)
│   │   └── DisciplinasAutocomplete.tsx  # Autocomplete para busca de professores
│   │
│   ├── pages/
│   │   ├── Alunos.tsx               # CRUD de alunos
│   │   ├── Professores.tsx          # CRUD professor-centric (área + componentes)
│   │   ├── Turmas.tsx               # CRUD de turmas
│   │   ├── Disciplinas.tsx          # Navegação por categorias (Anos Iniciais/Finais)
│   │   ├── Notas.tsx                # Sistema de notas com média parcial progressiva
│   │   ├── Notas.css                # Estilos específicos (modal compacto 88vh)
│   │   └── CommonPages.css          # Estilos compartilhados entre páginas
│   │
│   ├── services/
│   │   └── api.ts                   # Cliente Axios + endpoints da API
│   │
│   ├── App.tsx                      # Componente raiz com rotas
│   ├── App.css                      # Estilos globais e CSS variables
│   └── main.tsx                     # Entry point (ReactDOM.render)
│
├── package.json                     # Dependências e scripts
├── tsconfig.json                    # Configuração TypeScript
├── vite.config.ts                   # Configuração Vite
├── index.html                       # HTML base
└── README.md                        # Este arquivo
```

### Padrões de Código

- **Component-Based**: Componentes reutilizáveis e modulares
- **Type Safety**: TypeScript strict mode em todo o código
- **React Hooks**: useState, useEffect, useNavigate, custom hooks
- **Separation of Concerns**: Lógica de negócio separada da UI
- **Responsive Design**: Mobile-first approach com grid e flexbox
- **CSS Modular**: Arquivos CSS específicos por página/componente

## 📄 Páginas Principais

### 1. Alunos.tsx

**Funcionalidade**: CRUD completo de alunos

**Interface:**
- Header com título e botão "Novo Aluno"
- Tabela responsiva com colunas: Nome, CPF, Data Nascimento, Responsável, Turma, Ações
- Ações: Editar (ícone Edit) e Excluir (ícone Trash2)

**Modal de Cadastro/Edição:**
- Campos: Nome, CPF, Data de Nascimento, Responsável
- Dropdown de Turmas (carregado dinamicamente)
- Validações: todos os campos obrigatórios
- Botões: Cancelar e Salvar

**Lógica:**
- `useState` para alunos, turmas, modal, form
- `useEffect` para carregar dados na montagem
- `handleDelete` com confirmação
- Deleção em cascata (remove notas automaticamente)

### 2. Professores.tsx (Sistema Professor-Centric)

**Funcionalidade**: Cadastro avançado de professores com vinculação automática

**Interface:**
- Header com botão "Novo Professor"
- Tabela com Nome, CPF, Email, Telefone, Área, Ações

**Modal Grande (1200px):**
- Layout em duas colunas
- **Coluna 1**: Nome, CPF, Email, Telefone
- **Área de Atuação**: Radio buttons (Anos Iniciais/Anos Finais/Ambos)
- **Componentes Curriculares**: 10 checkboxes
  - ARTES, CIÊNCIAS, EDUCAÇÃO FÍSICA, ENSINO RELIGIOSO
  - GEOGRAFIA, HISTÓRIA, INGLÊS, MATEMÁTICA, PORTUGUÊS, PROJETO DE VIDA
- **Turmas Vinculadas**: Multi-select com todas as turmas

**Lógica:**
- Salva componentes e turmas como JSON no banco
- Cria automaticamente DisciplinaTurma para cada combinação (componente × turma)
- Filtra turmas por área selecionada

### 3. Turmas.tsx

**Funcionalidade**: Gerenciamento de turmas

**Interface:**
- Tabela com Ano, Nome, Período, Ano Letivo, Ações
- Modal com campos:
  - Ano (1-9)
  - Nome (A, B, C, etc.)
  - Período (enum: Manhã, Tarde, Noite, Integral)
  - Ano Letivo (padrão: 2025)

**Lógica:**
- Ordenação por ano
- Validação de ano (1-9)

### 4. Disciplinas.tsx (Navegação por Categorias)

**Funcionalidade**: Navegação em 3 níveis + gerenciamento de disciplinas

**Interface Nível 1 - Categorias:**
- 2 botões: "Anos Iniciais (1º ao 5º ano)" e "Anos Finais (6º ao 9º ano)"

**Interface Nível 2 - Turmas:**
- Header com:
  - Botão "Voltar" compacto (8px×14px padding, 0.875rem fonte)
  - Badge estilizado com nome da categoria
  - Botão "Nova Disciplina" (azul, compacto)
- Grid de turmas:
  - `gridTemplateColumns: repeat(auto-fit, minmax(120px, 1fr))`
  - Gap 12px
  - Botões com padding 12px×16px, fonte 0.875rem
  - Ordenação: por ano, depois por nome (6ª, 7ª, 8ª, 9ª)

**Interface Nível 3 - Disciplinas:**
- Listagem de disciplinas da turma
- Tabela com Disciplina, Carga Horária, Professor, Ações
- Modal com:
  - Dropdown de disciplinas (10 padronizadas)
  - Campo de carga horária
  - Autocomplete de professores (componente DisciplinasAutocomplete)

**Lógica:**
- `loadTurmas()` com sorting: `.sort((a, b) => { if (a.ano !== b.ano) return a.ano - b.ano; return a.nome.localeCompare(b.nome); })`
- Criação de DisciplinaTurma ao vincular

### 5. Notas.tsx (Sistema Avançado com Média Parcial Progressiva)

**Interface de Seleção (3 etapas):**
1. **Seleção de Turma** - Grid de botões com ano e nome
2. **Seleção de Aluno** - Lista filtrada pela turma escolhida
3. **Seleção de Disciplina** - Cards com nome e professor

**Cards de Visualização:**

📘 **Cards dos Trimestres (3x):**
- Momento 1:
  - Avaliação 01 (0.0 - 10.0)
  - Avaliação 02 (0.0 - 10.0)
  - Avaliação 03 (0.0 - 10.0)
  - Média M1 (soma das 3)
- Momento 2:
  - Avaliação EAC (0.0 - 10.0)
- Nota Final do Trimestre (max(M1, EAC))
- Botão "Editar Notas" em cada card

📊 **Média Parcial Progressiva (DESTAQUE!):**
- Badge azul com borda exibido entre T3 e Média Final
- Função `calcularMediaParcialAno()`:
  ```typescript
  if (apenas T1) return { valor: t1, texto: 'Média Parcial do Ano (T1)' };
  if (T1 e T2) return { valor: (t1*1 + t2*2)/3, texto: 'Média Parcial do Ano (T1+T2)' };
  if (T1, T2 e T3) return { valor: (t1*1 + t2*2 + t3*3)/6, texto: 'Média Parcial do Ano' };
  ```

📊 **Card de Média Final do Ano:**
- Exibe notas finais dos 3 trimestres
- Status visual:
  - 🟢 **APROVADO** (≥ 6.0) - Badge verde com CheckCircle
  - 🔴 **REPROVADO** (< 6.0) - Badge vermelho com XCircle
  - ⚪ **Aguardando** - Badge cinza

**Modal de Edição (Compacto - 88vh):**
- max-height: 88vh (sem barra de rolagem)
- Tema cinza: background `linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)`
- Header cinza escuro: `linear-gradient(135deg, #475569 0%, #334155 100%)`
- Padding reduzido:
  - Header: 12px×18px, h2 1.1rem
  - Body: 16px
  - Form-group: 12px margin-bottom, label 0.75rem
  - Inputs: 6px×8px padding, 0.875rem font
- **Momento 1, 2, 3**: h3 com cor #334155, fonte 0.9rem, padding 10px×12px
- **Labels dos campos**: inline `style={{ color: '#334155' }}` (cinza escuro)
- Botões:
  - Cancelar: background #fee2e2, color #dc2626, border #fca5a5
  - Salvar: verde (#10b981)

**Código de Cores (Cards):**
- 🟢 Verde: ≥ 7.0
- 🟡 Amarelo: 5.0 - 6.9
- 🔴 Vermelho: < 5.0

**Lógica:**
- `calcularMediaParcialAno()`: retorna objeto com valor e texto dinâmico
- Salvamento via `PUT /api/notas/:id`
- Atualização automática de M1, nota final, média anual
- Feedback visual com toasts/alerts
- Filtros por período
- Exportação de dados

### 9. Configurações

**Seções:**

**Dados da Escola:**
- Nome da escola
- Rede escolar
- Endereço completo
- Contatos (telefone, email)

## 🧩 Componentes Principais

### Modal.tsx

**Localização:** `src/components/Modal.tsx`

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}
```

**Funcionalidades:**
- Modal reutilizável em todo o sistema
- Backdrop clicável para fechar
- Botão X no canto superior direito
- Suporte a 3 tamanhos (small: 500px, medium: 700px, large: 1200px)
- Tema cinza moderno

**Estilos (Modal.css):**
- Background: `linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)`
- Border: 2px solid #475569
- Header: `linear-gradient(135deg, #475569 0%, #334155 100%)` com texto branco
- Labels: cor #1e40af (azul forte)
- Inputs: background #f8fafc, border #64748b
- Botão Cancelar: background #fee2e2, color #dc2626
- Botão Salvar: background verde (#10b981)

### DisciplinasAutocomplete.tsx

**Localização:** `src/components/DisciplinasAutocomplete.tsx`

**Funcionalidade:**
- Autocomplete para busca de professores
- Filtragem em tempo real por nome
- Dropdown com sugestões
- Seleção via clique

**Props:**
```typescript
interface Props {
  professores: Professor[];
  value: string;
  onChange: (id: string) => void;
}
```

## 🎨 Estilização

### Modal.css (Estilos Globais do Modal)

**Características:**
- Fundo degradê cinza moderno (#e2e8f0 → #cbd5e1 → #94a3b8)
- Header cinza escuro (#475569 → #334155)
- Labels azuis (#1e40af) com peso 700
- Campos com fundo claro (#f8fafc) e borda cinza (#64748b)
- Botão Cancelar vermelho claro (#fee2e2)
- Botão Salvar verde com gradiente

### Notas.css (Modal Compacto)

**Otimizações específicas:**
```css
.modal-notas {
  max-height: 88vh;  /* Sem barra de rolagem */
}

.modal-notas .modal-header {
  padding: 12px 18px;
  h2 { font-size: 1.1rem; }
}

.modal-notas .modal-body {
  padding: 16px;
}

.modal-notas .form-group {
  margin-bottom: 12px;
  label { margin-bottom: 4px; font-size: 0.75rem; }
}

.modal-notas input {
  padding: 6px 8px;
  font-size: 0.875rem;
}

.momento-form {
  padding: 10px 12px;
  margin-bottom: 12px;
  h3 { color: #334155; font-size: 0.9rem; margin: 0 0 8px 0; }
}
```

### CommonPages.css (Estilos Compartilhados)

**Elementos:**
- Headers de páginas
- Botões de ação
- Tabelas responsivas
- Cards de navegação
- Grid layouts

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Backend rodando em http://localhost:3333

### Instalação

1. Entre na pasta do frontend:
```powershell
cd frontend
```

2. Instale as dependências:
```powershell
npm install
```

3. (Opcional) Configure variáveis de ambiente:
```env
# .env
VITE_API_URL=http://localhost:3333
```

4. Inicie o servidor de desenvolvimento:
```powershell
npm run dev
```

✅ Acesse: **http://localhost:5173**

### Scripts Disponíveis

```bash
npm run dev              # Inicia Vite dev server (porta 5173)
npm run build            # Build de produção (pasta dist/)
npm run preview          # Preview do build de produção
npm run lint             # Executa ESLint (se configurado)
```

### Build de Produção

```powershell
npm run build
```

Gera pasta `dist/` otimizada para produção com:
- Code splitting
- Tree shaking
- Minificação
- Source maps

## 🧩 Componentes

### Layout

**Localização:** `src/components/Layout.tsx`

**Responsabilidades:**
- Sidebar com menu de navegação
- Logo da escola no topo
- Informações do usuário no rodapé
- Botão de logout
- Outlet para renderizar páginas filhas

**Funcionalidades:**
- Menu lateral fixo
- Indicador de página ativa
- Logo dinâmica das configurações (atualização automática via eventos)
- Avatar do usuário
- Tema claro/escuro
- Event Listener `configUpdated` para sincronização em tempo real

### PrivateRoute

**Localização:** `src/components/PrivateRoute.tsx`

**Responsabilidades:**
- Verificar autenticação do usuário
- Redirecionar para login se não autenticado
- Renderizar children se autenticado

**Uso:**
```tsx
<PrivateRoute>
  <Layout />
</PrivateRoute>
```

## 📄 Páginas

## 🌐 API Integration

### Cliente Axios

**Localização:** `src/services/api.ts`

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
});

// Interceptor para logs (opcional)
api.interceptors.request.use((config) => {
  console.log(`${config.method?.toUpperCase()} ${config.url}`);
  return config;
});
```

### APIs Exportadas

```typescript
// Alunos
export const alunosAPI = {
  getAll: () => api.get('/api/alunos'),
  getById: (id: string) => api.get(`/api/alunos/${id}`),
  create: (data) => api.post('/api/alunos', data),
  update: (id: string, data) => api.put(`/api/alunos/${id}`, data),
  delete: (id: string) => api.delete(`/api/alunos/${id}`),
};

// Professores
export const professoresAPI = {
  getAll: () => api.get('/api/professores'),
  getById: (id: string) => api.get(`/api/professores/${id}`),
  create: (data) => api.post('/api/professores', data),
  update: (id: string, data) => api.put(`/api/professores/${id}`, data),
  delete: (id: string) => api.delete(`/api/professores/${id}`),
};

// Turmas
export const turmasAPI = {
  getAll: () => api.get('/api/turmas'),
  getById: (id: string) => api.get(`/api/turmas/${id}`),
  create: (data) => api.post('/api/turmas', data),
  update: (id: string, data) => api.put(`/api/turmas/${id}`, data),
  delete: (id: string) => api.delete(`/api/turmas/${id}`),
};

// Disciplinas
export const disciplinasAPI = {
  getAll: () => api.get('/api/disciplinas'),
  getById: (id: string) => api.get(`/api/disciplinas/${id}`),
  create: (data) => api.post('/api/disciplinas', data),
  update: (id: string, data) => api.put(`/api/disciplinas/${id}`, data),
  delete: (id: string) => api.delete(`/api/disciplinas/${id}`),
};

// DisciplinaTurma
export const disciplinasTurmaAPI = {
  getAll: () => api.get('/api/disciplinas-turma'),
  getByTurma: (turmaId: string) => api.get(`/api/disciplinas-turma/turma/${turmaId}`),
  create: (data) => api.post('/api/disciplinas-turma', data),
  delete: (id: string) => api.delete(`/api/disciplinas-turma/${id}`),
};

// Notas
export const notasAPI = {
  getByAluno: (alunoId: string) => api.get(`/api/notas/aluno/${alunoId}`),
  getByAlunoAndDisciplina: (alunoId: string, disciplinaTurmaId: string) =>
    api.get(`/api/notas/aluno/${alunoId}/disciplinaTurma/${disciplinaTurmaId}`),
  create: (data) => api.post('/api/notas', data),
  update: (id: string, data) => api.put(`/api/notas/${id}`, data),
  delete: (id: string) => api.delete(`/api/notas/${id}`),
};
```

## 📊 Sistema de Notas - Fluxo Completo

### 1. Seleção
```
Usuário seleciona:
  └─> Turma
      └─> Aluno
          └─> Disciplina
```

### 2. Carregamento de Notas
```typescript
// GET /api/notas/aluno/:alunoId/disciplinaTurma/:disciplinaTurmaId
const response = await notasAPI.getByAlunoAndDisciplina(alunoId, disciplinaTurmaId);
// Retorna: { notas: Nota[], notaFinal: NotaFinal }
```

### 3. Exibição
- 3 cards de trimestres
- 1 badge de média parcial progressiva
- 1 card de média final

### 4. Edição
- Modal compacto 88vh sem scroll
- Campos para Momento 1 (3 avaliações)
- Campo para Momento 2 (EAC)
- Cálculo automático de M1

### 5. Salvamento
```typescript
// PUT /api/notas/:id
await notasAPI.update(notaId, {
  avaliacao01, avaliacao02, avaliacao03,
  avaliacaoEAC
});
// Backend calcula: mediaM1, notaFinal, mediaFinal, aprovado
```

### 6. Atualização UI
- Recarrega notas
- Atualiza média parcial progressiva
- Atualiza status APROVADO/REPROVADO
- Aplica código de cores

## 🚀 Melhorias Recentes

### Interface
- ✅ Botões compactos (8px×14px padding, 0.875rem fonte)
- ✅ Grid responsivo para turmas (auto-fit minmax(120px, 1fr))
- ✅ Badge estilizado para títulos de turma
- ✅ Ordenação alfabética de turmas (6ª, 7ª, 8ª, 9ª)

### Modal
- ✅ Redesign completo com tema cinza (#e2e8f0 degradê)
- ✅ Compactação para 88vh (sem scroll)
- ✅ Header cinza escuro (#475569 → #334155)
- ✅ Labels: azul (#1e40af) para campos, cinza (#334155) para seções
- ✅ Botão Cancelar vermelho claro (#fee2e2)

### Funcionalidades
- ✅ Média Parcial Progressiva (T1, T1+T2, T1+T2+T3)
- ✅ Badge destacado em azul para média parcial
- ✅ Sistema professor-centric com checkboxes de componentes
- ✅ Navegação por categorias (Anos Iniciais/Finais)
- ✅ Autocomplete para busca de professores

## 📚 Documentação Adicional

Consulte também:
- **[README Principal](../README.md)** - Visão geral completa do sistema
- **[Backend README](../backend/README.md)** - Arquitetura do backend

## 🎯 Próximos Passos

Para desenvolvedores que desejam contribuir ou estender o sistema:
1. Familiarize-se com a estrutura de pastas
2. Entenda o fluxo de Notas.tsx (página mais complexa)
3. Siga os padrões de Modal.css para novos modais
4. Mantenha a tipagem TypeScript rigorosa
5. Teste responsividade em mobile/tablet/desktop

---

**Frontend do Sistema de Gestão Escolar** - Versão 2.0 - 2025

### 1. Fluxo de Seleção

```
Usuário → Seleciona Turma
       → Seleciona Aluno (lista filtrada)
       → Seleciona Disciplina
       → Visualiza 4 cards (3 trimestres + nota final)
```

### 2. Lançamento de Notas

```
Usuário → Clica em "Editar" no card do trimestre
       → Preenche avaliações no modal
       → Clica em "Salvar Notas"
       → Sistema calcula automaticamente:
          ✓ Média M1 = soma das 3 avaliações
          ✓ Nota Final = maior entre M1 e EAC
          ✓ Média Final Anual = (T1×1 + T2×2 + T3×3) ÷ 6
          ✓ Status de Aprovação (≥ 6.0)
       → Dados salvos no banco
       → Interface atualiza em tempo real
```

### 3. API Calls

```typescript
// Buscar notas do aluno na disciplina
const response = await api.get(`/notas/aluno/${alunoId}/disciplina/${disciplinaId}`)
// Retorna: { notas: [], notaFinal: {} }

// Salvar notas
const response = await api.post('/notas/salvar', {
  alunoId,
  disciplinaId,
  trimestre,
  avaliacao01,
  avaliacao02,
  avaliacao03,
  avaliacaoEAC,
  observacao
})
// Retorna: { nota: {}, notaFinal: {} }
```

### 4. Eventos Customizados

**Atualização de Configurações:**
```typescript
// Em Configuracoes.tsx - Dispara evento após salvar
window.dispatchEvent(new Event('configUpdated'))

// Em Layout.tsx - Escuta e atualiza
window.addEventListener('configUpdated', handleConfigUpdate)
```

## 🔒 Segurança

### Armazenamento Local

- **Token JWT**: localStorage (`token`)
- **Dados do Usuário**: localStorage (`user`)
- **Tema**: localStorage (`theme`)

### Limpeza ao Logout

```typescript
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
  setToken(null);
};
```

## 🎯 Boas Práticas

1. **TypeScript**: Tipos em todos os componentes e funções
2. **Hooks**: Uso correto de useState, useEffect, useContext
3. **Clean Code**: Nomes descritivos e funções pequenas
4. **Error Handling**: Try-catch em todas as chamadas API
5. **Loading States**: Feedback visual durante requisições
6. **Form Validation**: Validação antes de enviar ao backend
7. **Accessibility**: Labels, ARIA attributes, keyboard navigation
8. **Performance**: Lazy loading, memoization quando necessário

## 📊 Performance

### Otimizações

- **Vite**: Build ultrarrápido com Hot Module Replacement
- **Code Splitting**: Lazy loading de rotas
- **Tree Shaking**: Eliminação de código não utilizado
- **CSS Modules**: Estilos isolados e otimizados
- **Image Optimization**: Compressão e lazy loading de imagens
- **Event-Driven Updates**: Sincronização eficiente entre componentes

## 🚀 Atualizações Recentes

### Sistema de Notas Avançado ✨
- ✅ Interface moderna com seleção por Turma → Aluno → Disciplina
- ✅ 4 cards visuais (3 trimestres + nota final anual)
- ✅ Cálculos automáticos de todas as médias
- ✅ Status de aprovação com código de cores
- ✅ Salvamento automático no banco de dados
- ✅ Atualização em tempo real da interface

### Melhorias na Interface 🎨
- ✅ Botões de seleção modernos com animações
- ✅ Sistema de eventos para sincronização (configUpdated)
- ✅ Atualização dinâmica de logo e nome da escola
- ✅ Cards responsivos com gradientes e sombras
- ✅ Feedback visual aprimorado (loading, success, error)

## 📚 Documentação Adicional

- [README Principal](../README.md)
- [Backend README](../backend/README.md)
- [Sistema de Notas Completo](../SISTEMA-DE-NOTAS.md)

---

Desenvolvido com ❤️ usando React, TypeScript e Vite
