# 🔧 Backend - Sistema de Gestão Escolar

API REST completa para gerenciamento de sistemas educacionais, construída com Node.js, TypeScript, Express e Prisma ORM.

## 📋 Visão Geral

Backend robusto e escalável que fornece todos os endpoints necessários para operação de um sistema de gestão escolar, incluindo autenticação, CRUD de entidades, controle de ponto, geração de relatórios e muito mais.

## 🛠️ Tecnologias

- **Runtime**: Node.js 18+
- **Linguagem**: TypeScript 5.3
- **Framework**: Express.js 4.18
- **ORM**: Prisma 5.22
- **Banco de Dados**: PostgreSQL 14+
- **Autenticação**: JWT (jsonwebtoken)
- **Criptografia**: bcryptjs
- **Validação**: Zod
- **CORS**: cors
- **Variáveis de Ambiente**: dotenv

## 📁 Estrutura de Pastas

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   ├── seed.ts               # Dados iniciais (usuário admin)
│   └── migrations/           # Histórico de migrações
│       ├── migration_lock.toml
│       └── [timestamps]/     # Arquivos de migração
├── src/
│   ├── routes/              # Rotas da API
│   │   ├── auth.routes.ts           # Autenticação
│   │   ├── alunos.routes.ts         # CRUD Alunos
│   │   ├── professores.routes.ts    # CRUD Professores
│   │   ├── funcionarios.routes.ts   # CRUD Funcionários
│   │   ├── equipeDiretiva.routes.ts # CRUD Equipe Diretiva
│   │   ├── turmas.routes.ts         # CRUD Turmas
│   │   ├── disciplinas.routes.ts    # CRUD Disciplinas
│   │   ├── disciplinaTurma.routes.ts # Vinculações
│   │   ├── notas.routes.ts          # Sistema de Notas
│   │   ├── frequencias.routes.ts    # Frequências básicas
│   │   ├── frequencia.routes.ts     # Registro de frequência
│   │   ├── calendario.routes.ts     # Calendário escolar
│   │   ├── grade-horaria.routes.ts  # Grade de horários
│   │   ├── ponto.routes.ts          # Controle de ponto
│   │   └── configuracoes.routes.ts  # Configurações
│   ├── controllers/         # Lógica de negócio (vazio por enquanto)
│   ├── services/           # Serviços auxiliares (vazio por enquanto)
│   ├── lib/
│   │   └── prisma.ts       # Instância do Prisma Client
│   └── server.ts           # Configuração principal do servidor
├── uploads/                # Arquivos enviados (imagens, etc)
├── .env                   # Variáveis de ambiente (não versionado)
├── .env.example          # Exemplo de variáveis
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend:

```env
# Conexão com banco de dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gestao_escolar"

# Chave secreta para JWT (use uma chave forte em produção!)
JWT_SECRET="seu-secret-super-secreto-aqui-123"

# Porta do servidor (padrão: 3333)
PORT=3333

# URL do frontend para CORS (opcional)
FRONTEND_URL="http://localhost:5173"
```

## 🚀 Instalação e Execução

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados

Certifique-se de que o PostgreSQL está rodando e crie o banco:

```sql
CREATE DATABASE gestao_escolar;
```

### 3. Executar Migrations

```bash
npx prisma migrate dev
```

### 4. Popular Banco (Seed)

Cria usuário administrador padrão:

```bash
npx prisma db seed
```

**Credenciais criadas:**
- Email: admin@escola.com
- Senha: admin123
- Tipo: ADMIN

### 5. Iniciar Servidor

**Modo Desenvolvimento** (com hot-reload):
```bash
npm run dev
```

**Modo Produção**:
```bash
npm run build
npm start
```

Servidor rodando em: **http://localhost:3333**

## 📡 Endpoints da API

### Base URL
```
http://localhost:3333/api
```

### 🔑 Autenticação (`/api/auth`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/login` | Login de usuário |
| POST | `/register` | Registro de novo usuário |
| POST | `/forgot-password` | Solicitar reset de senha |
| POST | `/reset-password` | Resetar senha com token |
| POST | `/reset-password-direct` | Reset direto (admin) |
| GET | `/me` | Dados do usuário logado |

### 👥 Gestão de Pessoas

