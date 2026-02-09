# =========================================
# CRIAR USUÁRIO ADMIN - Script PowerShell
# =========================================

Write-Host "🔐 Criando usuário admin no PostgreSQL..." -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está rodando
$dockerStatus = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker não está rodando!" -ForegroundColor Red
    Write-Host "   Execute: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Verificar se container PostgreSQL está rodando
$postgresRunning = docker ps --filter "name=sge-postgres" --format "{{.Names}}"
if (-not $postgresRunning) {
    Write-Host "❌ Container PostgreSQL não está rodando!" -ForegroundColor Red
    Write-Host "   Execute: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker e PostgreSQL estão rodando" -ForegroundColor Green
Write-Host ""

# Executar script SQL
Write-Host "📝 Executando script SQL..." -ForegroundColor Cyan
Get-Content ".\create-admin-user.sql" | docker exec -i sge-postgres psql -U sge_user -d sge_db

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ SUCESSO! Usuário admin criado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 CREDENCIAIS DE LOGIN:" -ForegroundColor Yellow
    Write-Host "   Email: admin@escola.com" -ForegroundColor White
    Write-Host "   Senha: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Troque a senha após o primeiro login!" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Erro ao criar usuário admin" -ForegroundColor Red
    Write-Host "   Verifique os logs acima para detalhes" -ForegroundColor Yellow
}
