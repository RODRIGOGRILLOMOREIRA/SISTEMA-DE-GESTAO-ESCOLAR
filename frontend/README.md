# 🎨 Frontend - Sistema de Gestão Escolar

Interface moderna e responsiva para gestão escolar desenvolvida com React, TypeScript e Vite. Design premium com tema ciano, animações sofisticadas e responsividade completa para todos os dispositivos.

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
- **Google Fonts (Poppins)** - Tipografia premium

### Estilização
- **CSS3 Avançado** - Gradientes, animações e transições
- **CSS Variables** - Temas dinâmicos (claro/escuro)
- **Flexbox & Grid** - Layouts responsivos
- **Media Queries** - 5 breakpoints (320px, 480px, 640px, 768px, 1024px, 1280px+)

### DevTools
- **@types/react** 18.2.43 - Tipos TypeScript
- **ESLint** - Linter de código
- **@vitejs/plugin-react** - Plugin React para Vite

---

## 🎨 Sistema de Design

### Paleta de Cores

**Primárias (Tema Ciano):**
- `#00BCD4` - Ciano principal
- `#00ACC1` - Ciano médio
- `#0097A7` - Ciano escuro

**Secundárias (Ações):**
- `#3b82f6` - Azul principal
- `#2563eb` - Azul escuro

**Backgrounds:**
- `#d0d0d0` - Fundo claro (modo light)
- `#0f172a` - Fundo escuro (modo dark)
- `#263238` - Dark gray inicial (gradientes)
- `#37474f` - Dark gray final (gradientes)

### Tipografia (Poppins)

- **Weights**: 400 (Regular), 600 (SemiBold), 700 (Bold), 800 (ExtraBold), 900 (Black)
- **Headers**: 1.8rem - 2.5rem com weight 700-900
- **Body**: 0.875rem - 1rem com weight 400-600
- **Buttons**: 0.9rem - 1rem com weight 600-700

### Efeitos Visuais

**Animações CSS:**
```css
/* Gradiente animado */
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Rotating radial */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Shine effect */
@keyframes shine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

/* Text glow */
@keyframes textGlow {
  0%, 100% { text-shadow: 0 0 10px rgba(0, 188, 212, 0.5); }
  50% { text-shadow: 0 0 20px rgba(0, 188, 212, 0.8); }
}
```

**Pseudo-elementos:**
- `::before` - Rotating radial gradient backgrounds
- `::after` - Shine sliding effects

**Bordas e Sombras:**
- Bordas: 3px solid #00BCD4
- Border-radius: 16px - 20px
- Box-shadow: Múltiplas camadas com rgba ciano
- Text-shadow: Contorno e brilho em textos

### Responsividade

**Breakpoints:**
- `1280px+` - Desktop Full HD
- `1024px - 1280px` - Notebook / Tablet landscape
- `768px - 1024px` - Tablet portrait
- `640px - 768px` - Mobile large
- `480px - 640px` - Mobile medium
- `< 480px` - Mobile small

**Layout Mobile (< 640px):**
- Sidebar horizontal fixa inferior (70px)
- Menu em linha com scroll
- Grid 1 coluna
- Botões largura total
- Modais 95-98% da tela

---

## 🎯 Funcionalidades Principais

### 1. Autenticação
- Login com JWT
- Rotas protegidas (PrivateRoute)
- Armazenamento de token em localStorage
- Logout automático em caso de erro

### 2. Dashboard Premium (Redesenhado Completo)

