# 🎓 Sistema de Gestão Escolar

Sistema completo e moderno para gerenciamento de instituições de ensino, desenvolvido com tecnologias de ponta para oferecer uma experiência fluida e eficiente.

## 📋 Visão Geral

Solução full-stack integrada que automatiza e simplifica todos os processos administrativos e pedagógicos de escolas e instituições educacionais, desde a matrícula até a geração de relatórios e boletins.

## 🌟 Principais Recursos

### 👥 Gestão de Pessoas
- **Alunos**: Cadastro completo com matrícula, dados pessoais, responsáveis e histórico escolar
- **Professores**: Gerenciamento de docentes, especialidades, áreas (Anos Iniciais/Finais/Ambos) e vinculação automática com disciplinas e turmas
- **Funcionários**: Controle de equipe administrativa e de apoio
- **Equipe Diretiva**: Gestão da Direção, Orientação e Supervisão

### 📚 Gestão Acadêmica
- **Turmas**: Organização por série, turno e ano letivo
- **Disciplinas**: Cadastro e vinculação com turmas e professores
- **Grade Horária**: Montagem interativa de horários semanais
- **Calendário Escolar**: Planejamento de eventos, feriados e períodos letivos

### 📊 Avaliação e Acompanhamento
- **Sistema de Notas**: Registro por trimestre com múltiplas avaliações
- **Frequência**: Controle diário de presença com relatórios
- **Boletim de Desempenho**: Visualização completa do rendimento escolar
- **Registro de Habilidades BNCC**: Acompanhamento detalhado de 334+ habilidades da Base Nacional Comum Curricular
  - Língua Portuguesa: 80+ habilidades (1º ao 9º ano)
  - Matemática: 85+ habilidades (1º ao 9º ano)
  - Ciências: 65+ habilidades (1º ao 9º ano)
  - História: 60+ habilidades (1º ao 9º ano)
  - Geografia: 44+ habilidades (1º ao 9º ano)
  - Status de desenvolvimento (não iniciado, em desenvolvimento, desenvolvido)
  - Atribuição por trimestre
  - Habilitação/desabilitação individual

### ⏰ Controle de Ponto
- **Registro Facial (IA)**: Reconhecimento facial para registro de ponto
- **Entrada/Saída**: Controle automático de horários
- **Relatórios**: Visualização por período, funcionário e departamento
- **Geração de Comprovantes**: Impressão de registros individuais

### 📈 Relatórios e Documentos
- **Boletins em PDF**: Geração automática com logo da instituição
- **Relatórios de Frequência**: Exportação em Excel e PDF
- **Relatórios de Desempenho**: Análises estatísticas por turma
- **Relatório Geral de Ponto**: Consolidação de registros de funcionários
- **Gráficos e Dashboards**: Visualização interativa de dados

### 🔐 Segurança e Autenticação
- **Login Seguro**: Sistema JWT com refresh tokens
- **Controle de Permissões**: Diferentes níveis de acesso por cargo
- **Recuperação de Senha**: Fluxo completo de reset
- **Registro de Usuários**: Cadastro com validação de dados

### 🎨 Interface Moderna
- **Tema Claro/Escuro**: Alternância de modo com persistência
- **Design Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Navegação Intuitiva**: Sidebar com ícones e organização clara
- **Feedback Visual**: Alertas, confirmações e loading states

## 🛠️ Stack Tecnológica

### Frontend
- **React 18.2** - Biblioteca UI moderna e reativa
- **TypeScript 5.3** - Type safety e melhor DX
- **Vite 5.0** - Build tool ultra-rápida
- **React Router 6** - Navegação SPA
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones consistentes
- **jsPDF + AutoTable** - Geração de PDFs
- **Recharts** - Gráficos interativos
- **XLSX** - Exportação para Excel
- **face-api.js** - Reconhecimento facial com IA

### Backend
- **Node.js 18+** - Runtime JavaScript
- **Express.js 4.18** - Framework web
- **TypeScript 5.3** - Type safety
- **Prisma 5.22** - ORM moderno
- **PostgreSQL 14+** - Banco de dados relacional
- **JWT** - Autenticação stateless
- **bcryptjs** - Hash de senhas
- **Zod** - Validação de schemas

## 📁 Estrutura do Projeto

