# 📱 Guia Completo - Sistema de Notificações Inteligente

## 🎯 Visão Geral

Sistema pioneiro de notificações em tempo real para escolas, integrando:
- ✅ WhatsApp Business API
- ✅ Telegram Bot
- ✅ SMS (fallback)
- ✅ IA Conversacional (ChatGPT)

---

## 📊 Status da Implementação

### ✅ CONCLUÍDO - Backend

| Componente | Status | Descrição |
|------------|--------|-----------|
| 🗄️ Banco de Dados | ✅ | Tabelas criadas no PostgreSQL |
| 🔧 Modelos Prisma | ✅ | ConfiguracaoNotificacao, HistoricoNotificacao |
| 🎯 Serviços | ✅ | NotificationService, WhatsAppService, TelegramService, etc |
| 🔗 Rotas API | ✅ | `/api/notificacoes/*` |
| 🪝 Hooks de Eventos | ✅ | Notas e Frequência integrados |
| 🤖 IA Service | ✅ | OpenAI GPT-4 configurado |

### 🚧 PRÓXIMOS PASSOS

1. **Configurar APIs Externas** (15 min)
2. **Testar Notificações** (30 min)
3. **Interface Admin no Frontend** (2-3 dias)
4. **Deploy e Produção** (1 dia)

---

## 🔧 Configuração Passo a Passo

### 1️⃣ WhatsApp Business API (Meta)

#### Requisitos:
- Conta Meta Business
- Número de telefone comercial verificado
- App configurado no Meta for Developers

#### Passos:

**A) Criar App no Meta for Developers**
```
1. Acesse: https://developers.facebook.com/
2. Criar App > Negócios
3. Adicionar Produto: WhatsApp
4. Configurar número de telefone
```

**B) Obter Credenciais**
```env
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_VERIFY_TOKEN=seu_token_secreto_123
```

**C) Configurar Webhook**
```
URL: https://seu-dominio.com/api/notificacoes/webhook/whatsapp
Verificar Token: seu_token_secreto_123
Eventos: messages
```

**D) Adicionar no .env**
```env
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_ACCESS_TOKEN=seu_access_token
WHATSAPP_VERIFY_TOKEN=seu_verify_token_123
```

#### Custos:
- Primeiras 1.000 conversas/mês: **GRÁTIS**
- Após 1.000: R$ 0,08 por conversa

---

### 2️⃣ Telegram Bot (RECOMENDADO - Grátis)

#### Passos:

**A) Criar Bot com BotFather**
```
1. Abra Telegram
2. Busque @BotFather
3. Envie: /newbot
4. Escolha nome: Escola Bot
5. Escolha username: escola_notificacoes_bot
6. Copie o TOKEN
```

**B) Adicionar no .env**
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_URL=https://seu-dominio.com/api/notificacoes/webhook/telegram
```

**C) Configurar Webhook**
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://seu-dominio.com/api/notificacoes/webhook/telegram"}'
```

#### Custos:
- **GRÁTIS** ilimitado ✅

---

### 3️⃣ SMS (Twilio - Fallback)

#### Passos:

**A) Criar Conta Twilio**
```
1. Acesse: https://www.twilio.com/
2. Criar conta (crédito grátis de teste)
3. Console > Account > Keys & Credentials
```

**B) Obter Credenciais**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+5511999999999
```

**C) Adicionar no .env**

#### Custos:
- R$ 0,05 - R$ 0,15 por SMS

---

### 4️⃣ OpenAI (IA Conversacional)

#### Passos:

**A) Criar Conta OpenAI**
```
1. Acesse: https://platform.openai.com/
2. Criar conta
3. API Keys > Create new secret key
```

**B) Adicionar no .env**
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4
```

#### Custos:
- ~R$ 0,02 por interação
- ~R$ 10-50/mês (uso moderado)

---

## 🚀 Como Usar

### Ativar Sistema

1. **Configurar credenciais no .env**
2. **Ativar sistema:**
```env
NOTIFICACOES_ATIVAS=true
MODO_TESTE=false
```
3. **Reiniciar backend**

### Configurar Notificações por Usuário

#### API Endpoints:

**1. Criar/Atualizar Configuração**
```http
POST /api/notificacoes/configuracao
Authorization: Bearer <token>
Content-Type: application/json

{
  "usuarioId": 123,
  "tipo": "RESPONSAVEL", // ou "PROFESSOR" ou "GESTAO"
  "canal": "WHATSAPP", // ou "TELEGRAM" ou "SMS"
  "telefone": "+5511999999999",
  "notificarFrequencia": true,
  "notificarNotas": true,
  "notificarAlertas": true,
  "horarioInicio": "08:00",
  "horarioFim": "20:00",
  "resumoDiario": true,
  "frequenciaMensagens": "TODAS" // ou "ALERTAS" ou "RESUMO"
}
```

**2. Buscar Configuração**
```http
GET /api/notificacoes/configuracao/:usuarioId
Authorization: Bearer <token>
```