**Cabeçalho com Gradiente Animado:**
- Background: linear-gradient(135deg, #00BCD4, #00ACC1, #0097A7)
- Animação: gradientShift 6s + fadeInDown 0.8s
- Bordas: 3px solid rgba(255,255,255,0.3)
- Efeitos: Rotating radial + shine effect
- Título: "E.E.E.F.CENTENÁRIO SISTEMA DE GESTÃO ESCOLAR"
- Tipografia: Poppins 900 com text-stroke

**4 Cards Modernos:**
- Background: linear-gradient(135deg, #263238, #37474f)
- Bordas: 3px solid #00BCD4 com cantos 16px
- Ícones: 60px em círculo com gradiente
- Números: 3rem centralizados
- Títulos: uppercase com letter-spacing
- Box-shadow: Múltiplas camadas ciano

**Hover Interativo:**
- Transição para gradiente ciano animado
- Scale transform + translateY(-4px)
- Rotating radial ativado
- Shine effect deslizante
- Box-shadow intensificado

### 3. Layout e Navegação

**Sidebar (Layout.css - 449 linhas):**

*Desktop (> 1024px):*
- Largura: 280px fixa à esquerda
- Background: #0f172a (dark mode color)
- Bordas: 3px ciano no lado direito com cantos arredondados
- Header: Logo + nome da escola + rede com gradiente ciano
- Menu: Itens com ícones + texto, hover ciano
- Footer: Info do usuário + botão logout

*Tablet (768px - 1024px):*
- Largura: 70px compacta
- Apenas ícones (textos ocultos)
- Border direita ciano linear

*Mobile (< 640px):*
- Sidebar horizontal inferior (70px altura)
- Menu em linha com scroll horizontal
- Header e footer ocultos
- Fixed bottom com z-index 1000

**Área de Conteúdo:**

*Modo Claro:*
- Background: #d0d0d0
- Bordas: 3px ciano com cantos 20px
- Margens: 16px com ajustes responsivos

*Modo Escuro:*
- Background: #0f172a
- Mesmas bordas e efeitos de brilho
- Box-shadow com rgba ciano

### 4. Componentes Unificados

**Botões Padronizados (ModernPages.css):**

`.btn-voltar` - Botão Azul de Retorno:
```css
background: linear-gradient(135deg, #3b82f6, #2563eb);
border: 2px solid rgba(255,255,255,0.3);
border-radius: 10px;
/* Rotating radial + hover effects */
/* Sempre à direita, ícone 16px */
```

`.btn-primary` - Ações Principais:
```css
background: linear-gradient(135deg, #3b82f6, #2563eb);
/* Rotating radial background */
/* Hover: scale(1.05) + sombras */
```

`.selection-btn` - Botões de Seleção:
```css
background: linear-gradient(135deg, #263238, #37474f);
border: 3px solid #00BCD4;
border-radius: 16px;
padding: 24px;
/* Hover: gradiente ciano animado */
/* Active: double animations */
/* Dark mode: ciano por padrão */
```

**Headers de Página:**
```css
.page-header {
  background: linear-gradient(135deg, #00BCD4, #00ACC1, #0097A7);
  background-size: 200% 200%;
  border-radius: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  animation: fadeInDown 0.8s, gradientShift 6s infinite;
  /* Rotating radial + shine effects */
}
```

**Cards de Seleção (Anos Iniciais/Finais, Turmas):**
- Grid 2 colunas centralizado (max-width 600px)
- Header com ícone + "Selecione a Categoria"
- Botões com mesma classe `.selection-btn`
- Responsivo: 2 cols → 1 col em mobile

### 5. Páginas Modernas (ModernPages.css - 680+ linhas)

**Páginas Unificadas:**
- Disciplinas
- Frequência / Registro de Frequência
- Notas
- Relatórios
- Configurações

**Características Comuns:**
- Header com gradiente ciano animado
- Contêineres com borda ciano 3px
- Max-width: 1300px centralizado
- Formulários com labels escuras e inputs claros
- Tabelas com scroll horizontal
- Botões de ação (edit/delete) estilizados
- Modais responsivos

### 6. Responsividade Completa

**Arquivos CSS com Media Queries:**

1. **Layout.css** (449 linhas + 130 linhas responsivas):
   - Desktop: Sidebar 280px completa
   - Tablet: Sidebar 70px compacta
   - Mobile: Sidebar horizontal 70px inferior
   - 4 breakpoints: 1024px, 768px, 640px, 480px

2. **Dashboard.css** (352 linhas + 120 linhas responsivas):
   - Grid adaptativo: 3 cols → 2 cols → 1 col
   - Cards: 24px padding → 14px → 12px
   - Ícones: 60px → 48px → 40px → 36px
   - Títulos: 2.5rem → 1.6rem → 1.1rem → 1rem
   - 5 breakpoints completos

3. **ModernPages.css** (533 linhas + 150 linhas responsivas):
   - Headers: 1.8rem → 1.6rem → 1.3rem → 1rem
   - Padding: 2rem → 1.5rem → 1rem → 0.5rem
   - Botões: Largura total em mobile
   - Tabelas: Scroll horizontal
   - Formulários: Grid 1 coluna em mobile

4. **Notas.css** (739 linhas + 100 linhas responsivas):
   - Selection grid: 3 cols → 2 cols → 1 col
   - Botões: 24px padding → 16px → 12px
   - Títulos: 1rem → 0.9rem → 0.8rem
   - Nivel-ensino: Coluna em mobile

5. **Modal.css** (253 linhas + 90 linhas responsivas):
   - Largura: 1200px → 900px → 600px → 95%
   - Altura: 90vh → 95vh → 98vh
   - Botões: Empilhados em mobile
   - Forms: 1 coluna em mobile

**Dispositivos Suportados:**

📱 **Smartphones (320px - 640px):**
- iPhone SE (375px)
- iPhone 12/13 (390px)
- iPhone 14 Pro Max (430px)
- Galaxy S20 (360px)
- Pixel 5 (393px)

📱 **Tablets (640px - 1024px):**
- iPad Mini (768px)
- iPad Air (820px)
- iPad Pro (1024px)
- Surface Pro (912px)

💻 **Notebooks (1024px - 1440px):**
- 1366x768 (padrão)
- 1440x900
- 1536x864

🖥️ **Desktops (1440px+):**
- Full HD 1920x1080
- 2K 2560x1440
- 4K 3840x2160

**Testes Recomendados:**
1. Chrome DevTools (Ctrl+Shift+M)
2. Dispositivos reais
3. Redimensionamento manual da janela
4. Orientação portrait e landscape

### 7. Gestão de Alunos
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
