# 🔧 Backend - Sistema de Gestão Escolar

API RESTful completa para gerenciamento escolar, desenvolvida com Node.js, TypeScript e Prisma ORM.

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Configuração](#configuração)
- [Rotas da API](#rotas-da-api)
- [Modelo de Dados](#modelo-de-dados)
- [Autenticação](#autenticação)
- [Validação](#validação)
- [Upload de Arquivos](#upload-de-arquivos)

## 🛠️ Tecnologias

### Core
- **Node.js** 18+ - Runtime JavaScript
- **TypeScript** 5.3.3 - Superset tipado do JavaScript
- **Express** 4.18.2 - Framework web minimalista

### Banco de Dados
- **PostgreSQL** 18 - Banco de dados relacional
- **Prisma ORM** 5.7.1 - ORM moderno e type-safe
- **Prisma Client** - Cliente de banco gerado automaticamente

### Autenticação e Segurança
- **jsonwebtoken** 9.0.2 - Geração e verificação de JWT
- **bcryptjs** 2.4.3 - Hash de senhas
- **cors** 2.8.5 - Controle de CORS

### Validação e Upload
- **Zod** 3.22.4 - Validação de schemas TypeScript-first
- **Multer** 1.4.5-lts.1 - Middleware para upload de arquivos

### Ferramentas de Desenvolvimento
- **tsx** 4.7.0 - TypeScript executor para Node.js
- **@types/node**, **@types/express**, **@types/cors** - Tipos TypeScript

## 🎯 Funcionalidades Principais

### Sistema de Notas Avançado
- ✅ **Cálculo Automático da Média M1** (soma de 3 avaliações)
- ✅ **Nota Final do Trimestre** (maior entre M1 e EAC)
- ✅ **Média Final Anual** com fórmula ponderada: `(T1×1 + T2×2 + T3×3) ÷ 6`
- ✅ **Status de Aprovação Automático** (≥ 6.0)
- ✅ **Salvamento Atômico** (upsert para evitar duplicação)
- ✅ **Atualização em Tempo Real** de todas as médias

### API RESTful Completa
- ✅ CRUD completo para todas as entidades
- ✅ Validação de dados com Zod
- ✅ Autenticação JWT
- ✅ Upload de imagens (logo da escola)
- ✅ CORS configurado
- ✅ Logging de queries (debug mode)

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
backend/
├── prisma/
│   ├── migrations/              # Migrações do banco de dados
│   ├── schema.prisma           # Schema do Prisma (modelos + notas_finais)
│   └── seed.ts                 # Seed inicial (admin + config)
│   ├── seed.ts                 # Dados iniciais (seed)
│   └── reset.ts                # Script de reset do banco
├── src/
│   ├── lib/
│   │   └── prisma.ts           # Instância do Prisma Client
│   ├── routes/
│   │   ├── alunos.routes.ts    # CRUD de alunos
│   │   ├── professores.routes.ts
│   │   ├── turmas.routes.ts
│   │   ├── disciplinas.routes.ts
│   │   ├── matriculas.routes.ts
│   │   ├── notas.routes.ts
│   │   ├── frequencia.routes.ts
│   │   ├── auth.routes.ts      # Autenticação
│   │   └── configuracoes.routes.ts
│   └── server.ts               # Configuração do Express
├── uploads/                    # Arquivos enviados (logos)
├── .env                        # Variáveis de ambiente
├── package.json
├── tsconfig.json
└── README.md
```

### Padrões de Código

- **Separation of Concerns**: Rotas separadas por entidade
- **Type Safety**: TypeScript em todo o código
- **Error Handling**: Try-catch em todas as rotas
- **RESTful API**: Seguindo convenções REST
- **Single Responsibility**: Cada arquivo tem uma responsabilidade clara

## ✨ Funcionalidades

### 1. Autenticação e Autorização

#### Login
- Validação de credenciais
- Hash de senha com bcrypt
- Geração de token JWT (7 dias de validade)
- Retorno de dados do usuário (sem senha)

#### Registro de Usuário
- Validação de email único
- Hash automático de senha
- Tipo padrão: USUARIO
- Auto-login após registro

#### Redefinição de Senha
- **Método tradicional**: Com token de reset via email
- **Método direto**: Sem token, apenas email e nova senha
- Validação de senha (mínimo 6 caracteres)

#### Verificação de Token
- Middleware de autenticação
- Validação de JWT
- Retorno de dados do usuário autenticado

### 2. Gestão de Alunos

**Campos:**
- Dados pessoais (nome, CPF, data de nascimento)
- Contatos (email, telefone)
- Endereço completo
- Status (ativo/inativo)
- Timestamps (criação/atualização)

**Operações:**
- ✅ Listar todos os alunos
- ✅ Buscar aluno por ID
- ✅ Criar novo aluno
- ✅ Atualizar dados do aluno
- ✅ Deletar aluno

**Validações:**
- CPF único
- Email único
- Formato de data
- Campos obrigatórios

### 3. Gestão de Professores

**Campos:**
- Dados pessoais (nome, CPF, data de nascimento)
- Especialização/área
- Contatos (email, telefone)
- Endereço completo
- Status (ativo/inativo)

**Operações:**
- ✅ CRUD completo
- ✅ Validação de CPF e email únicos
- ✅ Relacionamento com disciplinas

### 4. Gestão de Turmas

**Campos:**
- Nome da turma
- Série/ano
- Turno (manhã/tarde/noite)
- Ano letivo
- Status (ativa/inativa)

**Operações:**
- ✅ CRUD completo
- ✅ Listagem de matrículas por turma
- ✅ Controle de capacidade

### 5. Gestão de Disciplinas

**Campos:**
- Nome da disciplina
- Código
- Carga horária
- Descrição
- Professor responsável (FK)

**Operações:**
- ✅ CRUD completo
- ✅ Relacionamento com professor
- ✅ Código único

### 6. Matrículas

**Campos:**
- Aluno (FK)
- Turma (FK)
- Data de matrícula
- Status (ativa/cancelada/concluída)

**Operações:**
- ✅ Criar matrícula
- ✅ Listar matrículas
- ✅ Cancelar matrícula
- ✅ Validação de duplicidade

### 7. Notas

**Campos:**
- Matrícula (FK)
- Disciplina (FK)
- Notas (AV1, AV2, AV3)
- Média calculada
- Status (aprovado/reprovado/recuperação)

**Operações:**
- ✅ Lançamento de notas
- ✅ Cálculo automático de média
- ✅ Definição automática de status
- ✅ Busca por aluno/disciplina

**Regras:**
- Média = (AV1 + AV2 + AV3) / 3
- Aprovado: média >= 7.0
- Recuperação: média >= 5.0 e < 7.0
- Reprovado: média < 5.0

### 8. Frequência

**Campos:**
- Matrícula (FK)
- Disciplina (FK)
- Data da aula
- Status (presente/ausente/justificado)
- Observações

**Operações:**
- ✅ Registro de presença
- ✅ Listagem por aluno/turma/data
- ✅ Relatórios de frequência

### 9. Configurações

**Campos:**
- Nome da escola
- Rede escolar
- Endereço completo
- Logo (upload de imagem)

**Operações:**
- ✅ Buscar configurações
- ✅ Atualizar configurações
- ✅ Upload de logo
- ✅ Singleton pattern (apenas 1 registro)

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# Database
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/gestao_escolar?schema=public"

# Server
PORT=3333
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173

# Authentication
JWT_SECRET="seu_secret_super_seguro_aqui_mude_em_producao_12345"
```

### Scripts NPM

```bash
# Desenvolvimento
npm run dev              # Inicia servidor em modo dev (tsx watch)

# Build
npm run build            # Compila TypeScript para JavaScript

# Produção
npm run start            # Inicia servidor compilado

# Prisma
npx prisma studio        # Interface visual do banco
npx prisma migrate dev   # Cria e aplica migração
npx prisma migrate reset # Reseta o banco
npx prisma generate      # Gera Prisma Client
npx prisma db push       # Sincroniza schema sem migração

# Seeds
npx tsx prisma/seed.ts   # Cria usuário admin
npx tsx prisma/reset.ts  # Reseta e recria admin
```

## 🌐 Rotas da API

### Base URL
```
http://localhost:3333/api
```

### Autenticação (`/auth`)

| Método | Rota | Descrição | Body | Autenticação |
|--------|------|-----------|------|--------------|
| POST | `/auth/login` | Login do usuário | `{ email, senha }` | Não |
| POST | `/auth/register` | Cadastro de usuário | `{ nome, email, senha }` | Não |
| POST | `/auth/forgot-password` | Solicita reset de senha | `{ email }` | Não |
| POST | `/auth/reset-password` | Reset com token | `{ token, novaSenha }` | Não |
| POST | `/auth/reset-password-direct` | Reset direto | `{ email, novaSenha }` | Não |
| GET | `/auth/me` | Dados do usuário logado | - | Sim |

### Alunos (`/alunos`)

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/alunos` | Lista todos os alunos | Sim |
| GET | `/alunos/:id` | Busca aluno por ID | Sim |
| POST | `/alunos` | Cria novo aluno | Sim |
| PUT | `/alunos/:id` | Atualiza aluno | Sim |
| DELETE | `/alunos/:id` | Deleta aluno | Sim |

### Professores (`/professores`)

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/professores` | Lista todos | Sim |
| GET | `/professores/:id` | Busca por ID | Sim |
| POST | `/professores` | Cria novo | Sim |
| PUT | `/professores/:id` | Atualiza | Sim |
| DELETE | `/professores/:id` | Deleta | Sim |

### Turmas (`/turmas`)

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/turmas` | Lista todas | Sim |
| GET | `/turmas/:id` | Busca por ID | Sim |
| POST | `/turmas` | Cria nova | Sim |
| PUT | `/turmas/:id` | Atualiza | Sim |
| DELETE | `/turmas/:id` | Deleta | Sim |

### Disciplinas (`/disciplinas`)

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/disciplinas` | Lista todas | Sim |
| GET | `/disciplinas/:id` | Busca por ID | Sim |
| POST | `/disciplinas` | Cria nova | Sim |
| PUT | `/disciplinas/:id` | Atualiza | Sim |
| DELETE | `/disciplinas/:id` | Deleta | Sim |

### Matrículas (`/matriculas`)

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/matriculas` | Lista todas | Sim |
| GET | `/matriculas/:id` | Busca por ID | Sim |
| POST | `/matriculas` | Cria matrícula | Sim |
| PUT | `/matriculas/:id` | Atualiza status | Sim |
| DELETE | `/matriculas/:id` | Cancela matrícula | Sim |

### Notas (`/notas`)

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/notas` | Lista todas as notas | Sim |
| GET | `/notas/aluno/:alunoId/disciplina/:disciplinaId` | Busca notas completas (3 trimestres + nota final) | Sim |
| GET | `/notas/final/aluno/:alunoId` | Busca todas as médias finais de um aluno | Sim |
| POST | `/notas/salvar` | Lança/atualiza notas (upsert com cálculos automáticos) | Sim |
| DELETE | `/notas/:id` | Deleta nota e recalcula média final | Sim |

#### Sistema de Notas - Cálculos Automáticos

**Endpoint: POST `/notas/salvar`**

Payload:
```json
{
  "alunoId": "uuid",
  "disciplinaId": "uuid",
  "trimestre": 1,  // 1, 2 ou 3
  "avaliacao01": 8.0,
  "avaliacao02": 7.5,
  "avaliacao03": 9.0,
  "avaliacaoEAC": 7.0,
  "observacao": "Bom desempenho"
}
```

**Cálculos Executados Automaticamente:**

1. **Média M1** (Momento 1)
   ```javascript
   mediaM1 = avaliacao01 + avaliacao02 + avaliacao03
   ```

2. **Nota Final do Trimestre**
   ```javascript
   notaFinalTrimestre = Math.max(mediaM1, avaliacaoEAC)
   ```

3. **Média Final Anual** (após ter os 3 trimestres)
   ```javascript
   mediaFinal = (T1 × 1 + T2 × 2 + T3 × 3) / 6
   ```

4. **Status de Aprovação**
   ```javascript
   aprovado = mediaFinal >= 6.0
   ```

Resposta:
```json
{
  "nota": {
    "id": "uuid",
    "alunoId": "uuid",
    "disciplinaId": "uuid",
    "trimestre": 1,
    "avaliacao01": 8.0,
    "avaliacao02": 7.5,
    "avaliacao03": 9.0,
    "mediaM1": 24.5,
    "avaliacaoEAC": 7.0,
    "notaFinalTrimestre": 24.5,
    "observacao": "Bom desempenho"
  },
  "notaFinal": {
    "alunoId": "uuid",
    "disciplinaId": "uuid",
    "trimestre1": 24.5,
    "trimestre2": null,
    "trimestre3": null,
    "mediaFinal": null,
    "aprovado": false
  }
}
```

**Tabelas Utilizadas:**
- `notas`: Armazena notas de cada trimestre
- `notas_finais`: Armazena média final anual (atualizada automaticamente)

### Frequência (`/frequencia`)

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/frequencia` | Lista registros | Sim |
| GET | `/frequencia/:id` | Busca por ID | Sim |
| POST | `/frequencia` | Registra presença | Sim |
| PUT | `/frequencia/:id` | Atualiza status | Sim |
| DELETE | `/frequencia/:id` | Deleta registro | Sim |

### Configurações (`/configuracoes`)

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/configuracoes` | Busca configurações | Não |
| PUT | `/configuracoes` | Atualiza configurações | Sim |

## 📊 Modelo de Dados

### Schema Prisma

```prisma
// Usuario
model Usuario {
  id               String    @id @default(uuid())
  nome             String
  email            String    @unique
  senha            String
  tipo             String    @default("USUARIO") // ADMIN, USUARIO
  ativo            Boolean   @default(true)
  resetToken       String?
  resetTokenExpira DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

// Aluno
model Aluno {
  id              String       @id @default(uuid())
  nome            String
  cpf             String       @unique
  dataNascimento  DateTime
  email           String       @unique
  telefone        String
  endereco        String
  cidade          String
  estado          String
  cep             String
  ativo           Boolean      @default(true)
  matriculas      Matricula[]
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

// Professor
model Professor {
  id              String       @id @default(uuid())
  nome            String
  cpf             String       @unique
  especializacao  String
  email           String       @unique
  telefone        String
  endereco        String
  cidade          String
  estado          String
  cep             String
  ativo           Boolean      @default(true)
  disciplinas     Disciplina[]
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

// Turma
model Turma {
  id              String       @id @default(uuid())
  nome            String
  serie           String
  turno           String
  anoLetivo       Int
  ativa           Boolean      @default(true)
  matriculas      Matricula[]
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

// Disciplina
model Disciplina {
  id              String       @id @default(uuid())
  nome            String
  codigo          String       @unique
  cargaHoraria    Int
  descricao       String?
  professorId     String
  professor       Professor    @relation(fields: [professorId], references: [id])
  notas           Nota[]
  frequencias     Frequencia[]
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

// Matricula
model Matricula {
  id              String       @id @default(uuid())
  alunoId         String
  aluno           Aluno        @relation(fields: [alunoId], references: [id])
  turmaId         String
  turma           Turma        @relation(fields: [turmaId], references: [id])
  dataMatricula   DateTime     @default(now())
  status          String       @default("ativa") // ativa, cancelada, concluida
  notas           Nota[]
  frequencias     Frequencia[]
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

// Nota
model Nota {
  id              String       @id @default(uuid())
  matriculaId     String
  matricula       Matricula    @relation(fields: [matriculaId], references: [id])
  disciplinaId    String
  disciplina      Disciplina   @relation(fields: [disciplinaId], references: [id])
  av1             Float?
  av2             Float?
  av3             Float?
  media           Float?
  status          String?      // aprovado, reprovado, recuperacao
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

// Frequencia
model Frequencia {
  id              String       @id @default(uuid())
  matriculaId     String
  matricula       Matricula    @relation(fields: [matriculaId], references: [id])
  disciplinaId    String
  disciplina      Disciplina   @relation(fields: [disciplinaId], references: [id])
  data            DateTime
  presente        Boolean
  observacao      String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

// Configuracao
model Configuracao {
  id              String       @id @default(uuid())
  nomeEscola      String
  redeEscolar     String?
  endereco        String?
  cidade          String?
  estado          String?
  cep             String?
  telefone        String?
  email           String?
  logoUrl         String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}
```

## 🔐 Autenticação

### JWT Token

**Estrutura:**
```json
{
  "id": "uuid-do-usuario",
  "email": "usuario@email.com",
  "tipo": "ADMIN" | "USUARIO"
}
```

**Expiração:** 7 dias

**Header de Autorização:**
```
Authorization: Bearer <token>
```

### Middleware de Autenticação

```typescript
// Exemplo de uso em rotas protegidas
app.get('/api/auth/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = jwt.verify(token, JWT_SECRET);
  // ... buscar usuário
});
```

## ✅ Validação

Todas as rotas utilizam **Zod** para validação de dados:

```typescript
// Exemplo de schema
const alunoSchema = z.object({
  nome: z.string().min(3),
  cpf: z.string().length(11),
  dataNascimento: z.string().datetime(),
  email: z.string().email(),
  telefone: z.string(),
  // ...
});
```

## 📤 Upload de Arquivos

### Configuração Multer

- **Pasta de destino:** `uploads/`
- **Nome do arquivo:** Timestamp + nome original
- **Tipos aceitos:** Imagens (png, jpg, jpeg, gif)
- **Limite de tamanho:** 10MB (configurável)

### Exemplo de Upload

```typescript
POST /api/configuracoes
Content-Type: multipart/form-data

FormData:
  - logo: <arquivo>
  - nomeEscola: "Escola Exemplo"
  - redeEscolar: "Rede Municipal"
```

## 🔄 CORS

Configuração de CORS:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

## 📝 Logs

O servidor registra:
- ✅ Requisições recebidas (método + URL)
- ✅ Erros de validação
- ✅ Erros de banco de dados
- ✅ Erros de autenticação

## 🚨 Tratamento de Erros

Padrão de resposta de erro:

```json
{
  "error": "Mensagem de erro descritiva",
  "details": [] // Opcional, para erros de validação
}
```

Códigos HTTP:
- `200` - Sucesso
- `201` - Criado
- `204` - Sem conteúdo (delete bem-sucedido)
- `400` - Requisição inválida
- `401` - Não autorizado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## 🚀 Atualizações Recentes

### Sistema de Notas Completo ✨
- ✅ Tabela `notas_finais` para armazenar médias anuais
- ✅ Cálculo automático da Média M1 (soma de 3 avaliações)
- ✅ Cálculo da nota final do trimestre (maior entre M1 e EAC)
- ✅ Cálculo da média final anual: `(T1×1 + T2×2 + T3×3) ÷ 6`
- ✅ Determinação automática do status de aprovação (≥ 6.0)
- ✅ Endpoint `/notas/salvar` com upsert automático
- ✅ Atualização automática de médias finais ao salvar qualquer nota
- ✅ Unique constraint para evitar duplicação de notas

### Melhorias na API 🔧
- ✅ Validação robusta com Zod
- ✅ Logging detalhado de queries (modo debug)
- ✅ Campos nullable tratados corretamente
- ✅ Upload de imagens em base64
- ✅ CORS configurado para frontend
- ✅ Seed automático de dados iniciais

## 📚 Documentação Adicional

- [README Principal](../README.md)
- [Frontend README](../frontend/README.md)
- [Sistema de Notas Completo](../SISTEMA-DE-NOTAS.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

Desenvolvido com ❤️ usando Node.js, TypeScript e Prisma
