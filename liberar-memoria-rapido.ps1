# Script Rápido para Liberar Memória
# Execute antes de abrir o VS Code

Write-Host "=== LIBERANDO MEMÓRIA RAPIDAMENTE ===" -ForegroundColor Cyan
Write-Host ""

# Fechar processos do VS Code e Node
Write-Host "Fechando processos..." -ForegroundColor Yellow

$processes = @("Code", "node", "tsserver", "typescript", "eslint")
$closed = 0

foreach ($proc in $processes) {
    $running = Get-Process -Name $proc -ErrorAction SilentlyContinue
    if ($running) {
        Stop-Process -Name $proc -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ $proc fechado" -ForegroundColor Green
        $closed++
        Start-Sleep -Milliseconds 500
    }
}

if ($closed -eq 0) {
    Write-Host "  • Nenhum processo ativo encontrado" -ForegroundColor Gray
}

# Limpar memória
Write-Host ""
Write-Host "Liberando memória..." -ForegroundColor Yellow
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()
[System.GC]::Collect()
Write-Host "  ✓ Memória liberada" -ForegroundColor Green

# Mostrar memória disponível
Write-Host ""
Write-Host "=== STATUS DA MEMÓRIA ===" -ForegroundColor Cyan

try {
    $os = Get-CimInstance -ClassName Win32_OperatingSystem
    $totalRAM = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
    $freeRAM = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
    $usedRAM = [math]::Round($totalRAM - $freeRAM, 2)
    $percentUsed = [math]::Round(($usedRAM / $totalRAM) * 100, 1)
    
    Write-Host "Total: ${totalRAM}GB" -ForegroundColor White
    Write-Host "Usado: ${usedRAM}GB (${percentUsed}%)" -ForegroundColor $(if($percentUsed -gt 80) {"Red"} elseif($percentUsed -gt 60) {"Yellow"} else {"Green"})
    Write-Host "Livre: ${freeRAM}GB" -ForegroundColor Green
} catch {
    Write-Host "Não foi possível obter informações de memória" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pronto! Você pode abrir o VS Code agora." -ForegroundColor Green
Write-Host ""
