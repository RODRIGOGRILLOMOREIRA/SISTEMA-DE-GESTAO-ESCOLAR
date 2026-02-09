# 🖥️ RedisInsight - Guia de Instalação e Configuração

> **Interface Gráfica para Visualizar e Gerenciar Redis**

## 🎯 O que é RedisInsight?

RedisInsight é uma ferramenta **oficial e gratuita** da Redis que permite:

- 👀 **Visualizar** todas as chaves e valores
- 🔍 **Buscar** dados de forma intuitiva
- 📊 **Monitorar** performance e uso de memória
- ⚡ **Executar** comandos Redis diretamente
- 📈 **Analisar** padrões de uso

---

## 📥 Instalação

### Windows (Recomendado)

#### **Opção 1: Download Direto**

1. **Baixar o instalador:**
   - Acesse: https://redis.io/insight/
   - Clique em **"Download for Windows"**
   - Ou baixe diretamente: https://download.redisinsight.redis.com/latest/RedisInsight-v2-win-installer.exe

2. **Instalar:**
   - Execute o instalador baixado
   - Siga o wizard de instalação
   - Aceite as configurações padrão
   - Clique em "Install"

3. **Iniciar:**
   - RedisInsight será aberto automaticamente
   - Ou busque "RedisInsight" no menu Iniciar

#### **Opção 2: Via Winget (Windows Package Manager)**

```powershell
winget install RedisInsight
```

#### **Opção 3: Via Chocolatey**

```powershell
choco install redisinsight
```

### macOS

```bash
brew install redisinsight
```

### Linux

```bash
# Snap
sudo snap install redisinsight

# Ou baixe o .deb/.rpm
wget https://download.redisinsight.redis.com/latest/RedisInsight-v2-linux-amd64.deb
sudo dpkg -i RedisInsight-v2-linux-amd64.deb
```

### Docker (Alternativa)

```bash
docker run -d -p 5540:5540 redis/redisinsight:latest
```

Acesse: http://localhost:5540

---

## ⚙️ Configurar Conexão com Upstash

### Passo 1: Abrir RedisInsight

- Abra o RedisInsight
- Você verá a tela inicial

### Passo 2: Adicionar Nova Conexão

1. **Clique em "Add Redis Database"**

2. **Escolha "Connect to a Redis Database"**

3. **Preencha as informações:**

   ```
   Host: regular-bulldog-33638.upstash.io
   Port: 6379
   Database Alias: SGE Upstash (nome que você quiser)
   Username: default
   Password: AYNmAAIncDEyYTQwYmI1M2FhOTg0NjNkYTI2NzU3ZjljY2RkZjhiMnAxMzM2Mzg
   ```

4. **Configurações Avançadas:**
   - ✅ Marque "Use TLS"
   - ✅ Deixe "Verify TLS Certificate" marcado

5. **Clique em "Add Redis Database"**

### Passo 3: Conectar

- Clique no database criado
- Você verá o dashboard com suas chaves!

---

## 🎨 Interface do RedisInsight

### 📊 Dashboard Principal

Ao conectar, você verá:

1. **Overview:**
   - Total de chaves
   - Uso de memória
   - Comandos por segundo
   - Clientes conectados

2. **Browser:**
   - Lista todas as chaves
   - Buscar por padrão
   - Ver/editar valores
   - Deletar chaves

3. **Workbench:**
   - Executar comandos Redis
   - Ver histórico de comandos
   - Salvar comandos favoritos

4. **Analysis Tools:**
   - Análise de memória
   - Profiling de comandos
   - Recomendações

---

## 🔍 Operações Básicas

### Ver Todas as Chaves

1. Clique em **"Browser"** no menu lateral
2. Você verá todas as chaves do seu sistema:
   ```
   sge:turmas:list:1:10:nome:asc
   sge:turma:123
   sge:cache:alunos:*
   rl:192.168.1.1:/api/auth/login
   ```

### Buscar Chaves

1. Na barra de busca, digite:
   ```
   sge:turma:*
   ```
2. Pressione Enter
3. Verá apenas chaves de turmas

### Ver Conteúdo de uma Chave

1. Clique na chave desejada
2. Você verá:
   - **Type:** String, Hash, List, Set, etc.
   - **TTL:** Tempo restante
   - **Size:** Tamanho em bytes
   - **Value:** Conteúdo (JSON formatado)

### Editar Valor

1. Clique na chave
2. Clique em "Edit"
3. Modifique o valor
4. Clique em "Save"

### Deletar Chave

1. Clique na chave
2. Clique no ícone de lixeira 🗑️
3. Confirme a exclusão

---

## ⚡ Comandos Úteis (Workbench)

### Listar Chaves por Padrão

```redis
KEYS sge:*
```

### Ver Informações de uma Chave

```redis
TTL sge:turma:123
TYPE sge:turma:123
MEMORY USAGE sge:turma:123
```

### Ver Valor

```redis
GET sge:turma:123
```

### Deletar Chaves por Padrão

```redis
# Listar primeiro
KEYS sge:turmas:*

# Depois deletar (cuidado!)
DEL sge:turmas:list:1:10:nome:asc
```

### Ver Estatísticas

```redis
INFO stats
INFO memory
INFO clients
```

