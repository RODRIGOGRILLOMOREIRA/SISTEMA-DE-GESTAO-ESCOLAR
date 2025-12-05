# 🎨 Frontend - Sistema de Gestão Escolar

Interface moderna e responsiva para gerenciamento escolar, desenvolvida com React, TypeScript e Vite.

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Configuração](#configuração)
- [Componentes](#componentes)
- [Páginas](#páginas)
- [Context API](#context-api)
- [Temas](#temas)
- [Roteamento](#roteamento)

## 🛠️ Tecnologias

### Core
- **React** 18.2.0 - Biblioteca para interfaces
- **TypeScript** 5.3.3 - JavaScript tipado
- **Vite** 5.0.8 - Build tool ultrarrápido

### Roteamento e Estado
- **React Router DOM** 6.20.1 - Roteamento SPA
- **Context API** - Gerenciamento de estado global

### HTTP e API
- **Axios** 1.6.2 - Cliente HTTP
- **Interceptors** - Logging e autenticação automática

### UI e Estilo
- **Lucide React** 0.294.0 - Biblioteca de ícones
- **CSS Modules** - Estilos isolados
- **CSS Variables** - Temas dinâmicos

### Ferramentas de Desenvolvimento
- **ESLint** - Linter JavaScript/TypeScript
- **@vitejs/plugin-react** - Plugin React para Vite

## 🎯 Funcionalidades Principais

### Sistema de Notas Avançado
- ✅ **Seleção Intuitiva**: Turma → Aluno → Disciplina (botões modernos)
- ✅ **4 Cards Visuais**: 3 trimestres + 1 nota final do ano
- ✅ **Código de Cores**: Verde (≥7.0), Amarela (5.0-6.9), Vermelha (<5.0)
- ✅ **Cálculos em Tempo Real**: Todas as médias calculadas automaticamente
- ✅ **Status Visual**: APROVADO (verde) ou REPROVADO (vermelho)
- ✅ **Modal de Edição**: Interface intuitiva para lançamento de notas
- ✅ **Salvamento Automático**: Persistência no banco de dados

### Interface Moderna
- ✅ **Tema Claro/Escuro**: Alternância suave com CSS Variables
- ✅ **Sidebar Dinâmica**: Atualização automática de logo e nome
- ✅ **Modals Responsivos**: Edição/criação em popup
- ✅ **Animações Suaves**: Transições e hover effects
- ✅ **Design Responsivo**: Mobile-first approach
- ✅ **Ícones Modernos**: Lucide React icons

### Gestão Completa
- ✅ **CRUD Completo**: Todas as entidades (Alunos, Professores, Turmas, Disciplinas)
- ✅ **Autenticação**: Login, logout, recuperação de senha
- ✅ **Configurações**: Upload de logo, personalização do sistema
- ✅ **Dashboard**: Visão geral com estatísticas
- ✅ **Frequência**: Registro de presença

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
frontend/
├── public/                     # Arquivos públicos estáticos
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # Layout principal com sidebar e eventos
│   │   ├── Layout.css
│   │   ├── PrivateRoute.tsx    # HOC para proteção de rotas
│   │   └── ...
│   ├── contexts/
│   │   ├── ThemeContext.tsx    # Contexto de tema (claro/escuro)
│   │   └── AuthContext.tsx     # Contexto de autenticação
│   ├── lib/
│   │   └── api.ts              # Cliente Axios + tipos
│   ├── pages/
│   │   ├── Login.tsx           # Página de login
│   │   ├── Register.tsx        # Cadastro de usuário
│   │   ├── UserManagement.tsx  # Gerenciamento de usuários
│   │   ├── Dashboard.tsx       # Dashboard principal
│   │   ├── Alunos.tsx          # CRUD de alunos
│   │   ├── Professores.tsx     # CRUD de professores
│   │   ├── Turmas.tsx          # CRUD de turmas
│   │   ├── Disciplinas.tsx     # CRUD de disciplinas
│   │   ├── Notas.tsx           # Lançamento de notas
│   │   ├── Frequencia.tsx      # Registro de frequência
│   │   ├── Configuracoes.tsx   # Configurações da escola
│   │   └── Auth.css            # Estilos de autenticação
│   ├── App.tsx                 # Componente raiz
│   ├── App.css                 # Estilos globais
│   ├── main.tsx                # Entry point
│   └── vite-env.d.ts           # Tipos do Vite
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Padrões de Código

- **Component-Based**: Componentes reutilizáveis
- **Type Safety**: TypeScript em todo o código
- **Hooks**: useState, useEffect, useContext, useNavigate
- **Separation of Concerns**: Lógica separada da apresentação
- **Responsive Design**: Mobile-first approach

## ✨ Funcionalidades

### 1. Autenticação

#### Página de Login
- Formulário com email e senha
- Validação em tempo real
- Mensagens de erro amigáveis
- Logo dinâmica da escola
- Tema claro/escuro integrado
- Link para gerenciamento de usuários

#### Gerenciamento de Usuários
- **Aba "Novo Usuário"**:
  - Cadastro com nome, email e senha
  - Validação de senha (mínimo 6 caracteres)
  - Confirmação de senha
  - Auto-login após cadastro

- **Aba "Redefinir Senha"**:
  - Reset direto sem token
  - Apenas email e nova senha
  - Confirmação de senha
  - Redirecionamento automático

#### Proteção de Rotas
- Verificação de autenticação
- Redirecionamento para login
- Token armazenado no localStorage
- Header Authorization automático

### 2. Dashboard

**Visão Geral:**
- Cards com estatísticas principais
- Totais de alunos, professores, turmas
- Gráficos de notas e frequência
- Atalhos rápidos
- Notificações e alertas

### 3. Gestão de Alunos

**Interface:**
- Tabela com listagem completa
- Busca e filtros
- Ordenação por colunas
- Paginação

**Formulário:**
- Dados pessoais
- Informações de contato
- Endereço completo
- Status ativo/inativo

**Ações:**
- ➕ Adicionar novo aluno
- ✏️ Editar dados
- 🗑️ Excluir aluno
- 👁️ Visualizar detalhes

### 4. Gestão de Professores

**Campos:**
- Dados pessoais
- CPF e especialização
- Contatos (email, telefone)
- Endereço completo
- Status ativo/inativo

**Recursos:**
- CRUD completo
- Validação de CPF único
- Listagem de disciplinas vinculadas

### 5. Gestão de Turmas

**Campos:**
- Nome da turma
- Série/ano
- Turno (manhã/tarde/noite)
- Ano letivo
- Status (ativa/inativa)

**Recursos:**
- Visualização de alunos matriculados
- Controle de capacidade
- Filtros por série e turno

### 6. Gestão de Disciplinas

**Campos:**
- Nome da disciplina
- Código único
- Carga horária
- Professor responsável
- Descrição

**Recursos:**
- Seleção de professor via dropdown
- Validação de código único
- Cálculo automático de carga horária total

### 7. Lançamento de Notas Avançado

**Interface de Seleção (3 etapas):**
1. **Seleção de Turma** - Botões visuais com nome, ano e período
2. **Seleção de Aluno** - Lista filtrada pela turma escolhida
3. **Seleção de Disciplina** - Cards com carga horária e professor

**Cards de Visualização:**

📘 **Cards dos Trimestres (3x):**
- Momento 1:
  - Avaliação 01 (0.0 - 10.0)
  - Avaliação 02 (0.0 - 10.0)
  - Avaliação 03 (0.0 - 10.0)
  - Média M1 (soma automática)
- Momento 2:
  - Avaliação EAC (0.0 - 10.0)
- Nota Final do Trimestre (maior entre M1 e EAC)
- Botão de edição em cada card

📊 **Card de Nota Final do Ano:**
- Exibe notas finais dos 3 trimestres
- Média Final calculada: `(T1×1 + T2×2 + T3×3) ÷ 6`
- Status visual:
  - 🟢 **APROVADO** (≥ 6.0) - Botão verde com ícone check
  - 🔴 **REPROVADO** (< 6.0) - Botão vermelho com ícone X
  - ⚪ **PENDENTE** - Aguardando lançamento de notas

**Modal de Edição:**
- Formulário intuitivo com campos numéricos
- Validação em tempo real (0.0 - 10.0)
- Cálculo automático da Média M1
- Campo de observações
- Botão "Salvar Notas" com feedback de salvamento

**Código de Cores:**
- 🟢 Verde: Nota ≥ 7.0
- 🟡 Amarela: Nota entre 5.0 e 6.9
- 🔴 Vermelha: Nota < 5.0

**Recursos:**
- Salvamento automático no banco de dados
- Atualização em tempo real de todas as médias
- Persistência de dados para relatórios
- Cálculos executados no backend
- Interface responsiva (desktop, tablet, mobile)
- Animações suaves e feedback visual

### 8. Controle de Frequência

**Interface:**
- Calendário para seleção de data
- Lista de alunos da turma
- Marcação rápida (presente/ausente/justificado)
- Campo de observações

**Recursos:**
- Salvamento em lote
- Relatórios de frequência
- Filtros por período
- Exportação de dados

### 9. Configurações

**Seções:**

**Dados da Escola:**
- Nome da escola
- Rede escolar
- Endereço completo
- Contatos (telefone, email)

**Personalização:**
- Upload de logo
- Preview em tempo real
- Tema claro/escuro
- Salvamento automático no localStorage

**Recursos:**
- Upload de imagem (drag & drop)
- Validação de tipo de arquivo
- Limite de tamanho (10MB)
- Sincronização em todas as páginas

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
VITE_API_URL=http://localhost:3333/api
```

### Scripts NPM

```bash
# Desenvolvimento
npm run dev              # Inicia Vite dev server (porta 5173)

# Build
npm run build            # Build de produção
npm run preview          # Preview do build

# Linting
npm run lint             # Executa ESLint
```

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

### Login (`/login`)
- Formulário de autenticação
- Logo da escola
- Link para gerenciamento de usuários
- Tema integrado

### Gerenciamento de Usuários (`/user-management`)
- Tabs para cadastro e reset
- Formulários validados
- Mensagens de sucesso/erro
- Sem necessidade de autenticação

### Dashboard (`/dashboard`)
- Visão geral do sistema
- Cards com estatísticas
- Gráficos e relatórios
- Atalhos rápidos

### CRUD Pages
- **Alunos** (`/alunos`)
- **Professores** (`/professores`)
- **Turmas** (`/turmas`)
- **Disciplinas** (`/disciplinas`)
- **Notas** (`/notas`)
- **Frequência** (`/frequencia`)

Todas seguem o padrão:
1. Listagem com tabela
2. Botão de adicionar
3. Modal/formulário de criação
4. Ações de editar/excluir
5. Validação de dados
6. Feedback visual

### Configurações (`/configuracoes`)
- Dados da escola
- Upload de logo
- Tema claro/escuro
- Sincronização global

## 🔄 Context API

### ThemeContext

**Localização:** `src/contexts/ThemeContext.tsx`

**Estado:**
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

**Funcionalidades:**
- Alterna entre tema claro e escuro
- Salva preferência no localStorage
- Aplica CSS variables dinamicamente
- Sincroniza em todas as páginas

**Uso:**
```tsx
const { theme, toggleTheme } = useTheme();
```

### AuthContext

**Localização:** `src/contexts/AuthContext.tsx`

**Estado:**
```typescript
interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  login: (token: string, user: Usuario) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
```

**Funcionalidades:**
- Gerencia estado de autenticação
- Armazena token e usuário
- Carrega dados do localStorage
- Fornece métodos de login/logout

**Uso:**
```tsx
const { user, isAuthenticated, logout } = useAuth();
```

## 🎨 Temas

### Variáveis CSS

**Tema Claro:**
```css
:root {
  --background-color: #f5f7fa;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --card-bg: #ffffff;
  --border-color: #e2e8f0;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --sidebar-bg: #1e293b;
  --success-color: #10b981;
  --danger-color: #ef4444;
}
```

**Tema Escuro:**
```css
[data-theme="dark"] {
  --background-color: #0f172a;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --card-bg: #1e293b;
  --border-color: #334155;
  --primary-color: #60a5fa;
  --primary-hover: #3b82f6;
  --sidebar-bg: #0f172a;
  --success-color: #34d399;
  --danger-color: #f87171;
}
```

### Alternância de Tema

```tsx
const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
};
```

## 🛣️ Roteamento

### Estrutura de Rotas

```tsx
<Routes>
  {/* Rotas Públicas */}
  <Route path="/login" element={<Login />} />
  <Route path="/user-management" element={<UserManagement />} />

  {/* Rotas Privadas */}
  <Route path="/" element={
    <PrivateRoute>
      <Layout />
    </PrivateRoute>
  }>
    <Route index element={<Navigate to="/dashboard" />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="alunos" element={<Alunos />} />
    <Route path="professores" element={<Professores />} />
    <Route path="turmas" element={<Turmas />} />
    <Route path="disciplinas" element={<Disciplinas />} />
    <Route path="notas" element={<Notas />} />
    <Route path="frequencia" element={<Frequencia />} />
    <Route path="configuracoes" element={<Configuracoes />} />
  </Route>
</Routes>
```

## 🌐 Cliente API

### Configuração

**Localização:** `src/lib/api.ts`

```typescript
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### APIs Disponíveis

```typescript
// Autenticação
export const authAPI = {
  login: (data: LoginData) => api.post('/auth/login', data),
  register: (data: RegisterData) => api.post('/auth/register', data),
  resetPasswordDirect: (data) => api.post('/auth/reset-password-direct', data),
  me: () => api.get('/auth/me'),
};

// Alunos
export const alunosAPI = {
  getAll: () => api.get('/alunos'),
  getById: (id: string) => api.get(`/alunos/${id}`),
  create: (data: AlunoInput) => api.post('/alunos', data),
  update: (id: string, data: Partial<AlunoInput>) => api.put(`/alunos/${id}`, data),
  delete: (id: string) => api.delete(`/alunos/${id}`),
};

// ... outras APIs
```

## 📱 Responsividade

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  .sidebar { width: 70px; }
  .menu-item span { display: none; }
  .user-details { display: none; }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar { width: 220px; }
}

/* Desktop */
@media (min-width: 1025px) {
  .sidebar { width: 280px; }
}
```

## 🎭 Animações

### Animações CSS

```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-50px, 50px); }
}
```

## 📊 Sistema de Notas - Fluxo Completo

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
