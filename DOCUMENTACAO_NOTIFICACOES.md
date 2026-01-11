# 🔔 Sistema de Notificações Inteligentes

## 📱 Visão Geral

Sistema completo de notificações em tempo real para pais, professores e gestão escolar, com:
- ✅ WhatsApp Business API (canal principal)
- ✅ SMS (fallback automático)
- ✅ Chatbot com IA (OpenAI GPT-4)
- ✅ Notificações de notas em tempo real
- ✅ Notificações de frequência (faltas/presenças)
- ✅ Alertas de média baixa e frequência crítica
- ✅ Sistema de permissões por perfil
- ✅ Configurações personalizadas por usuário

---

## 🚀 Como Funciona

### Fluxo de Notificações

```
Professor lança nota/frequência
    ↓
Sistema dispara evento
    ↓
Serviço de notificações processa
    ↓
Verifica configurações do usuário
    ↓
Tenta WhatsApp → Se falhar → SMS
    ↓
Registra log
```

### Perfis de Notificação

#### 👔 Gestão (Diretores, Coordenadores)
- **Recebe**: Todas as notificações (resumidas)
- **Filtros**: Pode configurar para receber apenas alertas
- **Exemplo**: "🚨 3 alunos com média crítica hoje"

#### 👨‍🏫 Professores
- **Recebe**: Apenas de suas disciplinas e turmas
- **Filtros**: Confirmações de lançamentos, alertas de alunos
- **Exemplo**: "✅ Nota lançada: Turma 8°B - Matemática"

#### 👪 Responsáveis
- **Recebe**: Apenas do(s) próprio(s) filho(s)
- **Filtros**: Todas notificações ou apenas alertas
- **Exemplo**: "⚠️ Falta registrada: João Silva - Português"

---

## 💰 Custos Reais (Atualizado para 250 alunos)

### Cenário 1: Apenas Desenvolvimento/Teste
```
WhatsApp: Desabilitado (simulação)
SMS: Desabilitado
IA: Desabilitado
───────────────────────
TOTAL: R$ 0/mês ✅
```

### Cenário 2: Produção Econômica (Recomendado)
```
WhatsApp Meta: R$ 50/mês (após 1000 grátis)
SMS: R$ 0 (não usa)
IA OpenAI: R$ 30/mês
───────────────────────
TOTAL: R$ 80/mês
Por aluno: R$ 0,32/mês
```

### Cenário 3: Produção Completa
```
WhatsApp: R$ 160/mês
SMS Fallback: R$ 20/mês
IA: R$ 30/mês
───────────────────────
TOTAL: R$ 210/mês
Por aluno: R$ 0,84/mês
```

---

## 📋 Configuração Passo a Passo

### 1. OpenAI (Chatbot IA)

**Passo 1**: Criar conta
- Acesse: https://platform.openai.com/
- Crie uma conta (usa cartão de crédito)

**Passo 2**: Gerar API Key
- Vá em: https://platform.openai.com/api-keys
- Clique em "Create new secret key"
- Copie a chave (só aparece uma vez!)

**Passo 3**: Configurar no `.env`
```bash
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxx"
OPENAI_MODEL="gpt-4-turbo-preview"
IA_ENABLED=true
```

**Custo**: ~R$ 0,02 por interação (500 interações = R$ 10)

---

### 2. WhatsApp Business API (Meta - Grátis até 1000 conversas/mês)

**Opção A: Meta Business API (Recomendado)**

**Passo 1**: Criar Meta Business Account
- Acesse: https://business.facebook.com/
- Criar conta comercial

**Passo 2**: Configurar WhatsApp
- Acesse: https://developers.facebook.com/
- Criar App > WhatsApp > Cloud API
- Seguir wizard de configuração

**Passo 3**: Obter credenciais
- Token de acesso permanente
- Phone Number ID
- Verify Token (você cria)

**Passo 4**: Configurar webhook
```
URL: https://seu-dominio.com/api/notificacoes/webhook/whatsapp
Verify Token: (o que você definiu)
```

**Passo 5**: Configurar no `.env`
```bash
WHATSAPP_PROVIDER="meta"
WHATSAPP_API_KEY="seu_token_permanente"
WHATSAPP_PHONE_NUMBER_ID="123456789"
WHATSAPP_VERIFY_TOKEN="meu_token_secreto"
```

**Custo**: Primeiras 1000 conversas/mês GRÁTIS, depois R$ 0,08 cada

---

**Opção B: Twilio (Alternativa Paga)**

**Passo 1**: Criar conta Twilio
- Acesse: https://www.twilio.com/try-twilio
- Criar conta (R$ 50 de crédito grátis)

**Passo 2**: Ativar WhatsApp
- Console > Messaging > Try it out > WhatsApp
- Seguir processo de aprovação

**Passo 3**: Configurar no `.env`
```bash
WHATSAPP_PROVIDER="twilio"
TWILIO_ACCOUNT_SID="ACxxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxx"
WHATSAPP_FROM_NUMBER="+14155238886"
```

**Custo**: R$ 0,15 por mensagem enviada

---

### 3. SMS (Opcional - Fallback)

**Usar Twilio (mesma conta do WhatsApp)**

**Passo 1**: Comprar número SMS
- Console > Phone Numbers > Buy a number
- Selecionar Brasil (+55)

