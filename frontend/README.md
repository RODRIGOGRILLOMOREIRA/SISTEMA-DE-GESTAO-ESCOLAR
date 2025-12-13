# 🎨 Frontend - Sistema de Gestão Escolar

Interface moderna e responsiva para gestão escolar desenvolvida com React, TypeScript e Vite. Sistema completo com dashboards analíticos, gráficos interativos e interface intuitiva.

[![React](https://img.shields.io/badge/React-18.2.0-61dafb)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF)](https://vitejs.dev/)

---

## 🛠️ Tecnologias

### Core
- **React 18.2.0** - Biblioteca UI
- **TypeScript 5.3.3** - JavaScript com tipagem
- **Vite 5.4.21** - Build tool ultra-rápido
- **React Router 6.20.1** - Roteamento SPA

### Bibliotecas
- **Axios 1.6.2** - Cliente HTTP
- **Recharts 2.10.0** - Gráficos e visualizações
- **Lucide React 0.294.0** - Ícones modernos
- **CSS3** - Estilização customizada

### DevTools
- **@types/react** 18.2.43 - Tipos TypeScript
- **ESLint** - Linter de código
- **@vitejs/plugin-react** - Plugin React para Vite

---

## 🎯 Funcionalidades Principais

### 1. Autenticação
- Login com JWT
- Rotas protegidas (PrivateRoute)
- Armazenamento de token em localStorage
- Logout automático em caso de erro

### 2. Dashboard (Redesenhado)
- **Cabeçalho premium**: Nome da escola + "SISTEMA DE GESTÃO ESCOLAR"
- **4 Cards em verde ciano**: Design moderno com gradiente
- **Hover interativo**: Cards invertem para branco com borda ciano
- **Ícones grandes**: 36px centralizados em círculo
- **Números destacados**: 3rem centralizados
- **Títulos em maiúsculas**: Com espaçamento de letras
- **Animações suaves**: Scale, hover e sombras dinâmicas
- Integração com configurações (busca nome da escola)

### 3. Gestão de Alunos
- CRUD completo
- Validação de CPF
- Busca e filtros
- Vinculação a turmas

### 4. Gestão de Professores
- Cadastro com área de atuação
- Seleção de disciplinas
- Vinculação a turmas

### 5. Gestão de Turmas
- Categorização (Anos Iniciais/Finais)
- Organização por ano e período
- Campo de ano letivo

### 6. Registro de Frequência
- Registro diário simplificado
- Seleção de data, período e disciplina
- Marcação de presença/falta
- Justificativas de ausência

### 7. Registro de Notas (Com Ano Letivo)
- **NOVO: Seletor de Ano Letivo** (1ª etapa obrigatória)
- Sistema em 4 etapas: Ano → Turma → Aluno → Disciplina
- Anos disponíveis buscados do calendário escolar
- Sistema trimestral (1º, 2º, 3º) isolado por ano
- Notas de 0 a 10 com validação
- Cálculo automático de média
- Status de aprovação (Aprovado/Recuperação/Reprovado)
- Sincronização automática com Relatórios

### 8. Calendário Escolar
- Gestão de anos letivos
- Cadastro de eventos (feriados, recessos, etc)
- Visualização de períodos

### 9. ⭐ Relatórios Analíticos (Página Principal)

#### Relatório de Frequência
- **Dashboard Completo**:
  * Gráfico de pizza (presenças vs faltas)
  * Gráfico de barras por aluno
  * Cards com estatísticas (total aulas, presenças, faltas, %)
  
- **Filtros Avançados**:
  * Seletor de ano letivo (integrado com calendário escolar)
  * Período: Dia Atual, Mês Atual, Trimestre, Ano Letivo Completo
  * Período Personalizado (data início/fim)
  
- **Tabela Individual**:
  * Dados de todos os alunos da turma
  * 6 colunas: Nome, Total Aulas, Presenças, Faltas, % Frequência, Status
  * Busca por nome de aluno
  * Status visual com badges (Frequência Adequada ≥75% / Atenção Necessária <75%)

#### Relatório de Notas (Verde Ciano)
- **Design Moderno**: Tema verde ciano (#00BCD4) substituindo verde tradicional
- **Dashboard Completo**:
  * Gráfico de pizza (aprovados/recuperação/reprovados)
  * Gráfico de barras de desempenho por aluno
  * **Filtrado automaticamente por ano letivo**
  * Cards com estatísticas (média turma, % aprovação)
  
- **Filtros**:
  * Seletor de trimestre (trim1, trim2, trim3, final)
  
- **Tabela Individual**:
  * Dados de todos os alunos da turma
  * 6 colunas: Nome, Trim 1, Trim 2, Trim 3, Média Final, Situação
  * Busca por nome de aluno
  * Status visual com badges coloridos

#### Recursos Gerais dos Relatórios
- Segmentação por Anos Iniciais (1-5) / Anos Finais (6-9)
- Seleção de turma com cards visuais
- Banner informativo sobre integração com calendário escolar
- Atualização automática ao mudar filtros
- Mensagens de feedback quando sem dados
- Design responsivo e moderno

---

## 🏗️ Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/                      # Componentes reutilizáveis
│   │   ├── Layout.tsx                   # Layout com menu lateral
│   │   ├── Layout.css                   # Estilos do layout
│   │   └── PrivateRoute.tsx             # Proteção de rotas
│   │
│   ├── pages/                           # Páginas da aplicação
│   │   ├── Login.tsx                    # Tela de login
│   │   ├── Login.css                    # Estilos do login
│   │   ├── Dashboard.tsx                # Dashboard inicial
│   │   ├── Alunos.tsx                   # Gestão de alunos
│   │   ├── Professores.tsx              # Gestão de professores
│   │   ├── Turmas.tsx                   # Gestão de turmas
│   │   ├── Frequencia.tsx               # Registro de frequência
│   │   ├── Notas.tsx                    # Registro de notas
│   │   ├── CalendarioEscolar.tsx        # Calendário escolar
│   │   ├── Relatorios.tsx               # ⭐ Relatórios (956 linhas)
│   │   └── Relatorios.css               # ⭐ Estilos relatórios (650+ linhas)
│   │
│   ├── lib/
│   │   └── api.ts                       # Cliente Axios configurado
│   │
│   ├── App.tsx                          # Configuração de rotas
│   ├── App.css                          # Estilos globais
│   ├── main.tsx                         # Ponto de entrada
│   └── vite-env.d.ts                    # Tipos do Vite
│
├── public/                              # Arquivos estáticos
├── index.html                           # HTML principal
├── package.json                         # Dependências
├── tsconfig.json                        # Configuração TypeScript
├── vite.config.ts                       # Configuração Vite
└── .env                                 # Variáveis de ambiente
```

---

## 📦 Instalação

### 1. Instalar Dependências

```powershell
cd frontend
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
VITE_API_URL=http://localhost:3333/api
```

### 3. Iniciar Servidor de Desenvolvimento

```powershell
npm run dev
```

✅ Frontend rodando em `http://localhost:5173`

---

## 🔧 Scripts Disponíveis

```powershell
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento (porta 5173)

# Produção
npm run build            # Gera build otimizado em /dist
npm run preview          # Visualiza build de produção

# Qualidade de Código
npm run lint             # Executa ESLint
```

---

## 📡 Integração com API

### Cliente Axios (lib/api.ts)

```typescript
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### Módulos de API

```typescript
// Alunos
export const alunosAPI = {
  getAll: () => api.get('/alunos'),
  getById: (id: string) => api.get(`/alunos/${id}`),
  getByTurma: (turmaId: string) => api.get(`/alunos/turma/${turmaId}`),
  create: (data) => api.post('/alunos', data),
  update: (id: string, data) => api.put(`/alunos/${id}`, data),
  delete: (id: string) => api.delete(`/alunos/${id}`),
}

// Frequência
export const frequenciaAPI = {
  getByTurma: (turmaId, dataInicio?, dataFim?) => 
    api.get(`/registro-frequencia/turma/${turmaId}`, {
      params: { dataInicio, dataFim }
    }),
}

// Notas
export const notasAPI = {
  getByTurma: (turmaId) => api.get(`/notas/turma/${turmaId}`),
}

// Calendário
export const calendarioAPI = {
  getAnos: () => api.get('/calendario'),
  getAno: (ano) => api.get(`/calendario/ano/${ano}`),
}
```

---

## 🎨 Página de Relatórios (Relatorios.tsx)

### Características Principais

**Arquivo**: 956 linhas  
**CSS**: 650+ linhas  
**Complexidade**: Alta (dashboards, gráficos, filtros, tabelas)

### Estrutura de Estado

```typescript
// Seleção de tipo e categoria
const [tipoRelatorio, setTipoRelatorio] = useState<'frequencia' | 'notas'>('frequencia')
const [categoriaAno, setCategoriaAno] = useState<'iniciais' | 'finais'>('iniciais')

// Seleção de turma
const [turmas, setTurmas] = useState<Turma[]>([])
const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null)

// Filtros de período (Frequência)
const [anoLetivo, setAnoLetivo] = useState<number>(new Date().getFullYear())
const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([])
const [periodoSelecionado, setPeriodoSelecionado] = useState<string>('mes')
const [usarDataCustom, setUsarDataCustom] = useState(false)
const [dataInicioCustom, setDataInicioCustom] = useState<string>('')
const [dataFimCustom, setDataFimCustom] = useState<string>('')

// Filtros de período (Notas)
const [trimestreSelecionado, setTrimestreSelecionado] = useState<string>('trim1')

// Dados e busca
const [frequenciaAlunos, setFrequenciaAlunos] = useState<FrequenciaAluno[]>([])
const [notasAlunos, setNotasAlunos] = useState<NotaAluno[]>([])
const [buscaAluno, setBuscaAluno] = useState<string>('')
```

### Funções de Carregamento de Dados

#### loadFrequenciaData()
1. Busca todos os alunos da turma via API
2. Inicializa array com zeros para todos os alunos
3. Determina período baseado em filtros (dia/mês/trimestre/ano/custom)
4. Se "ano letivo completo", busca datas do calendário escolar
5. Faz requisição GET /registro-frequencia/turma/:turmaId?dataInicio&dataFim
6. Processa `registro.presenca_aluno` (compatível com `registro.presencas`)
7. Calcula estatísticas por aluno (totalAulas, presencas, faltas, percentual)
8. Atualiza estado
9. **Console logs**: Debug de dados recebidos e processados

#### loadNotasData()
1. Busca todos os alunos da turma via API
2. Inicializa array com notas vazias
3. Faz requisição GET /notas/turma/:turmaId
4. Agrupa notas por aluno
5. Extrai trim1, trim2, trim3 e final (se existirem)
6. Calcula mediaFinal e situacao (Aprovado/Reprovado/Aguardando)
7. Atualiza estado
8. **Console logs**: Debug de dados recebidos

### Componentes Visuais

#### Gráficos (Recharts)
- **PieChart**: Presenças vs Faltas / Aprovados vs Reprovados
- **BarChart**: Frequência individual / Desempenho por aluno
- Cores personalizadas e responsivos

#### Filtros de Período
- Seletor de ano letivo (anos do calendário escolar)
- Botões de período (Dia/Mês/Trimestre/Ano)
- Checkbox para período personalizado
- Inputs de data início/fim
- Banner informativo (azul) explicando integração com calendário

#### Tabelas de Dados Individuais
- Filtro de busca por nome
- 6 colunas de dados
- Badges coloridos para status
- Scroll interno
- Design responsivo

---

## ⚠️ Correções Importantes Aplicadas

### 1. Campo presenca_aluno (Relatorios.tsx)
**Problema**: Backend retorna `presenca_aluno`, frontend buscava `presencas`.

**Correção Aplicada** (Linhas 215-238):
```typescript
// ANTES (ERRADO):
const presencas = registro.presencas || []  // ❌

// DEPOIS (CORRETO com fallback):
const presencas = registro.presenca_aluno || registro.presencas || []  // ✅
```

### 2. Debug Logging
Adicionados console.logs para rastreamento:
```typescript
console.log('📊 Dados recebidos do backend:', {
  registros: registros.length,
  primeroRegistro: registros[0],
  presencas: registros[0]?.presenca_aluno?.length
})

console.log('📊 Dados calculados:', {
  aluno: alunoId,
  totalAulas: estadoAluno.totalAulas,
  presencas: estadoAluno.presencas,
  faltas: estadoAluno.faltas
})
```

---

## 🎨 Design System

### Cores
- **Primary**: #4CAF50 (Verde) - Ações positivas
- **Secondary**: #2196F3 (Azul) - Informações
- **Warning**: #ff9800 (Laranja) - Alertas
- **Danger**: #f44336 (Vermelho) - Erros
- **Success**: #4CAF50 (Verde) - Sucesso

### Badges de Status
```css
/* Frequência */
.badge-success {  /* ≥75% */
  background: #d4edda;
  color: #155724;
}

.badge-warning {  /* <75% */
  background: #fff3cd;
  color: #856404;
}

/* Notas */
.badge-aprovado {
  background: #d4edda;
  color: #155724;
}

.badge-reprovado {
  background: #f8d7da;
  color: #721c24;
}

.badge-aguardando {
  background: #e2e3e5;
  color: #383d41;
}
```

### Responsividade
- Desktop: Layout completo
- Tablet: Grid adaptativo
- Mobile: Colunas empilhadas

---

## 🎨 Design System Atualizado

### Paleta de Cores
- **Primária**: Verde Ciano (#00BCD4, #00ACC1) - todos os elementos ativos
- **Fundos**: Cinza intermediário (#f5f5f5, #fafafa) para melhor contraste
- **Modo Escuro**: Texto ajustado para visibilidade perfeita em todas as variações

### Efeitos Interativos
- **Hover**: translateY(-2px) + sombra colorida ampliada
- **Active**: scale(0.98) para feedback tátil instantâneo
- **Animação Pulso**: Elementos selecionados pulsam suavemente (pulseGlow)
- **Transições**: 0.2s-0.3s ease para fluidez perfeita

### Componentes Modernizados
- **Dashboard**: Cards com gradiente verde ciano e hover invertido
- **Relatórios**: Botões de turma com largura total e distribuição uniforme
- **Ícones**: Lucide React com tamanhos variados (24px-36px)
- **Animações CSS**: @keyframes pulseGlow para seleção
- **Feedback Visual**: Sombras coloridas e escalas em todas as ações
- **Responsividade**: Media queries para mobile, tablet e desktop

---

## 🔐 Autenticação

### Fluxo de Login
1. Usuário acessa `/login`
2. Insere credenciais
3. Frontend faz POST `/api/auth/login`
4. Armazena token em `localStorage`
5. Redireciona para `/dashboard`

### Rotas Protegidas
```typescript
<Route element={<PrivateRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/alunos" element={<Alunos />} />
  {/* ... outras rotas ... */}
</Route>
```

### Logout
```typescript
const handleLogout = () => {
  localStorage.removeItem('token')
  navigate('/login')
}
```

---

## 📱 Menu de Navegação

```
📚 Sistema de Gestão Escolar
├── 🏠 Dashboard
├── 👨‍🎓 Alunos
├── 👨‍🏫 Professores
├── 🏫 Turmas
├── 📝 Frequência
├── 📊 Notas
├── 📅 Calendário Escolar
└── 📈 Relatórios
```

---

## 🚀 Deploy para Produção

### Build
```powershell
npm run build
```

Gera pasta `/dist` com arquivos otimizados.

### Preview
```powershell
npm run preview
```

### Hospedagem Sugerida
- **Vercel** (recomendado para Vite)
- **Netlify**
- **GitHub Pages**

### Configuração de Ambiente
Atualizar `.env` para produção:
```env
VITE_API_URL=https://api.seudominio.com/api
```

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

**Versão**: 1.0.0  
**Última Atualização**: Dezembro 2024  
**Porta**: 5173 (desenvolvimento)
