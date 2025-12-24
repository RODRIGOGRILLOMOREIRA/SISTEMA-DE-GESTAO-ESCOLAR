# 🎓 Sistema de Gestão Escolar

Sistema completo de gestão escolar desenvolvido com tecnologias modernas, oferecendo controle total sobre alunos, professores, turmas, notas, frequências, calendário escolar e muito mais.

## 📋 Sobre o Projeto

O Sistema de Gestão Escolar é uma aplicação web completa que automatiza e facilita a administração de instituições de ensino. Desenvolvido com foco em usabilidade e eficiência, o sistema oferece recursos para gerenciar todos os aspectos da rotina escolar.

## ✨ Funcionalidades Principais

### 👥 Gestão de Pessoas
- **Alunos**: Cadastro completo com matrícula, dados pessoais, responsáveis e histórico
- **Professores**: Gerenciamento de docentes, especialidades, áreas (Anos Iniciais/Finais/Ambos) e vinculação automática com disciplinas e turmas
- **Funcionários**: Controle de equipe administrativa e de apoio
- **Equipe Diretiva**: Gestão da direção e coordenação

### 📚 Gestão Acadêmica
- **Turmas**: Organização por anos letivos (1º ao 9º ano), períodos e professores responsáveis
- **Disciplinas**: Cadastro intuitivo por turma com carga horária e vinculação de professores via autocomplete
  - Interface otimizada com navegação por categorias (Anos Iniciais/Anos Finais)
  - Seleção de turma com visualização clara das disciplinas cadastradas
  - Busca inteligente de professores com sugestões em tempo real
  - Validação automática de vínculos professor-disciplina-turma
- **Notas**: Sistema trimestral com cálculo automático de médias (T1×3 + T2×3 + T3×4)÷10
- **Frequências**: Controle de presença com percentuais e alertas automáticos
- **Boletim de Desempenho**: Relatórios detalhados por aluno com opções de impressão
- **Grade Horária**: Organização de horários de aulas por turma

### 📅 Gestão de Calendário Escolar
- **Calendário Escolar**: Planejamento anual com eventos, feriados e períodos letivos
- **Eventos**: Gestão de início/fim de ano, recesso, reuniões pedagógicas e datas importantes

### ⏰ Controle de Ponto
- **Registro de Ponto**: Sistema completo para professores, funcionários e equipe diretiva
- **Jornada de Trabalho**: Configuração de carga horária e horários padrão
- **Banco de Horas**: Controle mensal de horas trabalhadas e saldos
- **Relatórios**: Visualização detalhada por período e pessoa

### 📊 Relatórios e Análises
- **Dashboard**: Visão geral com indicadores e estatísticas
- **Relatórios Gerais**: Exportação de dados em diversos formatos
- **Boletins**: Geração automática em PDF com logo da escola

### ⚙️ Configurações
- **Personalização**: Nome da escola, logo, contatos e tema (claro/escuro)
- **Usuários**: Sistema de autenticação com níveis de acesso (Admin/Usuário)
- **Permissões**: Controle de acesso por funcionalidade

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** + **TypeScript** - Ambiente de execução e tipagem
- **Express.js** - Framework web
- **Prisma ORM** - Gerenciamento de banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação segura
- **bcryptjs** - Criptografia de senhas
- **Zod** - Validação de dados

### Frontend
- **React 18** + **TypeScript** - Biblioteca UI e tipagem
- **Vite** - Build tool rápido
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones modernos
- **jsPDF** + **AutoTable** - Geração de PDFs
- **Recharts** - Gráficos e visualizações
- **XLSX** - Exportação para Excel

## 📦 Estrutura do Projeto

```
PROJETO SISTEMA DE GESTÃO ESCOLAR/
├── backend/                    # API REST
│   ├── prisma/                # Schema e migrations do banco
│   │   ├── schema.prisma     # Definição dos modelos
│   │   ├── seed.ts           # Dados iniciais
│   │   └── migrations/       # Histórico de alterações
│   ├── src/
│   │   ├── routes/           # Endpoints da API
│   │   ├── controllers/      # Lógica de negócio
│   │   ├── services/         # Serviços auxiliares
│   │   ├── lib/              # Bibliotecas e utilidades
│   │   └── server.ts         # Configuração do servidor
│   ├── uploads/              # Arquivos enviados
│   └── package.json
│
├── frontend/                  # Interface web
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── contexts/         # Context API (Auth, Theme)
│   │   ├── lib/              # API client e utilitários
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── App.tsx           # Componente principal
│   │   └── main.tsx          # Ponto de entrada
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL 14+ instalado e rodando
- Git instalado

### 1️⃣ Clonar o Repositório
```bash
git clone https://github.com/RODRIGOGRILLOMOREIRA/SISTEMA-DE-GESTAO-ESCOLAR.git
cd SISTEMA-DE-GESTAO-ESCOLAR
```

### 2️⃣ Configurar Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gestao_escolar"
JWT_SECRET="seu-secret-super-secreto-aqui-123"
PORT=3333
```

