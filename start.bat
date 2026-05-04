@echo off
REM Script de inicialização rápida para Windows - Front End + Backend

echo.
echo ========================================
echo  Sistema de Certificados Senac
echo ========================================
echo.
echo Iniciando aplicação...
echo.

REM Verifica se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js nao esta instalado!
    echo   Instale em: https://nodejs.org/
    pause
    exit /b 1
)

echo OK Node.js encontrado: 
node -v
echo.

REM Navega para o backend
cd /d "Projeto PI" || exit /b 1

REM Instala dependências se necessário
if not exist "node_modules" (
    echo Instalando dependencias do backend...
    call npm install
    echo.
)

REM Verifica arquivo .env
if not exist ".env" (
    echo ! Arquivo .env nao encontrado no backend!
    echo   Crie um arquivo .env com as variaveis necessarias
    echo.
)

echo Iniciando backend em http://localhost:3000
echo.
start cmd /k npm start

timeout /t 3 /nobreak

REM Volta para raiz
cd /d ..

REM Navega para frontend
cd /d "Front END senac" || exit /b 1

REM Verifica se http-server está instalado
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Instalando http-server...
    call npm install -g http-server
    echo.
)

echo Iniciando frontend em http://localhost:8080
echo.

http-server -p 8080

pause
