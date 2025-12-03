# Script para reiniciar o Sistema de Gestão Escolar
Write-Host "================================================" -ForegroundColor Magenta
Write-Host "   SISTEMA DE GESTÃO ESCOLAR - REINICIANDO" -ForegroundColor Magenta
Write-Host "================================================" -ForegroundColor Magenta
Write-Host ""

$scriptPath = $PSScriptRoot

# Parar sistema
Write-Host "1. Parando sistema..." -ForegroundColor Yellow
& "$scriptPath\parar-sistema.ps1"
Start-Sleep -Seconds 3

# Iniciar sistema
Write-Host ""
Write-Host "2. Iniciando sistema..." -ForegroundColor Green
& "$scriptPath\iniciar-sistema.ps1"
