# 📱 CONFIGURAÇÃO PARA ACESSO DO CELULAR AO SISTEMA
## Data: 5 de Janeiro de 2026

---

## ✅ STATUS ATUAL

### Backend:
- ✅ Rodando em: http://192.168.5.19:3333
- ✅ Escutando em todas as interfaces (0.0.0.0)
- ✅ CORS configurado para aceitar toda a rede local

### Frontend:
- ✅ Rodando em: http://192.168.5.19:5173
- ✅ Acessível pela rede

---

## 🔥 LIBERAR FIREWALL (NECESSÁRIO)

**Execute os comandos abaixo como ADMINISTRADOR:**

### Opção 1: Usando o script automático
1. Clique com botão direito em `liberar-firewall.ps1`
2. Selecione "Executar com PowerShell"
3. Quando pedir confirmação, clique em "Sim"

### Opção 2: Comandos manuais no PowerShell (como Admin)
```powershell
New-NetFirewallRule -DisplayName "Gestão Escolar Backend 3333" -Direction Inbound -LocalPort 3333 -Protocol TCP -Action Allow

New-NetFirewallRule -DisplayName "Gestão Escolar Frontend 5173" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### Opção 3: Usando netsh (como Admin)
```cmd
netsh advfirewall firewall add rule name="Gestao Escolar Backend" dir=in action=allow protocol=TCP localport=3333

netsh advfirewall firewall add rule name="Gestao Escolar Frontend" dir=in action=allow protocol=TCP localport=5173
```

---

## 📱 ENDEREÇOS PARA ACESSAR DO CELULAR

### No navegador do celular, digite:
```
http://192.168.5.19:5173
```

### ⚠️ IMPORTANTE:
- Celular e notebook devem estar na **mesma rede Wi-Fi**
- Após liberar o firewall, **reinicie o navegador do celular**
- Se continuar com problemas, teste acessar diretamente a API:
  ```
  http://192.168.5.19:3333/api
  ```

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### No PowerShell do notebook:
```powershell
Test-NetConnection -ComputerName 192.168.5.19 -Port 3333
Test-NetConnection -ComputerName 192.168.5.19 -Port 5173
```

Ambos devem retornar: `TcpTestSucceeded : True`

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### Se ainda não conectar:
1. Desabilite temporariamente o firewall para testar:
   ```powershell
   Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
   ```

2. Teste novamente do celular

3. Se funcionar, reative o firewall:
   ```powershell
   Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
   ```

4. E adicione as regras corretas conforme acima

---

## 📝 IPs DETECTADOS NA REDE

- Servidor (este computador): **192.168.5.19**
- Dispositivo conectado: **192.168.5.11** (provavelmente seu celular)

---

**Configurações atualizadas automaticamente! ✨**
