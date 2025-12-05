# Sistema de Gestão Escolar

Sistema completo de gestão escolar desenvolvido com TypeScript, React e Node.js, com cálculos automáticos de notas e média final anual.

## 🚀 Tecnologias

### Backend
- **Node.js** com Express
- **TypeScript** para type-safety
- **Prisma ORM** para gerenciamento do banco de dados
- **PostgreSQL** como banco de dados
- **Zod** para validação de dados
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

### Frontend
- **React 18** com TypeScript
- **Vite** como bundler
- **React Router** para navegação
- **Axios** para requisições HTTP
- **Lucide React** para ícones modernos
- **Context API** para gerenciamento de estado
- **Tema claro/escuro** dinâmico

## 📋 Funcionalidades

### Gestão Acadêmica
- ✅ **Gestão de Alunos** - CRUD completo com CPF, responsável, turma
- ✅ **Gestão de Professores** - Cadastro com especialidade e disciplinas
- ✅ **Gestão de Turmas** - Organização por ano e período (Manhã/Tarde/Noite/Integral)
- ✅ **Gestão de Disciplinas** - Carga horária e vinculação com professores

### Sistema de Notas Avançado
- ✅ **Lançamento de Notas por Trimestre** (1º, 2º e 3º)
  - **Momento 1**: 3 avaliações + média automática (soma das 3)
  - **Momento 2**: Avaliação EAC
  - **Nota Final do Trimestre**: Maior nota entre M1 e EAC
- ✅ **Cálculo Automático da Média Final Anual**
  - Fórmula: `(T1×1 + T2×2 + T3×3) ÷ 6`
  - Atualização em tempo real
- ✅ **Status de Aprovação Automático**
  - APROVADO: Média ≥ 6.0 (botão verde)
  - REPROVADO: Média < 6.0 (botão vermelho)
- ✅ **Salvamento Automático no Banco de Dados**
- ✅ **Interface Moderna com Seleção por Turma → Aluno → Disciplina**
- ✅ **Cards Visuais com Código de Cores**
  - Verde: Nota ≥ 7.0
  - Amarela: Nota entre 5.0 e 6.9
  - Vermelha: Nota < 5.0

### Outras Funcionalidades
- ✅ **Controle de Frequência** - Registro de presença por data
- ✅ **Dashboard com Estatísticas** - Visão geral do sistema
- ✅ **Configurações Personalizáveis**
  - Upload de logo da escola
  - Nome e dados da instituição
  - Tema claro/escuro
- ✅ **Autenticação Completa**
  - Login com JWT
  - Recuperação de senha
  - Gerenciamento de usuários
- ✅ **Interface Responsiva** - Funciona em desktop, tablet e mobile

## 🏗️ Estrutura do Projeto

```
PROJETO SISTEMA DE GESTÃO ESCOLAR/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── lib/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── lib/
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── tsconfig.json
```

## 🔧 Instalação

### Backend

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env`:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas credenciais do banco de dados.

4. Execute as migrations do Prisma:
```bash
npm run prisma:migrate
```

5. Inicie o servidor:
```bash
npm run dev
```

O backend estará rodando em `http://localhost:3333`

### Frontend

1. Entre na pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## 📊 Banco de Dados

O sistema utiliza PostgreSQL. Certifique-se de ter o PostgreSQL instalado e rodando.

### Estrutura das Tabelas

- **usuarios**: Dados de acesso ao sistema
- **alunos**: Dados dos estudantes (CPF, responsável, turma)
- **professores**: Dados dos docentes (especialidade)
- **turmas**: Informações das turmas (ano, período)
- **disciplinas**: Matérias lecionadas (carga horária)
- **matriculas**: Vínculo aluno-turma (status)
- **notas**: Notas detalhadas por trimestre
  - Avaliações 01, 02, 03
  - Média M1 (calculada)
  - Avaliação EAC
  - Nota final do trimestre (calculada)
- **notas_finais**: Média final anual e aprovação
  - Notas dos 3 trimestres
  - Média final calculada: `(T1×1 + T2×2 + T3×3) ÷ 6`
  - Status de aprovação (boolean)
- **frequencias**: Registro de presença/ausência
- **configuracoes**: Personalização do sistema (logo, tema)

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
- `GET /api/notas/aluno/:alunoId/disciplina/:disciplinaId` - Busca notas completas (trimestres + nota final)
- `GET /api/notas/final/aluno/:alunoId` - Busca todas as notas finais do aluno
- `POST /api/notas/salvar` - Lança/atualiza nota (upsert com cálculos automáticos)
- `DELETE /api/notas/:id` - Remove nota (recalcula média final)

### Frequências
- `GET /api/frequencias` - Lista todas as frequências
- `GET /api/frequencias/aluno/:alunoId` - Busca frequências de um aluno
- `POST /api/frequencias` - Registra frequência
- `PUT /api/frequencias/:id` - Atualiza frequência
- `DELETE /api/frequencias/:id` - Remove frequência

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

#### Nota Final do Trimestre
```
Nota Final = Maior valor entre (Média M1, Avaliação EAC)

Onde:
- Média M1 = Avaliação01 + Avaliação02 + Avaliação03
```

#### Média Final Anual
```
Média Final = (T1 × 1 + T2 × 2 + T3 × 3) ÷ 6

Onde:
- T1 = Nota final do 1º trimestre
- T2 = Nota final do 2º trimestre
- T3 = Nota final do 3º trimestre
```

#### Critério de Aprovação
- **Média Final ≥ 6.0** → APROVADO ✅
- **Média Final < 6.0** → REPROVADO ❌

### Exemplo Prático

```
1º Trimestre:
- Avaliação 01: 8.0
- Avaliação 02: 7.5
- Avaliação 03: 9.0
- Média M1: 24.5
- Avaliação EAC: 7.0
- Nota Final T1: 24.5 (maior entre 24.5 e 7.0)

2º Trimestre: Nota Final = 21.0
3º Trimestre: Nota Final = 27.0

Média Final = (24.5×1 + 21.0×2 + 27.0×3) ÷ 6
Média Final = (24.5 + 42.0 + 81.0) ÷ 6
Média Final = 147.5 ÷ 6
Média Final = 24.58

Status: APROVADO ✅ (24.58 ≥ 6.0)
```

## 🔐 Credenciais de Acesso

### Usuário Administrador Padrão
- **Email**: admin@escola.com
- **Senha**: admin123

## 📚 Documentação Adicional

- [Sistema de Notas Completo](./SISTEMA-DE-NOTAS.md)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## 🤝 Contribuindo

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
