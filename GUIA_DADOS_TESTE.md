# 🧪 Guia de Uso - Sistema de Dados de Teste

Este guia explica como usar o sistema completo de dados fictícios para testar todas as funcionalidades do Sistema de Gestão Escolar.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Dados Gerados](#dados-gerados)
3. [Comandos Disponíveis](#comandos-disponíveis)
4. [Fluxo de Uso Recomendado](#fluxo-de-uso-recomendado)
5. [Reverter para Dados Reais](#reverter-para-dados-reais)
6. [Solução de Problemas](#solução-de-problemas)

---

## 🎯 Visão Geral

O sistema de dados de teste permite:

- ✅ Popular o banco com dados realistas e únicos
- ✅ Simular um ano letivo completo
- ✅ Testar todas as funcionalidades
- ✅ Gerar relatórios de análise
- ✅ Fazer backup dos dados
- ✅ Reverter para estado limpo quando necessário

**⚠️ IMPORTANTE:** Os dados fictícios incluem nomes, CPFs, emails e telefones únicos gerados automaticamente. Nenhum dado se repete.

---

## 📊 Dados Gerados

### Estrutura Completa

#### 👔 Equipe Diretiva (5 membros)
- Diretor Geral
- Vice-Diretor
- Coordenador Pedagógico
- Orientador Educacional
- Supervisor Escolar

**Carga Horária:** 40h semanais  
**Acesso ao Sistema:** Role DIRETOR

#### 👷 Funcionários (9 membros)
- Secretário Escolar
- Auxiliar de Secretaria
- Coordenador de TI
- Auxiliar de Biblioteca
- Inspetor de Alunos
- Auxiliar de Limpeza
- Merendeira
- Porteiro
- Auxiliar Administrativo

**Carga Horária:** 40h semanais  
**Acesso ao Sistema:** Role FUNCIONARIO

#### 👨‍🏫 Professores (21 membros)

Distribuídos por especialidade:

- **Língua Portuguesa:** 3 professores (1 com 40h, 2 com 20h)
- **Matemática:** 3 professores (1 com 40h, 2 com 20h)
- **Ciências:** 2 professores (1 com 40h, 1 com 20h)
- **Geografia:** 2 professores (1 com 40h, 1 com 20h)
- **História:** 2 professores (1 com 40h, 1 com 20h)
- **Inglês:** 2 professores (1 com 40h, 1 com 20h)
- **Educação Física:** 2 professores (1 com 40h, 1 com 20h)
- **Artes:** 2 professores (1 com 40h, 1 com 20h)
- **Ensino Religioso:** 2 professores (1 com 40h, 1 com 20h)

**Possibilidade de acumular funções:** Professores com 20h podem ter duas disciplinas

**Acesso ao Sistema:** Role PROFESSOR

#### 🎓 Turmas (9 turmas)

**Anos Iniciais (Ensino Fundamental I):**
- 1º ano - Matutino (~22 alunos)
- 2º ano - Matutino (~22 alunos)
- 3º ano - Matutino (~22 alunos)
- 4º ano - Vespertino (~22 alunos)
- 5º ano - Vespertino (~22 alunos)

**Anos Finais (Ensino Fundamental II):**
- 6º ano - Matutino (~23 alunos)
- 7º ano - Matutino (~23 alunos)
- 8º ano - Vespertino (~23 alunos)
- 9º ano - Vespertino (~21 alunos)

**Total:** 200 alunos

#### 👥 Alunos (200 no total)

Cada aluno possui:
- Nome completo único
- CPF único
- Email único (@aluno.escola.edu.br)
- Telefone
- Data de nascimento adequada ao ano
- Endereço
- Responsável com telefone
- Número de matrícula
- Status: ATIVO

#### 📚 Disciplinas (9 disciplinas)

Todas vinculadas a todas as turmas:
- Língua Portuguesa (5h/semana)
- Matemática (5h/semana)
- Ciências (3h/semana)
- Geografia (2h/semana)
- História (2h/semana)
- Inglês (2h/semana)
- Educação Física (2h/semana)
- Artes (2h/semana)
- Ensino Religioso (1h/semana)

#### 📝 Dados Acadêmicos

Para cada aluno, em cada disciplina:

**Notas por Trimestre:**
- 3 avaliações (0-10)
- Média M1 calculada
- Nota EAC (se média < 7.0)
- Nota final do trimestre
- Observações para alunos com dificuldades

**Perfis de Alunos:**
- 25% Excelentes (notas 8.5-10.0)
- 35% Bons (notas 7.0-8.5)
- 25% Regulares (notas 5.5-7.0)
- 15% Com dificuldades (notas 3.0-5.5)

**Frequências:**
- ~200 dias letivos
- Presença registrada diariamente
- Taxa de frequência por perfil:
  - Excelentes: 95-100%
  - Bons: 88-95%
  - Regulares: 78-88%
  - Com dificuldades: 65-78%

---

## 🛠️ Comandos Disponíveis

### 1. Popular o Banco de Dados

#### Opção A: Popular Tudo de Uma Vez (Recomendado para testes rápidos)
```bash
cd backend
npm run seed:all
```

Este comando executa sequencialmente:
1. `seed:base` - Cria diretores, funcionários, professores, disciplinas e turmas
2. `seed:alunos` - Cria 200 alunos e matrículas
3. `seed:notas` - Gera notas e frequências

**Tempo estimado:** 3-5 minutos

#### Opção B: Popular em Etapas (Recomendado para máquinas com menos memória)

**Etapa 1: Dados Base**
```bash
npm run seed:base
```
Cria: 5 diretores + 9 funcionários + 21 professores + 9 disciplinas + 9 turmas

**Etapa 2: Alunos**
```bash
npm run seed:alunos
```
Cria: 200 alunos + matrículas + vínculos disciplina-turma

**Etapa 3: Notas e Frequências**
```bash
npm run seed:notas
```
Gera: Notas dos 3 trimestres + frequências + notas finais para todos os alunos

### 2. Backup e Restore

#### Fazer Backup do Estado Atual
```bash
npm run backup:db
```
Salva um dump completo do banco em `backend/backups/backup_YYYY-MM-DD.sql`

**Use antes de:**
- Popular com dados de teste
- Fazer alterações importantes
- Testar novas funcionalidades

#### Restaurar Backup Anterior
```bash
npm run restore:backup
```
Restaura o último backup salvo

#### Limpar Tudo (Voltar ao Zero)
```bash
npm run restore:clean
```
Remove todos os dados de teste, mantendo apenas o usuário admin

**⚠️ CUIDADO:** Esta operação é irreversível!

### 3. Gerar Relatório de Análise

```bash
npm run analyze:system
```

Gera o arquivo `RELATORIO_ANALISE.md` na raiz do projeto com:

- 📊 Estatísticas gerais
- 📈 Desempenho acadêmico
- 🎓 Análise por turma
- 🏆 Top 5 professores
- ✅ Pontos positivos
- ⚠️ Pontos de atenção
- 🚨 Alunos em situação de risco
- 💡 Recomendações

---

## 🔄 Fluxo de Uso Recomendado

### Cenário 1: Primeira Vez - Testar Sistema Completo

```bash
# 1. Fazer backup do estado atual (segurança)
cd backend
npm run backup:db

# 2. Popular com dados de teste
npm run seed:all

# 3. Testar as funcionalidades no sistema
# - Login com usuários criados
# - Visualizar turmas e alunos
# - Lançar/visualizar notas
# - Ver frequências
# - Gerar relatórios

# 4. Gerar relatório de análise
npm run analyze:system

# 5. Quando terminar os testes, limpar
npm run restore:clean
```

### Cenário 2: Demonstração para Cliente

```bash
# 1. Backup de segurança
npm run backup:db

# 2. Popular com dados realistas
npm run seed:all

# 3. Mostrar o sistema funcionando
# - Dashboard com estatísticas
# - Gestão de alunos
# - Lançamento de notas
# - Controle de frequência
# - Relatórios acadêmicos

# 4. Mostrar relatório de análise
npm run analyze:system

# 5. Após a demonstração, restaurar estado anterior
npm run restore:backup
```

### Cenário 3: Testes de Performance

```bash
# 1. Popular em etapas para monitorar memória
npm run seed:base
# Verificar uso de memória

npm run seed:alunos
# Verificar uso de memória

npm run seed:notas
# Verificar uso de memória e tempo de resposta

# 2. Testar consultas pesadas
npm run analyze:system

# 3. Limpar quando terminar
npm run restore:clean
```

### Cenário 4: Desenvolvimento de Novas Features

```bash
# 1. Backup antes de começar
npm run backup:db

# 2. Popular dados de teste
npm run seed:all

# 3. Desenvolver e testar nova funcionalidade

# 4. Se algo der errado, restaurar
npm run restore:backup

# 5. Quando estiver ok, limpar dados de teste
npm run restore:clean
```

---

## 🔐 Credenciais de Acesso

### Usuários de Teste

Todos os usuários criados seguem o padrão:

**Email:** `nome.sobrenome.sobrenome@[tipo].escola.edu.br`

Onde `[tipo]` pode ser:
- `direcao` - Para equipe diretiva
- `func` - Para funcionários
- `prof` - Para professores
- `aluno` - Para alunos

**Senha Padrão:**
- Diretores: `Direcao@2025`
- Funcionários: `Func@2025`
- Professores: `Prof@2025`

### Exemplo de Login

```
Email: joao.silva.santos@prof.escola.edu.br
Senha: Prof@2025
Role: PROFESSOR
```

---

## 🔙 Reverter para Dados Reais

### Quando usar dados reais?

- Sistema validado e testado
- Pronto para produção
- Cliente aprovar os testes

### Processo de Transição

```bash
# 1. Garantir que tem backup dos dados de teste (opcional)
npm run backup:db

# 2. Limpar todos os dados de teste
npm run restore:clean

# 3. O banco estará limpo, com apenas o usuário admin

# 4. Começar a inserir dados reais através do sistema
# - Cadastrar funcionários reais
# - Cadastrar professores reais
# - Criar turmas do ano letivo
# - Matricular alunos reais
```

### Checklist Antes de Usar Dados Reais

- [ ] Todas as funcionalidades foram testadas
- [ ] Relatórios estão funcionando
- [ ] Backup foi feito
- [ ] Sistema foi aprovado
- [ ] Treinamento da equipe foi realizado
- [ ] Dados fictícios foram removidos

---

## 🐛 Solução de Problemas

### Erro: "Nenhuma turma encontrada"

**Causa:** Script de alunos executado antes do seed:base

**Solução:**
```bash
npm run seed:base
npm run seed:alunos
```

### Erro: "Arquivo de backup não encontrado"

**Causa:** Tentou restaurar backup sem ter criado um

**Solução:**
```bash
npm run backup:db
```

### Erro: "Memória insuficiente"

**Causa:** Sistema tentando processar muitos dados de uma vez

**Solução:** Use o modo em etapas:
```bash
npm run seed:base
# Aguardar conclusão

npm run seed:alunos
# Aguardar conclusão

npm run seed:notas
# Aguardar conclusão
```

### Banco fica lento após popular

**Causa:** Muitos dados sem otimização

**Solução:**
```bash
# Reindexar banco
cd backend
npx prisma db push --force-reset
npx prisma generate
npm run seed:all
```

### Dados duplicados ou conflitantes

**Causa:** Script executado múltiplas vezes

**Solução:**
```bash
# Limpar tudo e recomeçar
npm run restore:clean
npm run seed:all
```

### pg_dump não encontrado (Windows)

**Causa:** PostgreSQL não está no PATH

**Solução:**
1. Adicionar PostgreSQL ao PATH:
   - Caminho típico: `C:\Program Files\PostgreSQL\15\bin`
2. Ou usar o caminho completo no script

### Erro de conexão com banco

**Causa:** Credenciais incorretas ou banco offline

**Solução:**
1. Verificar `.env`:
   ```
   DATABASE_URL="postgresql://user:pass@host:5432/dbname"
   ```
2. Verificar se PostgreSQL está rodando
3. Testar conexão manual

---

## 📊 Estatísticas Esperadas

Após executar `npm run seed:all`, você deverá ter:

| Item | Quantidade |
|------|------------|
| Equipe Diretiva | 5 |
| Funcionários | 9 |
| Professores | 21 |
| Disciplinas | 9 |
| Turmas | 9 |
| Alunos | 200 |
| Matrículas | 200 |
| Vínculos Disciplina-Turma | 81 (9×9) |
| Notas (total) | ~5.400 (200 alunos × 9 disciplinas × 3 trimestres) |
| Notas Finais | ~1.800 (200 alunos × 9 disciplinas) |
| Frequências | ~40.000 (200 alunos × 200 dias) |
| Usuários | 35 (5 + 9 + 21) |

**Taxa de aprovação esperada:** 75-85%  
**Frequência média esperada:** 85-90%  
**Média geral esperada:** 6.5-7.5

---

## 💡 Dicas e Boas Práticas

### ✅ Sempre Fazer

1. **Backup antes de popular:**
   ```bash
   npm run backup:db && npm run seed:all
   ```

2. **Verificar dados após popular:**
   ```bash
   npm run analyze:system
   ```

3. **Limpar ao terminar testes:**
   ```bash
   npm run restore:clean
   ```

### ❌ Evitar

1. Executar scripts múltiplas vezes sem limpar
2. Popular dados reais junto com fictícios
3. Esquecer de fazer backup antes de testes
4. Usar dados de teste em produção

### 🎯 Recomendações

1. **Para Desenvolvimento:**
   - Manter dados de teste sempre atualizados
   - Usar `seed:all` para reset rápido
   - Testar com dados realistas

2. **Para Demonstrações:**
   - Gerar relatório antes de apresentar
   - Ter dados variados (bons e ruins)
   - Mostrar cenários reais

3. **Para Produção:**
   - Nunca usar dados fictícios
   - Treinar equipe com dados de teste primeiro
   - Fazer backup antes de cada alteração

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs do terminal
2. Conferir arquivo `.env`
3. Validar conexão com banco
4. Revisar este guia
5. Verificar espaço em disco

---

**Sistema de Gestão Escolar - Ambiente de Testes**  
*Versão 1.0 - 2025*
