# 🔄 CHECKPOINT - Configuração Docker WSL

**Data:** 19/01/2026  
**Status:** Aguardando 3º Reinício - Kernel WSL 2 instalado

---

## ✅ O que já foi feito:

1. ✅ Docker Desktop instalado (versão 29.1.3)
2. ✅ Componentes WSL foram instalados via PowerShell Admin
3. ✅ 1º Reinício concluído
4. ✅ 2º Reinício concluído
5. ✅ Kernel WSL 2 instalado
6. ❌ Comando `wsl` ainda não reconhecido (precisa reiniciar)
7. 🔄 **Aguardando 3º reinício do computador**

---

## 📍 Situação Atual (APÓS 1º REINÍCIO):

**Problema detectado:** 
- Docker Desktop instalado mas não inicia
- Comando `wsl` não é reconhecido
- Falta instalar o **Kernel WSL 2**

**Diagnóstico:**
```
docker --version → OK (v29.1.3)
docker info → ERRO: "Docker Desktop is unable to start"
wsl --status → ERRO: Comando não reconhecido
```

---

## 🎯 Próximos Passos (APÓS 2º REINÍCIO):

### **PASSO 1: Verificar se WSL está funcionando**
```powershell
# Abra PowerShell e teste:
wsl --status

# Se funcionar, pule para o PASSO 3
# Se NÃO funcionar, continue no PASSO 2
```

### **PASSO 2: Instalar Kernel WSL 2 (SE NECESSÁRIO)**
Se o comando `wsl` ainda não funcionar:

1. **Baixar o Kernel:**
   - Acesse: https://aka.ms/wsl2kernel
   - Clique em: **"WSL2 Linux kernel update package for x64 machines"**
   - Salve o arquivo: `wsl_update_x64.msi`

2. **Instalar o Kernel:**
   - Execute o arquivo baixado
   - Clique: Next → Next → Install → Finish
   - **Pode precisar de MAIS UM REINÍCIO**

3. **Definir WSL 2 como padrão:**
   ```powershell
   wsl --set-default-version 2
   ```

### **PASSO 3: Iniciar Docker Desktop**
```powershell
# Abra o Docker Desktop do menu Iniciar
# OU execute:
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Aguarde 2-3 minutos
# Verifique o ícone da bandeja (baleia)
# Deve ficar verde com mensagem: "Docker Desktop is running"
```

### **PASSO 4: Verificar se Docker está funcionando**
```powershell
# Em PowerShell, execute:
docker info

# ✅ Se funcionar: Você verá informações do sistema Docker
# ❌ Se não funcionar: Me avise o erro exato
```

### **PASSO 5: Subir os containers do projeto**
```powershell
# Na pasta do projeto
cd "C:\Users\Usuario\Desktop\PROJETO SISTEMA DE GESTÃO ESCOLAR"

# Ver se docker-compose.yml existe
Get-Content docker-compose.yml -Head 5

# Iniciar Redis + PostgreSQL
docker-compose up -d

# Aguardar ~30 segundos

# Verificar status
docker-compose ps
```

### **PASSO 6: Configurar ambiente backend**
```powershell
# Ir para pasta backend
cd backend

# Verificar se .env existe
if (Test-Path .env) { "✅ .env encontrado" } else { "❌ Criar .env" }

# Se não existir, copiar de exemplo
if (!(Test-Path .env)) { copy .env.development .env }

# Executar migrações do banco
npm run prisma:migrate

# Gerar Prisma Client
npm run prisma:generate
```

### **PASSO 7: Testar tudo**
```powershell
# Testar Redis
npm run test:redis

# Iniciar backend
npm run dev
```

---

## 🚨 Se encontrar erros:

### **Erro: "WSL command not found"**
- Reinicie novamente o computador
- WSL precisa de dois reinícios às vezes

### **Erro: "Docker Desktop is unable to start"**
- Abra PowerShell como Admin
- Execute: `wsl --update`
- Execute: `wsl --set-default-version 2`
- Reinicie Docker Desktop

### **Erro: "Hardware virtualization is not enabled"**
- Entre na BIOS
- Habilite Intel VT-x ou AMD-V
- Salve e reinicie

---

## 📞 Quando Voltar:

**Me avise:**
1. Se o Docker Desktop iniciou corretamente
2. Se `docker info` funcionou
3. Qualquer erro que aparecer

**Continuaremos de:**
- Verificar docker-compose.yml
- Subir os containers (Redis + PostgreSQL)
- Configurar ambiente de desenvolvimento
- Testar as conexões

---

## 📋 Comandos Rápidos (copie e cole):

```powershell
# Verificar Docker
docker info

# Ver versão
docker --version

# Testar WSL
wsl --version

# Subir containers
cd "C:\Users\Usuario\Desktop\PROJETO SISTEMA DE GESTÃO ESCOLAR"
docker-compose up -d

# Configurar backend
cd backend
copy .env.development .env
npm run prisma:migrate
npm run test:redis
```

---

## 🎯 Objetivo Final:

Ter o ambiente de desenvolvimento completo rodando:
- ✅ Docker Desktop funcionando
- ✅ Redis rodando em `localhost:6379`
- ✅ PostgreSQL rodando em `localhost:5432`
- ✅ Backend conectando nos dois
- ✅ Redis Commander em `http://localhost:8081`

---

**BOA SORTE COM O REINÍCIO! 🚀**

Me chame quando voltar: "voltei do reinício"
