@echo off
title Backend - Sistema de Gestao Escolar
color 0A
cd /d "%~dp0backend"
echo ========================================
echo  BACKEND - SISTEMA DE GESTAO ESCOLAR
echo ========================================
echo.
echo Iniciando servidor backend na porta 3333...
echo.
call npm run dev
pause
