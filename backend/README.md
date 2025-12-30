# 🔧 Backend - Sistema de Gestão Escolar

API REST completa e robusta para gerenciamento de sistemas educacionais, construída com Node.js, TypeScript, Express e Prisma ORM.

## 📋 Visão Geral

Backend escalável e bem estruturado que fornece todos os endpoints necessários para operação de um sistema de gestão escolar completo, incluindo autenticação JWT, CRUD de entidades, controle de ponto com IA, geração de relatórios, sistema de notas e frequências.

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
- **Upload**: Multer

## 🌟 Funcionalidades da API

### 🔐 Autenticação e Segurança
- **POST** `/auth/login` - Login com JWT
- **POST** `/auth/register` - Registro de usuários
- **POST** `/auth/forgot-password` - Recuperação de senha
- **GET** `/auth/me` - Dados do usuário autenticado
- Middleware de autenticação JWT
- Controle de permissões por cargo

### 👥 Gestão de Pessoas

**Alunos** (`/alunos`)
- **GET** `/` - Listar todos os alunos
- **GET** `/:id` - Buscar aluno por ID
- **POST** `/` - Criar novo aluno
- **PUT** `/:id` - Atualizar aluno
- **DELETE** `/:id` - Excluir aluno
- Suporte a upload de foto
- Dados de responsáveis

**Professores** (`/professores`)
- **GET** `/` - Listar todos os professores
- **GET** `/:id` - Buscar professor por ID
- **POST** `/` - Criar novo professor
- **PUT** `/:id` - Atualizar professor
- **DELETE** `/:id` - Excluir professor
- Vinculação com disciplinas

**Funcionários** (`/funcionarios`)
- **GET** `/` - Listar todos os funcionários
- **GET** `/:id` - Buscar funcionário por ID
- **POST** `/` - Criar novo funcionário
- **PUT** `/:id` - Atualizar funcionário
- **DELETE** `/:id` - Excluir funcionário
- Controle de cargo e departamento

**Equipe Diretiva** (`/equipe-diretiva`)
- **GET** `/` - Listar equipe diretiva
- **GET** `/:id` - Buscar membro por ID
- **POST** `/` - Criar novo membro
- **PUT** `/:id` - Atualizar membro
- **DELETE** `/:id` - Excluir membro
- Cargos: Diretor, Coordenador, Supervisor

### 📚 Gestão Acadêmica

**Turmas** (`/turmas`)
- **GET** `/` - Listar todas as turmas
- **GET** `/:id` - Buscar turma por ID com alunos
- **POST** `/` - Criar nova turma
- **PUT** `/:id` - Atualizar turma
- **DELETE** `/:id` - Excluir turma
- Organização por série, turno, ano letivo

**Disciplinas** (`/disciplinas`)
- **GET** `/` - Listar todas as disciplinas
- **GET** `/:id` - Buscar disciplina por ID
- **POST** `/` - Criar nova disciplina
- **PUT** `/:id` - Atualizar disciplina
- **DELETE** `/:id` - Excluir disciplina
- Carga horária e código

**Disciplina-Turma** (`/disciplina-turma`)
- **GET** `/turma/:turmaId` - Disciplinas de uma turma
- **POST** `/` - Vincular disciplina a turma
- **DELETE** `/:id` - Remover vinculação
- Associação professor-disciplina-turma

### 📊 Avaliação e Desempenho

**Notas** (`/notas`)
- **GET** `/turma/:turmaId/trimestre/:trimestre` - Notas por turma/trimestre
- **GET** `/aluno/:alunoId` - Todas as notas de um aluno
- **POST** `/` - Registrar nota
- **PUT** `/:id` - Atualizar nota
- **DELETE** `/:id` - Excluir nota
- Sistema trimestral (1º, 2º, 3º)
- Múltiplas avaliações (A1, A2, A3, Recuperação)
- Cálculo automático de médias

**Frequências** (`/frequencias`)
- **GET** `/turma/:turmaId` - Frequências de uma turma
- **GET** `/aluno/:alunoId` - Frequências de um aluno
- **POST** `/` - Registrar frequência
- **PUT** `/:id` - Atualizar frequência
- Registro por disciplina e data
- Controle de presença/falta

**Registro de Frequência** (`/frequencia`)
- **GET** `/turma/:turmaId/data/:data` - Frequência por data
- **POST** `/registrar` - Registrar presença/ausência
- **PUT** `/:id/justificar` - Justificar ausência
- Sistema de justificativas

### 📅 Planejamento

