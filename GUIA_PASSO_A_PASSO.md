# 🎯 Guia Passo a Passo - Configuração das APIs

## 📱 PARTE 1: TELEGRAM BOT (MAIS FÁCIL - COMECE AQUI)

### Por que começar pelo Telegram?
- ✅ 100% GRATUITO
- ✅ Mais simples de configurar
- ✅ Funciona em 5 minutos
- ✅ Não precisa aprovação

---

### PASSO 1: Criar o Bot no Telegram

**1.1 - Abrir o Telegram**
- Instale o Telegram no celular ou acesse https://web.telegram.org
- Faça login com seu número

**1.2 - Buscar o BotFather**
```
1. No campo de busca do Telegram, digite: @BotFather
2. Clique no primeiro resultado (verificado com ✓)
3. Clique em "START" ou "INICIAR"
```

**1.3 - Criar o Bot**
```
Digite: /newbot

BotFather vai perguntar:
"Alright, a new bot. How are we going to call it?"

Digite o nome do bot (exemplo):
Escola Centenário Bot

BotFather vai perguntar:
"Good. Now let's choose a username for your bot."

Digite o username (DEVE terminar em 'bot'):
centenario_escola_bot

✅ PRONTO! BotFather vai responder com seu TOKEN
```

**1.4 - Copiar o Token**
```
Você vai receber algo assim:

"Done! Congratulations on your new bot. You will find it at 
t.me/centenario_escola_bot. You can now add a description...

Use this token to access the HTTP API:
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789

Keep your token secure and store it safely, it can be used by 
anyone to control your bot."

COPIE ESSE TOKEN! ← Você vai precisar dele
```

**1.5 - Adicionar no .env**
```bash
# Abra o arquivo backend/.env
# Cole o token:

TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789
```

**1.6 - Testar o Bot**
```
1. No Telegram, busque seu bot: @centenario_escola_bot
2. Clique em START
3. Digite: /start
4. O bot vai responder se estiver funcionando!
```

✅ **TELEGRAM CONFIGURADO!** Isso já é suficiente para começar a testar!

---

### PASSO 2: Configurar o Webhook (Opcional - para produção)

**Quando você tiver um domínio público, execute:**

```bash
# Substitua:
# <SEU_TOKEN> pelo token do bot
# <SEU_DOMINIO> pelo seu domínio

curl -X POST "https://api.telegram.org/bot<SEU_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://<SEU_DOMINIO>/api/notificacoes/webhook/telegram"}'
```

**Exemplo:**
```bash
curl -X POST "https://api.telegram.org/bot1234567890:ABC.../setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://escola.com.br/api/notificacoes/webhook/telegram"}'
```

---

## 💬 PARTE 2: WHATSAPP BUSINESS API (MAIS COMPLEXO)

### Requisitos
- Conta Meta Business
- Número comercial (não pode ser pessoal)
- Cartão de crédito (cobrança após 1.000 conversas grátis)

---

### PASSO 1: Criar Conta Meta Business

**1.1 - Acessar Meta Business**
```
1. Abra: https://business.facebook.com/
2. Clique em "Criar conta"
3. Preencha os dados da escola:
   - Nome: E.E.E.F. CENTENÁRIO
   - Seu nome: Rodrigo Grillo Moreira
   - Email: rodrigo-gmoreira@educar.rs.gov.br
4. Clique em "Avançar"
```

**1.2 - Verificar Email**
```
1. Abra seu email
2. Procure email do Meta Business
3. Clique no link de verificação
```

✅ **Meta Business criada!**

---

### PASSO 2: Criar App para WhatsApp

**2.1 - Acessar Meta for Developers**
```
1. Abra: https://developers.facebook.com/
2. Entre com a mesma conta do Meta Business
3. Clique em "Meus Apps" (canto superior direito)
4. Clique em "Criar App"
```

**2.2 - Escolher Tipo de App**
```
1. Selecione: "Negócio"
2. Clique em "Avançar"
```

**2.3 - Configurar o App**
```
Nome do app: Sistema Notificações Escola
Email de contato: rodrigo-gmoreira@educar.rs.gov.br
Conta comercial: Selecione a conta que você criou
Clique em "Criar app"
```

