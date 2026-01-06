# Script para liberar portas no firewall
Write-Host "Liberando portas no firewall..." -ForegroundColor Cyan

try {
    # Remove regras antigas se existirem
    Remove-NetFirewallRule -DisplayName "Gestão Escolar Backend 3333" -ErrorAction SilentlyContinue
    Remove-NetFirewallRule -DisplayName "Gestão Escolar Frontend 5173" -ErrorAction SilentlyContinue
    
    # Cria novas regras
    New-NetFirewallRule -DisplayName "Gestão Escolar Backend 3333" -Direction Inbound -LocalPort 3333 -Protocol TCP -Action Allow
    New-NetFirewallRule -DisplayName "Gestão Escolar Frontend 5173" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
    
    Write-Host "`n✅ Portas liberadas com sucesso!" -ForegroundColor Green
    Write-Host "   - Backend: 3333" -ForegroundColor Yellow
    Write-Host "   - Frontend: 5173" -ForegroundColor Yellow
} catch {
    Write-Host "`n❌ Erro ao criar regras: $_" -ForegroundColor Red
    Write-Host "`nTente executar este script como Administrador" -ForegroundColor Yellow
}

Write-Host "`nPressione qualquer tecla para fechar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
