# Script para iniciar o Sistema de Gestão Escolar
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   SISTEMA DE GESTÃO ESCOLAR - INICIANDO" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = $PSScriptRoot

# Função para verificar se uma porta está em uso
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object {$_.State -eq "Listen"}
    return $null -ne $connection
}

# Função para matar processos em uma porta específica
function Stop-ProcessOnPort {
    param([int]$Port)
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                 Where-Object {$_.State -eq "Listen"} | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Processo na porta $Port finalizado" -ForegroundColor Yellow
        } catch {}
    }
}

# Limpar portas se estiverem em uso
Write-Host "1. Verificando portas..." -ForegroundColor White
if (Test-Port 3333) {
    Write-Host "  ⚠ Porta 3333 em uso, liberando..." -ForegroundColor Yellow
    Stop-ProcessOnPort 3333
    Start-Sleep -Seconds 2
}
if (Test-Port 5173) {
    Write-Host "  ⚠ Porta 5173 em uso, liberando..." -ForegroundColor Yellow
    Stop-ProcessOnPort 5173
    Start-Sleep -Seconds 2
}
Write-Host "  ✓ Portas verificadas" -ForegroundColor Green
Write-Host ""

# Iniciar Backend
Write-Host "2. Iniciando BACKEND..." -ForegroundColor White
$backendPath = Join-Path $projectPath "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🔧 BACKEND - Sistema de Gestão Escolar' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

Write-Host "  ⏳ Aguardando backend iniciar..." -ForegroundColor Yellow
$attempts = 0
$maxAttempts = 20
while (-not (Test-Port 3333) -and $attempts -lt $maxAttempts) {
    Start-Sleep -Seconds 1
    $attempts++
    Write-Host "  ⏳ Tentativa $attempts/$maxAttempts..." -ForegroundColor Gray
}

# Verificar se backend iniciou
if (Test-Port 3333) {
    Write-Host "  ✓ Backend rodando na porta 3333" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Backend ainda não respondeu, mas continuando..." -ForegroundColor Yellow
    Write-Host "  💡 Aguarde alguns segundos e verifique a janela do Backend" -ForegroundColor Cyan
}
Write-Host ""

# Iniciar Frontend
Write-Host ""
Write-Host "3. Iniciando FRONTEND..." -ForegroundColor White
$frontendPath = Join-Path $projectPath "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🎨 FRONTEND - Sistema de Gestão Escolar' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

Write-Host "  ⏳ Aguardando frontend iniciar..." -ForegroundColor Yellow
$attempts = 0
$maxAttempts = 20
while (-not (Test-Port 5173) -and $attempts -lt $maxAttempts) {
    Start-Sleep -Seconds 1
    $attempts++
    Write-Host "  ⏳ Tentativa $attempts/$maxAttempts..." -ForegroundColor Gray
}

# Verificar se frontend iniciou
if (Test-Port 5173) {
    Write-Host "  ✓ Frontend rodando na porta 5173" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Frontend ainda não respondeu, mas continuando..." -ForegroundColor Yellow
    Write-Host "  💡 Aguarde alguns segundos e verifique a janela do Frontend" -ForegroundColor Cyan
}
Write-Host ""

# Aguardar um pouco e abrir navegador
Start-Sleep -Seconds 2
Write-Host "4. Abrindo navegador..." -ForegroundColor White
Start-Process "http://localhost:5173/dashboard"
Write-Host "  ✓ Navegador aberto" -ForegroundColor Green
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   ✅ SISTEMA INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 URLs de Acesso:" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3333" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Dicas:" -ForegroundColor White
Write-Host "   - Mantenha as janelas do PowerShell abertas" -ForegroundColor Gray
Write-Host "   - Para parar: execute 'parar-sistema.ps1'" -ForegroundColor Gray
Write-Host "   - Para reiniciar: feche as janelas e execute novamente" -ForegroundColor Gray
Write-Host ""
Write-Host "Pressione qualquer tecla para fechar esta janela..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