**2.4 - Adicionar Produto WhatsApp**
```
1. No painel do app, procure "WhatsApp"
2. Clique em "Configurar" ou "Set up"
3. Siga o assistente de configuração
```

---

### PASSO 3: Configurar Número de Telefone

**3.1 - Número de Teste (Desenvolvimento)**
```
O Meta fornece um número de teste GRÁTIS!

1. No painel WhatsApp, vá em "API Setup"
2. Você verá um número de teste como:
   +1 555 025 3483 (exemplo)
3. Este número é grátis para testes!
```

**3.2 - Adicionar Números para Receber Testes**
```
1. Na seção "To", clique em "Add phone number"
2. Digite seu WhatsApp: +55 11 99999-9999
3. Clique em "Send code"
4. Digite o código recebido no WhatsApp
5. Seu número está autorizado a receber mensagens de teste!
```

**3.3 - Testar Envio**
```
1. No painel, clique em "Send test message"
2. Selecione seu número
3. Clique em "Send message"
4. Você deve receber no WhatsApp!
```

✅ **WhatsApp funcionando em modo teste!**

---

### PASSO 4: Obter Credenciais

**4.1 - Copiar Phone Number ID**
```
No painel API Setup, você verá:

Phone number ID: 123456789012345 ← COPIE ISSO
```

**4.2 - Obter Access Token**
```
1. Role a página para baixo
2. Procure por "Temporary access token"
3. Clique em "Copy" ao lado do token
4. Você verá algo como: EAAxxxxxxxxxxxxxxxxxxxxx

⚠️ IMPORTANTE: Este token expira em 24h!
   Para produção, você precisa gerar um token permanente
```

**4.3 - Gerar Token Permanente (Produção)**
```
1. Vá em "Tools" > "System Users"
2. Clique em "Add"
3. Nome: "Sistema Escola"
4. Role: Admin
5. Clique em "Create System User"
6. Clique em "Generate New Token"
7. Selecione seu app
8. Marque: whatsapp_business_messaging
9. Clique em "Generate Token"
10. COPIE E SALVE EM LOCAL SEGURO!
```

**4.4 - Criar Verify Token**
```
Este é um token que VOCÊ cria (qualquer string):

Exemplo: escola_centenario_webhook_2026_secreto
```

**4.5 - Adicionar no .env**
```env
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_VERIFY_TOKEN=escola_centenario_webhook_2026_secreto
```

✅ **WhatsApp configurado!**

---

### PASSO 5: Configurar Webhook (Produção)

**Quando tiver domínio público:**

**5.1 - Configurar no Meta**
```
1. No painel WhatsApp, vá em "Configuration" > "Webhook"
2. Clique em "Edit"
3. Callback URL: https://seu-dominio.com/api/notificacoes/webhook/whatsapp
4. Verify token: escola_centenario_webhook_2026_secreto (o mesmo do .env)
5. Clique em "Verify and save"
```

**5.2 - Assinar Eventos**
```
1. Clique em "Manage"
2. Marque: messages
3. Clique em "Save"
```

✅ **Webhook configurado!**

---

### PASSO 6: Número Comercial Real (Produção)

**Para usar número próprio da escola:**

**6.1 - Requisitos**
```
✅ Número comercial (não pessoal)
✅ Chip ativo
✅ Documentos da escola (CNPJ, etc)
```

**6.2 - Processo**
```
1. No painel WhatsApp Business, clique em "Add Phone Number"
2. Siga o processo de verificação
3. Upload dos documentos
4. Aguarde aprovação (1-3 dias úteis)
5. Número verificado aparecerá no painel
```

---

## 📨 PARTE 3: SMS (TWILIO)

### PASSO 1: Criar Conta Twilio

**1.1 - Acessar Twilio**
```
1. Abra: https://www.twilio.com/try-twilio
2. Preencha o formulário:
   - First Name: Rodrigo
   - Last Name: Moreira
   - Email: rodrigo-gmoreira@educar.rs.gov.br
   - Password: (crie uma senha forte)
3. Clique em "Start your free trial"
```

**1.2 - Verificar Email e Telefone**
```
1. Verifique seu email
2. Twilio vai ligar ou enviar SMS
3. Digite o código recebido
```