**Calendário Escolar** (`/calendario`)
- **GET** `/` - Listar todos os eventos
- **GET** `/mes/:ano/:mes` - Eventos de um mês
- **GET** `/:id` - Buscar evento por ID
- **POST** `/` - Criar novo evento
- **PUT** `/:id` - Atualizar evento
- **DELETE** `/:id` - Excluir evento
- Tipos: Aula, Feriado, Evento, Reunião, Avaliação

**Grade Horária** (`/grade-horaria`)
- **GET** `/turma/:turmaId` - Grade de uma turma
- **POST** `/` - Criar horário
- **PUT** `/:id` - Atualizar horário
- **DELETE** `/:id` - Excluir horário
- Organização por dia da semana e horário

### ⏰ Controle de Ponto

**Registro de Ponto** (`/ponto`)
- **GET** `/funcionario/:funcionarioId` - Registros de um funcionário
- **GET** `/periodo` - Registros por período (query: dataInicio, dataFim)
- **POST** `/registrar` - Registrar entrada/saída
- **POST** `/cadastrar-facial` - Cadastrar dados faciais
- **POST** `/reconhecer` - Reconhecimento facial
- Upload de fotos
- Armazenamento de descritores faciais (IA)
- Tipos: Entrada, Saída, Entrada-Almoço, Saída-Almoço

### ⚙️ Configurações

**Configurações** (`/configuracoes`)
- **GET** `/` - Buscar configurações da escola
- **POST** `/` - Criar configurações
- **PUT** `/` - Atualizar configurações
- Dados da instituição
- Logo da escola
- Informações de contato

## 📁 Estrutura de Pastas

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema completo do banco de dados
│   ├── seed.ts               # Dados iniciais (usuário admin)
│   └── migrations/           # Histórico de migrações
│       ├── migration_lock.toml
│       └── [timestamps]/     # Arquivos de migração SQL
│
├── src/
│   ├── routes/              # Rotas da API (16 módulos)
│   │   ├── auth.routes.ts           # Autenticação e registro
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
│   │   ├── ponto.routes.ts          # Controle de ponto + IA
│   │   ├── reconhecimento-facial.routes.ts # Reconhecimento facial
│   │   └── configuracoes.routes.ts  # Configurações
│   │
│   ├── controllers/         # Lógica de negócio (futuro)
│   ├── services/           # Serviços auxiliares
│   │   └── reconhecimento-facial.service.ts
│   │
│   ├── lib/
│   │   └── prisma.ts       # Instância do Prisma Client
│   │
│   └── server.ts           # Configuração principal do servidor
│
├── uploads/                # Arquivos enviados
│   ├── reconhecimento-facial/  # Fotos para cadastro facial
│   └── registro-ponto/         # Registros de ponto
│
├── models/                 # Arquivos auxiliares
├── .env                   # Variáveis de ambiente (não versionado)
├── .env.example          # Exemplo de variáveis
├── .gitignore
├── package.json
├── tsconfig.json
├── limpar-duplicatas.ts  # Script de manutenção
└── README.md
```

## 🗄️ Banco de Dados

### Principais Entidades

**Usuario**
- Autenticação e controle de acesso
- Campos: email, senha (hash), nome, cargo

**Aluno**
- Dados pessoais completos
- Responsáveis (nome, telefone, email)
- Foto de perfil
- Vinculação com turmas

**Professor**
- Dados pessoais
- Disciplinas que leciona
- Vinculação com turmas

**Funcionario**
- Dados pessoais
- Cargo e departamento
- Dados para reconhecimento facial

**EquipeDiretiva**
- Gestores da instituição
- Cargos: Diretor, Coordenador, Supervisor

**Turma**
- Série, nome, turno
- Ano letivo
- Lista de alunos

**Disciplina**
- Nome, código
- Carga horária

**DisciplinaTurma**
- Vinculação tripla: Disciplina-Turma-Professor

**Nota**
- Aluno, disciplina, trimestre
- Avaliações (A1, A2, A3, Recuperação)
- Média calculada

**Frequencia**
- Aluno, disciplina, data
- Presente/Ausente
- Justificativa

**EventoCalendario**
- Título, descrição
- Data início/fim
- Tipo de evento

**GradeHoraria**
- Turma, dia da semana
- Horário início/fim
- Disciplina e professor

**RegistroPonto**
- Funcionário, data/hora
- Tipo (Entrada/Saída)
- Foto e descritores faciais (JSON)

**Configuracao**
- Dados da escola
- Logo, contatos
- Configurações gerais

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend:

```env
# Conexão com banco de dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gestao_escolar?schema=public"

# Chave secreta para JWT (use uma chave forte em produção!)
JWT_SECRET="seu-secret-super-secreto-aqui-mudar-em-producao-123456"