**Passo 2**: Configurar no `.env`
```bash
SMS_PROVIDER="twilio"
SMS_FROM_NUMBER="+5511999999999"
```

**Custo**: R$ 0,05 por SMS

---

## 🗄️ Migração do Banco de Dados

```bash
cd backend
npx prisma migrate dev --name add_notification_system
npx prisma generate
```

Isso vai criar as tabelas:
- `configuracao_notificacao`
- `log_notificacao`
- `webhook_message`

---

## 🧪 Testando o Sistema

### 1. Testar sem APIs (Desenvolvimento)

Deixe tudo como `disabled` no `.env`:
```bash
WHATSAPP_PROVIDER="disabled"
SMS_PROVIDER="disabled"
IA_ENABLED=false
```

As notificações aparecerão apenas no console do servidor.

### 2. Testar WhatsApp/SMS

**Endpoint de teste:**
```bash
POST /api/notificacoes/teste
Content-Type: application/json

{
  "telefone": "+5511999999999",
  "mensagem": "Teste de notificação",
  "canal": "whatsapp"
}
```

### 3. Testar IA

```bash
POST /api/notificacoes/chat
Content-Type: application/json

{
  "usuarioId": "123",
  "tipoPerfil": "RESPONSAVEL",
  "mensagem": "Como está a frequência do meu filho?",
  "contexto": {
    "alunosIds": ["aluno-123"]
  }
}
```

---

## 📊 APIs Disponíveis

### Configurações
```
GET    /api/notificacoes/config/:usuarioId
PUT    /api/notificacoes/config/:usuarioId
```

### Logs
```
GET    /api/notificacoes/logs/:usuarioId
GET    /api/notificacoes/estatisticas/:usuarioId
```

### Chatbot
```
POST   /api/notificacoes/chat
```

### Webhook (WhatsApp)
```
GET    /api/notificacoes/webhook/whatsapp (verificação)
POST   /api/notificacoes/webhook/whatsapp (receber mensagens)
```

### Teste
```
POST   /api/notificacoes/teste
```

---

## 🎯 Exemplos de Notificações

### Nota Lançada
```
📚 Nova Nota Lançada!

👨‍🎓 Aluno: João Silva
📖 Disciplina: Matemática
📝 Avaliação: Prova Bimestral (Peso 4.0)
📊 Nota: 8.5
📈 Média atual: 7.8
✅ Aprovado parcialmente

8°B - 1º Trimestre
```

### Falta Registrada
```
⚠️ Falta Registrada

👨‍🎓 Aluno: Maria Santos
📚 Disciplina: Português
📅 Data: 10/01/2026
🕐 Horário: 08:00 - 08:50

📊 Frequência atual: 87.0%
📉 Faltas: 13 de 100 aulas
✅ Dentro do limite
```

### Alerta de Frequência Baixa
```
⚠️ ALERTA - Frequência Baixa

👨‍🎓 Aluno: Pedro Costa
📚 Frequência Geral
📊 Frequência atual: 72.5%
🎯 Mínimo obrigatório: 75%
📉 Total de faltas: 28
✅ Faltas restantes: -3

🚨 CRÍTICO: Abaixo do limite!

Justificar faltas pela plataforma ou contatar a escola.
```

---

## 🔒 Segurança e LGPD

- ✅ Cada responsável vê apenas dados dos próprios filhos
- ✅ Professores veem apenas suas turmas
- ✅ Logs completos de todas notificações
- ✅ Opt-out disponível (usuário pode desabilitar)
- ✅ Dados criptografados em trânsito (HTTPS)
- ✅ Webhook verificado (token secreto)

---

## 🆘 Troubleshooting

### "WhatsApp não está enviando"
1. Verificar se `WHATSAPP_PROVIDER` está configurado
2. Verificar se API Key é válida
3. Testar com endpoint `/teste`
4. Ver logs no console

### "IA não responde"
1. Verificar `OPENAI_API_KEY`
2. Verificar créditos na conta OpenAI
3. Ver logs de erro no console

### "Eventos não estão disparando"
1. Verificar se `notification.service` foi importado no `server.ts`
2. Ver console ao salvar nota/frequência
3. Verificar se aluno tem `telefoneResp`

---

## 📈 Roadmap Futuro

- [ ] Notificações de eventos do calendário
- [ ] Lembretes de reunião de pais
- [ ] Boletim automático por WhatsApp
- [ ] Integração com Telegram
- [ ] Dashboard de analytics de engajamento
- [ ] Respostas automáticas mais inteligentes
- [ ] Suporte a áudio/imagem nas respostas

---

## 💡 Dicas de Otimização de Custos

1. **Agrupamento**: Sistema já agrupa mensagens do mesmo dia
2. **Horário**: Configure horário de silêncio (22h-7h)
3. **Frequência**: Ofereça opção de resumo diário
4. **SMS Seletivo**: Use apenas para quem não tem WhatsApp
5. **IA Limitada**: Configure limite de tokens por requisição

---

## 📞 Suporte

Se tiver dúvidas sobre configuração:
1. Ver logs do servidor (`npm run dev`)
2. Testar endpoint `/teste`
3. Verificar documentação oficial dos provedores
4. Revisar `.env.example`

---

**Desenvolvido com ❤️ para revolucionar a comunicação escolar no Brasil**