**1.3 - Responder Questionário**
```
1. "Which Twilio product...?" → SMS
2. "What do you plan to build?" → Notifications
3. "How do you want to build?" → With code
4. "What is your preferred language?" → JavaScript/Node.js
```

✅ **Conta criada com US$ 15 de crédito grátis!**

---

### PASSO 2: Obter Credenciais

**2.1 - Account SID e Auth Token**
```
1. No Dashboard do Twilio
2. Você verá:

Account Info
├─ ACCOUNT SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
└─ AUTH TOKEN: [Show] ← Clique para ver

3. Clique em [Show] no Auth Token
4. COPIE AMBOS!
```

**2.2 - Obter Número de Telefone**
```
1. No menu lateral, clique em "Phone Numbers"
2. Clique em "Get a number"
3. Clique em "Get a number" novamente
4. Twilio vai sugerir um número (EUA grátis para teste)
5. Clique em "Choose this number"

Você receberá algo como: +1 234 567 8900
```

**2.3 - Configurar Número para Brasil (Opcional)**
```
Para enviar SMS no Brasil:

1. Vá em "Messaging" > "Regulatory Compliance"
2. Clique em "Create Bundle"
3. Selecione "Brazil" e siga o processo
4. Upload dos documentos da escola
5. Aguarde aprovação
6. Compre número brasileiro em "Buy a Number"
```

**2.4 - Adicionar no .env**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+12345678900
```

---

### PASSO 3: Testar SMS

**3.1 - Adicionar Número Verificado (Trial)**
```
1. Vá em "Phone Numbers" > "Verified Caller IDs"
2. Clique em "Add a new Caller ID"
3. Digite seu celular: +55 11 99999-9999
4. Você receberá um código por SMS
5. Digite o código
```

**3.2 - Testar Envio**
```
1. No Dashboard, clique em "Messaging" > "Try it out"
2. Send an SMS
3. From: (seu número Twilio)
4. To: (seu celular verificado)
5. Body: "Teste do sistema"
6. Clique em "Make Request"
```

✅ **SMS funcionando!**

---

## 🤖 PARTE 4: OPENAI (IA)

### PASSO 1: Criar Conta OpenAI

**1.1 - Acessar OpenAI**
```
1. Abra: https://platform.openai.com/signup
2. Clique em "Sign up"
3. Opções de cadastro:
   - Email
   - Google
   - Microsoft
4. Escolha uma opção e complete o cadastro
```

**1.2 - Verificar Email**
```
1. Abra seu email
2. Clique no link de verificação
```

**1.3 - Adicionar Método de Pagamento**
```
1. Vá em "Settings" > "Billing"
2. Clique em "Add payment method"
3. Digite os dados do cartão
4. Defina limite de uso (ex: US$ 10/mês)
```

✅ **Conta OpenAI criada!**

---

### PASSO 2: Criar API Key

**2.1 - Gerar Chave**
```
1. Vá em "API Keys" (menu lateral)
2. Clique em "Create new secret key"
3. Nome: Sistema Escola Notificações
4. Clique em "Create secret key"
```

**2.2 - Copiar a Chave**
```
Você verá algo como:

sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234

⚠️ IMPORTANTE: Copie AGORA! Não será mostrada novamente!
```

**2.3 - Adicionar no .env**
```env
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234
OPENAI_MODEL=gpt-4
```

---

### PASSO 3: Testar IA

**3.1 - Testar no Playground**
```
1. Vá em "Playground"
2. Mode: Chat
3. Model: gpt-4
4. Digite: "Olá, você está funcionando?"
5. Clique em "Submit"
6. A IA deve responder!
```

✅ **IA funcionando!**

---

## ⚙️ PARTE 5: ATIVAR O SISTEMA

### PASSO 1: Configurar .env Completo

**Abra o arquivo `backend/.env` e configure:**

```env
# Database (já configurado)
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/gestao_escolar?schema=public"

# Server (já configurado)
PORT=3333
NODE_ENV=development

# CORS (já configurado)
FRONTEND_URL=http://localhost:5173

# Authentication (já configurado)
JWT_SECRET="seu_secret_super_seguro_aqui_mude_em_producao_12345"

