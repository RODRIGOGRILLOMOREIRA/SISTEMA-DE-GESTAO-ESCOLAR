# ========================================
# Script de Instalação Redis para Windows
# Sistema de Gestão Escolar (SGE)
# ========================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  REDIS SETUP - SGE" -ForegroundColor Cyan
Write-Host "  Sistema de Gestão Escolar" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Escolha uma opção de instalação:`n" -ForegroundColor Yellow

Write-Host "1. " -NoNewline -ForegroundColor Green
Write-Host "Redis Local - Memurai (Recomendado)" -ForegroundColor White

Write-Host "2. " -NoNewline -ForegroundColor Green
Write-Host "Redis Local - Download Manual" -ForegroundColor White

Write-Host "3. " -NoNewline -ForegroundColor Green
Write-Host "Upstash Cloud - Configuração Rápida" -ForegroundColor White

Write-Host "4. " -NoNewline -ForegroundColor Green
Write-Host "Verificar Status do Redis" -ForegroundColor White

Write-Host "5. " -NoNewline -ForegroundColor Green
Write-Host "Testar Conexão Redis" -ForegroundColor White

Write-Host "6. " -NoNewline -ForegroundColor Green
Write-Host "Sair`n" -ForegroundColor White

$opcao = Read-Host "Digite o número da opção"