```
PROJETO SISTEMA DE GESTÃO ESCOLAR/
├── frontend/                    # Aplicação React
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── contexts/           # Context API (Auth, Theme)
│   │   ├── data/              # Base de dados BNCC
│   │   ├── lib/               # Utilitários e API client
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── App.tsx            # Configuração de rotas
│   │   └── main.tsx           # Entry point
│   ├── public/
│   │   └── models/            # Modelos de reconhecimento facial
│   └── package.json
│
├── backend/                    # API REST
│   ├── src/
│   │   ├── routes/            # Endpoints da API
│   │   ├── controllers/       # Lógica de negócio
│   │   ├── services/          # Serviços auxiliares
│   │   ├── lib/               # Prisma client
│   │   └── server.ts          # Configuração Express
│   ├── prisma/
│   │   ├── schema.prisma      # Schema do banco
│   │   ├── seed.ts            # Dados iniciais
│   │   └── migrations/        # Histórico de migrações
│   └── package.json
│
└── README.md                   # Este arquivo
```

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** 18 ou superior
- **PostgreSQL** 14 ou superior
- **npm** ou **yarn**

### 1. Clonar o Repositório

```bash
git clone https://github.com/RODRIGOGRILLOMOREIRA/SISTEMA-DE-GESTAO-ESCOLAR.git
cd SISTEMA-DE-GESTAO-ESCOLAR
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Criar arquivo .env baseado no .env.example
# Configurar DATABASE_URL e JWT_SECRET

# Executar migrations
npx prisma migrate dev

# Popular banco com usuário admin
npx prisma db seed

# Iniciar servidor
npm run dev
# Servidor rodando em http://localhost:3333
```

### 3. Configurar Frontend

```bash
cd frontend
npm install

# Criar arquivo .env baseado no .env.example
# Configurar VITE_API_URL

# Iniciar aplicação
npm run dev
# Aplicação rodando em http://localhost:5173
```

### 4. Credenciais Padrão

```
Email: admin@escola.com
Senha: admin123
```

## 📱 Principais Funcionalidades

### Dashboard Administrativo
- Visão geral com cards de estatísticas
- Acesso rápido às principais funcionalidades
- Tema personalizável (claro/escuro)

### Gestão de Alunos
- Cadastro completo com foto
- Dados pessoais e de responsáveis
- Vínculo com turmas
- Histórico acadêmico

### Sistema de Notas
- Registro por trimestre
- Múltiplas avaliações por período
- Cálculo automático de médias
- Geração de boletins em PDF

### Controle de Frequência
- Registro diário de presença
- Justificativas de ausência
- Relatórios por período
- Exportação para Excel

### Registro de Habilidades BNCC
- 334+ habilidades organizadas por:
  - Componente curricular
  - Ano escolar (1º ao 9º)
  - Código oficial BNCC
- Acompanhamento individual por aluno
- Status de desenvolvimento (3 níveis)
- Atribuição por trimestre
- Interface intuitiva com cards
- Filtros por categoria (Anos Iniciais/Finais)

### Calendário Escolar
- Visualização mensal/anual
- Adição de eventos e feriados
- Períodos letivos e recessos
- Exportação para impressão

### Grade Horária
- Montagem visual interativa
- Distribuição de aulas por dia/horário
- Vinculação professor-disciplina-turma
- Detecção de conflitos

### Controle de Ponto
- Registro com reconhecimento facial
- Entrada e saída automáticas
- Relatório consolidado
- Geração de comprovantes

## 🔒 Segurança

- Autenticação JWT com tokens de curta duração
- Senhas criptografadas com bcrypt
- Validação de dados no frontend e backend
- Proteção CORS configurável
- Rotas privadas protegidas
- Controle de permissões por cargo

## 📊 Banco de Dados

### Principais Entidades

- **Usuario**: Sistema de autenticação
- **Aluno**: Estudantes matriculados
- **Professor**: Corpo docente
- **Funcionario**: Equipe administrativa
- **EquipeDiretiva**: Direção e coordenação
- **Turma**: Classes organizadas
- **Disciplina**: Componentes curriculares
- **DisciplinaTurma**: Vinculações
- **Nota**: Avaliações e médias
- **Frequencia**: Registros de presença
- **EventoCalendario**: Calendário escolar
- **GradeHoraria**: Horários de aula
- **RegistroPonto**: Controle de ponto
- **Configuracao**: Dados da instituição

## 🎯 Próximas Melhorias

- [ ] Sistema de mensagens internas
- [ ] Notificações push
- [ ] Integração com sistemas de pagamento
- [ ] App mobile nativo
- [ ] Biblioteca virtual
- [ ] Portal do responsável
- [ ] Gestão de transporte escolar
- [ ] Controle de merenda
- [ ] Sistema de ocorrências disciplinares
- [ ] Integração com plataformas EAD

## 📄 Licença

Este projeto é privado e de uso exclusivo da instituição.

## 👨‍💻 Desenvolvedor

**Rodrigo Grillo Moreira**
- GitHub: [@RODRIGOGRILLOMOREIRA](https://github.com/RODRIGOGRILLOMOREIRA)

---

Desenvolvido com ❤️ para modernizar a gestão educacional
