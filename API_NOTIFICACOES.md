# 📡 API Reference - Sistema de Notificações

## Base URL
```
http://localhost:3333/api/notificacoes
```

## Autenticação
Todas as rotas requerem autenticação JWT:
```http
Authorization: Bearer <token>
```

---

## 📋 Endpoints

### 1. Configuração de Notificações

#### Criar/Atualizar Configuração
```http
POST /api/notificacoes/configuracao
```

**Request Body:**
```json
{
  "usuarioId": 123,
  "tipo": "RESPONSAVEL",
  "canal": "WHATSAPP",
  "telefone": "+5511999999999",
  "telegramChatId": null,
  "notificarFrequencia": true,
  "notificarNotas": true,
  "notificarAlertas": true,
  "horarioInicio": "08:00",
  "horarioFim": "20:00",
  "diasSemana": ["SEG", "TER", "QUA", "QUI", "SEX"],
  "resumoDiario": true,
  "frequenciaMensagens": "TODAS",
  "ativo": true
}
```

**Response (201):**
```json
{
  "success": true,
  "configuracao": {
    "id": "uuid",
    "usuarioId": 123,
    "tipo": "RESPONSAVEL",
    "canal": "WHATSAPP",
    "telefone": "+5511999999999",
    "ativo": true,
    "createdAt": "2026-01-10T19:00:00Z"
  }
}
```

---

#### Buscar Configuração
```http
GET /api/notificacoes/configuracao/:usuarioId
```

**Response (200):**
```json
{
  "success": true,
  "configuracao": {
    "id": "uuid",
    "usuarioId": 123,
    "tipo": "RESPONSAVEL",
    "canal": "WHATSAPP",
    "telefone": "+5511999999999",
    "notificarFrequencia": true,
    "notificarNotas": true,
    "notificarAlertas": true,
    "horarioInicio": "08:00",
    "horarioFim": "20:00",
    "resumoDiario": true,
    "ativo": true
  }
}
```

---

#### Deletar Configuração
```http
DELETE /api/notificacoes/configuracao/:usuarioId
```

**Response (200):**
```json
{
  "success": true,
  "message": "Configuração removida com sucesso"
}
```

---

### 2. Envio de Notificações

#### Testar Envio
```http
POST /api/notificacoes/teste
```

**Request Body:**
```json
{
  "telefone": "+5511999999999",
  "canal": "WHATSAPP",
  "mensagem": "Mensagem de teste do sistema"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notificação de teste enviada",
  "resultado": {
    "entregue": true,
    "messageId": "wamid.xxx",
    "timestamp": "2026-01-10T19:00:00Z"
  }
}
```

---

### 3. Histórico

#### Listar Histórico
```http
GET /api/notificacoes/historico?usuarioId=123&limit=50&offset=0
```

**Query Params:**
- `usuarioId` (opcional): Filtrar por usuário
- `tipo` (opcional): FREQUENCIA | NOTA | ALERTA | CHAT
- `canal` (opcional): WHATSAPP | TELEGRAM | SMS
- `status` (opcional): PENDENTE | ENVIADA | ENTREGUE | LIDA | FALHA
- `limit` (opcional): Padrão 50
- `offset` (opcional): Padrão 0

**Response (200):**
```json
{
  "success": true,
  "total": 245,
  "historico": [
    {
      "id": "uuid",
      "usuarioId": 123,
      "tipo": "FREQUENCIA",
      "canal": "WHATSAPP",
      "telefone": "+5511999999999",
      "mensagem": "⚠️ Falta registrada...",
      "status": "ENTREGUE",
      "tentativas": 1,
      "metadata": {
        "alunoId": 456,
        "disciplinaId": 10,
        "messageId": "wamid.xxx"
      },
      "enviadoEm": "2026-01-10T08:15:00Z",
      "entreguEm": "2026-01-10T08:15:02Z"
    }
  ]
}
```

---

### 4. Estatísticas

#### Obter Estatísticas
```http
GET /api/notificacoes/estatisticas?dataInicio=2026-01-01&dataFim=2026-01-31
```

