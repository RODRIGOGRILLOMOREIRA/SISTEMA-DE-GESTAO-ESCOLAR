# ⚛️ Frontend - Sistema de Gestão Escolar

Interface web moderna e responsiva para o Sistema de Gestão Escolar, construída com React, TypeScript e Vite.

## 📋 Visão Geral

Frontend completo que oferece uma experiência de usuário intuitiva e moderna para gerenciar todos os aspectos de uma instituição de ensino. Interface totalmente responsiva com tema claro/escuro, navegação fluida e feedback visual em tempo real.

## 🛠️ Tecnologias

- **Runtime**: Node.js 18+
- **Linguagem**: TypeScript 5.3
- **Framework UI**: React 18.2
- **Build Tool**: Vite 5.0
- **Roteamento**: React Router DOM 6.20
- **Cliente HTTP**: Axios 1.6
- **Ícones**: Lucide React 0.294
- **PDF**: jsPDF 3.0 + jsPDF-AutoTable 5.0
- **Gráficos**: Recharts 2.10
- **Planilhas**: XLSX 0.18
- **IA**: face-api.js - Reconhecimento facial

## 🌟 Funcionalidades Principais

### 🔐 Autenticação e Segurança
- Login com validação JWT
- Registro de novos usuários
- Recuperação de senha
- Controle de permissões por cargo
- Rotas protegidas (PrivateRoute)
- Logout seguro

### 👥 Gestão de Pessoas
- **Alunos**: CRUD completo com foto, dados pessoais, responsáveis
- **Professores**: Gestão de docentes com vinculação a disciplinas
- **Funcionários**: Controle de colaboradores administrativos
- **Equipe Diretiva**: Gestão de direção, coordenação e supervisão

### 📚 Gestão Acadêmica
- **Turmas**: Organização por série, turno, ano letivo
- **Disciplinas**: Cadastro com autocomplete inteligente
- **Vinculação**: Disciplina-Turma-Professor
- **Grade Horária**: Montagem visual interativa com drag-and-drop
- **Calendário Escolar**: Gerenciamento de eventos, feriados e períodos

### 📊 Avaliação e Desempenho
- **Sistema de Notas**: 
  - Registro por trimestre
  - Múltiplas avaliações (A1, A2, A3, Recuperação)
  - Cálculo automático de médias
  - Visualização por turma e aluno
  
- **Controle de Frequência**:
  - Registro diário de presença
  - Justificativas de ausências
  - Percentual de frequência automático
  - Relatórios por período
  
- **Boletim de Desempenho**:
  - Visualização completa do rendimento
  - Notas de todas as disciplinas
  - Percentual de frequência
  - Média geral e situação
  - Geração de PDF com logo da escola
  - Exportação para Excel

### 🎯 Registro de Habilidades BNCC
- **Base Completa**: 334+ habilidades da Base Nacional Comum Curricular
- **Organização por**:
  - Componente curricular (Língua Portuguesa, Matemática, Ciências, História, Geografia)
  - Ano escolar (1º ao 9º ano)
  - Categoria (Anos Iniciais 1º-5º / Anos Finais 6º-9º)
  
- **Funcionalidades**:
  - Navegação hierárquica: Categoria → Turma → Aluno → Disciplina
  - Visualização de todas as habilidades por componente/ano
  - Cards individuais com código BNCC e descrição completa
  - Status de desenvolvimento:
    - 🔴 Não Iniciado
    - 🟡 Em Desenvolvimento
    - 🟢 Desenvolvido
  - Atribuição por trimestre (1º, 2º, 3º)
  - Habilitar/desabilitar habilidades individuais
  - Interface responsiva com grid adaptativo
  - Salvamento de registros

### ⏰ Controle de Ponto
- **Cadastro Facial com IA**:
  - Detecção automática de rosto
  - Captura e armazenamento de descritores faciais
  - Interface guiada passo a passo
  - Suporte a múltiplos registros
  
- **Reconhecimento Facial**:
  - Identificação automática via webcam
  - Validação de similaridade
  - Registro automático de entrada/saída
  - Feedback visual em tempo real
  
- **Relatórios de Ponto**:
  - Visualização por funcionário
  - Filtros por período e departamento
  - Listagem de entradas e saídas
  - Geração de comprovantes em PDF
  - Consolidação mensal

### 📈 Relatórios e Dashboards
- **Dashboard Principal**:
  - Cards com estatísticas gerais
  - Total de alunos, professores, funcionários
  - Total de turmas e disciplinas
  - Tema personalizável
  
- **Relatórios Disponíveis**:
  - Desempenho por turma
  - Frequência por período
  - Consolidado de ponto
  - Boletins individuais
  - Exportação múltiplos formatos (PDF, Excel)

