# ========================================
# EXEMPLOS DE CONFIGURAÇÃO .ENV - REDIS
# Sistema de Gestão Escolar (SGE)
# ========================================

# ==========================================
# CENÁRIO 1: UPSTASH CLOUD (Recomendado para Desenvolvimento)
# ==========================================
# ✅ Mais rápido de configurar (5 minutos)
# ✅ Não requer instalação local
# ✅ 10.000 comandos/dia grátis
# ⚠️ Requer internet

REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
UPSTASH_REDIS_URL=redis://default:AYasAAIjcDE1YmVjOGY0ZGY5ZDQ0MGYxYjI1ZGY0ZmViOGYyNzEyM3AxMA@us1-rare-mantis-12345.upstash.io:6379

# ==========================================
# CENÁRIO 2: REDIS LOCAL (Recomendado para Produção)
# ==========================================
# ✅ Melhor performance (localhost)
# ✅ Sem dependência de internet
# ⚠️ Requer instalação (Memurai ou Redis)

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
UPSTASH_REDIS_URL=

# ==========================================
# CENÁRIO 3: HÍBRIDO - LOCAL + CLOUD FALLBACK (Ideal!)
# ==========================================
# ✅ Usa Redis local quando disponível
# ✅ Fallback automático para Upstash se local falhar
# ✅ Melhor dos dois mundos

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
UPSTASH_REDIS_URL=redis://default:AYasAAIjcDE1YmVjOGY0ZGY5ZDQ0MGYxYjI1ZGY0ZmViOGYyNzEyM3AxMA@us1-rare-mantis-12345.upstash.io:6379

# ==========================================
# CENÁRIO 4: SEM REDIS (Desenvolvimento Básico)
# ==========================================
# ✅ Sistema funciona sem Redis
# ⚠️ Funcionalidades de fila limitadas
# ⚠️ Performance reduzida

REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
UPSTASH_REDIS_URL=

# ==========================================
# CENÁRIO 5: REDIS COM SENHA (Produção Segura)
# ==========================================
# ✅ Redis local com autenticação
# ✅ Máxima segurança

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=sua-senha-redis-forte-aqui
UPSTASH_REDIS_URL=

# ==========================================
# LOGS ESPERADOS POR CENÁRIO
# ==========================================

# CENÁRIO 1 (Upstash):
# ☁️ Tentando conectar ao Upstash Redis Cloud...
# ✅ ☁️ Upstash Cloud: Conectado com sucesso

# CENÁRIO 2 (Local):
# 🔄 Tentando conectar ao Redis Local...
# ✅ 📍 Redis Local: Conectado com sucesso

# CENÁRIO 3 (Híbrido - Local funcionando):
# 🔄 Tentando conectar ao Redis Local...
# ✅ 📍 Redis Local: Conectado com sucesso

# CENÁRIO 3 (Híbrido - Local indisponível, usando Upstash):
# 🔄 Tentando conectar ao Redis Local...
# ❌ Falha ao conectar ao Redis Local
# 🔄 Tentando fallback para Upstash Cloud...
# ✅ Conectado ao Upstash Cloud como fallback

# CENÁRIO 4 (Sem Redis):
# ⚠️ Redis não configurado - Sistema operará sem cache/filas
# 🚀 Sistema iniciando sem Redis...

# ==========================================
# TROUBLESHOOTING
# ==========================================

# ERRO: "Redis Local: Não disponível"
# SOLUÇÃO 1: Instalar Redis local (.\setup-redis.ps1)
# SOLUÇÃO 2: Configurar UPSTASH_REDIS_URL

# ERRO: "Upstash Cloud: Falha na conexão"
# SOLUÇÃO 1: Verificar URL no .env (redis://default:...)
# SOLUÇÃO 2: Verificar internet
# SOLUÇÃO 3: Verificar limite de requisições no Upstash Dashboard

# ERRO: "ECONNREFUSED localhost:6379"
# SOLUÇÃO 1: Iniciar serviço Redis: Start-Service Memurai
# SOLUÇÃO 2: Verificar se Redis está instalado
# SOLUÇÃO 3: Usar Upstash como alternativa

# ==========================================
# VERIFICAÇÃO RÁPIDA
# ==========================================

# Para verificar status:
# Execute: .\setup-redis.ps1
# Escolha: Opção 4 (Verificar Status)

# Para testar conexão:
# Execute: .\setup-redis.ps1
# Escolha: Opção 5 (Testar Conexão)

# ==========================================
# LINKS ÚTEIS
# ==========================================

# Upstash Dashboard: https://console.upstash.com/
# Memurai Download: https://www.memurai.com/get-memurai
# Redis Windows: https://github.com/tporadowski/redis/releases
# Documentação SGE: ./REDIS_SETUP.md
# Guia Rápido: ./REDIS_QUICKSTART.md
