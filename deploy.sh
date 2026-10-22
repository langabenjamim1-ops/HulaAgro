#!/bin/bash

# HULA AGRO - Deploy Script
# Este script automatiza o deploy no Vercel

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                 HULA AGRO DEPLOY SCRIPT                  ║"
echo "║                    Versão 1.0 (Vercel)                   ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Erro: Execute este script da raiz do projeto${NC}"
  exit 1
fi

# Step 1: Verificar dependências
echo -e "${YELLOW}[1/7] Verificando dependências...${NC}"
if ! command -v vercel &> /dev/null; then
  echo "Instalando Vercel CLI..."
  npm i -g vercel
fi
echo -e "${GREEN}✅ Dependências OK${NC}"
echo ""

# Step 2: Limpar cache
echo -e "${YELLOW}[2/7] Limpando cache...${NC}"
rm -rf .next build dist
npm cache clean --force
echo -e "${GREEN}✅ Cache limpo${NC}"
echo ""

# Step 3: Instalar dependências
echo -e "${YELLOW}[3/7] Instalando dependências...${NC}"
npm install
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# Step 4: Build local
echo -e "${YELLOW}[4/7] Executando build local...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build falhou!${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Build bem-sucedido${NC}"
echo ""

# Step 5: Verificar variáveis de ambiente
echo -e "${YELLOW}[5/7] Verificando variáveis de ambiente...${NC}"
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_URL não definida${NC}"
fi
if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY não definida${NC}"
fi
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  ANTHROPIC_API_KEY não definida${NC}"
fi
echo -e "${GREEN}✅ Verificação concluída${NC}"
echo ""

# Step 6: Git commit
echo -e "${YELLOW}[6/7] Preparando Git...${NC}"
git add .
git commit -m "Deploy: HULA AGRO v1.0" || true
echo -e "${GREEN}✅ Git pronto${NC}"
echo ""

# Step 7: Deploy
echo -e "${YELLOW}[7/7] Fazendo deploy no Vercel...${NC}"
vercel --prod

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            ✅ DEPLOY CONCLUÍDO COM SUCESSO!              ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║  Seu HULA AGRO está online!                             ║${NC}"
echo -e "${GREEN}║  Próximas etapas:                                        ║${NC}"
echo -e "${GREEN}║  1. Verificar dashboard Vercel                           ║${NC}"
echo -e "${GREEN}║  2. Testar em produção                                   ║${NC}"
echo -e "${GREEN}║  3. Compartilhar URL com clientes                        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