switch ($opcao) {
    "1" {
        Write-Host "`n📦 INSTALAÇÃO MEMURAI (REDIS PARA WINDOWS)`n" -ForegroundColor Cyan
        Write-Host "1. Abrindo página de download..." -ForegroundColor Yellow
        Start-Process "https://www.memurai.com/get-memurai"
        
        Write-Host "`n2. Instruções:" -ForegroundColor Yellow
        Write-Host "   a) Baixe 'Memurai Developer' (gratuito)" -ForegroundColor White
        Write-Host "   b) Execute o instalador" -ForegroundColor White
        Write-Host "   c) Aceite as configurações padrão" -ForegroundColor White
        Write-Host "   d) O serviço iniciará automaticamente" -ForegroundColor White
        
        Write-Host "`n3. Após instalar, execute novamente este script e escolha opção 4" -ForegroundColor Green
        Write-Host "   para verificar o status`n" -ForegroundColor Green
    }
    
    "2" {
        Write-Host "`n📦 DOWNLOAD MANUAL REDIS`n" -ForegroundColor Cyan
        Write-Host "1. Abrindo página de download..." -ForegroundColor Yellow
        Start-Process "https://github.com/tporadowski/redis/releases"
        
        Write-Host "`n2. Instruções:" -ForegroundColor Yellow
        Write-Host "   a) Baixe: Redis-x64-5.0.14.1.zip" -ForegroundColor White
        Write-Host "   b) Extraia para: C:\Redis" -ForegroundColor White
        Write-Host "   c) Abra PowerShell como Administrador" -ForegroundColor White
        Write-Host "   d) Execute os comandos abaixo:`n" -ForegroundColor White
        
        Write-Host "   cd C:\Redis" -ForegroundColor Cyan
        Write-Host "   .\redis-server.exe --service-install redis.windows.conf" -ForegroundColor Cyan
        Write-Host "   .\redis-server.exe --service-start`n" -ForegroundColor Cyan
        
        Write-Host "3. Após instalar, execute novamente este script e escolha opção 4" -ForegroundColor Green
        Write-Host "   para verificar o status`n" -ForegroundColor Green
    }
    
    "3" {
        Write-Host "`n☁️ CONFIGURAÇÃO UPSTASH CLOUD`n" -ForegroundColor Cyan
        Write-Host "1. Abrindo página de cadastro..." -ForegroundColor Yellow
        Start-Process "https://upstash.com/"
        
        Write-Host "`n2. Instruções:" -ForegroundColor Yellow
        Write-Host "   a) Clique em 'Sign Up' (use Google/GitHub/Email)" -ForegroundColor White
        Write-Host "   b) Após login, clique 'Create Database'" -ForegroundColor White
        Write-Host "   c) Configurações:" -ForegroundColor White
        Write-Host "      - Name: sge-redis" -ForegroundColor Gray
        Write-Host "      - Type: Regional" -ForegroundColor Gray
        Write-Host "      - Region: Mais próximo de você" -ForegroundColor Gray
        Write-Host "      - TLS: Enabled" -ForegroundColor Gray
        Write-Host "   d) Clique 'Create'" -ForegroundColor White
        Write-Host "   e) Copie a URL de conexão (formato Redis)" -ForegroundColor White
        
        Write-Host "`n3. Adicione no arquivo .env:" -ForegroundColor Yellow
        Write-Host "   UPSTASH_REDIS_URL=redis://default:PASSWORD@HOST:6379`n" -ForegroundColor Cyan
        
        Write-Host "4. Reinicie o backend: npm run dev`n" -ForegroundColor Green
    }
    
    "4" {
        Write-Host "`n🔍 VERIFICANDO STATUS DO REDIS...`n" -ForegroundColor Cyan
        
        # Verificar Memurai
        $memurai = Get-Service -Name "Memurai" -ErrorAction SilentlyContinue
        if ($memurai) {
            if ($memurai.Status -eq "Running") {
                Write-Host "✅ Memurai está RODANDO" -ForegroundColor Green
                Write-Host "   Porta: 6379" -ForegroundColor Gray
                Write-Host "   Host: localhost`n" -ForegroundColor Gray
            } else {
                Write-Host "⚠️ Memurai está PARADO" -ForegroundColor Yellow
                Write-Host "   Execute: Start-Service Memurai`n" -ForegroundColor Cyan
            }
        }
        
        # Verificar Redis
        $redis = Get-Service -Name "Redis" -ErrorAction SilentlyContinue
        if ($redis) {
            if ($redis.Status -eq "Running") {
                Write-Host "✅ Redis está RODANDO" -ForegroundColor Green
                Write-Host "   Porta: 6379" -ForegroundColor Gray
                Write-Host "   Host: localhost`n" -ForegroundColor Gray
            } else {
                Write-Host "⚠️ Redis está PARADO" -ForegroundColor Yellow
                Write-Host "   Execute: Start-Service Redis`n" -ForegroundColor Cyan
            }
        }
        
        if (-not $memurai -and -not $redis) {
            Write-Host "❌ Nenhum serviço Redis encontrado" -ForegroundColor Red
            Write-Host "   Execute a opção 1 ou 2 para instalar`n" -ForegroundColor Yellow
        }
        
        # Verificar .env
        $envPath = ".\backend\.env"
        if (Test-Path $envPath) {
            $envContent = Get-Content $envPath -Raw
            
            Write-Host "📄 Configuração no .env:" -ForegroundColor Cyan
            
            if ($envContent -match "REDIS_HOST=(.+)") {
                Write-Host "   REDIS_HOST: $($matches[1])" -ForegroundColor Gray
            }
            if ($envContent -match "REDIS_PORT=(.+)") {
                Write-Host "   REDIS_PORT: $($matches[1])" -ForegroundColor Gray
            }
            if ($envContent -match "UPSTASH_REDIS_URL=(.+)") {
                $url = $matches[1].Trim()
                if ($url -and $url -ne "") {
                    Write-Host "   UPSTASH_REDIS_URL: Configurado ✅" -ForegroundColor Gray
                } else {
                    Write-Host "   UPSTASH_REDIS_URL: Não configurado" -ForegroundColor Gray
                }
            }
        }
        
        Write-Host ""
    }
    
    "5" {
        Write-Host "`n🧪 TESTANDO CONEXÃO REDIS...`n" -ForegroundColor Cyan
        
        # Verificar se porta 6379 está aberta
        $test = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue
        
        if ($test.TcpTestSucceeded) {
            Write-Host "✅ Porta 6379 está ABERTA" -ForegroundColor Green
            Write-Host "   Redis está aceitando conexões`n" -ForegroundColor Gray
            
            Write-Host "💡 Para testar completamente:" -ForegroundColor Yellow
            Write-Host "   1. Inicie o backend: cd backend && npm run dev" -ForegroundColor White
            Write-Host "   2. Procure nos logs:" -ForegroundColor White
            Write-Host "      '✅ Redis Local: Conectado com sucesso'`n" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Porta 6379 está FECHADA" -ForegroundColor Red
            Write-Host "   Redis não está rodando ou não foi instalado`n" -ForegroundColor Yellow
            
            Write-Host "💡 Soluções:" -ForegroundColor Yellow
            Write-Host "   1. Instalar Redis (opção 1 ou 2)" -ForegroundColor White
            Write-Host "   2. Iniciar serviço: Start-Service Memurai" -ForegroundColor White
            Write-Host "   3. Ou usar Upstash Cloud (opção 3)`n" -ForegroundColor White
        }
    }
    
    "6" {
        Write-Host "`n👋 Até logo!`n" -ForegroundColor Green
        exit
    }
    
    default {
        Write-Host "`n❌ Opção inválida!`n" -ForegroundColor Red
    }
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
Write-Host "📖 Para mais detalhes, veja: REDIS_SETUP.md`n" -ForegroundColor Gray

Read-Host "Pressione Enter para sair"