**Query Params:**
- `dataInicio` (obrigatório): Data inicial (YYYY-MM-DD)
- `dataFim` (obrigatório): Data final (YYYY-MM-DD)
- `usuarioId` (opcional): Filtrar por usuário

**Response (200):**
```json
{
  "success": true,
  "periodo": {
    "inicio": "2026-01-01",
    "fim": "2026-01-31"
  },
  "estatisticas": {
    "totalEnviadas": 1250,
    "totalEntregues": 1180,
    "totalLidas": 950,
    "totalFalhas": 70,
    "taxaEntrega": 94.4,
    "taxaLeitura": 76.0,
    "porCanal": {
      "whatsapp": {
        "enviadas": 850,
        "entregues": 820,
        "lidas": 700,
        "falhas": 30
      },
      "telegram": {
        "enviadas": 300,
        "entregues": 290,
        "lidas": 200,
        "falhas": 10
      },
      "sms": {
        "enviadas": 100,
        "entregues": 70,
        "lidas": 50,
        "falhas": 30
      }
    },
    "porTipo": {
      "FREQUENCIA": 450,
      "NOTA": 600,
      "ALERTA": 150,
      "CHAT": 50
    },
    "topHorarios": [
      { "hora": "08:00", "quantidade": 180 },
      { "hora": "09:00", "quantidade": 150 },
      { "hora": "18:00", "quantidade": 120 }
    ]
  }
}
```

---

### 5. Webhooks

#### WhatsApp Webhook (Receber Mensagens)
```http
POST /api/notificacoes/webhook/whatsapp
```

**Verificação (GET):**
```http
GET /api/notificacoes/webhook/whatsapp?hub.mode=subscribe&hub.challenge=xxx&hub.verify_token=xxx
```

**Payload (POST):**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "5511999999999",
          "id": "wamid.xxx",
          "text": {
            "body": "Qual a nota do meu filho?"
          },
          "timestamp": "1704920400"
        }]
      }
    }]
  }]
}
```

---

#### Telegram Webhook
```http
POST /api/notificacoes/webhook/telegram
```

**Payload:**
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "first_name": "João",
      "username": "joao_silva"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "date": 1704920400,
    "text": "Qual a nota do meu filho?"
  }
}
```

---

### 6. Chat IA

#### Enviar Mensagem para IA
```http
POST /api/notificacoes/chat
```

**Request Body:**
```json
{
  "usuarioId": 123,
  "mensagem": "Qual a média do meu filho em matemática?",
  "contexto": {
    "alunoId": 456,
    "tipo": "RESPONSAVEL"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "resposta": "Olá! 👋\n\nConsultei os dados do João Silva (8°B):\n\n📚 Matemática - Prof. Maria Santos\n📊 Média atual: 7.8\n\nDetalhamento:\n• Prova 1: 8.5 (peso 4.0)\n• Trabalho: 7.0 (peso 2.0)\n• Participação: 8.0 (peso 1.0)\n\nStatus: Aprovado parcialmente ✅\n\nMais alguma dúvida? 😊",
  "timestamp": "2026-01-10T19:00:00Z"
}
```

---

### 7. Configurações do Sistema

#### Obter Status do Sistema
```http
GET /api/notificacoes/status
```

**Response (200):**
```json
{
  "success": true,
  "status": {
    "notificacoesAtivas": true,
    "modoTeste": false,
    "canaisDisponiveis": {
      "whatsapp": true,
      "telegram": true,
      "sms": true
    },
    "iaDisponivel": true,
    "webhooksConfigurados": {
      "whatsapp": true,
      "telegram": true
    },
    "filaAtiva": true,
    "ultimaExecucao": "2026-01-10T19:00:00Z"
  }
}
```

---

#### Ativar/Desativar Sistema
```http
PATCH /api/notificacoes/sistema
```

**Request Body:**
```json
{
  "notificacoesAtivas": true,
  "modoTeste": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sistema atualizado com sucesso",
  "status": {
    "notificacoesAtivas": true,
    "modoTeste": false
  }
}
```

