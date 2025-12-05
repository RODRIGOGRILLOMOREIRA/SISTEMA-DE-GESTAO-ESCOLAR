@echo off
title Iniciar Sistema Completo
color 0E
cls

echo ========================================
echo  SISTEMA DE GESTAO ESCOLAR
echo ========================================
echo.
echo Iniciando o sistema...
echo.

REM Matar processos Node existentes
echo [1/5] Parando processos anteriores...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Iniciar Backend em nova janela
echo [2/5] Iniciando Backend (porta 3333)...
start "Backend - Porta 3333" cmd /k "cd /d "%~dp0backend" && color 0A && npm run dev"
timeout /t 3 /nobreak >nul

REM Iniciar Frontend em nova janela
echo [3/5] Iniciando Frontend (porta 5173)...
start "Frontend - Porta 5173" cmd /k "cd /d "%~dp0frontend" && color 0B && npm run dev"
timeout /t 3 /nobreak >nul

REM Aguardar servidores iniciarem
echo [4/5] Aguardando servidores iniciarem...
timeout /t 5 /nobreak >nul

REM Abrir navegador
echo [5/5] Abrindo navegador...
start http://localhost:5173

echo.
echo ========================================
echo  SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3333
echo.
echo Credenciais de Login:
echo Email: admin@escola.com
echo Senha: admin123
echo.
echo ========================================
echo.
echo Duas janelas foram abertas:
echo  1. Backend (porta 3333) - Verde
echo  2. Frontend (porta 5173) - Azul
echo.
echo Para parar o sistema, feche essas janelas.
echo.
pause
