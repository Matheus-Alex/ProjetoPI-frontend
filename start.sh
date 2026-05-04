#!/bin/bash
# Script de inicialização rápida - Front End + Backend

echo "🚀 Iniciando Sistema de Certificados Senac..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  1️⃣  INICIANDO BACKEND${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Verifica se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Instale em: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node -v)"
echo ""

# Navega para o backend e inicia
cd "Projeto PI" || exit 1

# Instala dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    npm install
    echo ""
fi

# Verifica arquivo .env
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado no backend!"
    echo "   Crie um arquivo .env com as variáveis necessárias:"
    echo ""
    echo "   POSTGRES_URL=postgresql://user:password@localhost:5432/certificados"
    echo "   JWT_SECRET=sua-chave-secreta-aqui"
    echo "   PORT=3000"
    echo ""
fi

echo -e "${GREEN}▶  Iniciando backend em http://localhost:3000${NC}"
npm start &
BACKEND_PID=$!

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  2️⃣  INICIANDO FRONTEND${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Volta para raiz
cd ..

# Verifica se http-server está instalado
if ! command -v http-server &> /dev/null; then
    echo "📦 Instalando http-server..."
    npm install -g http-server
    echo ""
fi

# Navega para frontend
cd "Front END senac" || exit 1

echo -e "${GREEN}▶  Iniciando frontend em http://localhost:8080${NC}"
echo ""

# Inicia servidor HTTP
http-server -p 8080 -o /Login/login.html

# Cleanup ao sair
trap "kill $BACKEND_PID 2>/dev/null" EXIT

echo ""
echo "🛑 Encerrando aplicação..."
