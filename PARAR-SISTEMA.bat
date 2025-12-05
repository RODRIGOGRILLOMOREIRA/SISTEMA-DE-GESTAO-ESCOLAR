@echo off
title Parar Sistema
color 0C
echo ========================================
echo  PARANDO SISTEMA DE GESTAO ESCOLAR
echo ========================================
echo.
echo Parando todos os processos Node...
taskkill /F /IM node.exe
echo.
echo Sistema parado!
echo.
pause
