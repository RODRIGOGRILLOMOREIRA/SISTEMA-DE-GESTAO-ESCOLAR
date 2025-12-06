# Sistema de Gestão Escolar

Sistema completo de gestão escolar desenvolvido com TypeScript, React e Node.js, com cálculos automáticos de notas, média parcial progressiva e interface moderna otimizada.

## 🚀 Tecnologias

### Backend
- **Node.js** com Express
- **TypeScript** para type-safety
- **Prisma ORM 5.22.0** para gerenciamento do banco de dados
- **PostgreSQL 18** como banco de dados
- **Zod** para validação de dados robusta
- **Arquitetura RESTful** com rotas organizadas

### Frontend
- **React 18.2.0** com TypeScript 5.3.3
- **Vite 5.4.21** como bundler de alta performance
- **React Router 6.20.1** para navegação SPA
- **Axios 1.6.2** para requisições HTTP
- **Lucide React 0.294.0** para ícones modernos
- **CSS Modules** com tema responsivo
- **Interface otimizada** sem barras de rolagem

## 📋 Funcionalidades

### Gestão Acadêmica Completa

#### 👨‍🎓 Gestão de Alunos
- CRUD completo com validação de CPF
- Cadastro com nome, CPF, data de nascimento, responsável
- Vinculação automática a turmas
- Listagem ordenada alfabeticamente
- Deleção em cascata (remove automaticamente notas associadas)

#### 👨‍🏫 Gestão de Professores (Sistema Professor-Centric)
- Cadastro com área de atuação (Anos Iniciais/Anos Finais/Ambos)
- Seleção de **componentes curriculares** via checkboxes
- Vinculação a **múltiplas turmas** simultaneamente
- Criação automática de **DisciplinaTurma** ao cadastrar professor
- Modal otimizado (1200px) com layout em duas colunas
- 10 componentes curriculares padronizados:
  - ARTES, CIÊNCIAS, EDUCAÇÃO FÍSICA, ENSINO RELIGIOSO
  - GEOGRAFIA, HISTÓRIA, INGLÊS, MATEMÁTICA, PORTUGUÊS, PROJETO DE VIDA

#### 🏫 Gestão de Turmas
- Organização por **categoria** (Anos Iniciais 1º-5º / Anos Finais 6º-9º)
- Cadastro com ano, nome, período (Manhã/Tarde/Noite/Integral)
- Campo **anoLetivo** (padrão: 2025)
- Navegação por categorias com botões modernos
- Listagem de turmas ordenada (6ª, 7ª, 8ª, 9ª)
- Layout responsivo em grid compacto

#### 📚 Gestão de Disciplinas
- Navegação em 3 níveis: **Categoria → Turma → Disciplinas**
- Carga horária e professor responsável
- Botões modernizados e compactos
- Badge estilizado para nome da turma
- Autocomplete para busca de professores
- Vinculação automática via DisciplinaTurma

### Sistema de Notas Avançado

#### 📊 Lançamento de Notas por Trimestre
- **3 Trimestres** independentes (1º, 2º, 3º)
- **Momento 1**: 3 avaliações (0.0 a 10.0)
  - Média M1 = soma das 3 avaliações
  - Cálculo automático em tempo real
- **Momento 2**: Avaliação EAC (0.0 a 10.0)
- **Nota Final do Trimestre**: Maior valor entre M1 e EAC
- Modal de edição compacto (88vh) sem barra de rolagem
- Tema cinza moderno com ótimo contraste

#### 📈 Média Parcial Progressiva do Ano (NOVO!)
Sistema inteligente que atualiza a média conforme as notas são lançadas:

1. **Apenas T1 lançado:**
   - Mostra: "Média Parcial do Ano (T1)"
   - Fórmula: `T1 × 1 ÷ 1 = T1`

2. **T1 e T2 lançados:**
   - Mostra: "Média Parcial do Ano (T1+T2)"
   - Fórmula: `(T1×1 + T2×2) ÷ 3`

3. **T1, T2 e T3 lançados:**
   - Mostra: "Média Parcial do Ano"
   - Fórmula: `(T1×1 + T2×2 + T3×3) ÷ 6`

- ✅ Atualização automática a cada trimestre
- ✅ Badge destacado em azul com borda
- ✅ Aluno sempre ciente do aproveitamento atual

#### ✅ Status de Aprovação Automático
- **APROVADO**: Média Final ≥ 6.0 (badge verde com ícone CheckCircle)
- **REPROVADO**: Média Final < 6.0 (badge vermelho com ícone XCircle)
- **Aguardando**: Notas ainda não lançadas (badge cinza)

