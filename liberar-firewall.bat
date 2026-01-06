@echo off
echo ============================================
echo  LIBERANDO PORTAS NO FIREWALL
echo ============================================
echo.

echo Adicionando regra para Backend (porta 3333)...
netsh advfirewall firewall add rule name="Gestao Escolar Backend" dir=in action=allow protocol=TCP localport=3333

echo.
echo Adicionando regra para Frontend (porta 5173)...
netsh advfirewall firewall add rule name="Gestao Escolar Frontend" dir=in action=allow protocol=TCP localport=5173

echo.
echo ============================================
echo  CONCLUIDO!
echo ============================================
echo.
echo Portas liberadas:
echo  - Backend: 3333
echo  - Frontend: 5173
echo.
echo Agora tente acessar do celular:
echo  http://192.168.5.19:5173
echo.
pause