# Porta do servidor (padrão: 3333)
PORT=3333

# URL do frontend para CORS
FRONTEND_URL="http://localhost:5173"

# Ambiente (development | production)
NODE_ENV=development
```

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados

Certifique-se de que o PostgreSQL está rodando e crie o banco:

```sql
CREATE DATABASE gestao_escolar;
```

### 3. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 4. Executar Migrations

```bash
npx prisma migrate dev
```

### 5. Popular Banco de Dados

```bash
npx prisma db seed
# Cria usuário admin padrão:
# Email: admin@escola.com
# Senha: admin123
```

### 6. Iniciar Servidor

**Desenvolvimento:**
```bash
npm run dev
# Servidor rodando em http://localhost:3333
```

**Produção:**
```bash
npm run build
npm start
```

## 📡 Endpoints da API

### Base URL
```
http://localhost:3333
```

### Autenticação
Todas as rotas exceto `/auth/*` requerem token JWT no header:
```
Authorization: Bearer <token>
```

### Exemplos de Uso

**Login:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@escola.com",
  "senha": "admin123"
}
```

**Criar Aluno:**
```bash
POST /alunos
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "João Silva",
  "dataNascimento": "2010-05-15",
  "cpf": "12345678901",
  "email": "joao@email.com",
  "telefone": "(11) 98765-4321",
  "endereco": "Rua Exemplo, 123",
  "nomeResponsavel": "Maria Silva",
  "telefoneResponsavel": "(11) 91234-5678"
}
```

**Registrar Nota:**
```bash
POST /notas
Authorization: Bearer <token>
Content-Type: application/json

{
  "alunoId": "uuid-do-aluno",
  "disciplinaId": "uuid-da-disciplina",
  "trimestre": 1,
  "a1": 8.5,
  "a2": 7.0,
  "a3": 9.0
}
```

**Registrar Ponto:**
```bash
POST /ponto/registrar
Authorization: Bearer <token>
Content-Type: application/json

{
  "funcionarioId": "uuid-do-funcionario",
  "tipo": "Entrada"
}
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor em modo desenvolvimento (tsx watch)
npm run build        # Compila TypeScript para JavaScript
npm start            # Inicia servidor em produção
npm run seed         # Popula banco de dados

# Prisma
npx prisma migrate dev       # Cria e aplica migration
npx prisma migrate deploy    # Aplica migrations (produção)
npx prisma studio            # Interface visual do banco
npx prisma generate          # Gera Prisma Client
npx prisma db seed           # Executa seed
```

## 🔒 Segurança

- Senhas criptografadas com bcrypt (10 rounds)
- Tokens JWT com expiração configurável
- Validação de dados com Zod
- Proteção CORS
- Rate limiting (recomendado para produção)
- Sanitização de inputs
- Headers de segurança

## 📊 Middleware

- **authMiddleware**: Validação de token JWT
- **cors**: Controle de acesso entre origens
- **express.json**: Parser de JSON
- **multer**: Upload de arquivos

## 🧪 Testes

```bash
# Futuro
npm test
```

## 📈 Monitoramento

Para produção, recomenda-se:
- PM2 para gerenciamento de processos
- Winston para logs estruturados
- Sentry para tracking de erros
- Prometheus + Grafana para métricas

## 🚀 Deploy

### Opções de Deploy

**Heroku:**
```bash
heroku create nome-app
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3333
CMD ["npm", "start"]
```

**Railway/Render:**
- Conectar repositório GitHub
- Configurar variáveis de ambiente
- Deploy automático

## 📝 Logs

Logs são exibidos no console em desenvolvimento.
Para produção, configure um sistema de logs apropriado.

## 🔄 Migrations

Histórico de mudanças no banco:
```
20251202235526_init              # Schema inicial
20251203001127_add_configuracao  # Tabela Configuracao
20251203010311_add_usuario       # Tabela Usuario
```

## 🎯 Próximas Melhorias

- [ ] Testes unitários e de integração
- [ ] Documentação Swagger/OpenAPI
- [ ] Rate limiting
- [ ] Cache com Redis
- [ ] Logs estruturados (Winston)
- [ ] Websockets para notificações em tempo real
- [ ] Sistema de filas (Bull/BullMQ)
- [ ] Backup automatizado
- [ ] Monitoring e alertas
- [ ] CI/CD pipeline

## 👨‍💻 Desenvolvimento

### Padrões de Código

- TypeScript strict mode
- ESLint para linting
- Prettier para formatação
- Convenções REST
- Error handling consistente

### Estrutura de Resposta

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

---

Desenvolvido com ❤️ usando Node.js + TypeScript + Prisma


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
