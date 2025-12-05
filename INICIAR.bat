@echo off
echo ========================================
echo  SISTEMA DE GESTAO ESCOLAR
echo  Inicializacao Completa
echo ========================================
echo.

cd /d "%~dp0"

echo [1/6] Parando processos existentes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/6] Configurando banco de dados...
cd backend
call npx prisma generate >nul 2>&1
call npx prisma db push --skip-generate --accept-data-loss >nul 2>&1
call npx prisma db seed >nul 2>&1
cd ..

echo [3/6] Iniciando Backend (porta 3333)...
start "Backend - Porta 3333" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 5 /nobreak >nul

echo [4/6] Iniciando Frontend (porta 5173)...
start "Frontend - Porta 5173" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo [5/6] Verificando servicos...
netstat -ano | findstr ":3333" >nul 2>&1
if %errorlevel%==0 (
    echo    Backend: OK
) else (
    echo    Backend: ERRO
)

netstat -ano | findstr ":5173" >nul 2>&1
if %errorlevel%==0 (
    echo    Frontend: OK
) else (
    echo    Frontend: ERRO
)

echo [6/6] Abrindo navegador...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo  SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:3333
echo.
echo  Login: admin@escola.com
echo  Senha: admin123
echo ========================================
echo.
pause
