# Script Simplificado de Inicialização

Write-Host "Iniciando Sistema..." -ForegroundColor Cyan

# Parar processos
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Ir para o diretório do backend
cd "$PSScriptRoot\backend"

# Iniciar backend
Write-Host "Iniciando Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

# Aguardar
Start-Sleep -Seconds 5

# Iniciar frontend
Write-Host "Iniciando Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

# Aguardar
Start-Sleep -Seconds 5

# Abrir navegador
Write-Host "Abrindo navegador..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Sistema iniciado!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3333" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login: admin@escola.com" -ForegroundColor Yellow
Write-Host "Senha: admin123" -ForegroundColor Yellow
