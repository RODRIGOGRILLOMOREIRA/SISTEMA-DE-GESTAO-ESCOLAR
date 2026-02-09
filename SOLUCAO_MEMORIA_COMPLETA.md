# 🛠️ Soluções para Crashes e Problemas de Memória do VS Code

Este documento contém soluções completas para problemas de travamento, crash e falta de memória do VS Code durante o desenvolvimento do projeto.

---

## 🎯 Problemas Identificados

O VS Code estava crashando/travando devido a:
- ❌ Alto uso de memória pelo TypeScript Server
- ❌ Muitos arquivos sendo monitorados (node_modules, uploads, etc.)
- ❌ Recursos de IntelliSense muito agressivos
- ❌ Limite padrão de memória do Node.js insuficiente (2GB)
- ❌ Cache acumulado do VS Code

---

## 🚀 SOLUÇÃO RÁPIDA - Execute Agora!

### 1️⃣ Aumentar Memória (Executar UMA VEZ como Administrador)

```powershell
# Clique com botão direito no PowerShell > Executar como Administrador
.\aumentar-memoria.ps1
```

**Este script irá:**
- ✅ Aumentar memória do Node.js para **8GB**
- ✅ Aumentar memória do VS Code para **8GB**
- ✅ Configurar TypeScript Server para **4GB**
- ✅ Limpar todo cache do VS Code
- ✅ Criar atalho otimizado na área de trabalho

**⚠️ IMPORTANTE:** Após executar:
1. Feche TODOS os processos do VS Code
2. Reinicie o computador ou faça logout/login
3. Use o atalho "VS Code (Alta Performance)" criado na área de trabalho

---

### 2️⃣ Liberar Memória Antes de Trabalhar (Executar SEMPRE)

```powershell
# Execute este script ANTES de abrir o VS Code
.\liberar-memoria-rapido.ps1
```

**Este script irá:**
- ✅ Fechar processos antigos do VS Code/Node
- ✅ Liberar memória RAM
- ✅ Mostrar status da memória disponível

---

## 📋 Configurações Otimizadas Aplicadas

### Arquivo `.vscode/settings.json` (já configurado automaticamente)

```json
{
  // Memória do TypeScript aumentada para 4GB
  "typescript.tsserver.maxTsServerMemory": 4096,
  
  // Limitar abas abertas para economizar memória
  "workbench.editor.limit.enabled": true,
  "workbench.editor.limit.value": 10,
  
  // Auto-salvar para evitar perda de dados
  "files.autoSave": "onFocusChange",
  
  // Excluir pastas do monitoramento
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/uploads/**": true,
    "**/backups/**": true,
    "**/dev-dist/**": true
  }
}
```

---

## 🎮 Como Usar no Dia a Dia

### Rotina Recomendada:

1. **Antes de começar a trabalhar:**
   ```powershell
   .\liberar-memoria-rapido.ps1
   ```

2. **Abrir VS Code:**
   - Use o atalho "VS Code (Alta Performance)" da área de trabalho
   - OU execute: `code . --max-memory=8192`

3. **Durante o trabalho:**
   - Feche abas que não está usando
   - Evite abrir muitos arquivos simultaneamente
   - Limite: 10 abas abertas (configurado automaticamente)

4. **Se o VS Code começar a travar:**
   - Salve tudo (Ctrl+K S)
   - Feche o VS Code
   - Execute: `.\liberar-memoria-rapido.ps1`
   - Reabra o VS Code

---

## 📊 Configurações de Memória

| Componente | Antes | Depois | Ganho |
|------------|-------|--------|-------|
| Node.js | 2GB | 8GB | +300% |
| VS Code | 2GB | 8GB | +300% |
| TypeScript Server | 1.5GB | 4GB | +167% |
| Total Disponível | ~5.5GB | ~20GB | +264% |

---

## 🔧 Comandos Úteis

### Verificar Memória Disponível
```powershell
Get-CimInstance Win32_OperatingSystem | Select-Object FreePhysicalMemory,TotalVisibleMemorySize
```

### Fechar Todos os Processos do VS Code Manualmente
```powershell
Stop-Process -Name "Code" -Force
Stop-Process -Name "node" -Force
Stop-Process -Name "tsserver" -Force
```

### Limpar Cache do NPM (se necessário)
```powershell
npm cache clean --force
```

---

## 🚨 Troubleshooting

### VS Code ainda está travando?

1. **Verifique se executou o script com privilégios de administrador:**
   ```powershell
   # Verifique se NODE_OPTIONS está definido
   [System.Environment]::GetEnvironmentVariable('NODE_OPTIONS', 'User')
   # Deve retornar: --max-old-space-size=8192
   ```

2. **Reinicie o computador:**
   - Variáveis de ambiente só são carregadas após reiniciar

3. **Verifique memória RAM física:**
   - Você precisa de pelo menos 8GB de RAM física
   - Feche outros programas pesados (Chrome, etc.)

4. **Desabilite extensões desnecessárias:**
   - Abra VS Code
   - Pressione Ctrl+Shift+X
   - Desabilite extensões que não está usando

5. **Use modo de desempenho:**
   - Pressione Ctrl+Shift+P
   - Digite: "Developer: Show Running Extensions"
   - Identifique extensões que consomem muita memória

---

## ⚡ Dicas Extras de Performance

### 1. Use Git via terminal ao invés do Source Control do VS Code
```powershell
# Mais leve e rápido
git add .
git commit -m "mensagem"
git push
```

### 2. Feche o painel de Output quando não estiver usando
- Pressione Ctrl+Shift+U para abrir/fechar

### 3. Desabilite Live Server se não estiver usando
- Economiza memória e CPU

### 4. Use filtros de busca específicos
```
# Em vez de buscar em tudo:
Ctrl+Shift+F > Adicionar padrão: src/**/*.ts

# Exclua node_modules explicitamente:
files to exclude: **/node_modules/**
```

---

## 📚 Arquivos Relacionados

- `aumentar-memoria.ps1` - Script principal de configuração
- `liberar-memoria-rapido.ps1` - Script de limpeza rápida
- `.vscode/settings.json` - Configurações do workspace
- `clear-memory.ps1` - Script alternativo de limpeza

---

## ✅ Checklist de Verificação

Após executar as soluções, verifique:

- [ ] NODE_OPTIONS está definido (8GB)
- [ ] VS Code abre sem erros
- [ ] TypeScript Server funciona normalmente
- [ ] Atalho na área de trabalho foi criado
- [ ] Cache foi limpo
- [ ] Computador foi reiniciado

---

## 📞 Ainda com Problemas?

Se após todas essas otimizações o VS Code continuar travando:

1. Verifique a quantidade de RAM física do seu computador
2. Monitore uso de memória com Task Manager (Ctrl+Shift+Esc)
3. Considere aumentar a RAM física se tiver menos de 8GB
4. Use o VS Code em modo leve: `code --disable-extensions`

---

**Última atualização:** 16/01/2026
**Status:** ✅ Todas as otimizações aplicadas