#### 🎨 Interface Visual com Código de Cores
- **Verde**: Nota ≥ 7.0 (ótimo desempenho)
- **Amarelo**: Nota entre 5.0 e 6.9 (atenção)
- **Vermelho**: Nota < 5.0 (necessita recuperação)
- Cards com gradientes e sombras modernas
- Transições suaves e animações

### 🎨 Design e UX

#### Interface Moderna
- **Modal redesenhado**: Fundo degradê cinza (#e2e8f0 → #cbd5e1 → #94a3b8)
- **Header escuro**: Cinza (#475569 → #334155) com título branco
- **Campos otimizados**: Fundo claro com borda cinza, texto escuro
- **Labels**: Cinza escuro (#334155) para excelente legibilidade
- **Títulos de seção**: Cinza escuro harmonizado
- **Botões**:
  - Cancelar: Vermelho claro (#fee2e2) com texto vermelho forte
  - Salvar: Verde (#10b981) com texto branco

#### Navegação Intuitiva
- Seleção progressiva: **Turma → Aluno → Disciplina → Trimestre**
- Breadcrumbs visuais com botões "Voltar" compactos
- Grid responsivo adaptável
- Filtros automáticos por categoria de ano

## 🏗️ Estrutura do Projeto

```
PROJETO SISTEMA DE GESTÃO ESCOLAR/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Schema do banco (Professor, Turma, Aluno, Disciplina, DisciplinaTurma, Nota, NotaFinal)
│   │   └── migrations/             # Histórico de migrações
│   ├── scripts/
│   │   └── padronizar-disciplinas.ts  # Script para criar 10 disciplinas padrão
│   ├── src/
│   │   ├── routes/
│   │   │   ├── alunos.ts
│   │   │   ├── disciplinas.ts
│   │   │   ├── notas.ts
│   │   │   ├── professores.ts
│   │   │   └── turmas.ts
│   │   ├── lib/
│   │   │   └── prisma.ts           # Cliente Prisma singleton
│   │   └── server.ts               # Express server (porta 3333)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Modal.tsx           # Modal reutilizável com tema cinza
│   │   │   ├── Modal.css           # Estilos globais do modal
│   │   │   └── DisciplinasAutocomplete.tsx
│   │   ├── pages/
│   │   │   ├── Alunos.tsx
│   │   │   ├── Disciplinas.tsx     # Navegação por categorias e turmas
│   │   │   ├── Notas.tsx           # Sistema de notas com média parcial progressiva
│   │   │   ├── Notas.css           # Estilos do modal de notas compacto
│   │   │   ├── Professores.tsx     # Cadastro professor-centric
│   │   │   ├── Turmas.tsx
│   │   │   └── CommonPages.css     # Estilos compartilhados
│   │   ├── services/
│   │   │   └── api.ts              # Axios configurado + endpoints
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md                       # Este arquivo
```

## 🔧 Instalação e Configuração

### Pré-requisitos
- **Node.js** 18+ e npm
- **PostgreSQL** 18+ rodando
- **Git** para clonar o repositório

### 1. Backend

Entre na pasta do backend:
```powershell
cd backend
```

Instale as dependências:
```powershell
npm install
```

Configure o banco de dados PostgreSQL:
```powershell
# Crie o banco de dados
psql -U postgres
CREATE DATABASE gestao_escolar;
\q
```

Configure as variáveis de ambiente criando arquivo `.env`:
```env
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/gestao_escolar?schema=public"
PORT=3333
```

Execute as migrations do Prisma:
```powershell
npx prisma migrate dev
```

Gere as 10 disciplinas padronizadas:
```powershell
npx ts-node scripts/padronizar-disciplinas.ts
```

Inicie o servidor:
```powershell
npm run dev
```

✅ Backend rodando em `http://localhost:3333`

### 2. Frontend

Abra novo terminal e entre na pasta do frontend:
```powershell
cd frontend
```

Instale as dependências:
```powershell
npm install
```

Inicie o servidor de desenvolvimento:
```powershell
npm run dev
```

✅ Frontend rodando em `http://localhost:5173`

### 3. Acesse o Sistema

Abra o navegador em: **http://localhost:5173**

## 📊 Banco de Dados

### Schema Prisma

O sistema utiliza **PostgreSQL 18** com **Prisma ORM 5.22.0**.

#### Modelos Principais:

**Professor** (Sistema Professor-Centric)
- `id`, `nome`, `cpf`, `email`, `telefone`
- `area`: String? (Anos Iniciais/Anos Finais/Ambos)
- `componentes`: String? (JSON com array de disciplinas selecionadas)
- `turmasVinculadas`: String? (JSON com array de IDs de turmas)
- Criação automática de **DisciplinaTurma** ao cadastrar

**Turma**
- `id`, `ano` (1-9), `nome` (A, B, C...), `periodo` (enum)
- `anoLetivo`: Int @default(2025)
- Relações: alunos[], disciplinas (DisciplinaTurma[])

**Disciplina** (10 padronizadas)
- `id`, `nome`, `cargaHoraria`
- Criadas via script: ARTES, CIÊNCIAS, EDUCAÇÃO FÍSICA, ENSINO RELIGIOSO, GEOGRAFIA, HISTÓRIA, INGLÊS, MATEMÁTICA, PORTUGUÊS, PROJETO DE VIDA

**DisciplinaTurma** (Junction Table)
- `id`, `disciplinaId`, `turmaId`, `professorId`
- @@unique([disciplinaId, turmaId]) - Previne duplicatas
- Criado automaticamente ao vincular professor

**Aluno**
- `id`, `nome`, `cpf`, `dataNascimento`, `responsavel`, `turmaId`
- Relações: turma, matriculas[], notas[]

**Nota** (Por Trimestre)
- `id`, `alunoId`, `disciplinaTurmaId`, `trimestre` (1/2/3)
- Momento 1: `avaliacao01`, `avaliacao02`, `avaliacao03`, `mediaM1` (calculada)
- Momento 2: `avaliacaoEAC`
- `notaFinal`: Decimal? (maior entre M1 e EAC)

**NotaFinal** (Anual)
- `id`, `alunoId`, `disciplinaTurmaId`
- `notaT1`, `notaT2`, `notaT3`: Decimal?
- `mediaFinal`: Decimal? = `(T1×1 + T2×2 + T3×3) ÷ 6`
- `aprovado`: Boolean? (≥ 6.0)

## 🔐 Variáveis de Ambiente

### Backend (.env)
```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gestao_escolar?schema=public"
PORT=3333
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3333/api
```

## 📝 API Endpoints

### Alunos
- `GET /api/alunos` - Lista todos os alunos
- `GET /api/alunos/:id` - Busca aluno por ID
- `POST /api/alunos` - Cria novo aluno
- `PUT /api/alunos/:id` - Atualiza aluno
- `DELETE /api/alunos/:id` - Remove aluno

### Professores
- `GET /api/professores` - Lista todos os professores
- `GET /api/professores/:id` - Busca professor por ID
- `POST /api/professores` - Cria novo professor
- `PUT /api/professores/:id` - Atualiza professor
- `DELETE /api/professores/:id` - Remove professor

### Turmas
- `GET /api/turmas` - Lista todas as turmas
- `GET /api/turmas/:id` - Busca turma por ID
- `POST /api/turmas` - Cria nova turma
- `PUT /api/turmas/:id` - Atualiza turma
- `DELETE /api/turmas/:id` - Remove turma

### Disciplinas
- `GET /api/disciplinas` - Lista todas as disciplinas
- `GET /api/disciplinas/:id` - Busca disciplina por ID
- `POST /api/disciplinas` - Cria nova disciplina
- `PUT /api/disciplinas/:id` - Atualiza disciplina
- `DELETE /api/disciplinas/:id` - Remove disciplina

### Notas
- `GET /api/notas` - Lista todas as notas
- `GET /api/notas/aluno/:alunoId/disciplinaTurma/:disciplinaTurmaId` - Busca notas completas (3 trimestres + nota final)
- `GET /api/notas/final/aluno/:alunoId` - Busca todas as notas finais do aluno
- `POST /api/notas` - Cria nova nota com cálculos automáticos
- `PUT /api/notas/:id` - Atualiza nota (recalcula M1, nota final, média anual)
- `DELETE /api/notas/:id` - Remove nota (recalcula média final)

### DisciplinaTurma
- `GET /api/disciplinas-turma` - Lista todas as vinculações
- `GET /api/disciplinas-turma/turma/:turmaId` - Lista disciplinas de uma turma
- `POST /api/disciplinas-turma` - Cria vinculação (automático ao cadastrar professor)
- `DELETE /api/disciplinas-turma/:id` - Remove vinculação

## 🛠️ Scripts Disponíveis

### Backend
- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o projeto
- `npm start` - Inicia o servidor em produção
- `npm run prisma:generate` - Gera o Prisma Client
- `npm run prisma:migrate` - Executa as migrations
- `npm run prisma:studio` - Abre o Prisma Studio

### Frontend
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção

## 🎓 Sistema de Notas - Detalhes

### Cálculos Automáticos

#### 1. Nota Final do Trimestre
```
Nota Final Trimestre = Maior valor entre (Média M1, Avaliação EAC)

Onde:
- Média M1 = Avaliação01 + Avaliação02 + Avaliação03
- Avaliação EAC = prova de recuperação
```

#### 2. Média Parcial Progressiva (Atualização Contínua)

O sistema exibe a média parcial conforme as notas são lançadas:

**Caso 1: Apenas T1 lançado**
```
Média Parcial = T1 × 1 ÷ 1 = T1
Exibe: "Média Parcial do Ano (T1)"
```

**Caso 2: T1 e T2 lançados**
```
Média Parcial = (T1 × 1 + T2 × 2) ÷ 3
Exibe: "Média Parcial do Ano (T1+T2)"
```

**Caso 3: T1, T2 e T3 lançados**
```
Média Final = (T1 × 1 + T2 × 2 + T3 × 3) ÷ 6
Exibe: "Média Parcial do Ano"
```

#### 3. Critério de Aprovação
- **Média Final ≥ 6.0** → APROVADO ✅ (badge verde)
- **Média Final < 6.0** → REPROVADO ❌ (badge vermelho)
- **Sem notas** → Aguardando (badge cinza)

### Exemplo Prático Completo

```
1º Trimestre:
- Avaliação 01: 8.0
- Avaliação 02: 7.5
- Avaliação 03: 9.0
- Média M1: 24.5
- Avaliação EAC: 7.0
- Nota Final T1: 24.5 ✅ (maior entre 24.5 e 7.0)
→ Média Parcial (T1): 24.5

2º Trimestre: Nota Final = 21.0
→ Média Parcial (T1+T2): (24.5×1 + 21.0×2) ÷ 3 = 22.17

3º Trimestre: Nota Final = 27.0
→ Média Final: (24.5×1 + 21.0×2 + 27.0×3) ÷ 6 = 24.08
→ Status: APROVADO ✅ (≥ 6.0)
```

## 🎯 Fluxo de Uso do Sistema

### 1. Configuração Inicial
1. Criar disciplinas padronizadas (via script)
2. Cadastrar turmas por ano e período
3. Cadastrar professores com áreas e componentes
4. Sistema cria automaticamente DisciplinaTurma

### 2. Gestão de Alunos
1. Cadastrar alunos vinculando-os a turmas
2. Aluno automaticamente terá acesso a todas as disciplinas da turma

### 3. Lançamento de Notas
1. Acessar página Notas
2. Selecionar Turma → Aluno → Disciplina
3. Escolher trimestre (1º, 2º ou 3º)
4. Lançar notas do Momento 1 (3 avaliações)
5. Sistema calcula automaticamente Média M1
6. Lançar nota do Momento 2 (EAC) se necessário
7. Sistema define Nota Final do Trimestre (maior entre M1 e EAC)
8. Sistema calcula e exibe Média Parcial progressivamente
9. Após T3, sistema exibe Média Final e status APROVADO/REPROVADO

### 4. Acompanhamento
- Visualizar média parcial a cada trimestre
- Identificar alunos em risco (notas vermelhas/amarelas)
- Monitorar progressão de aprendizagem

## 🚀 Melhorias Recentes

### Interface Modernizada
- ✅ Botões compactos com padding otimizado
- ✅ Modal sem barra de rolagem (max-height 88vh)
- ✅ Tema cinza moderno com ótimo contraste
- ✅ Grid responsivo para turmas
- ✅ Badges estilizados para títulos

### Funcionalidades Avançadas
- ✅ Média Parcial Progressiva (T1, T1+T2, T1+T2+T3)
- ✅ Cálculos automáticos em tempo real
- ✅ Sistema professor-centric com DisciplinaTurma
- ✅ Ordenação automática de turmas
- ✅ Código de cores para status visual

## 📚 Documentação Adicional

Consulte os READMEs específicos para mais detalhes:
- **[Backend README](./backend/README.md)** - Arquitetura, API, banco de dados
- **[Frontend README](./frontend/README.md)** - Componentes, estilos, estrutura

## 👨‍💻 Desenvolvimento

### Tecnologias e Versões
- Node.js 18+
- PostgreSQL 18
- Prisma 5.22.0
- React 18.2.0
- TypeScript 5.3.3
- Vite 5.4.21

### Padrões de Código
- TypeScript strict mode
- ESLint configurado
- Prettier para formatação
- Commits semânticos

## 📄 Licença

Este projeto é proprietário e destinado ao uso educacional.

---

**Sistema de Gestão Escolar** - Desenvolvido com ❤️ em TypeScript
Versão 2.0 - 2025

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto está sob a licença ISC.
- [ ] Adicionar filtros e busca
- [ ] Criar relatórios em PDF
- [ ] Implementar notificações
- [ ] Adicionar testes unitários e de integração
- [ ] Deploy em produção

## 📄 Licença

Este projeto está sob a licença ISC.