#### Alunos (`/api/alunos`)
- `GET /` - Listar todos
- `GET /:id` - Buscar por ID
- `GET /turma/:turmaId` - Buscar por turma
- `POST /` - Criar novo
- `PUT /:id` - Atualizar
- `DELETE /:id` - Remover

#### Professores (`/api/professores`)
- `GET /` - Listar todos (incluindo disciplinas e turmas vinculadas)
- `GET /:id` - Buscar por ID
- `POST /` - Criar novo (com vinculação automática de disciplinas e turmas)
- `PUT /:id` - Atualizar (atualiza vinculações automaticamente)
- `DELETE /:id` - Remover

#### Funcionários (`/api/funcionarios`)
- `GET /` - Listar todos
- `GET /:id` - Buscar por ID
- `POST /` - Criar novo
- `PUT /:id` - Atualizar
- `DELETE /:id` - Remover

#### Equipe Diretiva (`/api/equipe-diretiva`)
- `GET /` - Listar todos
- `GET /:id` - Buscar por ID
- `POST /` - Criar novo
- `PUT /:id` - Atualizar
- `DELETE /:id` - Remover

### 📚 Gestão Acadêmica

#### Turmas (`/api/turmas`)
- `GET /` - Listar todas
- `GET /:id` - Buscar por ID
- `POST /` - Criar nova
- `PUT /:id` - Atualizar
- `DELETE /:id` - Remover

#### Disciplinas (`/api/disciplinas`)
- `GET /` - Listar todas
- `GET /:id` - Buscar por ID
- `POST /` - Criar nova
- `PUT /:id` - Atualizar
- `DELETE /:id` - Remover

#### Disciplina-Turma (`/api/disciplinas-turmas`)
- `GET /` - Listar vinculações
- `GET /:id` - Buscar por ID
- `POST /` - Criar vinculação
- `PUT /:id` - Atualizar
- `DELETE /:id` - Remover

#### Notas (`/api/notas`)
- `GET /` - Listar todas
- `GET /aluno/:alunoId` - Notas de um aluno
- `GET /turma/:turmaId` - Notas de uma turma
- `POST /` - Criar nota
- `PUT /:id` - Atualizar nota
- `DELETE /:id` - Remover nota

#### Frequências (`/api/frequencias` e `/api/registro-frequencia`)
- `GET /` - Listar frequências
- `GET /aluno/:alunoId` - Frequências de um aluno
- `GET /turma/:turmaId` - Frequências de uma turma
- `POST /` - Registrar frequência
- `PUT /:id` - Atualizar
- `DELETE /:id` - Remover

### 📅 Calendário e Grade

#### Calendário Escolar (`/api/calendario`)
- `GET /` - Listar calendários
- `GET /:id` - Buscar por ID
- `POST /` - Criar calendário
- `PUT /:id` - Atualizar
- `DELETE /:id` - Remover

#### Grade Horária (`/api/grade-horaria`)
- `GET /` - Listar grades
- `GET /:turmaId` - Grade de uma turma
- `POST /` - Criar horário
- `PUT /:id` - Atualizar
- `DELETE /:id` - Remover

### ⏰ Controle de Ponto (`/api/ponto`)

- `POST /registrar` - Registrar ponto (entrada/saída)
- `GET /pessoa/:pessoaId` - Registros de uma pessoa
- `GET /mes/:pessoaId/:mes/:ano` - Registros mensais
- `POST /jornada` - Configurar jornada de trabalho
- `GET /jornada/:pessoaId` - Buscar configuração
- `GET /banco-horas/:pessoaId/:mes/:ano` - Banco de horas

### ⚙️ Configurações (`/api/configuracoes`)

- `GET /` - Obter configurações (nome da escola, logo, etc)
- `PUT /` - Atualizar configurações

## 🗄️ Modelos do Banco de Dados

### Principais Entidades

- **usuarios** - Usuários do sistema com autenticação
- **alunos** - Estudantes matriculados
- **professores** - Corpo docente
- **funcionarios** - Equipe de apoio
- **equipe_diretiva** - Direção e coordenação
- **turmas** - Classes escolares
- **disciplinas** - Matérias/componentes curriculares
- **disciplina_turma** - Vinculação disciplina-turma-professor
- **notas** - Sistema de avaliação
- **frequencias** - Controle de presença
- **calendario_escolar** - Planejamento anual
- **eventos_calendario** - Eventos e datas importantes
- **grade_horaria** - Horários de aula
- **registro_ponto** - Ponto eletrônico
- **configuracao_jornada** - Jornada de trabalho
- **banco_horas** - Controle de horas trabalhadas
- **configuracoes** - Configurações gerais

