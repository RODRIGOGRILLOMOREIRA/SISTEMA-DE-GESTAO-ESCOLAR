# 🛡️ PREVENÇÃO DE CRASHES DO VS CODE

## ⚠️ PROBLEMA RESOLVIDO

O VS Code estava travando devido a:
1. **Alto uso de memória** - Monitoramento excessivo de arquivos
2. **TypeScript Server** - Consumo elevado de RAM
3. **Node.js** - Limite de memória padrão muito alto (4GB)

---

## ✅ SOLUÇÕES IMPLEMENTADAS

### 1. Configuração do VS Code (`.vscode/settings.json`)
```json
{
  // Excluir pastas desnecessárias do monitoramento
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/uploads/**": true,
    "**/backups/**": true
  },
  
  // Limitar memória do TypeScript Server
  "typescript.tsserver.maxTsServerMemory": 2048,
  
  // Desabilitar recursos pesados
  "git.autofetch": false,
  "git.autorefresh": false,
  "extensions.autoUpdate": false
}
```

### 2. Otimização do Node.js (`package.json`)
```json
{
  "scripts": {
    // Reduzido de 4GB para 2GB
    "dev": "set NODE_OPTIONS=--max-old-space-size=2048 --expose-gc && npx tsx watch src/server.ts"
  }
}
```

### 3. Redis com TLS Otimizado
- ✅ Conexão única e reutilizável
- ✅ Lazy connection quando possível
- ✅ Graceful shutdown implementado
- ✅ Sem memory leaks

### 4. Rate Limiter Otimizado
- ✅ Limpeza automática a cada 5 minutos
- ✅ Sem acúmulo infinito de registros
- ✅ Destroy method para shutdown limpo

---

## 📊 MONITORAMENTO DE MEMÓRIA

### Verificar Uso Atual
```powershell
# No terminal do VS Code
Get-Process node | Select-Object Name, CPU, WS
```

### Limpar Cache do VS Code
```powershell
# Fechar VS Code completamente
# Limpar cache
Remove-Item -Recurse -Force "$env:APPDATA\Code\Cache"
Remove-Item -Recurse -Force "$env:APPDATA\Code\CachedData"
```

---

## 🚀 BOAS PRÁTICAS

### Durante o Desenvolvimento

1. **Fechar terminais desnecessários**
   - Use CTRL+C para parar servidores antes de fechar
   - Não acumule terminais abertos

2. **Reiniciar VS Code periodicamente**
   - A cada 4-6 horas de uso intenso
   - Ou quando notar lentidão

3. **Usar Tasks do VS Code**
   - Abra a paleta de comandos (CTRL+SHIFT+P)
   - Execute "Tasks: Run Task"
   - Escolha "Start Backend" ou "Start Frontend"
   - Tasks são mais eficientes que terminais manuais

4. **Monitorar extensões**
   - Desabilite extensões não usadas
   - Algumas extensões consomem muita RAM

### Ao Fechar o Projeto

```powershell
# 1. Parar servidores
CTRL+C (em cada terminal)

# 2. Aguardar graceful shutdown
# Você verá: "✅ Redis desconectado graciosamente"

# 3. Fechar VS Code
# Aguarde alguns segundos antes de reabrir
```

---

## 🔧 COMANDOS ÚTEIS

### Iniciar Sistema (Modo Seguro)
```powershell
# Backend
cd backend
npm run dev

# Frontend (em outro terminal)
cd frontend
npm run dev
```

### Testar Redis (Sem Iniciar Servidor)
```powershell
cd backend
npm run test:redis
```

### Limpar Memória do Node.js
```powershell
# O flag --expose-gc permite forçar garbage collection
# Já está configurado no npm run dev
```

---

## 🐛 SE O VS CODE TRAVAR NOVAMENTE

### Passo 1: Force Quit
```powershell
# Via Task Manager
CTRL+SHIFT+ESC
# Finalizar todos os processos "Code.exe" e "node.exe"
```

### Passo 2: Limpar Cache
```powershell
# PowerShell
Remove-Item -Recurse -Force "$env:APPDATA\Code\Cache"
Remove-Item -Recurse -Force "$env:APPDATA\Code\CachedData"
Remove-Item -Recurse -Force "$env:APPDATA\Code\GPUCache"
```

### Passo 3: Verificar Extensões
```
1. Abrir VS Code
2. CTRL+SHIFT+X (Extensões)
3. Desabilitar extensões pesadas:
   - GitLens (se não estiver usando)
   - Docker (se não estiver usando)
   - Outras que consomem muita RAM
```

### Passo 4: Reiniciar PC (último recurso)
Se nada funcionar, reinicie o computador.

---

## 📱 ACESSO NO CELULAR

### Configuração Necessária

1. **Descobrir IP do Notebook**
```powershell
ipconfig
# Procure "IPv4 Address" (ex: 192.168.1.100)
```

2. **Configurar Frontend**
Crie/edite `frontend/.env`:
```env
VITE_API_URL=http://192.168.1.100:3333
```

3. **Abrir no Celular**
- Conecte o celular na **mesma rede WiFi**
- Acesse: `http://192.168.1.100:5174`

### Firewall do Windows
Se não conseguir conectar do celular:
```powershell
# PowerShell como Administrador
New-NetFirewallRule -DisplayName "Node Backend" -Direction Inbound -LocalPort 3333 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Vite Frontend" -Direction Inbound -LocalPort 5174 -Protocol TCP -Action Allow
```

---

## 💡 DICAS DE PERFORMANCE

### VS Code

1. **Desabilitar telemetria**
   ```json
   "telemetry.telemetryLevel": "off"
   ```

2. **Reduzir histórico do terminal**
   ```json
   "terminal.integrated.scrollback": 1000
   ```

3. **Desabilitar animações**
   ```json
   "workbench.reduceMotion": "on"
   ```

### Sistema

1. **Fechar programas pesados** (Chrome, Discord, etc.) durante desenvolvimento

2. **Usar navegador leve** (Edge, Firefox) para testar frontend

3. **Monitorar RAM** - Mínimo 8GB recomendado para desenvolvimento

---

## 📞 CHECKLIST ANTES DE COMEÇAR

- [ ] VS Code atualizado
- [ ] Node.js v18+ instalado
- [ ] 8GB+ RAM disponível
- [ ] Configurações do `.vscode/settings.json` aplicadas
- [ ] .env do backend configurado com UPSTASH_REDIS_URL
- [ ] Firewall configurado (se usar celular)
- [ ] PostgreSQL rodando

---

## 🎯 RESULTADO ESPERADO

```
✅ VS Code estável e responsivo
✅ Backend rodando com 2GB RAM
✅ Frontend leve e rápido
✅ Redis conectado ao Upstash
✅ Acesso funcionando no celular e notebook
✅ Sem crashes ou travamentos
```

---

**Última atualização**: 16/01/2026  
**Status**: ✅ CONFIGURAÇÕES APLICADAS E TESTADAS
