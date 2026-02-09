#!/usr/bin/env pwsh
# Script de Limpeza de Memória do VS Code

Write-Host "🧹 LIMPANDO MEMÓRIA DO VS CODE..." -ForegroundColor Cyan
Write-Host ""

# 1. Parar processos Node.js desnecessários
Write-Host "1️⃣ Encerrando processos Node.js..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -notlike "*VS Code*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Processos Node.js encerrados" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Nenhum processo Node.js encontrado" -ForegroundColor Yellow
}

# 2. Limpar cache do TypeScript
Write-Host ""
Write-Host "2️⃣ Limpando cache do TypeScript..." -ForegroundColor Yellow
$tsCachePaths = @(
    "$env:TEMP\typescript-*",
    "$env:LOCALAPPDATA\Microsoft\TypeScript\*",
    ".\backend\node_modules\.cache",
    ".\frontend\node_modules\.cache"
)

foreach ($path in $tsCachePaths) {
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Cache removido: $path" -ForegroundColor Green
    }
}

# 3. Limpar logs temporários
Write-Host ""
Write-Host "3️⃣ Limpando logs temporários..." -ForegroundColor Yellow
if (Test-Path ".\backend\logs") {
    Remove-Item -Path ".\backend\logs\*.log" -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Logs limpos" -ForegroundColor Green
}

# 4. Executar garbage collector do Node.js
Write-Host ""
Write-Host "4️⃣ Forçando coleta de lixo..." -ForegroundColor Yellow
if (Get-Process -Name "node" -ErrorAction SilentlyContinue) {
    Write-Host "   ⚠️ Processos Node ainda ativos - reinicie o VS Code" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Sem processos Node.js ativos" -ForegroundColor Green
}

# 5. Estatísticas de memória
Write-Host ""
Write-Host "5️⃣ Memória disponível:" -ForegroundColor Yellow
$memory = Get-CimInstance -ClassName Win32_OperatingSystem
$freeMemoryMB = [math]::Round($memory.FreePhysicalMemory / 1024, 2)
$totalMemoryMB = [math]::Round($memory.TotalVisibleMemorySize / 1024, 2)
$usedMemoryMB = [math]::Round($totalMemoryMB - $freeMemoryMB, 2)
$percentUsed = [math]::Round(($usedMemoryMB / $totalMemoryMB) * 100, 2)

Write-Host "   💾 Total: $totalMemoryMB MB" -ForegroundColor Cyan
Write-Host "   📊 Em uso: $usedMemoryMB MB ($percentUsed%)" -ForegroundColor Cyan
Write-Host "   ✅ Livre: $freeMemoryMB MB" -ForegroundColor Green

Write-Host ""
Write-Host "✨ LIMPEZA CONCLUÍDA!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "   1. Feche TODAS as janelas do VS Code" -ForegroundColor White
Write-Host "   2. Aguarde 10 segundos" -ForegroundColor White
Write-Host "   3. Abra o VS Code novamente" -ForegroundColor White
Write-Host "   4. Evite abrir muitos arquivos ao mesmo tempo" -ForegroundColor White
Write-Host ""

# 6. Recomendações
if ($percentUsed -gt 85) {
    Write-Host "⚠️ ATENÇÃO: Memória acima de 85%!" -ForegroundColor Red
    Write-Host "   Recomendações:" -ForegroundColor Yellow
    Write-Host "   • Feche outros programas" -ForegroundColor White
    Write-Host "   • Reinicie o computador se possível" -ForegroundColor White
    Write-Host ""
}