**3. Testar Notificação**
```http
POST /api/notificacoes/teste
Authorization: Bearer <token>
Content-Type: application/json

{
  "telefone": "+5511999999999",
  "canal": "WHATSAPP",
  "mensagem": "Teste do sistema de notificações"
}
```

---

## 📝 Exemplos de Mensagens

### Notificação de Falta
```
⚠️ Falta Registrada

👨‍🎓 Aluno: João Silva - 8°B
📅 Data: 10/01/2026
🕐 Horário: 08:00 - 08:50
📚 Disciplina: Matemática
👨‍🏫 Professor: Maria Santos

📊 Situação Atual:
• Frequência: 88% ✅
• Faltas: 12 de 100 aulas
• Limite mínimo: 75%
• Margem: 13 faltas restantes

💬 Responda:
1 - Justificar falta
2 - Falar com escola
3 - Ver histórico
```

### Notificação de Nota
```
📝 Nova Nota Lançada!

👨‍🎓 Aluno: Maria Santos - 9°A
📚 Disciplina: Português
📋 Avaliação: Prova Bimestral (Peso 4.0)
✅ Nota: 8.5

📊 Situação:
• Média atual: 7.8
• Status: Aprovado parcialmente ✅
• Próxima avaliação: 15/01/2026

👏 Continue assim!

💬 Dúvidas? Pergunte para mim!
```

### Alerta de Média Crítica
```
⚠️ ALERTA ACADÊMICO

👨‍🎓 Aluno: Pedro Costa - 7°B
📚 Disciplina: Matemática

📉 Situação Crítica:
• Nota atual: 4.5
• Média necessária: 6.0
• Diferença: -1.5 pontos

📋 Próxima avaliação:
• Data: 20/01/2026
• Nota mínima para passar: 7.5

💡 Recomendações:
✅ Agendar aula de reforço
✅ Estudar 30min/dia
✅ Revisar exercícios

📞 Fale com a escola: (55) 99999-9999
```

### Resumo Diário (Gestão)
```
🏫 RESUMO DO DIA - 10/01/2026

📊 INDICADORES:
✅ 15 notas lançadas
⚠️ 23 faltas registradas
📉 3 alunos em situação crítica

📈 POR TURMA:
• 8°A: 95% frequência ✅
• 8°B: 92% frequência ✅
• 9°A: 82% frequência ⚠️

⚠️ REQUER ATENÇÃO:
• João Silva (8°B): 4 faltas consecutivas
• Maria Costa (9°A): Média 4.2 em Matemática
• Prof. Carlos: Pendente lançar 5 notas

📱 Ver detalhes completos
```

### Chatbot IA
```
Pai: Qual a média do meu filho em matemática?

🤖 Bot: Olá! 👋

Consultei os dados do João Silva (8°B):

📚 Matemática - Prof. Maria Santos
📊 Média atual: 7.8

Detalhamento:
• Prova 1: 8.5 (peso 4.0)
• Trabalho: 7.0 (peso 2.0)
• Participação: 8.0 (peso 1.0)

Status: Aprovado parcialmente ✅
Próxima avaliação: 15/01/2026

Mais alguma dúvida? 😊
```

---

## 🎯 Permissões e Filtros

### GESTÃO (Diretores, Coordenadores)
```javascript
- ✅ Recebe TODAS as notificações
- ✅ Resumo diário consolidado
- ✅ Alertas de alunos em risco
- ✅ Métricas gerais
- ✅ Alertas de professores
- ✅ Acesso total via IA
```

### PROFESSORES
```javascript
- ✅ Apenas suas disciplinas
- ✅ Apenas suas turmas
- ✅ Confirmações de lançamento
- ✅ Alertas de alunos críticos
- ❌ Não vê outras disciplinas
- ✅ IA responde sobre suas turmas
```

### RESPONSÁVEIS
```javascript
- ✅ Apenas dados do próprio filho
- ✅ Todas as disciplinas do aluno
- ✅ Todas as faltas do aluno
- ✅ Todas as notas do aluno
- ❌ Não vê outros alunos
- ✅ IA responde sobre seu filho
- ✅ LGPD compliance total
```

---

## 💰 Estimativa de Custos

### Cenário: 250 alunos + 50 profissionais

```
┌─────────────────────────────────────────┐
│  OPÇÃO 1: Telegram + SMS + IA           │
├─────────────────────────────────────────┤
│  Telegram:          R$   0/mês (grátis) │
│  SMS (10%):         R$  19/mês          │
│  IA (OpenAI):       R$  28/mês          │
├─────────────────────────────────────────┤
│  TOTAL:             R$  47/mês          │
│  Por aluno:         R$  0,19/mês        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  OPÇÃO 2: WhatsApp + SMS + IA           │
├─────────────────────────────────────────┤
│  WhatsApp:          R$ 232/mês          │
│  SMS (10%):         R$  19/mês          │
│  IA (OpenAI):       R$  28/mês          │
├─────────────────────────────────────────┤
│  TOTAL:             R$ 279/mês          │
│  Por aluno:         R$  1,12/mês        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  OPÇÃO 3: Todos + Otimizações           │
├─────────────────────────────────────────┤
│  WhatsApp:          R$ 160/mês          │
│  Telegram:          R$   0/mês          │
│  SMS:               R$  19/mês          │
│  IA:                R$  28/mês          │
├─────────────────────────────────────────┤
│  TOTAL:             R$ 207/mês          │
│  Por aluno:         R$  0,83/mês        │
└─────────────────────────────────────────┘
```

