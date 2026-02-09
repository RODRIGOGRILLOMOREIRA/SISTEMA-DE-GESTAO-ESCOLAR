# 🚀 INÍCIO RÁPIDO - CONFIGURAÇÃO REDIS

## ⚡ Opção Mais Rápida: Upstash Cloud (5 minutos)

### Passo a Passo:

1. **Cadastre-se (grátis):**
   ```
   https://upstash.com/
   ```

2. **Crie um Database:**
   - Clique: "Create Database"
   - Nome: `sge-redis`
   - Região: Mais próxima de você
   - Clique: "Create"

3. **Copie a URL:**
   - Na página do database, copie a URL que começa com:
   ```
   redis://default:...
   ```

4. **Configure no .env:**
   ```env
   # No arquivo: backend/.env
   UPSTASH_REDIS_URL=redis://default:SEU_PASSWORD@SEU_HOST:6379
   ```

5. **Reinicie o backend:**
   ```powershell
   cd backend
   npm run dev
   ```

6. **Verifique os logs:**
   ```
   ✅ Conectado ao Upstash Cloud como fallback
   ```

✅ **PRONTO!** Sistema funcionando com Redis em 5 minutos!

---

## 📦 Alternativa: Redis Local (15 minutos)

### Windows - Memurai (Recomendado):

1. **Download:**
   ```
   https://www.memurai.com/get-memurai
   ```

2. **Instale:**
   - Execute o instalador
   - Aceite configurações padrão
   - Serviço inicia automaticamente

3. **Configure no .env:**
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   ```

4. **Reinicie o backend:**
   ```powershell
   cd backend
   npm run dev
   ```

5. **Verifique os logs:**
   ```
   ✅ Redis Local: Conectado com sucesso
   ```

---

## 🔧 Script Interativo (Mais Fácil)

Execute no PowerShell:

```powershell
.\setup-redis.ps1
```

O script oferece menu interativo com todas as opções!

---

## 🆘 Problemas?

### Redis não conecta?

**Solução rápida:** Use Upstash Cloud (5 minutos)

### Já tem Redis rodando mas não conecta?

1. Verifique serviço:
   ```powershell
   Get-Service Memurai
   # ou
   Get-Service Redis
   ```

2. Se parado, inicie:
   ```powershell
   Start-Service Memurai
   ```

### Sistema lento sem Redis?

Configure Redis seguindo este guia ou `REDIS_SETUP.md`

---

## 📊 Status da Configuração

Execute para verificar:

```powershell
.\setup-redis.ps1
# Escolha opção: 4 - Verificar Status
```

---

**Recomendação Final:**

- **Desenvolvimento:** Use Upstash Cloud ☁️
- **Produção:** Use Redis Local + Upstash Fallback 🚀
- **Testes Rápidos:** Sistema funciona sem Redis ⚙️

---

📖 **Guia Completo:** [REDIS_SETUP.md](./REDIS_SETUP.md)
