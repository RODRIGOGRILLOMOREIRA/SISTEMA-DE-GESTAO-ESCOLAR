# 🔧 Backend - Sistema de Gestão Escolar

API RESTful completa e robusta para gerenciamento escolar, desenvolvida com Node.js, TypeScript, Express e Prisma ORM, com sistema de notas avançado e média parcial progressiva.

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Modelo de Dados](#modelo-de-dados)
- [Rotas da API](#rotas-da-api)
- [Cálculos Automáticos](#cálculos-automáticos)
- [Instalação](#instalação)
- [Scripts](#scripts)

## 🛠️ Tecnologias

### Core
- **Node.js** 18+ - Runtime JavaScript server-side
- **TypeScript** 5.3.3+ - JavaScript com tipagem estática
- **Express** 4.18+ - Framework web minimalista e flexível

### Banco de Dados
- **PostgreSQL** 18 - Banco de dados relacional avançado
- **Prisma ORM** 5.22.0 - ORM moderno, type-safe e produtivo
- **Prisma Client** - Cliente auto-gerado com tipos TypeScript
- **Prisma Migrate** - Sistema de migrações versionado

### Dependências
- **@prisma/client** 5.22.0 - Cliente Prisma
- **cors** - Middleware para CORS
- **tsx** - Executor TypeScript para Node.js

### Desenvolvimento
- **Prisma Studio** - Interface visual para banco de dados
- **TypeScript Compiler** - Compilador TypeScript
- **Node types** - Tipos TypeScript para Node.js

## 🎯 Funcionalidades Principais

### ✅ Sistema de Ano Letivo (Novo)

**Isolamento Total de Notas por Ano**

Todas as notas são amarradas a um `anoLetivo` específico, garantindo que:
- Notas de 2024 não se misturam com 2025
- Cada ano tem seu próprio conjunto de registros
- Relatórios e dashboards filtram automaticamente por ano
- Consultas sempre incluem `anoLetivo` como parâmetro

**Implementação no Prisma:**
```prisma
model notas {
  id            String       @id @default(uuid())
  valor         Float
  trimestre     Int          // 1, 2 ou 3
  anoLetivo     Int          @default(2025)
  observacoes   String?
  
  @@unique([alunoId, disciplinaId, trimestre, anoLetivo])
  @@index([alunoId, disciplinaId, anoLetivo])
}

model notas_finais {
  id            String       @id @default(uuid())
  mediaFinal    Float
  anoLetivo     Int          @default(2025)
  status        String
  
  @@unique([alunoId, disciplinaId, anoLetivo])
  @@index([alunoId, anoLetivo])
}
```

**Rotas com Ano Letivo:**

1. **Buscar notas por aluno e disciplina:**
   ```http
   GET /api/notas/aluno/:alunoId/disciplina/:disciplinaId?anoLetivo=2025
   ```

2. **Salvar nota com ano:**
   ```http
   POST /api/notas/salvar
   Body: {
     alunoId, disciplinaId, trimestre, valor,
     anoLetivo: 2025
   }
   ```

3. **Buscar notas por turma:**
   ```http
   GET /api/notas/turma/:turmaId?anoLetivo=2025
   ```

**Lógica de Cálculo com Ano:**
```typescript
async function atualizarNotaFinal(
  alunoId: string,
  disciplinaId: string,
  anoLetivo: number
) {
  // Busca apenas notas do ano letivo específico
  const notas = await prisma.notas.findMany({
    where: { alunoId, disciplinaId, anoLetivo }
  })
  
  // Calcula média final
  const soma = notas.reduce((acc, nota) => acc + nota.valor, 0)
  const mediaFinal = soma / 3
  
  // Salva com ano letivo
  await prisma.notas_finais.upsert({
    where: {
      alunoId_disciplinaId_anoLetivo: {
        alunoId, disciplinaId, anoLetivo
      }
    },
    update: { mediaFinal },
    create: { alunoId, disciplinaId, anoLetivo, mediaFinal }
  })
}
```

### Sistema de Notas Avançado com Cálculos Automáticos

#### Cálculo de Média M1
```typescript
// Momento 1: soma de 3 avaliações
mediaM1 = avaliacao01 + avaliacao02 + avaliacao03
```

#### Nota Final do Trimestre
```typescript
// Maior valor entre Média M1 e Avaliação EAC
notaFinal = Math.max(mediaM1, avaliacaoEAC || 0)
```

#### Média Final Anual (Ponderada)
```typescript
// Fórmula: (T1×1 + T2×2 + T3×3) ÷ 6
mediaFinal = (notaT1 * 1 + notaT2 * 2 + notaT3 * 3) / 6
```

#### Status de Aprovação
```typescript
aprovado = mediaFinal >= 6.0
```

### Sistema Professor-Centric
- ✅ **Cadastro com área**: Anos Iniciais, Anos Finais ou Ambos
- ✅ **Componentes curriculares**: Seleção de disciplinas via JSON
- ✅ **Turmas vinculadas**: Array de IDs de turmas como JSON
- ✅ **Criação automática**: DisciplinaTurma criado ao salvar professor
- ✅ **Junction table**: Previne duplicatas com @@unique

### Disciplinas Padronizadas
- ✅ **10 componentes**: ARTES, CIÊNCIAS, EDUCAÇÃO FÍSICA, ENSINO RELIGIOSO, GEOGRAFIA, HISTÓRIA, INGLÊS, MATEMÁTICA, PORTUGUÊS, PROJETO DE VIDA
- ✅ **Script de padronização**: `prisma/padronizar-disciplinas.ts`
- ✅ **Carga horária**: Configurável por disciplina
- ✅ **Acentuação correta**: UTF-8 garantido

### API RESTful Completa
- ✅ **CRUD completo**: Alunos, Professores, Turmas, Disciplinas, DisciplinaTurma, Notas
- ✅ **Upsert inteligente**: Evita duplicação de notas
- ✅ **Deleção em cascata**: Remove notas ao deletar aluno
- ✅ **Atualização automática**: Recalcula médias a cada alteração
- ✅ **Queries otimizadas**: Uso de includes e selects do Prisma
- ✅ **CORS habilitado**: Aceita requisições do frontend

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
backend/
├── prisma/
│   ├── migrations/                      # Histórico de migrações do banco
│   ├── schema.prisma                    # Schema do Prisma (8 modelos)
│   └── padronizar-disciplinas.ts        # Script para criar 10 disciplinas
│
├── src/
│   ├── lib/
│   │   └── prisma.ts                    # Singleton do Prisma Client
│   │
│   ├── routes/
│   │   ├── alunos.ts                    # GET, POST, PUT, DELETE /api/alunos
│   │   ├── disciplinas.ts               # CRUD de disciplinas
│   │   ├── disciplinas-turma.ts         # CRUD de DisciplinaTurma
│   │   ├── notas.ts                     # Lançamento de notas com cálculos
│   │   ├── professores.ts               # Sistema professor-centric
│   │   └── turmas.ts                    # CRUD de turmas
│   │
│   └── server.ts                        # Configuração Express + CORS (porta 3333)
│
├── .env                                 # DATABASE_URL, PORT
├── package.json                         # Dependências e scripts
├── tsconfig.json                        # Configuração TypeScript
└── README.md                            # Este arquivo
```

### Padrões de Código

- **RESTful Design**: Rotas seguem convenções REST (GET, POST, PUT, DELETE)
- **Type Safety**: TypeScript strict mode em todo o código
- **Error Handling**: Try-catch em todas as rotas com status HTTP apropriados
- **Separation of Concerns**: Cada rota em arquivo separado
- **Prisma Best Practices**: Uso de includes, selects e transações quando necessário
- **Single Responsibility**: Cada endpoint tem uma responsabilidade clara

## 📊 Modelo de Dados (Prisma Schema)

### Modelos Principais

#### Professor
```prisma
model Professor {
  id                String             @id @default(uuid())
  nome              String
  cpf               String             @unique
  email             String             @unique
  telefone          String?
  area              String?            // "Anos Iniciais", "Anos Finais", "Ambos"
  componentes       String?            // JSON: ["MATEMÁTICA", "PORTUGUÊS", ...]
  turmasVinculadas  String?            // JSON: ["uuid1", "uuid2", ...]
  disciplinasTurma  DisciplinaTurma[]
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
}
```

#### Turma
```prisma
model Turma {
  id               String             @id @default(uuid())
  ano              Int                // 1-9
  nome             String             // A, B, C, etc.
  periodo          Periodo            // enum: MANHA, TARDE, NOITE, INTEGRAL
  anoLetivo        Int                @default(2025)
  alunos           Aluno[]
  disciplinas      DisciplinaTurma[]
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
}
```

#### Disciplina (10 Padronizadas)
```prisma
model Disciplina {
  id               String             @id @default(uuid())
  nome             String             @unique
  cargaHoraria     Int
  turmas           DisciplinaTurma[]
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
}
```

**10 disciplinas criadas via script:**
- ARTES
- CIÊNCIAS
- EDUCAÇÃO FÍSICA
- ENSINO RELIGIOSO
- GEOGRAFIA
- HISTÓRIA
- INGLÊS
- MATEMÁTICA
- PORTUGUÊS
- PROJETO DE VIDA

#### DisciplinaTurma (Junction Table)
```prisma
model DisciplinaTurma {
  id            String      @id @default(uuid())
  disciplinaId  String
  turmaId       String
  professorId   String?
  disciplina    Disciplina  @relation(fields: [disciplinaId], references: [id])
  turma         Turma       @relation(fields: [turmaId], references: [id])
  professor     Professor?  @relation(fields: [professorId], references: [id])
  notas         Nota[]
  notasFinais   NotaFinal[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@unique([disciplinaId, turmaId])  // Previne duplicatas
}
```

#### Aluno
```prisma
model Aluno {
  id              String      @id @default(uuid())
  nome            String
  cpf             String      @unique
  dataNascimento  DateTime
  responsavel     String
  turmaId         String
  turma           Turma       @relation(fields: [turmaId], references: [id])
  notas           Nota[]
  notasFinais     NotaFinal[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

#### Nota (Por Trimestre)
```prisma
model Nota {
  id                String          @id @default(uuid())
  alunoId           String
  disciplinaTurmaId String
  trimestre         Int             // 1, 2 ou 3
  avaliacao01       Decimal?        @db.Decimal(5, 2)
  avaliacao02       Decimal?        @db.Decimal(5, 2)
  avaliacao03       Decimal?        @db.Decimal(5, 2)
  mediaM1           Decimal?        @db.Decimal(5, 2)  // Calculada: soma das 3
  avaliacaoEAC      Decimal?        @db.Decimal(5, 2)
  notaFinal         Decimal?        @db.Decimal(5, 2)  // max(mediaM1, EAC)
  aluno             Aluno           @relation(fields: [alunoId], references: [id], onDelete: Cascade)
  disciplinaTurma   DisciplinaTurma @relation(fields: [disciplinaTurmaId], references: [id])
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@unique([alunoId, disciplinaTurmaId, trimestre])
}
```

#### NotaFinal (Anual)
```prisma
model NotaFinal {
  id                String          @id @default(uuid())
  alunoId           String
  disciplinaTurmaId String
  notaT1            Decimal?        @db.Decimal(5, 2)
  notaT2            Decimal?        @db.Decimal(5, 2)
  notaT3            Decimal?        @db.Decimal(5, 2)
  mediaFinal        Decimal?        @db.Decimal(5, 2)  // (T1×1 + T2×2 + T3×3) ÷ 6
  aprovado          Boolean?
  aluno             Aluno           @relation(fields: [alunoId], references: [id], onDelete: Cascade)
  disciplinaTurma   DisciplinaTurma @relation(fields: [disciplinaTurmaId], references: [id])
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@unique([alunoId, disciplinaTurmaId])
}
```

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- PostgreSQL 18+ rodando
- npm ou yarn

### Instalação

1. Entre na pasta do backend:
```powershell
cd backend
```

2. Instale as dependências:
```powershell
npm install
```

3. Configure o banco de dados PostgreSQL:
```powershell
# Entre no PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE gestao_escolar;

# Saia
\q
```

4. Configure as variáveis de ambiente:
```env
# .env
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/gestao_escolar?schema=public"
PORT=3333
```

5. Execute as migrações:
```powershell
npx prisma migrate dev
```

6. Gere o Prisma Client:
```powershell
npx prisma generate
```

7. Crie as 10 disciplinas padronizadas:
```powershell
npx tsx prisma/padronizar-disciplinas.ts
```

8. Inicie o servidor:
```powershell
npm run dev
```

✅ Backend rodando em **http://localhost:3333**

### Scripts Disponíveis

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

### Alunos (`/api/alunos`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/alunos` | Lista todos os alunos com turmas |
| GET | `/api/alunos/:id` | Busca aluno por ID |
| POST | `/api/alunos` | Cria novo aluno (nome, cpf, dataNascimento, responsavel, turmaId) |
| PUT | `/api/alunos/:id` | Atualiza dados do aluno |
| DELETE | `/api/alunos/:id` | Deleta aluno (cascata: remove notas automaticamente) |

### Professores (`/api/professores`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/professores` | Lista todos os professores |
| GET | `/api/professores/:id` | Busca professor por ID |
| POST | `/api/professores` | Cria professor (sistema professor-centric) |
| PUT | `/api/professores/:id` | Atualiza professor |
| DELETE | `/api/professores/:id` | Deleta professor |

**Body POST/PUT Professores:**
```json
{
  "nome": "João Silva",
  "cpf": "12345678900",
  "email": "joao@escola.com",
  "telefone": "11999999999",
  "area": "Anos Iniciais",  // ou "Anos Finais" ou "Ambos"
  "componentes": ["MATEMÁTICA", "PORTUGUÊS"],  // Array de disciplinas
  "turmasVinculadas": ["uuid1", "uuid2"]  // Array de IDs de turmas
}
```

**Lógica Especial:**
- Ao criar/atualizar professor, o backend cria automaticamente registros em `DisciplinaTurma`
- Cria uma linha para cada combinação (componente × turma)
- Exemplo: 2 componentes × 3 turmas = 6 registros DisciplinaTurma

### Turmas (`/api/turmas`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/turmas` | Lista todas as turmas |
| GET | `/api/turmas/:id` | Busca turma por ID |
| POST | `/api/turmas` | Cria turma (ano, nome, periodo, anoLetivo) |
| PUT | `/api/turmas/:id` | Atualiza turma |
| DELETE | `/api/turmas/:id` | Deleta turma |

**Body POST/PUT:**
```json
{
  "ano": 6,  // 1-9
  "nome": "A",  // A, B, C, etc.
  "periodo": "MANHA",  // MANHA, TARDE, NOITE, INTEGRAL
  "anoLetivo": 2025
}
```

### Disciplinas (`/api/disciplinas`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/disciplinas` | Lista todas as disciplinas (10 padronizadas) |
| GET | `/api/disciplinas/:id` | Busca disciplina por ID |
| POST | `/api/disciplinas` | Cria disciplina (nome, cargaHoraria) |
| PUT | `/api/disciplinas/:id` | Atualiza disciplina |
| DELETE | `/api/disciplinas/:id` | Deleta disciplina |

**10 disciplinas padrão:**
- ARTES, CIÊNCIAS, EDUCAÇÃO FÍSICA, ENSINO RELIGIOSO, GEOGRAFIA, HISTÓRIA, INGLÊS, MATEMÁTICA, PORTUGUÊS, PROJETO DE VIDA

### DisciplinaTurma (`/api/disciplinas-turma`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/disciplinas-turma` | Lista todas as vinculações |
| GET | `/api/disciplinas-turma/turma/:turmaId` | Lista disciplinas de uma turma específica |
| POST | `/api/disciplinas-turma` | Cria vinculação manual (disciplinaId, turmaId, professorId?) |
| DELETE | `/api/disciplinas-turma/:id` | Remove vinculação |

**Observação:** Normalmente criado automaticamente ao cadastrar professor.

### Notas (`/api/notas`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/notas` | Lista todas as notas |
| GET | `/api/notas/aluno/:alunoId/disciplinaTurma/:disciplinaTurmaId` | Busca notas completas (3 trimestres + nota final) de um aluno em uma disciplina |
| GET | `/api/notas/final/aluno/:alunoId` | Busca todas as médias finais de um aluno |
| POST | `/api/notas` | Cria nota com cálculos automáticos |
| PUT | `/api/notas/:id` | Atualiza nota (recalcula tudo) |
| DELETE | `/api/notas/:id` | Deleta nota e recalcula média final |

## 🧮 Cálculos Automáticos de Notas

### Endpoint: PUT `/api/notas/:id`

**Body:**
```json
{
  "avaliacao01": 8.0,
  "avaliacao02": 7.5,
  "avaliacao03": 9.0,
  "avaliacaoEAC": 7.0
}
```

**Cálculos Executados no Backend:**

#### 1. Média M1 (Momento 1)
```typescript
const mediaM1 = (avaliacao01 || 0) + (avaliacao02 || 0) + (avaliacao03 || 0);
```

#### 2. Nota Final do Trimestre
```typescript
const notaFinal = Math.max(mediaM1, avaliacaoEAC || 0);
```

#### 3. Atualização de NotaFinal
Após salvar a nota do trimestre, o backend:
- Busca/cria registro em `NotaFinal`
- Atualiza campo `notaT1`, `notaT2` ou `notaT3` conforme o trimestre
- Recalcula `mediaFinal` e `aprovado`

#### 4. Média Final Anual
```typescript
const { notaT1, notaT2, notaT3 } = notaFinal;

if (notaT1 && notaT2 && notaT3) {
  // Todos os trimestres lançados
  const mediaFinal = (notaT1 * 1 + notaT2 * 2 + notaT3 * 3) / 6;
  const aprovado = mediaFinal >= 6.0;
  
  await prisma.notaFinal.update({
    where: { id: notaFinalId },
    data: { mediaFinal, aprovado }
  });
}
```

#### 5. Fórmulas de Média Parcial (Frontend)
O backend fornece os dados, o frontend calcula a média parcial progressiva:

```typescript
// Apenas T1
if (notaT1 && !notaT2 && !notaT3) {
  mediaParcial = notaT1;
  texto = "Média Parcial do Ano (T1)";
}

// T1 + T2
if (notaT1 && notaT2 && !notaT3) {
  mediaParcial = (notaT1 * 1 + notaT2 * 2) / 3;
  texto = "Média Parcial do Ano (T1+T2)";
}

// T1 + T2 + T3
if (notaT1 && notaT2 && notaT3) {
  mediaParcial = (notaT1 * 1 + notaT2 * 2 + notaT3 * 3) / 6;
  texto = "Média Parcial do Ano";
}
```

**Resposta:**
```json
{
  "id": "uuid",
  "alunoId": "uuid",
  "disciplinaTurmaId": "uuid",
  "trimestre": 1,
  "avaliacao01": 8.0,
  "avaliacao02": 7.5,
  "avaliacao03": 9.0,
  "mediaM1": 24.5,
  "avaliacaoEAC": 7.0,
  "notaFinal": 24.5,
  "updatedAt": "2025-12-06T..."
}

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/frequencia` | Lista registros | Sim |
## 🎯 Fluxo Completo - Sistema de Notas

### Cenário: Professor lança notas do 1º Trimestre

1. **Frontend solicita:**
   ```
   PUT /api/notas/:notaId
   Body: {
     avaliacao01: 8.0,
     avaliacao02: 7.5,
     avaliacao03: 9.0,
     avaliacaoEAC: 7.0
   }
   ```

2. **Backend calcula automaticamente:**
   ```typescript
   mediaM1 = 8.0 + 7.5 + 9.0 = 24.5
   notaFinal = Math.max(24.5, 7.0) = 24.5
   ```

3. **Backend atualiza Nota:**
   ```sql
   UPDATE Nota SET
     avaliacao01 = 8.0,
     avaliacao02 = 7.5,
     avaliacao03 = 9.0,
     mediaM1 = 24.5,
     avaliacaoEAC = 7.0,
     notaFinal = 24.5
   WHERE id = :notaId
   ```

4. **Backend busca/cria NotaFinal:**
   ```typescript
   const notaFinal = await prisma.notaFinal.upsert({
     where: {
       alunoId_disciplinaTurmaId: {
         alunoId: nota.alunoId,
         disciplinaTurmaId: nota.disciplinaTurmaId
       }
     },
     update: { notaT1: 24.5 },
     create: {
       alunoId: nota.alunoId,
       disciplinaTurmaId: nota.disciplinaTurmaId,
       notaT1: 24.5
     }
   });
   ```

5. **Backend verifica trimestres completos:**
   ```typescript
   // Se apenas T1: não calcula média final ainda
   // Se T1+T2: não calcula média final ainda
   // Se T1+T2+T3: calcula média final e aprovação
   
   if (notaT1 && notaT2 && notaT3) {
     const mediaFinal = (notaT1 * 1 + notaT2 * 2 + notaT3 * 3) / 6;
     const aprovado = mediaFinal >= 6.0;
     
     await prisma.notaFinal.update({
       where: { id: notaFinalId },
       data: { mediaFinal, aprovado }
     });
   }
   ```

6. **Frontend recebe resposta e:**
   - Atualiza card do trimestre
   - Recalcula média parcial progressiva
   - Atualiza badge de status

## 📚 Scripts Úteis

### Padronizar Disciplinas
```powershell
# Cria as 10 disciplinas padrão
cd backend
npx tsx prisma/padronizar-disciplinas.ts
```

**Script:** `prisma/padronizar-disciplinas.ts`
```typescript
const disciplinas = [
  { nome: 'ARTES', cargaHoraria: 80 },
  { nome: 'CIÊNCIAS', cargaHoraria: 120 },
  { nome: 'EDUCAÇÃO FÍSICA', cargaHoraria: 80 },
  { nome: 'ENSINO RELIGIOSO', cargaHoraria: 40 },
  { nome: 'GEOGRAFIA', cargaHoraria: 80 },
  { nome: 'HISTÓRIA', cargaHoraria: 80 },
  { nome: 'INGLÊS', cargaHoraria: 80 },
  { nome: 'MATEMÁTICA', cargaHoraria: 160 },
  { nome: 'PORTUGUÊS', cargaHoraria: 160 },
  { nome: 'PROJETO DE VIDA', cargaHoraria: 40 }
];
```

### Visualizar Banco de Dados
```powershell
npx prisma studio
```
Abre interface visual em http://localhost:5555

### Resetar Migrações
```powershell
npx prisma migrate reset
```
⚠️ **ATENÇÃO:** Deleta todos os dados!

### Gerar Client após mudanças no Schema
```powershell
npx prisma generate
```

### Sincronizar Schema sem Migração
```powershell
npx prisma db push
```

## 🔐 Tratamento de Erros

### Padrão de Resposta

**Sucesso:**
```json
{
  "id": "uuid",
  "nome": "...",
  // ... outros campos
}
```

**Erro:**
```json
{
  "error": "Mensagem de erro descritiva"
}
```

### Códigos HTTP

| Código | Significado | Quando usar |
|--------|-------------|-------------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado |
| 400 | Bad Request | Dados inválidos |
| 401 | Unauthorized | Não autenticado |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro do servidor |

## 🚀 Melhorias Recentes

### Sistema Professor-Centric
- ✅ Cadastro com área e componentes via JSON
- ✅ Vinculação a múltiplas turmas
- ✅ Criação automática de DisciplinaTurma

### Disciplinas Padronizadas
- ✅ 10 componentes curriculares com acentuação correta
- ✅ Script de criação automatizada
- ✅ Carga horária por disciplina

### Sistema de Notas
- ✅ Cálculos automáticos (M1, notaFinal, mediaFinal, aprovado)
- ✅ Upsert para evitar duplicatas
- ✅ Deleção em cascata
- ✅ Atualização automática de médias

### Arquitetura
- ✅ Rotas organizadas por entidade
- ✅ TypeScript strict mode
- ✅ Prisma ORM 5.22.0
- ✅ CORS configurado

## 📚 Documentação Adicional

Consulte também:
- **[README Principal](../README.md)** - Visão geral do sistema
- **[Frontend README](../frontend/README.md)** - Interface React

## 🎯 Próximos Passos

Para desenvolvedores que desejam contribuir:
1. Entenda o schema do Prisma em `prisma/schema.prisma`
2. Estude o fluxo de notas em `src/routes/notas.ts`
3. Mantenha padrões REST nas rotas
4. Use TypeScript strict mode
5. Teste com Prisma Studio

---

**Backend do Sistema de Gestão Escolar** - Versão 2.0 - 2025

Porta: **3333** | Banco: **PostgreSQL 18** | ORM: **Prisma 5.22.0**

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