# ====================
# SISTEMA DE NOTIFICAÇÕES
# ====================

# WhatsApp Business API (Meta)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_VERIFY_TOKEN=escola_centenario_webhook_2026_secreto

# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789
TELEGRAM_WEBHOOK_URL=https://seu-dominio.com/api/notificacoes/webhook/telegram

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+12345678900

# OpenAI (IA Conversacional)
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234
OPENAI_MODEL=gpt-4

# Configurações de Notificações
NOTIFICACOES_ATIVAS=true
MODO_TESTE=false
```

---

### PASSO 2: Reiniciar Backend

```bash
# Pare o backend (Ctrl+C no terminal)
# Inicie novamente:

cd backend
npm run dev
```

**Você deve ver:**
```
🤖 IA Service inicializado: Modelo gpt-4
🔔 Notification Service: Listeners inicializados
🚀 Servidor rodando na porta 3333
```

✅ **Sistema ativado!**

---

### PASSO 3: Testar o Sistema

**3.1 - Executar Script de Testes**

```bash
cd backend
npx tsx test-notificacoes.ts
```

**3.2 - Resultado Esperado**
```
🧪 INICIANDO TESTES DO SISTEMA DE NOTIFICAÇÕES

1️⃣  TESTE: Login
✅ Login realizado com sucesso!

2️⃣  TESTE: Status do Sistema
📊 Status do Sistema:
   Notificações Ativas: ✅
   Modo Teste: ❌
   IA Disponível: ✅

...

🎉 TODOS OS TESTES PASSARAM!
✨ Sistema de Notificações totalmente funcional!
```

---

## 🔍 TROUBLESHOOTING COMUM

### Problema 1: "EPERM" ao reiniciar backend
```bash
# Solução: Matar processo manualmente
netstat -ano | findstr :3333
taskkill /PID <numero_do_pid> /F
npm run dev
```

### Problema 2: Telegram não responde
```bash
# Verificar token:
curl https://api.telegram.org/bot<SEU_TOKEN>/getMe

# Deve retornar informações do bot
```

### Problema 3: WhatsApp "Invalid token"
```bash
# Gerar novo token no Meta for Developers
# Atualizar no .env
# Reiniciar backend
```

### Problema 4: OpenAI "Insufficient credits"
```bash
# Verificar saldo em: https://platform.openai.com/usage
# Adicionar créditos em: Settings > Billing
```

### Problema 5: SMS não envia
```bash
# Verificar se número está verificado (trial account)
# Verificar saldo em Twilio Dashboard
```

---

## 📊 ORDEM RECOMENDADA DE CONFIGURAÇÃO

```
1. Telegram       ⭐ COMECE AQUI (5 min, grátis)
2. OpenAI         ⭐ Segundo (10 min, teste grátis)
3. SMS (Twilio)   ⭐ Terceiro (15 min, US$ 15 grátis)
4. WhatsApp       ⭐ Por último (30 min, mais complexo)
```

---

## ✅ CHECKLIST FINAL

Antes de colocar em produção:

```
□ Telegram Bot criado e token no .env
□ OpenAI API Key criada e no .env
□ Twilio conta criada e credenciais no .env
□ WhatsApp Business configurado (se usar)
□ NOTIFICACOES_ATIVAS=true
□ MODO_TESTE=false
□ Backend reiniciado
□ Testes executados com sucesso
□ Números de teste recebendo mensagens
□ Logs sem erros
```

---

## 🆘 PRECISA DE AJUDA?

**Se tiver dúvidas em qualquer passo:**

1. Verifique os logs: `tail -f backend/logs/notificacoes.log`
2. Consulte a documentação oficial:
   - Telegram: https://core.telegram.org/bots
   - WhatsApp: https://developers.facebook.com/docs/whatsapp
   - Twilio: https://www.twilio.com/docs/sms
   - OpenAI: https://platform.openai.com/docs

3. Entre em contato:
   - 📧 rodrigo-gmoreira@educar.rs.gov.br
   - 📱 (55) 99645-8562

---

**Boa sorte! O sistema está pronto para revolucionar a comunicação da sua escola! 🚀**
