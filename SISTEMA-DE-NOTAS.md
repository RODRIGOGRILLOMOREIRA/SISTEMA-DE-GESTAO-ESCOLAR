# Sistema de Notas - Documentação Completa

## 📊 Visão Geral

O sistema de notas implementado no Sistema de Gestão Escolar possui cálculos automáticos e salvamento em tempo real no banco de dados, garantindo que todas as informações fiquem persistidas e disponíveis para análises.

## 🎯 Estrutura de Notas

### 1. Trimestres (1º, 2º e 3º)

Cada trimestre possui:

#### **Momento 1**
- Avaliação 01 (0.0 a 10.0)
- Avaliação 02 (0.0 a 10.0)
- Avaliação 03 (0.0 a 10.0)
- **Média M1** = Soma das 3 avaliações

#### **Momento 2**
- Avaliação EAC (0.0 a 10.0)

#### **Nota Final do Trimestre**
- **Maior nota entre Média M1 e Avaliação EAC**
- Exemplo: Se M1 = 8.0 e EAC = 7.0, a nota final do trimestre = 8.0

### 2. Nota Final do Ano

#### **Fórmula de Cálculo**
```
Média Final = (T1 × 1 + T2 × 2 + T3 × 3) ÷ 6
```

Onde:
- T1 = Nota final do 1º trimestre
- T2 = Nota final do 2º trimestre
- T3 = Nota final do 3º trimestre

#### **Exemplo de Cálculo**
```
T1 = 8.0
T2 = 7.5
T3 = 9.0

Média Final = (8.0×1 + 7.5×2 + 9.0×3) ÷ 6
Média Final = (8.0 + 15.0 + 27.0) ÷ 6
Média Final = 50.0 ÷ 6
Média Final = 8.33
```

### 3. Status de Aprovação

- **APROVADO**: Média Final ≥ 6.0 (botão verde com ícone ✓)
- **REPROVADO**: Média Final < 6.0 (botão vermelho com ícone ✗)

## 💾 Salvamento Automático

### Quando as Notas São Salvas

1. **Ao clicar em "Salvar Notas"** no modal de edição
2. **Cálculos automáticos** são executados no backend:
   - Média M1 é calculada
   - Nota final do trimestre é determinada (maior entre M1 e EAC)
   - Nota final anual é recalculada com base nos 3 trimestres
   - Status de aprovação é atualizado

### Tabelas do Banco de Dados

#### **Tabela `notas`**
Armazena as notas de cada trimestre:
- `alunoId` - ID do aluno
- `disciplinaId` - ID da disciplina
- `trimestre` - Número do trimestre (1, 2 ou 3)
- `avaliacao01` - Primeira avaliação
- `avaliacao02` - Segunda avaliação
- `avaliacao03` - Terceira avaliação
- `mediaM1` - Média do Momento 1
- `avaliacaoEAC` - Avaliação do Momento 2
- `notaFinalTrimestre` - Maior nota entre M1 e EAC
- `observacao` - Observações sobre o desempenho

#### **Tabela `notas_finais`**
Armazena a média final anual:
- `alunoId` - ID do aluno
- `disciplinaId` - ID da disciplina
- `trimestre1` - Nota final do 1º trimestre
- `trimestre2` - Nota final do 2º trimestre
- `trimestre3` - Nota final do 3º trimestre
- `mediaFinal` - Média final anual calculada
- `aprovado` - Boolean (true se aprovado, false se reprovado)

## 🎨 Interface do Usuário

### Fluxo de Uso

1. **Selecione a Turma** - Botões modernos com nome e ano
2. **Selecione o Aluno** - Lista filtrada pela turma selecionada
3. **Selecione a Disciplina** - Disciplinas disponíveis no sistema

### Cards de Visualização

#### **Cards dos Trimestres**
- 3 cards lado a lado (1º, 2º e 3º Trimestre)
- Cada card mostra:
  - Momento 1 com as 3 avaliações e média
  - Momento 2 com a avaliação EAC
  - Nota final do trimestre
- Botão de editar em cada card

#### **Card de Nota Final do Ano**
- Exibe as notas finais dos 3 trimestres
- Mostra a média final calculada
- Status visual:
  - **APROVADO** em verde com ícone de check
  - **REPROVADO** em vermelho com ícone de X
  - **Pendente** em cinza se faltar notas

### Cores das Notas

- 🟢 **Verde**: Nota ≥ 7.0
- 🟡 **Amarela**: Nota entre 5.0 e 6.9
- 🔴 **Vermelha**: Nota < 5.0

## 🔄 Atualização em Tempo Real

- Ao salvar qualquer nota de qualquer trimestre, o sistema:
  1. Salva a nota no banco de dados
  2. Recalcula a nota final do trimestre
  3. Recalcula a média final anual
  4. Atualiza o status de aprovação
  5. Atualiza a interface automaticamente

## 📱 Responsividade

- Layout adaptável para desktop, tablet e mobile
- Botões de seleção com design moderno e animações
- Cards empilham verticalmente em telas menores

## 🔐 Segurança

- Validação de dados no backend (Zod)
- Valores entre 0.0 e 10.0
- Unique constraint para evitar duplicação de notas
- Salvamento atômico (upsert) para evitar conflitos

## 📊 Análises e Relatórios

Todas as notas ficam salvas e podem ser usadas para:
- Boletins individuais
- Relatórios de desempenho por turma
- Análises estatísticas
- Histórico escolar completo
- Identificação de alunos em risco
- Comparação de desempenho entre disciplinas

## 🎓 Credenciais de Acesso

- **Email**: admin@escola.com
- **Senha**: admin123
- **URL**: http://localhost:5173

## ✅ Implementação Completa

✓ Schema do banco de dados atualizado  
✓ Tabela de notas finais criada  
✓ API backend com cálculos automáticos  
✓ Interface moderna e responsiva  
✓ Salvamento automático no banco  
✓ Cálculo da média final anual  
✓ Status de aprovação/reprovação  
✓ Sistema totalmente funcional