### 🎨 Interface e UX
- **Tema Claro/Escuro**:
  - Alternância com um clique
  - Persistência no localStorage
  - Transições suaves
  - Design consistente
  
- **Layout Responsivo**:
  - Desktop (telas grandes)
  - Tablet (telas médias)
  - Mobile (telas pequenas)
  - Sidebar colapsável
  
- **Componentes Modernos**:
  - Modais elegantes
  - Formulários validados
  - Feedback visual
  - Loading states
  - Confirmações de ações
  - Mensagens de erro/sucesso

## 📁 Estrutura de Pastas

```
frontend/
├── src/
│   ├── components/              # Componentes reutilizáveis
│   │   ├── Layout.tsx          # Layout principal com sidebar
│   │   ├── Layout.css
│   │   ├── BackButton.tsx      # Botão de voltar padronizado
│   │   ├── PrivateRoute.tsx    # Proteção de rotas
│   │   ├── Modal.css           # Estilos de modais
│   │   ├── CadastroFacial.tsx  # Registro facial com IA
│   │   ├── CadastroFacial.css
│   │   ├── ReconhecimentoFacialIA.tsx  # Reconhecimento facial
│   │   ├── ReconhecimentoFacialIA.css
│   │   ├── CalendarioEscolar.tsx
│   │   ├── CalendarioEscolar.css
│   │   ├── GradeHoraria.tsx
│   │   ├── GradeHoraria.css
│   │   ├── RegistroFrequencia.tsx
│   │   ├── RegistroFrequencia.css
│   │   └── RelatorioGeralPonto.tsx
│   │
│   ├── contexts/               # Context API
│   │   ├── AuthContext.tsx    # Gerenciamento de autenticação
│   │   └── ThemeContext.tsx   # Tema claro/escuro
│   │
│   ├── data/                  # Base de dados estática
│   │   └── habilidadesBNCC.ts # 334+ habilidades BNCC
│   │
│   ├── config/               # Configurações
│   │   └── reconhecimento.config.ts
│   │
│   ├── lib/                   # Bibliotecas e utilitários
│   │   ├── api.ts            # Cliente Axios configurado
│   │   └── permissions.ts    # Verificação de permissões
│   │
│   ├── pages/                # Páginas da aplicação
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── UserManagement.tsx
│   │   ├── Auth.css          # Estilos de autenticação
│   │   │
│   │   ├── Dashboard.tsx     # Dashboard principal
│   │   ├── Dashboard.css
│   │   │
│   │   ├── Alunos.tsx        # Gestão de alunos
│   │   ├── Professores.tsx   # Gestão de professores
│   │   ├── Funcionarios.tsx  # Gestão de funcionários
│   │   ├── EquipeDiretiva.tsx # Gestão de equipe diretiva
│   │   ├── EquipeDiretiva.css
│   │   │
│   │   ├── Turmas.tsx        # Gestão de turmas
│   │   ├── Disciplinas.tsx   # Gestão de disciplinas
│   │   ├── DisciplinasAutocomplete.css
│   │   │
│   │   ├── Notas.tsx         # Sistema de notas
│   │   ├── Notas.css
│   │   ├── FrequenciaPage.tsx # Controle de frequência
│   │   ├── Frequencia.tsx
│   │   ├── BoletimDesempenho.tsx # Boletim completo
│   │   ├── BoletimDesempenho.css
│   │   ├── Habilidades.tsx   # Registro de habilidades BNCC
│   │   ├── Habilidades.css
│   │   │
│   │   ├── CalendarioEscolarPage.tsx # Calendário
│   │   ├── GradeHorariaPage.tsx # Grade horária
│   │   ├── RegistroPonto.tsx # Controle de ponto
│   │   ├── CadastroFacialIA.tsx # Cadastro facial
│   │   ├── CadastroFacialIA.css
│   │   │
│   │   ├── Relatorios.tsx    # Central de relatórios
│   │   ├── Relatorios.css
│   │   ├── Configuracoes.tsx # Configurações do sistema
│   │   ├── Configuracoes.css
│   │   │
│   │   ├── CommonPages.css   # Estilos compartilhados
│   │   └── ModernPages.css   # Estilos modernos padronizados
│   │
│   ├── App.tsx               # Componente raiz e rotas
│   ├── main.tsx             # Ponto de entrada
│   ├── index.css           # Estilos globais
│   └── vite-env.d.ts      # Tipos do Vite
│
├── public/
│   └── models/              # Modelos de reconhecimento facial
│       ├── face_expression_model-*
│       ├── face_landmark_68_model-*
│       ├── face_recognition_model-*
│       └── tiny_face_detector_model-*
│
├── uploads/                # Arquivos temporários
│   ├── reconhecimento-facial/
│   └── registro-ponto/
│
├── index.html             # HTML principal
├── .env                  # Variáveis de ambiente
├── .env.example         # Exemplo de variáveis
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
# URL da API Backend
VITE_API_URL=http://localhost:3333
```

