# Script para parar o Sistema de Gestão Escolar
Write-Host "================================================" -ForegroundColor Red
Write-Host "   SISTEMA DE GESTÃO ESCOLAR - PARANDO" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Red
Write-Host ""

# Função para matar processos em uma porta específica
function Stop-ProcessOnPort {
    param([int]$Port, [string]$Name)
    Write-Host "Parando $Name (porta $Port)..." -ForegroundColor Yellow
    
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                 Where-Object {$_.State -eq "Listen"} | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($processes) {
        foreach ($pid in $processes) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "  ✓ Processo $pid finalizado" -ForegroundColor Green
            } catch {
                Write-Host "  ✗ Erro ao finalizar processo $pid" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  ℹ Nenhum processo encontrado na porta $Port" -ForegroundColor Gray
    }
}

# Parar Backend (porta 3333)
Stop-ProcessOnPort -Port 3333 -Name "Backend"
Start-Sleep -Seconds 1

# Parar Frontend (porta 5173)
Stop-ProcessOnPort -Port 5173 -Name "Frontend"
Start-Sleep -Seconds 1

# Matar todos os processos node restantes (segurança)
Write-Host ""
Write-Host "Finalizando processos Node.js restantes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Processos Node.js finalizados" -ForegroundColor Green
} else {
    Write-Host "  ℹ Nenhum processo Node.js encontrado" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   ✅ SISTEMA PARADO COM SUCESSO!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
