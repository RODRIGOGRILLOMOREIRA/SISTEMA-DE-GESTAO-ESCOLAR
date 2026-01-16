# 🚀 Guia de Configuração Redis - Sistema Híbrido

> **Sistema SGE** - Configuração de Cache e Filas com Fallback Automático

## 📋 Visão Geral

O sistema suporta **3 modos de operação**:

1. **🏠 Redis Local** (melhor performance) - Recomendado para produção
2. **☁️ Upstash Cloud** (fallback automático) - Recomendado para desenvolvimento
3. **⚙️ Modo Degradado** (sem Redis) - Funcionalidades limitadas

---

## ✅ OPÇÃO 1: Redis Local (Windows) - SEM DOCKER

### 📦 Instalação Redis Portable

#### **Método 1: Memurai (Recomendado para Windows)**

1. **Download:**
   - Acesse: https://www.memurai.com/get-memurai
   - Baixe: **Memurai Developer** (gratuito)

2. **Instalação:**
   ```powershell
   # Execute o instalador baixado
   # Aceite as configurações padrão
   # Porta: 6379
   # Host: localhost
   ```

3. **Iniciar Serviço:**
   ```powershell
   # Opção A: Iniciar como Serviço Windows (automático)
   # Já inicia automaticamente após instalação
   
   # Opção B: Verificar status
   Get-Service Memurai
   
   # Opção C: Iniciar manualmente se parado
   Start-Service Memurai
   ```

4. **Testar Conexão:**
   ```powershell
   # Instalar cliente Redis (opcional)
   # Download: https://github.com/microsoftarchive/redis/releases
   
   # Testar com telnet
   telnet localhost 6379
   # Digite: PING
   # Resposta esperada: +PONG
   ```

#### **Método 2: Redis Windows (Tporadis)**

1. **Download:**
   - Acesse: https://github.com/tporadowski/redis/releases
   - Baixe: `Redis-x64-5.0.14.1.zip` (última versão)

2. **Instalação:**
   ```powershell
   # Extrair ZIP para: C:\Redis
   
   # Navegar até a pasta
   cd C:\Redis
   
   # Instalar como serviço
   redis-server.exe --service-install redis.windows.conf
   
   # Iniciar serviço
   redis-server.exe --service-start
   ```

3. **Criar Script de Inicialização (Opcional):**
   ```batch
   @echo off
   REM Arquivo: start-redis.bat
   echo Iniciando Redis...
   cd C:\Redis
   redis-server.exe redis.windows.conf
   ```

### 🔧 Configuração no SGE

1. **Arquivo `.env`:**
   ```env
   # Redis Local
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   
   # Deixe Upstash vazio para não usar fallback
   UPSTASH_REDIS_URL=
   ```

2. **Reiniciar Backend:**
   ```powershell
   cd backend
   npm run dev
   ```

3. **Verificar Logs:**
   ```
   ✅ 📍 Redis Local: Conectado com sucesso
   ✅ 📍 Redis Local: Pronto para operações
   ```

---

## ☁️ OPÇÃO 2: Upstash Cloud (Gratuito)

### 📝 Cadastro e Configuração

1. **Criar Conta:**
   - Acesse: https://upstash.com/
   - Clique em: **Sign Up** (gratuito)
   - Use Google, GitHub ou email

2. **Criar Database Redis:**
   ```
   1. No Dashboard, clique: "Create Database"
   2. Configurações:
      - Name: sge-redis (ou qualquer nome)
      - Type: Regional
      - Region: Escolha mais próximo (ex: Brazil/São Paulo se disponível)
      - TLS: Enabled (padrão)
      - Eviction: Disabled
   3. Clique: "Create"
   ```

3. **Copiar URL de Conexão:**
   ```
   1. Na página do database criado
   2. Procure seção: "REST API" ou "Connection"
   3. Copie a URL no formato:
      redis://default:SEU_PASSWORD@SEU_HOST:6379
   
   Exemplo:
   redis://default:AYasAAIjcDE1YmVjOGY0ZGY5ZDQ0MGYxYjI1ZGY0ZmViOGYyNzEyM3AxMA@us1-rare-mantis-12345.upstash.io:6379
   ```

### 🔧 Configuração no SGE