## 🚀 Instalação e Execução

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
# Aplicação rodando em http://localhost:5173
```

### 4. Build para Produção

```bash
npm run build
# Arquivos gerados em: dist/
```

### 5. Preview do Build

```bash
npm run preview
```

## 📱 Rotas da Aplicação

### Públicas
- `/` - Login
- `/register` - Registro de usuário
- `/forgot-password` - Recuperação de senha

### Privadas (Requerem Autenticação)

**Gestão de Pessoas**
- `/dashboard` - Dashboard principal
- `/alunos` - Gestão de alunos
- `/professores` - Gestão de professores
- `/funcionarios` - Gestão de funcionários
- `/equipe-diretiva` - Gestão de equipe diretiva

**Gestão Acadêmica**
- `/turmas` - Gestão de turmas
- `/disciplinas` - Gestão de disciplinas
- `/notas` - Sistema de notas
- `/frequencia` - Controle de frequência
- `/boletim` - Boletim de desempenho
- `/habilidades` - Registro de habilidades BNCC

**Planejamento**
- `/calendario` - Calendário escolar
- `/grade-horaria` - Grade horária

**Controle de Ponto**
- `/registro-ponto` - Controle de ponto
- `/cadastro-facial` - Cadastro facial com IA

**Sistema**
- `/relatorios` - Central de relatórios
- `/configuracoes` - Configurações gerais
- `/usuarios` - Gestão de usuários

## 🎨 Temas e Personalização

O sistema suporta dois temas:
- **Claro**: Design clean com fundo branco
- **Escuro**: Design confortável para uso noturno

A preferência é salva automaticamente no localStorage.

## 📊 Geração de Documentos

### PDF
- Boletins escolares com logo
- Comprovantes de ponto
- Relatórios formatados

### Excel
- Frequências por período
- Listagens de alunos
- Consolidados diversos

## 🔒 Segurança

- Tokens JWT armazenados com segurança
- Validação de formulários no cliente
- Proteção de rotas sensíveis
- Logout automático em caso de token inválido
- Criptografia de dados sensíveis

## 🌐 Navegadores Suportados

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## 📦 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Gera build de produção
npm run preview      # Preview do build
npm run lint         # Verifica código com ESLint
```

## 🎯 Melhorias Futuras

- [ ] Progressive Web App (PWA)
- [ ] Notificações push
- [ ] Chat em tempo real
- [ ] Vídeo conferência integrada
- [ ] Editor de documentos colaborativo
- [ ] Integração com Google Classroom
- [ ] App mobile React Native

## 👨‍💻 Desenvolvimento

### Estrutura de Componentes

Os componentes seguem o padrão:
- Componentes reutilizáveis em `/components`
- Páginas completas em `/pages`
- Estilos colocalizados (.tsx + .css)
- Context API para estado global

### Boas Práticas

- TypeScript para type safety
- Componentes funcionais com hooks
- CSS modules quando necessário
- Validação de formulários
- Tratamento de erros
- Loading states
- Mensagens de feedback

---

Desenvolvido com ❤️ usando React + TypeScript + Vite


## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
# URL da API backend
VITE_API_URL=http://localhost:3333/api
```

## 🚀 Instalação e Execução

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis

Crie o arquivo `.env` com a URL do backend.

### 3. Iniciar Servidor

**Modo Desenvolvimento** (com hot-reload):
```bash
npm run dev
```

Acesse: **http://localhost:5173**

**Build para Produção**:
```bash
npm run build
```

**Preview do Build**:
```bash
npm run preview
```

## 🎨 Design System

### Cores Principais

```css
/* Primárias */
--primary: #10b981;      /* Verde principal */
--primary-hover: #059669; /* Verde hover */
--secondary: #00BCD4;    /* Azul ciano */

/* Estados */
--success: #16a34a;      /* Verde sucesso */
--warning: #f59e0b;      /* Amarelo alerta */
--error: #ef4444;        /* Vermelho erro */
--info: #3b82f6;         /* Azul informação */