---

## 🔔 Eventos Automáticos

### Eventos que Disparam Notificações

#### 1. Frequência Registrada
**Trigger:** `POST /api/registro-frequencia/salvar`

**Notificação Enviada:**
```
Tipo: FREQUENCIA
Para: Responsável do aluno
Quando: Imediatamente após registro
Condição: Falta registrada (não presença)
```

---

#### 2. Nota Lançada
**Trigger:** `POST /api/notas/salvar`

**Notificação Enviada:**
```
Tipo: NOTA
Para: Responsável do aluno
Quando: Imediatamente após lançamento
Condição: Sempre
```

---

#### 3. Alerta de Média Crítica
**Trigger:** Cálculo automático ao lançar nota

**Notificação Enviada:**
```
Tipo: ALERTA
Para: Responsável + Gestão
Quando: Média < 6.0
Condição: Primeira vez ou mudança de status
```

---

#### 4. Alerta de Frequência Crítica
**Trigger:** Cálculo automático ao registrar falta

**Notificação Enviada:**
```
Tipo: ALERTA
Para: Responsável + Gestão
Quando: Frequência < 75%
Condição: Primeira vez ou mudança de status
```

---

#### 5. Resumo Diário (Gestão)
**Trigger:** Cron job às 18:00

**Notificação Enviada:**
```
Tipo: RESUMO
Para: Equipe Gestora
Quando: Diariamente às 18h
Condição: Atividades do dia
```

---

## 🔒 Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 429 | Muitas requisições (rate limit) |
| 500 | Erro interno do servidor |

---

## 📊 Rate Limits

| Endpoint | Limite |
|----------|--------|
| POST /configuracao | 10 req/min |
| POST /teste | 5 req/min |
| POST /chat | 20 req/min |
| GET /historico | 30 req/min |
| GET /estatisticas | 10 req/min |

---

## 🧪 Exemplos de Uso

### JavaScript/Fetch
```javascript
// Configurar notificações
const configurarNotificacoes = async (token, config) => {
  const response = await fetch('http://localhost:3333/api/notificacoes/configuracao', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(config)
  });
  
  return await response.json();
};

// Usar
const config = {
  usuarioId: 123,
  tipo: 'RESPONSAVEL',
  canal: 'WHATSAPP',
  telefone: '+5511999999999',
  notificarFrequencia: true,
  notificarNotas: true
};

const resultado = await configurarNotificacoes('seu_token', config);
console.log(resultado);
```

### Python/Requests
```python
import requests

# Buscar histórico
def buscar_historico(token, usuario_id):
    url = f'http://localhost:3333/api/notificacoes/historico'
    headers = {
        'Authorization': f'Bearer {token}'
    }
    params = {
        'usuarioId': usuario_id,
        'limit': 50
    }
    
    response = requests.get(url, headers=headers, params=params)
    return response.json()

# Usar
historico = buscar_historico('seu_token', 123)
print(historico)
```

### cURL
```bash
# Testar notificação
curl -X POST http://localhost:3333/api/notificacoes/teste \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "+5511999999999",
    "canal": "WHATSAPP",
    "mensagem": "Teste"
  }'
```

---

## 📝 Notas Importantes

1. **Telefones**: Sempre usar formato internacional (+55...)
2. **Horários**: Usar formato 24h (HH:MM)
3. **Datas**: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
4. **Webhooks**: Requerem HTTPS em produção
5. **Rate Limits**: Implementados para prevenir abuso
6. **LGPD**: Dados isolados por usuário

---

## 🐛 Debugging

### Logs
```bash
# Ver logs em tempo real
tail -f backend/logs/notificacoes.log

# Filtrar por tipo
tail -f backend/logs/notificacoes.log | grep "WHATSAPP"

# Ver erros
tail -f backend/logs/notificacoes.log | grep "ERROR"
```

### Modo Teste
```env
# .env
MODO_TESTE=true
```

Isso irá logar todas as mensagens sem enviá-las.

---

**API criada com ❤️ para facilitar a comunicação escolar!**
