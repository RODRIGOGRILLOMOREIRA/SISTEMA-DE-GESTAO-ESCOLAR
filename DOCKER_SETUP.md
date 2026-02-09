# 🐳 DOCKER SETUP - Sistema de Gestão Escolar

## 📋 Índice

1. [Por que usar Docker?](#-por-que-usar-docker)
2. [Instalação do Docker](#-instalação-do-docker)
3. [Como usar](#-como-usar)
4. [Ambientes (Dev vs Prod)](#-ambientes)
5. [Comandos úteis](#-comandos-úteis)
6. [Troubleshooting](#-troubleshooting)

---

## 🎯 Por que usar Docker?

### **Ganhos Principais**

| Recurso | Sem Docker | Com Docker | Ganho |
|---------|------------|------------|-------|
| **Setup inicial** | 2-3 horas | 5 minutos | **36x mais rápido** |
| **Latência Redis** | 50-100ms (Upstash) | ~1ms (local) | **50x mais rápido** |
| **Testes** | Depende de internet | Offline | **100% disponível** |
| **Limpeza de dados** | Manual no Upstash | `docker-compose down -v` | **Instantâneo** |
| **Custo mensal** | Upstash: $10-50 | $0 (dev local) | **100% economia** |

### **Cenários de Uso**

```
┌─────────────────────────────────────────┐
│   DESENVOLVIMENTO (Você agora)          │
│   Docker Redis + Docker PostgreSQL      │
│   - Rápido, offline, ilimitado          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   STAGING (Testes pré-produção)         │
│   Upstash Redis + PostgreSQL Cloud      │
│   - Ambiente similar a produção         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   PRODUÇÃO (Clientes finais)            │
│   Upstash Redis + PostgreSQL Cloud      │
│   - Alta disponibilidade                │
│   - Backups automáticos                 │
└─────────────────────────────────────────┘
```

---

## 🔧 Instalação do Docker

### ❓ **Preciso instalar WSL 2 antes?**

**NÃO!** O Docker Desktop faz tudo automaticamente! 🎉

- ✅ O Docker Desktop **instala o WSL 2 automaticamente**
- ✅ Você **não precisa** fazer nada manualmente
- ✅ Apenas instale o Docker Desktop e pronto
- ✅ Ele cuida de toda a configuração

---

### Windows 10/11 - Passo a Passo

#### **1. Baixar Docker Desktop**
   - Site oficial: https://www.docker.com/products/docker-desktop
   - Download direto: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

#### **2. Instalar**
   ```powershell
   # 1. Execute o instalador Docker Desktop Installer.exe
   # 2. Aceite os termos de uso
   # 3. Marque "Use WSL 2 instead of Hyper-V" (já vem marcado)
   # 4. Clique em "Ok"
   # 5. Aguarde a instalação (~5 minutos)
   ```

   **Durante a instalação:**
   - ✅ Docker instala WSL 2 automaticamente (se não tiver)
   - ✅ Configura Linux kernel
   - ✅ Prepara ambiente Docker
   
   **Quando terminar:**
   - 🔄 Será solicitado **reiniciar o computador**
   - ⚠️ IMPORTANTE: Reinicie para completar a instalação

#### **3. Primeira execução**
   ```powershell
   # 1. Após reiniciar, abra o Docker Desktop
   # 2. Aguarde aparecer "Docker is running" (ícone na bandeja)
   # 3. Aceite o Service Agreement se aparecer
   # 4. Pode pular o tutorial (Skip tutorial)
   ```

#### **4. Verificar instalação**
   ```powershell
   # Abra PowerShell e execute:
   
   docker --version
   # ✅ Deve retornar: Docker version 24.x.x ou superior
   
   docker-compose --version
   # ✅ Deve retornar: Docker Compose version v2.x.x ou superior
   
   docker info
   # ✅ Deve mostrar informações do sistema (confirma que está rodando)
   ```

#### **5. Configurar recursos (Recomendado)**
   - Abrir Docker Desktop
   - Clicar no ícone de engrenagem ⚙️ (Settings)
   - Ir em **Resources** → **Advanced**
   - Configurar:
     - **Memory:** 4GB (mínimo) ou 8GB (recomendado)
     - **CPUs:** 2 (mínimo) ou 4 (recomendado)
     - **Disk:** 20GB
   - Clicar em **Apply & Restart**

---

### 🎯 Requisitos do Sistema

| Requisito | Detalhes |
|-----------|----------|
| **Windows** | Windows 10 64-bit: Pro, Enterprise ou Education (Build 19041 ou superior)<br>OU Windows 11 64-bit |
| **RAM** | 4GB mínimo (8GB recomendado) |
| **Processador** | 64-bit com virtualização |
| **Virtualização** | Deve estar habilitada na BIOS (Intel VT-x ou AMD-V) |
| **WSL 2** | ✅ Instalado **AUTOMATICAMENTE** pelo Docker |

---

### 🔍 Como verificar se virtualização está habilitada?

```powershell
# Abra PowerShell como Administrador e execute:
systeminfo

# Procure por "Hyper-V Requirements"
# Deve mostrar:
#   Hyper-V Requirements: A hypervisor has been detected
```

**Se virtualização estiver desabilitada:**
1. Reinicie o computador
2. Entre na BIOS (geralmente F2, F10, Del ou Esc durante boot)
3. Procure por:
   - Intel: "Intel VT-x" ou "Virtualization Technology"
   - AMD: "AMD-V" ou "SVM Mode"
4. Habilite a opção
5. Salve e reinicie

---

### 💡 O que é WSL 2 e por que o Docker precisa?

**WSL 2 (Windows Subsystem for Linux 2)** permite rodar Linux no Windows.

**Por que o Docker precisa:**
- 🐳 Docker é baseado em Linux
- 🚀 WSL 2 dá performance quase nativa
- ⚡ É 2-5x mais rápido que Hyper-V (método antigo)
- 🔧 Docker Desktop cuida de tudo automaticamente

**Você nem vai perceber que está usando WSL 2!**

---

## 🚀 Como Usar

### **1. Subir os containers (Primeira vez)**

```powershell
# Na pasta raiz do projeto
cd "C:\Users\Usuario\Desktop\PROJETO SISTEMA DE GESTÃO ESCOLAR"

# Subir todos os serviços
docker-compose up -d

# Aguardar ~30 segundos (primeira vez baixa as imagens)
```

**O que acontece:**
- ✅ Redis rodando em `localhost:6379`
- ✅ PostgreSQL rodando em `localhost:5432`
- ✅ Redis Commander (UI) em `http://localhost:8081`

### **2. Configurar ambiente de desenvolvimento**

```powershell
# Copiar arquivo de ambiente
cd backend
copy .env.development .env

# OU criar manualmente com:
REDIS_URL=redis://:Dev@Redis123@localhost:6379
DATABASE_URL="postgresql://sge_user:sge_password@localhost:5432/sge_db"
```

### **3. Executar migrações**

```powershell
# Ainda na pasta backend
npm run prisma:migrate
# OU: npx prisma migrate dev
```

### **4. Iniciar o backend**

```powershell
npm run dev
```

### **5. Testar conexão**

```powershell
# Testar Redis
npm run test:redis

# Health check da API
curl http://localhost:3333/health
```

---

## 🌍 Ambientes

### **DESENVOLVIMENTO (Docker Local)**

**Arquivo:** `.env.development` (já criado)

```env
REDIS_URL=redis://:Dev@Redis123@localhost:6379
DATABASE_URL="postgresql://sge_user:sge_password@localhost:5432/sge_db"
```

**Uso:**
```powershell
# Copiar .env.development para .env
copy .env.development .env

# Iniciar Docker
docker-compose up -d

# Rodar backend
npm run dev
```

**Vantagens:**
- ⚡ Latência < 5ms
- 🌐 Funciona offline
- 🧪 Testes ilimitados
- 💰 Zero custo

---

### **PRODUÇÃO (Upstash Cloud)**

**Arquivo:** `.env.production` (já criado)

```env
UPSTASH_REDIS_URL=rediss://default:senha@regular-bulldog-33638.upstash.io:6379
DATABASE_URL="postgresql://user:pass@production-host:5432/sge_prod"
```

**Uso:**
```powershell
# Copiar .env.production para .env
copy .env.production .env

# NÃO precisa do Docker
# Conecta direto no Upstash Cloud

# Rodar backend
npm start
```

**Vantagens:**
- ☁️ Escalabilidade automática
- 🔒 Backups automáticos
- 🌎 Disponibilidade global
- 📊 Monitoramento integrado

---

## 🎮 Comandos Úteis

### **Gerenciar containers**

```powershell
# Ver containers rodando
docker-compose ps

# Parar tudo
docker-compose stop

# Iniciar novamente
docker-compose start

# Reiniciar
docker-compose restart

# Parar e APAGAR (dados são perdidos)
docker-compose down

# Parar e apagar INCLUINDO volumes (CUIDADO!)
docker-compose down -v
```

### **Logs e debug**

```powershell
# Ver logs de todos os containers
docker-compose logs

# Logs em tempo real
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs redis
docker-compose logs postgres

# Últimas 100 linhas
docker-compose logs --tail=100
```

### **Acessar containers**

```powershell
# Entrar no Redis
docker exec -it sge-redis-local redis-cli -a Dev@Redis123

# Comandos Redis úteis:
# PING              # Testa conexão
# KEYS *            # Lista todas as chaves
# GET chave         # Pega valor
# FLUSHALL          # APAGA TUDO (cuidado!)
# INFO              # Informações do servidor

# Entrar no PostgreSQL
docker exec -it sge-postgres psql -U sge_user -d sge_db

# Comandos PostgreSQL úteis:
# \l                # Lista databases
# \dt               # Lista tabelas
# \d nome_tabela    # Descreve tabela
# \q                # Sair
```

### **Limpar dados**

```powershell
# Limpar APENAS dados do Redis (mantém container)
docker exec sge-redis-local redis-cli -a Dev@Redis123 FLUSHALL

# Limpar TUDO e recomeçar
docker-compose down -v
docker-compose up -d
npm run prisma:migrate
```

---

## 🖥️ Interfaces Web

### **Redis Commander** (Já incluído!)

Acesse: http://localhost:8081

**Funcionalidades:**
- 🔍 Visualizar todas as chaves
- ✏️ Editar valores
- 🗑️ Deletar chaves
- 📊 Estatísticas em tempo real
- 🔐 Múltiplas conexões Redis

### **PgAdmin** (Opcional)

```powershell
# Iniciar com PgAdmin
docker-compose --profile tools up -d
```

Acesse: http://localhost:5050
- Email: admin@escola.com
- Senha: admin123

---

## 🐛 Troubleshooting

### **Erro: "Docker não encontrado"**

```powershell
# Verificar se Docker está rodando
docker info

# Se não estiver, abrir Docker Desktop
# Aguardar aparecer "Docker is running" no ícone da bandeja
```

**Solução:**
1. Abra o Docker Desktop
2. Aguarde 30-60 segundos
3. Verifique o ícone da baleia na bandeja (system tray)
4. Deve estar verde e dizer "Docker Desktop is running"

---

### **Erro: WSL 2 Installation Failed**

```
WSL 2 installation is incomplete.
The WSL 2 Linux kernel is now installed using a separate MSI update package.
```

**Solução Automática (Recomendada):**
```powershell
# O Docker Desktop vai tentar instalar automaticamente
# Basta seguir as instruções na tela e reiniciar
```

**Solução Manual (se necessário):**
1. Baixe o kernel WSL 2: https://aka.ms/wsl2kernel
2. Execute o instalador `wsl_update_x64.msi`
3. Reinicie o Docker Desktop
4. Pronto!

---

### **Erro: "Hardware assisted virtualization and data execution protection must be enabled in the BIOS"**

**Causa:** Virtualização está desabilitada na BIOS

**Solução:**
1. Reinicie o computador
2. Entre na BIOS (pressione F2, F10, Del ou Esc durante o boot)
3. Procure por:
   - **Intel:** "Intel VT-x" ou "Virtualization Technology"
   - **AMD:** "AMD-V" ou "SVM Mode"
4. Mude para **Enabled**
5. Salve (geralmente F10) e reinicie

**Verificar se está habilitado:**
```powershell
# PowerShell como Administrador
systeminfo | findstr "Hyper-V"

# Deve mostrar:
# Hyper-V Requirements: A hypervisor has been detected
```

---

### **Erro: "Docker failed to initialize"**

**Solução:**
```powershell
# 1. Fechar Docker Desktop completamente
# 2. Abrir PowerShell como Administrador
# 3. Executar:

wsl --shutdown
wsl --unregister docker-desktop
wsl --unregister docker-desktop-data

# 4. Abrir Docker Desktop novamente
# 5. Aguardar recriar os containers WSL
```

---

### **Erro: "An error occurred mounting one of your file systems"**

**Causa:** WSL 2 não está funcionando corretamente

**Solução:**
```powershell
# PowerShell como Administrador

# 1. Atualizar WSL
wsl --update

# 2. Reiniciar WSL
wsl --shutdown

# 3. Reiniciar Docker Desktop
```

---

### **Erro: "Port 6379 already in use"**

```powershell
# Verificar o que está usando a porta
netstat -ano | findstr :6379

# Matar processo (substituir PID pelo número encontrado)
taskkill /PID 1234 /F

# Ou mudar porta no docker-compose.yml:
# ports:
#   - "6380:6379"  # Usar 6380 no host
```

---

### **Erro: "Port 5432 already in use"**

```powershell
# PostgreSQL já instalado localmente
# Opção 1: Parar PostgreSQL local
net stop postgresql-x64-15

# Opção 2: Mudar porta no docker-compose.yml
# ports:
#   - "5433:5432"  # Usar 5433 no host
```

### **Redis não conecta**

```powershell
# Verificar se container está rodando
docker-compose ps

# Ver logs
docker-compose logs redis

# Testar manualmente
docker exec -it sge-redis-local redis-cli -a Dev@Redis123 PING
# Deve retornar: PONG
```

### **PostgreSQL não conecta**

```powershell
# Verificar container
docker-compose ps

# Ver logs
docker-compose logs postgres

# Testar conexão
docker exec -it sge-postgres psql -U sge_user -d sge_db -c "SELECT 1;"
```

### **Containers param sozinhos**

```powershell
# Ver o que aconteceu
docker-compose logs

# Recriar containers do zero
docker-compose down
docker-compose up -d --force-recreate
```

### **Lentidão no Docker Desktop**

**Configurar recursos:**
1. Docker Desktop → Settings → Resources
2. Alocar:
   - Memory: 4GB mínimo (8GB recomendado)
   - CPUs: 2 mínimo (4 recomendado)
3. Apply & Restart

---

## 📊 Monitoramento

### **Uso de recursos**

```powershell
# Ver uso de CPU/RAM/Rede
docker stats

# Ver específico
docker stats sge-redis-local sge-postgres
```

### **Espaço em disco**

```powershell
# Ver espaço usado
docker system df

# Limpar cache (libera espaço)
docker system prune -a
```

---

## 🚀 CI/CD com Docker

### **GitHub Actions**

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: sge_user
          POSTGRES_PASSWORD: sge_password
          POSTGRES_DB: sge_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Run tests
        run: |
          cd backend
          npm test
        env:
          REDIS_URL: redis://localhost:6379
          DATABASE_URL: postgresql://sge_user:sge_password@localhost:5432/sge_test
```

---

## 🎯 Resumo - Quando usar o quê?

| Cenário | Redis | PostgreSQL | Motivo |
|---------|-------|------------|--------|
| **Desenvolvimento local** | 🐳 Docker | 🐳 Docker | Rápido, offline, grátis |
| **Testes automatizados** | 🐳 Docker | 🐳 Docker | Isolamento, CI/CD |
| **Staging** | ☁️ Upstash | ☁️ Cloud | Similar a produção |
| **Produção** | ☁️ Upstash | ☁️ Cloud | Alta disponibilidade |
| **Demo/POC** | 🐳 Docker | 🐳 Docker | Setup rápido |

---

## 🎓 Próximos Passos

1. ✅ Instalar Docker Desktop
2. ✅ Executar `docker-compose up -d`
3. ✅ Copiar `.env.development` para `.env`
4. ✅ Rodar `npm run prisma:migrate`
5. ✅ Testar: `npm run test:redis`
6. ✅ Acessar Redis Commander: http://localhost:8081
7. ✅ Começar a desenvolver! 🚀

---

## 📞 Suporte

- **Documentação Docker:** https://docs.docker.com
- **Docker Compose:** https://docs.docker.com/compose
- **Redis Commander:** https://joeferner.github.io/redis-commander/

---

**Desenvolvido com ❤️ para facilitar seu desenvolvimento**