Execute as migrations e seed:
```bash
npx prisma migrate dev
npx prisma db seed
```

Inicie o servidor:
```bash
npm run dev
```

O backend estará rodando em: **http://localhost:3333**

### 3️⃣ Configurar Frontend

```bash
cd ../frontend
npm install
```

Crie o arquivo `.env`:
```env
VITE_API_URL=http://localhost:3333/api
```

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará rodando em: **http://localhost:5173**

## 🔐 Acesso Inicial

Após executar o seed, use estas credenciais:

- **Email:** admin@escola.com
- **Senha:** admin123
- **Tipo:** ADMIN (acesso total)

> ⚠️ **IMPORTANTE:** Altere estas credenciais em produção!

## 📱 Páginas Disponíveis

### Públicas
- `/login` - Autenticação
- `/register` - Registro de novos usuários
- `/forgot-password` - Recuperação de senha
- `/user-management` - Gestão de credenciais

### Privadas (requer autenticação)
- `/dashboard` - Painel inicial
- `/alunos` - Gestão de alunos
- `/professores` - Gestão de professores
- `/funcionarios` - Gestão de funcionários
- `/equipe-diretiva` - Gestão da equipe diretiva
- `/turmas` - Gestão de turmas
- `/disciplinas` - Gestão de disciplinas
- `/notas` - Lançamento de notas
- `/frequencia` - Registro de frequências
- `/boletim` - Boletim de desempenho
- `/calendario-escolar` - Calendário anual
- `/grade-horaria` - Grade de horários
- `/registro-ponto` - Controle de ponto
- `/relatorios` - Relatórios gerais
- `/configuracoes` - Configurações do sistema

## 🎨 Design e UX

- **Interface Moderna**: Design responsivo com gradientes e efeitos glassmorphism
- **Tema Claro/Escuro**: Alternância entre modos de visualização
- **Responsivo**: Otimizado para desktop, tablet e mobile (320px - 1920px+)
- **Feedback Visual**: Animações suaves e mensagens claras
- **Impressão**: Layouts otimizados para impressão de relatórios
- **Navegação Intuitiva**: Fluxo de trabalho otimizado com breadcrumbs e botões contextuais
- **Autocomplete Inteligente**: Busca de professores com sugestões em tempo real
- **Validações em Tempo Real**: Feedback imediato sobre dados inconsistentes

## 🔄 Últimas Atualizações (Dezembro/2024)

### Melhorias na Gestão de Disciplinas
- ✅ Corrigido problema de campo vazio ao vincular professores
- ✅ Implementado sistema de autocomplete para busca de professores
- ✅ Adicionado carregamento automático de professores ao abrir modal
- ✅ Melhorada navegação entre categorias (Anos Iniciais/Finais)
- ✅ Simplificada interface removendo botões duplicados
- ✅ Adicionado indicador visual quando não há professores cadastrados
- ✅ Implementados logs detalhados para debug e monitoramento
- ✅ Otimizada função de voltar para turmas com recarregamento de dados

## 🔒 Segurança

- ✅ Autenticação JWT com expiração configurável
- ✅ Senhas criptografadas com bcrypt (10 rounds)
- ✅ Validação de dados com Zod
- ✅ CORS configurado
- ✅ Proteção de rotas no frontend e backend
- ✅ Sanitização de inputs

## 📊 Sistema de Notas

**Fórmula de Cálculo:**
```
Média Final = (Trimestre1 × 3 + Trimestre2 × 3 + Trimestre3 × 4) ÷ 10
```

**Critérios de Aprovação:**
- Média Final ≥ 6.0 **E** Frequência ≥ 75%

**Classificações:**
- ≥ 8.0: Aprovado Excelente
- ≥ 6.0: Aprovado - Pode Evoluir
- ≥ 4.0: Reprovado - Pode Evoluir
- < 4.0: Reprovado - Intervenção Urgente

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Scripts Disponíveis

### Backend
```bash
npm run dev          # Inicia servidor em modo desenvolvimento
npm run build        # Compila TypeScript para JavaScript
npm start            # Inicia servidor em produção
npm run prisma:generate  # Gera cliente Prisma
npm run prisma:migrate   # Executa migrations
npm run prisma:studio    # Abre interface visual do banco
```

### Frontend
```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build de produção
```

## 📄 Licença

Este projeto está sob a licença ISC.

## 👨‍💻 Autor

**Rodrigo Grillo Moreira**
- GitHub: [@RODRIGOGRILLOMOREIRA](https://github.com/RODRIGOGRILLOMOREIRA)



---

**Desenvolvido com ❤️ para facilitar a gestão escolar**