### Monitorar Comandos em Tempo Real

```redis
MONITOR
```

---

## 📊 Monitoramento

### Ver Uso de Memória

1. Vá em **"Analysis Tools"**
2. Clique em **"Database Analysis"**
3. Clique em **"New Analysis"**
4. Aguarde o scan
5. Você verá:
   - Uso de memória por tipo
   - Top chaves por tamanho
   - Distribuição de TTLs

### Ver Performance

1. Dashboard principal mostra:
   - **Ops/sec:** Operações por segundo
   - **Network:** I/O de rede
   - **CPU:** Uso de CPU
   - **Memory:** Uso de memória

---

## 🎯 Use Cases para o SGE

### 1️⃣ **Debugar Cache**

Verificar se cache está sendo criado corretamente:

```
1. Browser → Buscar: sge:turmas:*
2. Ver valores e TTLs
3. Verificar se dados estão corretos
```

### 2️⃣ **Monitorar Rate Limiting**

Ver quantas requisições um IP fez:

```
1. Browser → Buscar: rl:*
2. Ver contadores por IP
3. Identificar IPs suspeitos
```

### 3️⃣ **Verificar Blacklist**

Ver IPs bloqueados:

```
1. Browser → Buscar: blacklist:*
2. Ver IPs bloqueados e motivo
```

### 4️⃣ **Limpar Cache Manualmente**

Invalidar cache de uma entidade:

```
1. Browser → Buscar: sge:turma:123
2. Delete a chave
3. Próxima request buscará do banco
```

### 5️⃣ **Monitorar Filas (Bull Queue)**

Ver jobs em processamento:

```
1. Browser → Buscar: bull:*
2. Ver filas e seus jobs
```

---

## 🚨 Atenções e Cuidados

### ⚠️ Comandos Perigosos

**NUNCA execute em produção:**

```redis
# ❌ PERIGO: Deleta TODAS as chaves
FLUSHDB

# ❌ PERIGO: Deleta TODOS os databases
FLUSHALL

# ❌ Cuidado com padrões amplos
DEL sge:*
```

### ✅ Sempre Faça:

1. **Backup antes de deletar** chaves importantes
2. **Teste comandos** em ambiente de desenvolvimento
3. **Use KEYS com cautela** (pode deixar Redis lento)
4. **Prefira SCAN** ao invés de KEYS em produção

### 🔒 Segurança

- ✅ RedisInsight armazena credenciais localmente
- ✅ Conexões são criptografadas (TLS)
- ⚠️ Não compartilhe seu password do Upstash

---

## 🎓 Recursos Avançados

### 📸 Exportar Dados

1. Browser → Selecione chaves
2. Clique em "Export"
3. Escolha formato (JSON, CSV, Redis Protocol)
4. Salve o arquivo

### 📥 Importar Dados

1. Browser → Clique em "Import"
2. Selecione arquivo
3. Confirme importação

### 📝 Salvar Comandos Favoritos

1. Workbench → Execute comando
2. Clique no ⭐ ao lado do comando
3. Dê um nome e salve

### 📊 Profiling

Ver quais comandos estão consumindo mais recursos:

1. Profiler → Start Profiling
2. Use o sistema normalmente por alguns minutos
3. Stop Profiling
4. Analise os resultados

---

## 🔧 Solução de Problemas

### Não consegue conectar?

**Erro: "Connection timeout"**

✅ Soluções:
1. Verifique se TLS está habilitado
2. Confirme host e porta corretos
3. Teste com outro cliente (redis-cli)

**Erro: "Authentication failed"**

✅ Soluções:
1. Verifique username: `default`
2. Confirme password está correto
3. Copie novamente do Upstash dashboard

**Erro: "ECONNREFUSED"**

✅ Soluções:
1. Upstash pode estar em manutenção
2. Verifique seu firewall
3. Teste conexão de rede

### RedisInsight lento?

✅ Soluções:
1. Evite usar KEYS com muitas chaves
2. Use SCAN ao invés de KEYS
3. Feche análises não utilizadas
4. Reinicie o RedisInsight

---

## 📚 Links Úteis

- **Site Oficial:** https://redis.io/insight/
- **Documentação:** https://docs.redis.com/latest/ri/
- **Upstash Dashboard:** https://console.upstash.com/
- **Redis Commands:** https://redis.io/commands/

---

## ✅ Checklist de Instalação

- [ ] RedisInsight instalado
- [ ] Conexão com Upstash configurada
- [ ] TLS habilitado
- [ ] Consegue ver chaves `sge:*`
- [ ] Testou buscar uma chave
- [ ] Verificou TTL de uma chave

---

## 🎉 Pronto!

Agora você tem uma interface visual completa para gerenciar seu Redis!

**Principais Benefícios:**

✅ Visualização clara de todos os dados  
✅ Debug fácil de problemas de cache  
✅ Monitoramento em tempo real  
✅ Execução de comandos sem terminal  
✅ Análise de performance  

---

**Dúvidas?** Consulte a [documentação oficial](https://docs.redis.com/latest/ri/) ou o guia de uso do Redis: [REDIS_USAGE_GUIDE.md](./REDIS_USAGE_GUIDE.md)
