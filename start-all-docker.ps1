# =============================================
# SCRIPT: Iniciar Docker + Backend + Frontend
# =============================================

Write-Host "🚀 Iniciando Sistema de Gestão Escolar..." -ForegroundColor Cyan
Write-Host ""

# =============================================
# 1. VERIFICAR DOCKER
# =============================================
Write-Host "📦 Verificando Docker..." -ForegroundColor Yellow

try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker instalado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado!" -ForegroundColor Red
    Write-Host "   Instale o Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host "   Ou veja: DOCKER_SETUP.md" -ForegroundColor Yellow
    exit 1
}

# Verificar se Docker está rodando
try {
    docker info | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando!" -ForegroundColor Red
    Write-Host "   Abra o Docker Desktop e aguarde iniciar" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# =============================================
# 2. SUBIR CONTAINERS (Redis + PostgreSQL)
# =============================================
Write-Host "🐳 Iniciando containers Docker..." -ForegroundColor Yellow

docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Containers iniciados com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   🔴 Redis:          http://localhost:6379" -ForegroundColor Cyan
    Write-Host "   🐘 PostgreSQL:     http://localhost:5432" -ForegroundColor Cyan
    Write-Host "   🎨 Redis UI:       http://localhost:8081" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erro ao iniciar containers" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Aguardar containers ficarem healthy
Write-Host "⏳ Aguardando containers ficarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""

# =============================================
# 3. CONFIGURAR .ENV PARA DESENVOLVIMENTO
# =============================================
Write-Host "⚙️ Configurando ambiente..." -ForegroundColor Yellow

$envPath = "backend\.env"
$envDevPath = "backend\.env.development"

if (Test-Path $envDevPath) {
    Copy-Item $envDevPath $envPath -Force
    Write-Host "✅ Arquivo .env configurado para DESENVOLVIMENTO (Docker Local)" -ForegroundColor Green
} else {
    Write-Host "⚠️ Arquivo .env.development não encontrado" -ForegroundColor Yellow
    Write-Host "   Usando .env existente" -ForegroundColor Yellow
}

Write-Host ""

# =============================================
# 4. INICIAR BACKEND
# =============================================
Write-Host "🖥️ Iniciando Backend..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

Write-Host "✅ Backend iniciando na porta 3333..." -ForegroundColor Green
Write-Host "   Aguarde ~10 segundos para ficar pronto" -ForegroundColor Cyan

Write-Host ""

# =============================================
# 5. INICIAR FRONTEND
# =============================================
Write-Host "🌐 Iniciando Frontend..." -ForegroundColor Yellow

Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "✅ Frontend iniciando na porta 5173..." -ForegroundColor Green

Write-Host ""

# =============================================
# 6. RESUMO
# =============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ SISTEMA INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Acesse:" -ForegroundColor Cyan
Write-Host "   Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:     http://localhost:3333" -ForegroundColor White
Write-Host "   Redis UI:    http://localhost:8081" -ForegroundColor White
Write-Host "   Health:      http://localhost:3333/health" -ForegroundColor White
Write-Host ""
Write-Host "🐳 Docker Containers:" -ForegroundColor Cyan
Write-Host "   Status:      docker-compose ps" -ForegroundColor White
Write-Host "   Logs:        docker-compose logs -f" -ForegroundColor White
Write-Host "   Parar:       docker-compose stop" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Ambiente:" -ForegroundColor Cyan
Write-Host "   Redis:       Docker Local (🐳 localhost:6379)" -ForegroundColor White
Write-Host "   PostgreSQL:  Docker Local (🐳 localhost:5432)" -ForegroundColor White
Write-Host "   Modo:        DESENVOLVIMENTO" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentação:" -ForegroundColor Cyan
Write-Host "   DOCKER_SETUP.md - Guia completo do Docker" -ForegroundColor White
Write-Host "   README.md - Visão geral do sistema" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para fechar esta janela..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