/* Neutras */
--background: #f8fafc;   /* Fundo claro */
--surface: #ffffff;      /* Superfícies */
--text: #1e293b;         /* Texto principal */
--text-light: #64748b;   /* Texto secundário */
```

### Tipografia

- **Font Family**: 'Segoe UI', system-ui, -apple-system
- **Tamanhos Responsivos**: Uso de `clamp()` para fluidez
- **Pesos**: 400 (normal), 600 (semibold), 700 (bold), 800 (extrabold)

### Layout Responsivo

```css
/* Mobile First */
320px  - Mobile pequeno
375px  - Mobile padrão
768px  - Tablet
1024px - Desktop
1440px - Desktop large
1920px+ - 4K/Ultrawide
```

## 📱 Páginas e Rotas

### Públicas (sem autenticação)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/login` | Login.tsx | Autenticação de usuários |
| `/register` | Register.tsx | Cadastro de novos usuários |
| `/forgot-password` | ForgotPassword.tsx | Recuperação de senha |
| `/user-management` | UserManagement.tsx | Gestão de credenciais |

### Privadas (requer autenticação)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/dashboard` | Dashboard.tsx | Painel inicial com estatísticas |
| `/alunos` | Alunos.tsx | Gestão de alunos |
| `/professores` | Professores.tsx | Gestão de professores |
| `/funcionarios` | Funcionarios.tsx | Gestão de funcionários |
| `/equipe-diretiva` | EquipeDiretiva.tsx | Gestão da equipe diretiva |
| `/turmas` | Turmas.tsx | Gestão de turmas |
| `/disciplinas` | Disciplinas.tsx | Gestão de disciplinas com autocomplete de professores |
| `/notas` | Notas.tsx | Lançamento de notas |
| `/frequencia` | FrequenciaPage.tsx | Registro de frequências |
| `/boletim` | BoletimDesempenho.tsx | Boletim do aluno |
| `/calendario-escolar` | CalendarioEscolarPage.tsx | Calendário anual |
| `/grade-horaria` | GradeHorariaPage.tsx | Grade de horários |
| `/registro-ponto` | RegistroPonto.tsx | Controle de ponto |
| `/relatorios` | Relatorios.tsx | Relatórios gerais |
| `/configuracoes` | Configuracoes.tsx | Configurações do sistema |

## 🔑 Autenticação

### Context API

O `AuthContext` gerencia o estado de autenticação:

```typescript
// Uso
import { useAuth } from '@/contexts/AuthContext'

function Component() {
  const { user, token, login, logout, isAuthenticated } = useAuth()
  
  // user: dados do usuário logado
  // token: JWT token
  // isAuthenticated: boolean
  // login(token, user): função para fazer login
  // logout(): função para fazer logout
}
```

### LocalStorage

- `token`: JWT armazenado
- `user`: Dados do usuário (JSON)

### Proteção de Rotas

```typescript
<Route path="/dashboard" element={
  <PrivateRoute>
    <Dashboard />
  </PrivateRoute>
} />
```

## 🎨 Tema Claro/Escuro

### ThemeContext

```typescript
import { useTheme } from '@/contexts/ThemeContext'

function Component() {
  const { theme, toggleTheme } = useTheme()
  
  // theme: 'light' | 'dark'
  // toggleTheme(): alterna entre temas
}
```

### Implementação CSS

O tema é aplicado via classe no `<html>`:

```css
/* Tema Claro (padrão) */
:root { ... }

/* Tema Escuro */
html.dark {
  --background: #0f172a;
  --surface: #1e293b;
  --text: #f1f5f9;
}
```

## 📡 API Client

O arquivo `lib/api.ts` configura o Axios:

```typescript
import { api } from '@/lib/api'

// GET
const response = await api.get('/alunos')

// POST
await api.post('/alunos', { nome: 'João', ... })

// PUT
await api.put('/alunos/123', { nome: 'João Silva' })

// DELETE
await api.delete('/alunos/123')
```

### Interceptors

- **Request**: Adiciona token JWT automaticamente
- **Response**: Log de requisições e tratamento de erros

### APIs Disponíveis

```typescript
// Exemplo de uso
import { alunosAPI, turmasAPI, notasAPI } from '@/lib/api'

// Buscar alunos
const alunos = await alunosAPI.getAll()

// Buscar por ID
const aluno = await alunosAPI.getById('123')

// Criar novo
await alunosAPI.create({ nome: 'João', ... })

// Atualizar
await alunosAPI.update('123', { nome: 'João Silva' })

// Deletar
await alunosAPI.delete('123')
```

## 📊 Geração de PDFs

### jsPDF + AutoTable

Exemplo do BoletimDesempenho:

