# 🧪 Sistema de Dados de Teste - Quick Start

## 🚀 Uso Rápido

### Popular Tudo de Uma Vez
```bash
cd backend
npm run seed:all
```

### Popular em Etapas (Recomendado para menos memória)
```bash
cd backend
npm run seed:base      # Diretores, funcionários, professores, turmas
npm run seed:alunos    # 200 alunos
npm run seed:notas     # Notas e frequências
```

## 📊 O Que Será Criado

- ✅ **5 Diretores** (Diretor, Vice, Coordenador, Orientador, Supervisor)
- ✅ **9 Funcionários** (Secretaria, TI, Biblioteca, etc)
- ✅ **21 Professores** (9 especialidades, 40h e 20h)
- ✅ **9 Disciplinas** (Português, Matemática, Ciências, etc)
- ✅ **9 Turmas** (1º ao 9º ano - Anos Iniciais e Finais)
- ✅ **200 Alunos** (distribuídos nas turmas)
- ✅ **Notas** (3 trimestres + EAC quando necessário)
- ✅ **Frequências** (200 dias letivos por aluno)

## 🔐 Credenciais de Teste

| Tipo | Email | Senha |
|------|-------|-------|
| Diretores | `nome.sobrenome@direcao.escola.edu.br` | `Direcao@2025` |
| Funcionários | `nome.sobrenome@func.escola.edu.br` | `Func@2025` |
| Professores | `nome.sobrenome@prof.escola.edu.br` | `Prof@2025` |

## 📈 Gerar Relatório de Análise

```bash
npm run analyze:system
```

Gera `RELATORIO_ANALISE.md` com:
- Estatísticas gerais
- Taxa de aprovação
- Frequência média
- Alunos em risco
- Pontos positivos e de atenção
- Recomendações

## 💾 Backup e Restore

### Fazer Backup
```bash
npm run backup:db
```

### Restaurar Backup
```bash
npm run restore:backup
```

### Limpar Tudo (Voltar ao Zero)
```bash
npm run restore:clean
```

## 📋 Fluxo Completo Recomendado

```bash
# 1. Backup de segurança
npm run backup:db

# 2. Popular dados de teste
npm run seed:all

# 3. Testar funcionalidades do sistema
# (login, cadastros, notas, frequências, relatórios)

# 4. Gerar relatório de análise
npm run analyze:system

# 5. Quando terminar, limpar
npm run restore:clean
```

## ⚠️ Importante

- **Nomes, CPFs, emails e telefones são únicos** - não há duplicatas
- **Professores podem acumular funções** (20h + 20h)
- **Dados realistas** com variação de desempenho (25% excelentes, 35% bons, 25% regulares, 15% com dificuldades)
- **Turmas corretas**: 1º a 5º ano (Anos Iniciais) e 6º a 9º ano (Anos Finais)

## 📖 Documentação Completa

Ver arquivo detalhado: [GUIA_DADOS_TESTE.md](GUIA_DADOS_TESTE.md)

## 🐛 Problemas Comuns

**"Nenhuma turma encontrada"**
```bash
# Execute na ordem correta:
npm run seed:base
npm run seed:alunos
npm run seed:notas
```

**Memória insuficiente**
```bash
# Use etapas separadas ao invés de seed:all
npm run seed:base
# Aguardar
npm run seed:alunos
# Aguardar
npm run seed:notas
```

**Banco lento**
```bash
# Limpar e recomeçar
npm run restore:clean
npm run seed:all
```

---

**🎯 Pronto para Testar!** Execute os comandos acima e explore todas as funcionalidades do sistema com dados realistas.
