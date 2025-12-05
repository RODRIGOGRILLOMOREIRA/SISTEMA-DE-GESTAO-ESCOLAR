@echo off
title Frontend - Sistema de Gestao Escolar
color 0B
cd /d "%~dp0frontend"
echo ========================================
echo  FRONTEND - SISTEMA DE GESTAO ESCOLAR
echo ========================================
echo.
echo Iniciando servidor frontend na porta 5173...
echo.
call npm run dev
pause