---

## 🧪 Testes

### Modo de Teste

No `.env`:
```env
MODO_TESTE=true
```

Isso irá:
- ✅ Log todas as mensagens no console
- ✅ Não enviar mensagens reais
- ✅ Simular respostas de APIs
- ✅ Permitir debug completo

### Testar Notificação Manual

```bash
curl -X POST http://localhost:3333/api/notificacoes/teste \
  -H "Authorization: Bearer <seu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "+5511999999999",
    "canal": "WHATSAPP",
    "mensagem": "Teste do sistema"
  }'
```

---

## 📊 Monitoramento

### Ver Histórico de Notificações

```http
GET /api/notificacoes/historico?usuarioId=123&limit=50
Authorization: Bearer <token>
```

### Estatísticas

```http
GET /api/notificacoes/estatisticas?dataInicio=2026-01-01&dataFim=2026-01-31
Authorization: Bearer <token>
```

Retorna:
```json
{
  "totalEnviadas": 1250,
  "totalEntregues": 1180,
  "totalFalhas": 70,
  "porCanal": {
    "whatsapp": 850,
    "telegram": 300,
    "sms": 100
  },
  "taxaEntrega": 94.4
}
```

---

## 🔒 Segurança e LGPD

### Proteções Implementadas

✅ **Isolamento de Dados**
- Responsável vê apenas dados do próprio filho
- Professor vê apenas suas turmas
- Gestão vê tudo com auditoria

✅ **Criptografia**
- Tokens JWT
- HTTPS obrigatório em produção
- Dados sensíveis criptografados

✅ **Auditoria**
- Todos os envios registrados
- Histórico completo
- Rastreabilidade total

✅ **Consentimento**
- Opt-in obrigatório
- Configuração de preferências
- Descadastro fácil

---

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Verificar se porta 3333 está livre
netstat -ano | findstr :3333

# Matar processo se necessário
taskkill /PID <PID> /F

# Reinstalar dependências
cd backend
npm install
npm run dev
```

### Migração falha

```bash
# Resetar schema (CUIDADO: apaga dados)
npx prisma migrate reset

# Ou aplicar manualmente
npx prisma db execute --file prisma/migrations/manual_add_notificacoes.sql
```

### WhatsApp não envia

1. Verificar token válido
2. Número verificado na Meta
3. Webhook configurado
4. Checkar logs: `tail -f logs/notificacoes.log`

### IA não responde

1. Verificar `OPENAI_API_KEY`
2. Checkar créditos OpenAI
3. Testar modelo: `gpt-3.5-turbo` (mais barato)

---

## 📞 Suporte

### Logs

```bash
# Backend
cd backend
npm run dev

# Ver logs em tempo real
tail -f logs/notificacoes.log
```

### Contato

- 📧 Email: rodrigo-gmoreira@educar.rs.gov.br
- 📱 WhatsApp: (55) 99645-8562

---

## 🎯 Roadmap Futuro

### Fase 2 (Próximos 2 meses)
- [ ] App mobile nativo (React Native)
- [ ] Push notifications
- [ ] Chatbot por voz (Whisper API)
- [ ] Dashboard analytics avançado
- [ ] Integrações: Google Classroom, Microsoft Teams

### Fase 3 (6 meses)
- [ ] Machine Learning: Predição de evasão escolar
- [ ] Recomendações personalizadas por aluno
- [ ] Gamificação para engajamento
- [ ] Marketplace de conteúdo educacional

---

## ✅ Checklist de Deploy

### Desenvolvimento
- [x] Banco de dados configurado
- [x] Modelos Prisma criados
- [x] Serviços implementados
- [x] Rotas API funcionando
- [x] Hooks de eventos ativos
- [ ] Testes unitários
- [ ] Testes de integração

### Configuração
- [ ] WhatsApp API configurado
- [ ] Telegram Bot configurado
- [ ] SMS provider configurado
- [ ] OpenAI API configurado
- [ ] Webhooks validados
- [ ] .env produção criado

### Frontend
- [ ] Tela de configurações
- [ ] Dashboard de histórico
- [ ] Painel administrativo
- [ ] Testes E2E

### Produção
- [ ] Servidor configurado (AWS/DigitalOcean)
- [ ] Domínio HTTPS
- [ ] Backup automático
- [ ] Monitoramento (New Relic/Datadog)
- [ ] Logs centralizados
- [ ] CI/CD pipeline

---

## 📚 Documentação Adicional

- [API Reference](./API_NOTIFICACOES.md)
- [Arquitetura](./ARQUITETURA_ESCALABILIDADE.md)
- [Cálculo de Notas](./DOCUMENTACAO_CALCULO_NOTAS.md)

---

**Sistema desenvolvido com ❤️ para revolucionar a educação brasileira! 🇧🇷**
