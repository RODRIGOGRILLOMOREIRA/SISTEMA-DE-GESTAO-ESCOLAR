# Script para Aumentar Memória do Node.js e VS Code
# Execute como Administrador

Write-Host "=== AUMENTANDO LIMITES DE MEMÓRIA ===" -ForegroundColor Cyan
Write-Host ""

# 1. Aumentar memória do Node.js globalmente (8GB)
Write-Host "1. Configurando variável de ambiente NODE_OPTIONS..." -ForegroundColor Yellow
[System.Environment]::SetEnvironmentVariable('NODE_OPTIONS', '--max-old-space-size=8192', [System.EnvironmentVariableTarget]::User)
Write-Host "   ✓ NODE_OPTIONS definido para 8GB" -ForegroundColor Green

# 2. Aumentar memória do VS Code
Write-Host ""
Write-Host "2. Configurando argumentos do VS Code..." -ForegroundColor Yellow

$vsCodeArgs = @(
    "--max-memory=8192",
    "--disable-features=CalculateNativeWinOcclusion"
)

# Criar/Atualizar arquivo de argumentos do VS Code
$appData = $env:APPDATA
$vscodeDir = "$appData\Code\User"
$argvPath = "$vscodeDir\argv.json"

if (-not (Test-Path $vscodeDir)) {
    New-Item -ItemType Directory -Path $vscodeDir -Force | Out-Null
}

$argvContent = @"
{
  "disable-hardware-acceleration": false,
  "enable-crash-reporter": false,
  "max-memory": 8192,
  "js-flags": "--max-old-space-size=8192"
}
"@

$argvContent | Out-File -FilePath $argvPath -Encoding utf8 -Force
Write-Host "   ✓ Argumentos do VS Code configurados" -ForegroundColor Green

# 3. Limpar cache do VS Code
Write-Host ""
Write-Host "3. Limpando cache do VS Code..." -ForegroundColor Yellow
$cacheDirs = @(
    "$appData\Code\Cache",
    "$appData\Code\CachedData",
    "$appData\Code\CachedExtensions",
    "$appData\Code\CachedExtensionVSIXs",
    "$appData\Code\logs"
)

foreach ($dir in $cacheDirs) {
    if (Test-Path $dir) {
        try {
            Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "   ✓ Removido: $dir" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠ Não foi possível remover: $dir" -ForegroundColor Yellow
        }
    }
}

# 4. Limpar memória do sistema
Write-Host ""
Write-Host "4. Liberando memória do sistema..." -ForegroundColor Yellow
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()
[System.GC]::Collect()
Write-Host "   ✓ Memória do sistema liberada" -ForegroundColor Green

# 5. Criar atalho do VS Code com argumentos
Write-Host ""
Write-Host "5. Criando atalho otimizado do VS Code..." -ForegroundColor Yellow

$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = "$desktopPath\VS Code (Alta Performance).lnk"

$codePath = (Get-Command code -ErrorAction SilentlyContinue).Source
if ($codePath) {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $codePath
    $Shortcut.Arguments = "--max-memory=8192 --disable-gpu-vsync"
    $Shortcut.WorkingDirectory = $PWD.Path
    $Shortcut.Description = "VS Code com memória otimizada (8GB)"
    $Shortcut.Save()
    Write-Host "   ✓ Atalho criado na área de trabalho" -ForegroundColor Green
} else {
    Write-Host "   ⚠ VS Code não encontrado no PATH" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== CONFIGURAÇÃO CONCLUÍDA ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "1. Feche TODOS os processos do VS Code e Node.js" -ForegroundColor White
Write-Host "2. Reinicie o computador ou faça logout/login" -ForegroundColor White
Write-Host "3. Abra o VS Code novamente (use o atalho criado na área de trabalho)" -ForegroundColor White
Write-Host ""
Write-Host "Configurações aplicadas:" -ForegroundColor Yellow
Write-Host "  • Memória do Node.js: 8GB" -ForegroundColor White
Write-Host "  • Memória do VS Code: 8GB" -ForegroundColor White
Write-Host "  • TypeScript Server: 4GB" -ForegroundColor White
Write-Host "  • Cache limpo" -ForegroundColor White
Write-Host ""

# Verificar memória disponível
$computerInfo = Get-ComputerInfo
$totalRAM = [math]::Round($computerInfo.CsTotalPhysicalMemory / 1GB, 2)
$freeRAM = [math]::Round($computerInfo.CsPhyicallyInstalledMemory / 1GB, 2)

Write-Host "Memória do Sistema:" -ForegroundColor Cyan
Write-Host "  Total: ${totalRAM}GB" -ForegroundColor White
Write-Host ""
Write-Host "Pressione Enter para fechar..." -ForegroundColor Gray
Read-Host