```typescript
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const doc = new jsPDF()

// Cabeçalho com logo
doc.addImage(logoBase64, 'PNG', x, y, width, height)

// Tabelas
autoTable(doc, {
  head: [['Disciplina', 'T1', 'T2', 'T3', 'Média']],
  body: dadosNotas,
  theme: 'grid',
  styles: { fontSize: 10 }
})

// Salvar
doc.save('boletim.pdf')
```

## 📈 Gráficos

### Recharts

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

<LineChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="value" stroke="#10b981" />
</LineChart>
```

## 📥 Exportação Excel

### XLSX

```typescript
import * as XLSX from 'xlsx'

// Criar workbook
const ws = XLSX.utils.json_to_sheet(data)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'Relatório')

// Download
XLSX.writeFile(wb, 'relatorio.xlsx')
```

## 🔒 Permissões

### Verificação de Níveis

```typescript
import { isAdmin, isProfessor, canAccessPage } from '@/lib/permissions'

if (isAdmin(user)) {
  // Acesso total
}

if (isProfessor(user)) {
  // Acesso de professor
}

if (canAccessPage(user, '/notas')) {
  // Pode acessar página de notas
}
```

## 🎯 Funcionalidades Especiais

### Boletim de Desempenho

- Visualização completa de notas e frequências
- Cálculo automático de médias: `(T1×3 + T2×3 + T3×4)÷10`
- Status visual: Aprovado/Reprovado com cores
- Geração de PDF com logo da escola
- Seleção de período (trimestre ou anual)

### Dashboard

- Estatísticas em tempo real
- Gráficos de desempenho
- Indicadores de alunos, turmas, professores
- Alertas de frequência baixa
- Visão geral do sistema

### Registro de Ponto

- Múltiplos tipos: Entrada, Saída, Intervalo
- Configuração de jornada de trabalho
- Banco de horas mensal
- Relatórios detalhados
- Filtros por período e pessoa

### Calendário Escolar

- Visualização anual completa
- Gestão de eventos (feriados, recessos, reuniões)
- Períodos letivos
- Exportação para impressão

## 🎨 Animações

### CSS Animations

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-fade { animation: fadeIn 0.3s ease-in; }
.animate-slide { animation: slideDown 0.4s ease-out; }
```

## 📱 Responsividade

### Media Queries Principais

```css
/* Mobile */
@media (max-width: 767px) {
  .container { padding: 1rem; }
  .grid { grid-template-columns: 1fr; }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

## 🐛 Debug

### React DevTools

Instale a extensão do navegador para debug de componentes.

### Logs da API

Todos os requests/responses são logados no console em desenvolvimento:

```
🔵 Request: POST /api/auth/login {...}
✅ Response: /api/auth/login {...}
```

## 📦 Build e Deploy

### Build de Produção

```bash
npm run build
```

Arquivos gerados em: `dist/`

### Deploy Recomendações

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **Nginx**: Servir pasta `dist/`

### Configuração Nginx

```nginx
server {
  listen 80;
  server_name seudominio.com;
  root /caminho/para/dist;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  location /api {
    proxy_pass http://localhost:3333;
  }
}
```

## 🔧 Vite Configuration

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3333'
    }
  }
})
```

## 📚 Recursos Úteis

- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Router](https://reactrouter.com)
- [Axios Docs](https://axios-http.com/docs/intro)

## 🔄 Últimas Atualizações (Dezembro/2024)

### Melhorias na Página de Disciplinas
- ✅ **Autocomplete de Professores**: Campo de busca inteligente com sugestões em tempo real
- ✅ **Validação de Professores**: Alerta visual quando não há professores cadastrados
- ✅ **Interface Otimizada**: Removido botão duplicado, mantendo apenas "Cadastrar Disciplina"
- ✅ **Navegação Melhorada**: Função `voltarParaTurmas` implementada com recarregamento de dados
- ✅ **Logs de Debug**: Sistema completo de logs para facilitar troubleshooting
- ✅ **Carregamento Assíncrono**: Professores carregados automaticamente ao abrir modal
- ✅ **Feedback Visual**: Indicadores claros de estado e mensagens de ajuda
- ✅ **Exibição Simplificada**: Nome da turma exibido discretamente no cabeçalho

### Componentes Atualizados
- `Disciplinas.tsx`: Lógica de autocomplete e validação de professores
- `DisciplinasAutocomplete.css`: Estilos para sugestões de autocomplete
- API Client (`api.ts`): Logs detalhados de requisições e respostas

## 🤝 Contribuindo

Para adicionar novas páginas:

1. Crie o componente em `src/pages/`
2. Adicione a rota em `App.tsx`
3. Proteja com `<PrivateRoute>` se necessário
4. Importe estilos necessários

---

**Desenvolvido com ⚛️ usando React e TypeScript**