## 🔒 Segurança

### Autenticação JWT

Todas as rotas privadas exigem token JWT no header:

```
Authorization: Bearer <seu_token_jwt>
```

### Criptografia

- Senhas são criptografadas com **bcrypt** (10 rounds)
- Tokens JWT expiram em **7 dias** (configurável)

### CORS

Configurado para aceitar requisições das portas:
- `http://localhost:5173` (Vite padrão)
- `http://localhost:5174` (alternativa)

### Validação

Todos os inputs são validados com **Zod** antes de processar.

## 📊 Scripts NPM

```bash
# Desenvolvimento
npm run dev              # Inicia com hot-reload (tsx watch)

# Produção
npm run build            # Compila TypeScript
npm start                # Inicia servidor compilado

# Prisma
npm run prisma:generate  # Gera Prisma Client
npm run prisma:migrate   # Executa migrations
npm run prisma:studio    # Interface visual do banco
npx prisma db seed       # Popula banco com dados iniciais
npx prisma migrate reset # Reseta banco (CUIDADO!)
```

## 🐛 Debug

Para ver queries SQL do Prisma, adicione no `.env`:

```env
DEBUG="prisma:*"
```

Ou no código:
```typescript
const prisma = new PrismaClient({ log: ['query'] })
```

## 📝 Logs

O servidor exibe logs detalhados no console:

```
🚀 Servidor rodando na porta 3333
📥 Login request: { email: 'user@example.com', senha: '***' }
👤 Usuário encontrado: Sim
🔐 Verificando senha...
✓ Senha válida: true
```

## 🚨 Tratamento de Erros

Todos os endpoints retornam respostas padronizadas:

**Sucesso:**
```json
{
  "data": { ... }
}
```

**Erro:**
```json
{
  "error": "Mensagem de erro"
}
```

**Códigos HTTP:**
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## 🔄 Migrations

Para criar uma nova migration:

```bash
npx prisma migrate dev --name nome_da_migration
```

Para aplicar migrations em produção:

```bash
npx prisma migrate deploy
```

## 📦 Deploy

### Recomendações

1. Use variáveis de ambiente seguras
2. Configure HTTPS
3. Use um gerenciador de processos (PM2)
4. Configure logs externos
5. Monitore performance

### Exemplo com PM2

```bash
npm run build
pm2 start dist/server.js --name "gestao-escolar-api"
```

## 🤝 Contribuindo

Para adicionar novas rotas:

1. Crie o arquivo em `src/routes/`
2. Importe no `server.ts`
3. Registre com `app.use('/api/seu-endpoint', suaRouter)`
4. Documente aqui no README

## 📚 Recursos Adicionais

- [Documentação do Prisma](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/pt-br/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JWT.io](https://jwt.io/)

## 🔄 Últimas Atualizações (Dezembro/2024)

### Melhorias no Sistema de Professores e Disciplinas
- ✅ **GET /professores**: Agora retorna professores com `includes` de disciplinas e turmas vinculadas
- ✅ **POST /professores**: Vinculação automática de disciplinas e turmas via `disciplinas_turmas`
- ✅ **PUT /professores**: Atualização inteligente de vínculos, removendo antigos e criando novos
- ✅ **Validação Aprimorada**: Campo `area` obrigatório (Anos Iniciais/Anos Finais/Ambos)
- ✅ **Relacionamentos**: Suporte completo a múltiplas disciplinas por professor e múltiplas turmas
- ✅ **Atomicidade**: Operações transacionais garantindo integridade dos dados

### Correções e Otimizações
- 🔧 Corrigido retorno de professores na API para incluir relacionamentos
- 🔧 Implementado sistema de logs para debug e monitoramento
- 🔧 Otimizada lógica de vinculação professor-disciplina-turma
- 🔧 Melhorada validação de dados com Zod

---

**Desenvolvido com ⚡ usando Node.js e TypeScript**
