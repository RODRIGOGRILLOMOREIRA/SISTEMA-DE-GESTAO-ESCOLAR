# 📚 Sistema de Gestão Escolar

Sistema completo e moderno de gestão escolar desenvolvido com TypeScript, React e Node.js. Oferece controle total sobre frequência, notas com ano letivo, calendário escolar e relatórios analíticos com dashboards interativos em tema ciano premium.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-316192)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748)](https://www.prisma.io/)

---

## 🎯 Visão Geral

Sistema completo para gestão escolar focado em **Anos Iniciais (1º ao 5º)** e **Anos Finais (6º ao 9º)**, com funcionalidades para controle de alunos, professores, turmas, disciplinas, frequência diária, **notas trimestrais por ano letivo**, calendário escolar e relatórios analíticos com gráficos interativos.

### ✨ Diferenciais

- 🎨 **Interface Premium**: Design moderno com tema ciano (#00BCD4), gradientes animados e efeitos visuais sofisticados
- 📱 **100% Responsivo**: Funciona perfeitamente em smartphones, tablets, notebooks e desktops (320px a 2560px+)
- 🌙 **Modo Escuro Premium**: Tema escuro com bordas ciano, cantos arredondados e efeitos de brilho
- ✨ **Animações Modernas**: Gradientes animados, shine effects, rotating radials e transições suaves
- 📊 **Dashboards Analíticos**: Gráficos interativos com Recharts
- 📅 **Calendário Escolar**: Integração com eventos e ano letivo
- 📆 **Ano Letivo por Notas**: Sistema de notas isolado por ano letivo
- 🔍 **Busca e Filtros**: Pesquisa por aluno e filtros de período personalizáveis
- 📈 **Relatórios Inteligentes**: Dados agregados por turma e por aluno individual
- 🔄 **Atualização em Tempo Real**: Sincronização automática dos dados
- 🎓 **Sistema Trimestral**: Notas organizadas por trimestres com cálculo automático de médias
- 🎯 **Layout Unificado**: Aparência consistente em todas as páginas com botões padronizados

---

## 🚀 Tecnologias

### Backend
- **Node.js 20.x** com Express
- **TypeScript 5.x** para type-safety
- **Prisma ORM 5.22.0** para gerenciamento do banco de dados
- **PostgreSQL 18** como banco de dados relacional
- **Zod** para validação de dados
- **JWT** para autenticação
- **Arquitetura RESTful** com rotas organizadas

### Frontend
- **React 18.2.0** com TypeScript 5.3.3
- **Vite 5.4.21** como bundler ultra-rápido
- **React Router 6.20.1** para navegação SPA
- **Axios 1.6.2** para requisições HTTP
- **Recharts 2.10.0** para gráficos e visualizações
- **Lucide React 0.294.0** para ícones SVG modernos
- **CSS3** com design responsivo, animações e gradientes
- **Google Fonts (Poppins)** - Tipografia premium

### Design System
- **Cores Primárias**: Ciano (#00BCD4, #00ACC1, #0097A7)
- **Cores Secundárias**: Azul (#3b82f6, #2563eb) para botões de ação
- **Backgrounds**: Gradientes dark gray (#263238 → #37474f)
- **Modo Claro**: Fundo cinza claro (#d0d0d0)
- **Modo Escuro**: Fundo azul escuro (#0f172a) com bordas ciano
- **Tipografia**: Poppins (400, 600, 700, 800, 900)
- **Efeitos**: Gradientes animados, shine, rotating radial, text glow
- **Bordas**: 3px solid #00BCD4 com cantos arredondados (16-20px)

---

## 🎨 Interface e Design

### Tema Visual Premium

**Modo Claro:**
- Fundo cinza claro (#d0d0d0) com área de conteúdo destacada
- Cards com gradiente dark gray (#263238 → #37474f)
- Bordas ciano (#00BCD4) com 3px de espessura
- Efeitos de hover com gradiente ciano animado
- Cantos arredondados (16-20px) em todos os elementos

**Modo Escuro:**
- Fundo azul escuro (#0f172a) com bordas e brilho ciano
- Área de conteúdo com cantos arredondados e contorno iluminado
- Cards ciano por padrão com efeitos de brilho
- Sidebar com bordas ciano e efeitos de sombra
- Transições suaves entre temas

### Animações e Efeitos

- **Gradientes Animados**: Background-position shift em 6s
- **Rotating Radial**: Gradiente radial rotacionando em 10s
- **Shine Effect**: Brilho deslizante em elementos interativos
- **Text Glow**: Contorno e brilho em textos importantes
- **Hover Transforms**: Scale, translateY e box-shadow dinâmicos
- **Fade In/Down**: Animações de entrada suaves

### Layout Responsivo Completo

**Desktop (> 1280px):**
- Sidebar completa (280px) com logo, nome e menu expandido
- Área de conteúdo com max-width 1300px centralizada
- Grid de 3 colunas para cards e seleções
- Tabelas com largura total e scroll interno

**Notebook (1024px - 1280px):**
- Sidebar mantida com ajustes de padding
- Área de conteúdo responsiva (100% com margens)
- Grid de 2-3 colunas adaptativo
- Elementos com tamanhos reduzidos

**Tablet (768px - 1024px):**
- Sidebar compacta (70px) apenas com ícones
- Menu items sem texto, apenas ícones centralizados
- Grid de 2 colunas
- Área de conteúdo ajustada (78px de margem esquerda)
- Botões e inputs com tamanhos médios

**Mobile (640px - 768px):**
- Sidebar horizontal fixa na parte inferior (70px altura)
- Menu em linha com scroll horizontal
- Grid de 1 coluna para todos os cards
- Área de conteúdo sem bordas laterais
- Botões com largura total
- Elementos empilhados verticalmente

**Mobile Pequeno (< 640px):**
- Mesma estrutura do mobile
- Ícones e textos ainda menores (0.8rem)
- Padding reduzido em todos os elementos
- Tabelas com scroll horizontal completo
- Modais ocupam 98% da tela

### Componentes Unificados

**Botões Padronizados:**
- `.btn-voltar`: Azul (#3b82f6) com ícone, sempre à direita, 16px
- `.btn-primary`: Azul para ações principais
- `.btn-secondary`: Cinza para ações secundárias
- `.selection-btn`: Dark gray com hover ciano para seleções

**Headers de Página:**
- Gradiente ciano animado com borda branca
- Título centralizado com fonte Poppins bold
- Animações de entrada (fadeInDown)
- Efeitos de shine e rotating radial

**Cards de Seleção:**
- Botões "Anos Iniciais" e "Anos Finais" uniformes
- Grid de 2 colunas centralizado (max-width 600px)
- Ícone + título "Selecione a Categoria"
- Hover com gradiente ciano e animações

**Tabelas:**
- Bordas ciano 3px com cantos arredondados
- Headers com fundo escuro e texto claro
- Rows com hover effect
- Scroll horizontal automático em mobile

---

## 📋 Funcionalidades Principais

### 1. 👨‍🎓 Gestão de Alunos
- ✅ CRUD completo com validação de CPF
- ✅ Cadastro: nome, CPF, data de nascimento, email, telefone, responsável
- ✅ Vinculação a turmas com controle de ano letivo
- ✅ Busca e filtros em tempo real
- ✅ Listagem ordenada alfabeticamente
- ✅ Deleção em cascata (remove frequências e notas)

### 2. 👨‍🏫 Gestão de Professores
- ✅ Cadastro com área de atuação (Anos Iniciais/Finais/Ambos)
- ✅ Seleção de múltiplas disciplinas via checkboxes
- ✅ Vinculação a múltiplas turmas simultaneamente
- ✅ 10 componentes curriculares padronizados:
  - Artes, Ciências, Educação Física, Ensino Religioso
  - Geografia, História, Inglês, Matemática, Português, Projeto de Vida
- ✅ Criação automática de relação DisciplinaTurma

### 3. 🏫 Gestão de Turmas
- ✅ Organização por **Anos Iniciais (1º-5º)** e **Anos Finais (6º-9º)**
- ✅ Cadastro: ano, nome, período (Manhã/Tarde/Noite/Integral)
- ✅ Campo **anoLetivo** vinculado ao calendário escolar
- ✅ Interface categorizada com navegação por abas
- ✅ Listagem ordenada e agrupada

### 4. 📝 Registro de Frequência
- ✅ **Registro diário simplificado** por turma
- ✅ Seleção de data, período (Manhã/Tarde) e disciplina
- ✅ Marcação de presença/falta por aluno com checkbox
- ✅ Campo de justificativa de ausências
- ✅ Salvamento automático de registros
- ✅ Histórico de registros por turma e período
- ✅ Integração com calendário escolar

### 5. 📊 Registro de Notas (com Ano Letivo)
- ✅ **Seletor de Ano Letivo**: Primeiro passo obrigatório antes de lançar notas
- ✅ **Sistema trimestral** (1º, 2º e 3º trimestre) por ano letivo
- ✅ **Isolamento por ano**: Cada ano letivo tem seu próprio conjunto de notas
- ✅ Registro por turma, aluno, disciplina e trimestre
- ✅ Notas de 0 a 10 com validação
- ✅ Cálculo automático de média final
- ✅ Status de aprovação baseado em média:
  - ≥ 7.0: Aprovado
  - 5.0 - 6.9: Recuperação
  - < 5.0: Reprovado
- ✅ Observações por nota
- ✅ Edição e atualização de notas lançadas
- ✅ Sincronização com Relatórios: dashboards puxam notas do ano letivo correto

### 6. 🏠 Dashboard Principal
- ✅ **Cabeçalho personalizado**: Nome da escola + "SISTEMA DE GESTÃO ESCOLAR" em destaque
- ✅ **4 Cards estatísticos** em verde ciano:
  * Disciplinas, Professores, Turmas, Alunos
  * Design moderno com gradiente e ícones grandes
  * Hover: inverte para branco com borda ciano
  * Números centralizados em fonte grande (3rem)
  * Títulos em maiúsculas com espaçamento
- ✅ **Animações**: Efeitos de hover, active e pulso suave
- ✅ **Tema adaptável**: Cores ajustadas para modo claro e escuro
- ✅ Integração com configurações da escola

### 7. 📅 Calendário Escolar
- ✅ Cadastro de eventos por ano letivo
- ✅ Tipos de eventos:
  - Início/Fim do Ano Letivo
  - Início/Fim de Trimestre
  - Dias Letivos/Não Letivos
  - Feriados e Recessos
  - Paradas Pedagógicas
  - Sábados Letivos
- ✅ Períodos de início e fim por evento
- ✅ Integração com cálculo de dias letivos
- ✅ Base para relatórios de frequência

### 7. 📈 Relatórios Analíticos

#### Relatório de Frequência
- ✅ Dashboard com gráficos (pizza e barras)
- ✅ Estatísticas gerais: total de aulas, presenças, faltas, percentuais
- ✅ Dados individuais por aluno com busca
- ✅ Status visual (Frequência Adequada ≥75% / Atenção Necessária <75%)
- ✅ Filtros de período:
  - Dia Atual
  - Mês Atual
  - Trimestre Atual
  - Ano Letivo Completo (baseado no calendário escolar)
  - Período Personalizado (data início/fim)
- ✅ Seletor de ano letivo

#### Relatório de Notas
- ✅ Dashboard com gráficos de desempenho
- ✅ Estatísticas: média da turma, % aprovação, recuperação, reprovação
- ✅ Tabela individual com todas as notas (3 trimestres + média)
- ✅ Busca por aluno específico
- ✅ Filtro por trimestre
- ✅ Status visual com badges coloridos

#### Recursos Gerais dos Relatórios
- ✅ Segmentação por Anos Iniciais/Finais
- ✅ Seleção de turma com cards visuais
- ✅ Atualização automática ao mudar filtros
- ✅ Mensagem informativa quando turma não tem alunos
- ✅ Export de dados (planejado)

---

## 🗄️ Estrutura do Banco de Dados

### Principais Entidades

- **alunos**: Dados pessoais e vínculo com turma
- **professores**: Informações e áreas de atuação
- **turmas**: Organização por ano e período
- **disciplinas**: Componentes curriculares
- **disciplinas_turmas**: Relação professor-disciplina-turma
- **registro_frequencia**: Registros de presença/falta
- **presenca_aluno**: Detalhamento de cada presença
- **notas**: Notas por trimestre e disciplina
- **calendario_escolar**: Anos letivos
- **eventos_calendario**: Eventos do calendário
- **usuarios**: Autenticação e controle de acesso

### Relacionamentos Principais

```
turmas 1--N alunos
turmas 1--N disciplinas_turmas
professores 1--N disciplinas_turmas
disciplinas 1--N disciplinas_turmas
turmas 1--N registro_frequencia
registro_frequencia 1--N presenca_aluno
alunos 1--N notas
calendario_escolar 1--N eventos_calendario
```

---

## 🔧 Instalação e Configuração

### Pré-requisitos

- Node.js 20.x ou superior
- PostgreSQL 18 ou superior
- npm ou yarn

### 1️⃣ Clonar o Repositório

```powershell
git clone https://github.com/RODRIGOGRILLOMOREIRA/SISTEMA-DE-GESTAO-ESCOLAR.git
cd "PROJETO SISTEMA DE GESTÃO ESCOLAR"
```

### 2️⃣ Configurar Backend

```powershell
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Criar arquivo .env com:
# DATABASE_URL="postgresql://usuario:senha@localhost:5432/gestao_escolar"
# PORT=3333
---

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação.

### Credenciais Padrão (Desenvolvimento)

- **Email**: `rodrigo-gmoreira@educar.rs.gov.br`
- **Senha**: `123456`

### Fluxo de Autenticação

1. Usuário faz login com email e senha
2. Backend valida credenciais e retorna JWT token
3. Frontend armazena token no `localStorage`
4. Token é enviado em todas as requisições no header `Authorization: Bearer <token>`
5. Backend valida token em rotas protegidas

---

## 🎨 Interface do Usuário

### Menu de Navegação

- 🏠 Dashboard
- 👨‍🎓 Alunos
- 👨‍🏫 Professores
- 🏫 Turmas
- 📝 Frequência
- 📊 Notas
- 📅 Calendário Escolar
- 📈 Relatórios

### Temas e Cores

- **Primária**: Verde (#4CAF50) - Ações positivas
- **Secundária**: Azul (#2196F3) - Informações
- **Atenção**: Amarelo/Laranja (#ff9800) - Alertas
- **Erro**: Vermelho (#f44336) - Ações destrutivas
- **Sucesso**: Verde (#4CAF50) - Confirmações

---

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Dados do usuário autenticado

### Alunos
- `GET /api/alunos` - Listar todos
- `GET /api/alunos/:id` - Buscar por ID
- `GET /api/alunos/turma/:turmaId` - Buscar por turma
- `POST /api/alunos` - Criar novo
- `PUT /api/alunos/:id` - Atualizar
- `DELETE /api/alunos/:id` - Deletar

### Professores
- `GET /api/professores` - Listar todos
- `GET /api/professores/:id` - Buscar por ID
- `POST /api/professores` - Criar novo
- `PUT /api/professores/:id` - Atualizar
- `DELETE /api/professores/:id` - Deletar

### Turmas
- `GET /api/turmas` - Listar todas
- `GET /api/turmas/:id` - Buscar por ID
- `POST /api/turmas` - Criar nova
- `PUT /api/turmas/:id` - Atualizar
- `DELETE /api/turmas/:id` - Deletar

### Frequência
- `GET /api/frequencia/turma/:turmaId` - Listar por turma
- `GET /api/registro-frequencia/turma/:turmaId` - Registros com período (dataInicio/dataFim)
- `POST /api/frequencia` - Criar registro
- `PUT /api/frequencia/:id` - Atualizar
- `DELETE /api/frequencia/:id` - Deletar

### Notas
- `GET /api/notas` - Listar todas
- `GET /api/notas/turma/:turmaId` - Buscar por turma
- `GET /api/notas/aluno/:alunoId` - Buscar por aluno
- `POST /api/notas` - Criar nota
- `PUT /api/notas/:id` - Atualizar
- `DELETE /api/notas/:id` - Deletar

### Calendário Escolar
- `GET /api/calendario` - Listar todos os anos
- `GET /api/calendario/ano/:ano` - Buscar por ano
- `GET /api/calendario/eventos/periodo` - Eventos por período
- `POST /api/calendario` - Criar calendário
- `PUT /api/calendario/:id` - Atualizar
- `DELETE /api/calendario/:id` - Deletar

---

## 🧪 Testes

```powershell
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## 📦 Build para Produção

### Backend
```powershell
cd backend
npm run build
npm start
```

### Frontend
```powershell
cd frontend
npm run build
# Arquivos gerados em: dist/
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Rodrigo Grillo Moreira**
- GitHub: [@RODRIGOGRILLOMOREIRA](https://github.com/RODRIGOGRILLOMOREIRA)
- Email: rodrigo-gmoreira@educar.rs.gov.br

---

## 📞 Suporte

Para suporte, envie um email para rodrigo-gmoreira@educar.rs.gov.br ou abra uma issue no GitHub.

---

## 🎓 Agradecimentos

Desenvolvido para facilitar a gestão escolar e melhorar o acompanhamento do desempenho acadêmico dos alunos.

---

**Versão**: 1.0.0  
**Última Atualização**: Dezembro 2024
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
