# Security Policy

## 🔒 Política de Segurança - SGE Sistema de Gestão Escolar

**Copyright (c) 2026 - PROPRIETARY & CONFIDENTIAL**

---

## 📋 Versões Suportadas

| Versão | Suporte | Status |
|--------|---------|--------|
| 1.0.x  | ✅ Sim  | Atual |
| < 1.0  | ❌ Não  | Descontinuada |

---

## 🚨 Reportar Vulnerabilidades

### **Como Reportar**

Se você descobrir uma vulnerabilidade de segurança, **NÃO** abra uma issue pública.
Siga o processo confidencial abaixo:

1. **Email Seguro:**
   - Envie para: `security@example.com`
   - Assunto: `[SECURITY] SGE - [Descrição Breve]`

2. **Informações Necessárias:**
   ```
   - Descrição detalhada da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial (CVSS score se possível)
   - Versão afetada
   - Proof of Concept (PoC) se disponível
   - Sugestão de correção (opcional)
   ```

3. **Prazo de Resposta:**
   - Confirmação inicial: **24 horas**
   - Análise completa: **72 horas**
   - Correção: **7-14 dias** (dependendo da gravidade)

4. **Confidencialidade:**
   - Manteremos sua identidade confidencial se solicitado
   - Daremos crédito pela descoberta (se desejado)
   - Não divulgaremos a vulnerabilidade até a correção

---

## 🛡️ Medidas de Segurança Implementadas

### **1. Autenticação e Autorização**
- ✅ JWT (JSON Web Tokens) com expiração
- ✅ Bcrypt para hash de senhas (salt rounds: 10)
- ✅ Role-based access control (RBAC)
- ✅ Refresh tokens com rotação

### **2. Proteção de Dados**
- ✅ Criptografia TLS/SSL (HTTPS obrigatório em produção)
- ✅ Variáveis sensíveis em `.env` (não versionadas)
- ✅ Sanitização de inputs (SQL injection prevention)
- ✅ Validação de dados com schemas TypeScript

### **3. API Security**
- ✅ Rate limiting (100 req/min por IP)
- ✅ CORS configurado (whitelist de domínios)
- ✅ Helmet.js (headers de segurança HTTP)
- ✅ XSS protection
- ✅ CSRF tokens

### **4. Banco de Dados**
- ✅ Prisma ORM (SQL injection safe)
- ✅ Backups automáticos diários
- ✅ Logs de auditoria (quem/quando/o quê)
- ✅ Conexões criptografadas

### **5. Upload de Arquivos**
- ✅ Validação de tipos permitidos (whitelist)
- ✅ Limite de tamanho (5MB por arquivo)
- ✅ Scan de malware (ClamAV)
- ✅ Armazenamento isolado

### **6. Reconhecimento Facial**
- ✅ Processamento local (TensorFlow.js)
- ✅ Descriptors criptografados no DB
- ✅ LGPD compliance (consentimento explícito)
- ✅ Exclusão de dados sob demanda

---

## 🔐 Responsabilidades dos Desenvolvedores

### **Código Seguro**
```typescript
// ✅ BOM - Parametrizado
const user = await prisma.usuario.findUnique({
  where: { id: userId }
});

// ❌ RUIM - SQL Injection
const user = await prisma.$queryRaw`SELECT * FROM usuario WHERE id = ${userId}`;
```

### **Secrets Management**
```bash
# ✅ BOM
JWT_SECRET="${process.env.JWT_SECRET}"

# ❌ RUIM - Hardcoded
const JWT_SECRET = "minha-senha-123";
```

### **Validação de Inputs**
```typescript
// ✅ BOM
const schema = z.object({
  email: z.string().email(),
  senha: z.string().min(8)
});

// ❌ RUIM - Sem validação
const { email, senha } = req.body;
```

---

## 🚫 Práticas Proibidas

1. ❌ Commitar credenciais ou tokens no Git
2. ❌ Usar `eval()` ou `Function()` com input do usuário
3. ❌ Desabilitar CORS em produção
4. ❌ Logar senhas ou tokens (mesmo em dev)
5. ❌ Usar dependências com vulnerabilidades conhecidas
6. ❌ Expor stack traces para o usuário final
7. ❌ Armazenar senhas em plaintext

---

## 📊 Auditoria de Segurança

### **Ferramentas Utilizadas**

```bash
# NPM Audit (dependências vulneráveis)
npm audit

# Snyk (scan de vulnerabilidades)
npx snyk test

# ESLint Security Plugin
npm run lint

# GitLeaks (scan de secrets)
gitleaks detect --source . --verbose

# OWASP ZAP (scan de API)
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000
```

### **Frequência de Auditorias**
- 🔄 **Automática:** A cada push (GitHub Actions)
- 🔄 **Manual:** Semanal (sextas-feiras)
- 🔄 **Completa:** Mensal (1ª semana do mês)

---

## 🎯 Classificação de Vulnerabilidades

| Severidade | CVSS Score | Prazo de Correção | Exemplo |
|------------|------------|-------------------|---------|
| **Crítica** | 9.0 - 10.0 | 24 horas | SQL Injection, RCE |
| **Alta** | 7.0 - 8.9 | 7 dias | XSS, Auth Bypass |
| **Média** | 4.0 - 6.9 | 30 dias | CSRF, Info Disclosure |
| **Baixa** | 0.1 - 3.9 | 90 dias | Rate Limit fraco |

---

## 📜 Compliance

### **LGPD (Lei Geral de Proteção de Dados)**
- ✅ Consentimento explícito para coleta de dados
- ✅ Direito de acesso, retificação e exclusão
- ✅ Portabilidade de dados (JSON export)
- ✅ DPO (Data Protection Officer) designado
- ✅ Privacy Policy publicada

### **ISO 27001**
- 🚧 Em processo de certificação

---

## 🆘 Contatos de Emergência

**Equipe de Segurança:**
- 📧 Email: security@example.com
- 📱 Telefone: +55 (11) 99999-9999 (24/7)
- 💬 Slack: #security-team

**Escalação:**
1. Security Engineer (resposta inicial)
2. Tech Lead (análise técnica)
3. CTO (decisões críticas)
4. CEO (comunicação com clientes)

---

## 📝 Changelog de Segurança

### **v1.0.0 - 10/01/2026**
- ✅ Implementação de JWT com refresh tokens
- ✅ Rate limiting em todas as rotas
- ✅ Helmet.js configurado
- ✅ CORS whitelist
- ✅ Prisma ORM (SQL injection safe)

---

## 🏆 Hall da Fama (Pesquisadores de Segurança)

Agradecimentos especiais a:

> _Nenhum pesquisador reportou vulnerabilidades ainda._

**Recompensas:**
- Crítica: R$ 1.000 + Menção
- Alta: R$ 500 + Menção
- Média: R$ 250 + Menção
- Baixa: Menção

---

**Última atualização:** 10 de janeiro de 2026  
**Próxima revisão:** 10 de abril de 2026
