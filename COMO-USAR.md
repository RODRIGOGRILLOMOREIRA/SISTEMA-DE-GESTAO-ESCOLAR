# SISTEMA DE GESTÃO ESCOLAR

## 🚀 COMO INICIAR O SISTEMA

### Método 1: Iniciar Tudo de Uma Vez (RECOMENDADO)
Clique duas vezes no arquivo:
```
INICIAR-SISTEMA.bat
```

Este script irá:
- Parar processos anteriores
- Iniciar o Backend (porta 3333)
- Iniciar o Frontend (porta 5173)
- Abrir o navegador automaticamente

### Método 2: Iniciar Separadamente
1. Clique em `1-start-backend.bat` (inicia o backend)
2. Aguarde 5 segundos
3. Clique em `2-start-frontend.bat` (inicia o frontend)
4. Abra o navegador em: http://localhost:5173

## 🛑 COMO PARAR O SISTEMA

Clique duas vezes no arquivo:
```
PARAR-SISTEMA.bat
```

Ou feche as janelas do Backend e Frontend.

## 🔐 CREDENCIAIS DE ACESSO

- **Email:** admin@escola.com
- **Senha:** admin123

## 📋 FUNCIONALIDADES

- ✅ Gestão de Alunos
- ✅ Gestão de Professores
- ✅ Gestão de Turmas
- ✅ Gestão de Disciplinas
- ✅ Sistema de Notas (3 Trimestres)
  - Momento 1: 3 avaliações + média
  - Momento 2: Avaliação EAC
- ✅ Sistema de Frequência
- ✅ Configurações da Escola
- ✅ Tema Claro/Escuro

## 🌐 ENDEREÇOS

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3333

## ⚠️ PROBLEMAS COMUNS

**O sistema não abre?**
1. Execute `PARAR-SISTEMA.bat`
2. Aguarde 3 segundos
3. Execute `INICIAR-SISTEMA.bat` novamente

**Erro de porta em uso?**
- Execute `PARAR-SISTEMA.bat` para liberar as portas

## 📞 SUPORTE

Se o sistema não iniciar:
1. Verifique se o Node.js está instalado: `node --version`
2. Verifique se o PostgreSQL está rodando
3. Execute os comandos manualmente nas pastas backend e frontend:
   ```
   npm install
   npm run dev
   ```