1. **Arquivo `.env`:**
   ```env
   # Opção 1: Upstash como principal
   REDIS_HOST=
   REDIS_PORT=
   REDIS_PASSWORD=
   UPSTASH_REDIS_URL=redis://default:SEU_PASSWORD@SEU_HOST:6379
   
   # Opção 2: Upstash como fallback (recomendado)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   UPSTASH_REDIS_URL=redis://default:SEU_PASSWORD@SEU_HOST:6379
   ```

2. **Reiniciar Backend:**
   ```powershell
   cd backend
   npm run dev
   ```

3. **Verificar Logs:**
   ```
   # Se Redis local não disponível:
   🔄 Tentando fallback para Upstash Cloud...
   ✅ Conectado ao Upstash Cloud como fallback
   
   # Ou se Upstash for principal:
   ☁️ Tentando conectar ao Upstash Redis Cloud...
   ✅ ☁️ Upstash Cloud: Conectado com sucesso
   ```

---

## 🔄 Sistema de Fallback Automático

O sistema tenta conectar na seguinte ordem:

```
1. Redis Local (localhost:6379)
   ↓ (se falhar)
2. Upstash Cloud (UPSTASH_REDIS_URL)
   ↓ (se falhar)
3. Modo Degradado (sem Redis)
```

**Configuração Ideal para Produção:**
```env
# Prioriza local, fallback para cloud
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=sua-senha-forte
UPSTASH_REDIS_URL=redis://default:PASSWORD@HOST:6379
```

---

## 🧪 Testando a Configuração

### Teste 1: Verificar Conexão

```powershell
# No terminal do backend
cd backend
npm run dev

# Procure nos logs:
✅ 📍 Redis Local: Conectado com sucesso
# ou
✅ ☁️ Upstash Cloud: Conectado com sucesso
```

### Teste 2: Testar Funcionalidades

1. **Acesse o sistema:** http://localhost:5173
2. **Faça login:** admin@escola.com / admin123
3. **Teste recursos que usam Redis:**
   - ✅ Enviar notificações
   - ✅ Gerar relatórios em segundo plano
   - ✅ Agendar mensagens (Central de Comunicação)

---

## ⚠️ Troubleshooting

### Problema: "Redis Local: Não disponível"

**Solução:**
```powershell
# 1. Verificar se Redis está rodando
Get-Service Memurai  # ou Redis

# 2. Iniciar serviço
Start-Service Memurai  # ou Redis

# 3. Se não instalado, seguir Opção 1 acima

# 4. Alternativa rápida: Usar Upstash (Opção 2)
```

### Problema: "Upstash Cloud: Falha na conexão"

**Solução:**
1. Verificar `UPSTASH_REDIS_URL` no `.env`
2. Garantir que URL está completa e correta
3. Testar no Dashboard do Upstash: CLI → `PING`
4. Verificar limite de requisições (10k/dia no plano grátis)

### Problema: Sistema lento sem Redis

**Sintomas:**
- Relatórios demoram muito
- Notificações não enviam
- Logs mostram: "Sistema operará sem Redis"

**Solução:** Configurar Redis (Opção 1 ou 2 acima)

---

## 📊 Comparação das Opções

| Característica | Redis Local | Upstash Cloud | Sem Redis |
|---------------|-------------|---------------|-----------|
| **Performance** | 🚀 Excelente | ⚡ Boa | 🐌 Limitada |
| **Instalação** | 📦 Requer setup | ☁️ Instantânea | ✅ Não precisa |
| **Custo** | 💰 Grátis | 💰 10k req/dia grátis | 💰 Grátis |
| **Internet** | ❌ Não precisa | ✅ Requer | ❌ Não precisa |
| **Ideal para** | Produção | Desenvolvimento | Testes básicos |

---

## 🎯 Recomendações

### Para Desenvolvimento:
```env
# Use Upstash - zero configuração
UPSTASH_REDIS_URL=redis://...
```

### Para Produção:
```env
# Use Redis Local com Upstash como fallback
REDIS_HOST=localhost
REDIS_PORT=6379
UPSTASH_REDIS_URL=redis://...
```

### Para Testes Rápidos:
```env
# Deixe ambos vazios - sistema funciona sem Redis
# (funcionalidades de fila limitadas)
```

---

## 🆘 Suporte

- 📖 Documentação Redis: https://redis.io/docs/
- 📖 Documentação Upstash: https://docs.upstash.com/redis
- 🐛 Issues: Abra um issue no repositório

---

**Última atualização:** 16 de Janeiro de 2026
**Versão do Sistema:** 1.0.0
