# 🚀 Guia de Deploy - HULA Agro 2.0

## Status: Pronto para Produção ✅

---

## 📋 Pré-requisitos

Antes de fazer deploy, verifique:

- [x] Projeto Next.js 16 funciona localmente
- [x] Build sem erros: `npm run build` ✅
- [x] Todas as páginas geram corretamente
- [x] Chatbot de IA está testado localmente
- [x] Supabase está conectado
- [x] Variáveis de ambiente configuradas

---

## 🔑 Passo 1: Obter Chave da API Anthropic

### 1.1 Criar/Acessar Console do Anthropic

1. Visite: **https://console.anthropic.com**
2. Faça login ou crie uma conta
3. Confirme seu email

### 1.2 Gerar API Key

1. No dashboard, clique em "API Keys"
2. Clique em "Create Key"
3. Dê um nome: "HULA Agro Production"
4. Copie a chave: `sk-ant-v0-...`
5. **Guarde em local seguro** (não compartilhe!)

### 1.3 Validar Funcionamento Local (Opcional)

```bash
# Teste local antes de deploy
echo "ANTHROPIC_API_KEY=sk-ant-v0-sua-chave-aqui" > .env.local
npm run dev
# Acesse http://localhost:3000
# Teste o chatbot (botão 💬)
```

---

## 📤 Passo 2: Adicionar Variável no Vercel

### 2.1 Acessar Vercel Dashboard

1. Vá para: **https://vercel.com**
2. Faça login
3. Clique no seu projeto HULA Agro
4. Vá para: **Settings**

### 2.2 Adicionar Variável de Ambiente

```
1. Clique em "Environment Variables"
2. Clique em "Add"
3. Preencha:
   - Name: ANTHROPIC_API_KEY
   - Value: sk-ant-v0-... (sua chave)
   - Select: Production (importante!)
4. Clique "Save"
```

**Resultado esperado:**
```
ANTHROPIC_API_KEY = sk-ant-v0-... [Production] ✅
```

### 2.3 Confirmação

Você deve ver:
```
✅ Environment Variable Added
Environment variable "ANTHROPIC_API_KEY" has been created.
```

---

## 🔄 Passo 3: Fazer Deploy

### 3.1 Conectar Repositório (Se não conectado)

1. Em Vercel, clique em "Deployments"
2. Clique em "Import Repository"
3. Selecione seu repositório GitHub
4. Clique "Import"

### 3.2 Triggerar Deploy

**Opção A: Automático (Recomendado)**
```bash
git push origin main
# Vercel automaticamente faz deploy
```

**Opção B: Manual no Vercel**
1. No Vercel, clique em "Deployments"
2. Clique em "Redeploy"
3. Selecione a branch `main`
4. Clique "Redeploy"

### 3.3 Acompanhar Deploy

1. Você verá: "Deployment in progress..."
2. Aguarde o build completar (2-3 minutos)
3. Você verá: "✅ Production" quando pronto

---

## ✅ Passo 4: Validar Deploy

### 4.1 Acessar a Aplicação

1. Clique em "Visit" no Vercel
2. Ou vá para: `https://seu-projeto.vercel.app`
3. Você deve ver o dashboard do HULA Agro

### 4.2 Testar Funcionalidades

#### Dashboard
- [ ] Sidebar carrega corretamente
- [ ] Cards de módulos aparecem
- [ ] Links funcionam

#### Produção
- [ ] Página de Produção carrega
- [ ] Dashboard de lotes aparece
- [ ] Dados são exibidos

#### Chatbot IA
- [ ] Botão 💬 aparece
- [ ] Consegue abrir o chat
- [ ] Consegue fazer uma pergunta
- [ ] IA responde com dados

### 4.3 Teste de Pergunta (CRÍTICO)

Faça uma pergunta ao chatbot:

```
"Quantas aves estão ativas?"
```

Você deve receber:

```
✅ Resposta estruturada com:
  - Observações (dados encontrados)
  - Riscos (se houver)
  - Recomendações
  - Prioridade
```

**Se receber erro:**
```
❌ Erro: "ANTHROPIC_API_KEY is not set"
   → Verificar se variável foi adicionada no Vercel
   → Verificar se é produção (não preview)

❌ Erro: "Failed to process message"
   → Verificar se ANTHROPIC_API_KEY é válida
   → Verificar console do navegador (F12)
```

---

## 🔐 Segurança

### Boas Práticas

✅ **Fazer:**
- Usar variáveis de ambiente para chaves sensíveis
- Adicionar em Vercel (não em git)
- Usar chaves diferentes para dev/produção
- Revogar chaves antigas

❌ **NÃO Fazer:**
- Commitar `ANTHROPIC_API_KEY` no git
- Adicionar em `.env` ou `.env.local` no repo
- Compartilhar a chave
- Usar a mesma chave em múltiplos projetos

### Proteger a Chave

```bash
# Nunca faça isso:
git add .env
git add .env.local

# Se acidentalmente commitou:
git rm --cached .env
git commit -m "Remove sensitive data"
```

---

## 📊 Monitoramento Pós-Deploy

### Verificar Logs

1. No Vercel, clique em "Deployments"
2. Clique na deployment atual (Production)
3. Veja a aba "Logs"
4. Procure por erros

### Problemas Comuns

#### 1. Build falha
```
❌ "Build error occurred"
   ✅ Solução: Verificar console de erros
             Executar npm run build localmente
             Validar sintaxe TypeScript
```

#### 2. Deploy bem-sucedido mas IA não funciona
```
❌ "AI service not configured"
   ✅ Solução: ANTHROPIC_API_KEY não foi adicionada
             Adicionar em Environment Variables
             Fazer redeploy
```

#### 3. Chatbot carrega mas não responde
```
❌ "Failed to process message"
   ✅ Solução: Verificar se variável está em produção
             Abrir console do navegador (F12)
             Procurar por mensagens de erro
```

---

## 🔄 Redeploy Futuro

### Se Fizer Mudanças

```bash
# 1. Fazer alterações no código
git add .
git commit -m "Descrição das mudanças"

# 2. Push para GitHub
git push origin main

# 3. Vercel automaticamente faz deploy
# Aguarde 2-3 minutos
# Vá para https://seu-projeto.vercel.app
```

### Se Apenas Mudar Variáveis

```
1. Vá para Vercel
2. Project Settings → Environment Variables
3. Atualize a variável
4. Clique em Deployments → Redeploy
5. Pronto!
```

---

## 📞 Troubleshooting

### Pergunta: Onde vejo a chave de API?
```
Resposta: Nunca após salvar! 
         Se perdeu, gere uma nova em console.anthropic.com
         Anthropic não mostra novamente
```

### Pergunta: Quantas requisições posso fazer?
```
Resposta: Depende do seu plano Anthropic
         Veja: console.anthropic.com/account/billing
         Recomendação: Monitorar uso
```

### Pergunta: E se a IA começar a dar erros?
```
Resposta:
1. Verificar status de Anthropic API
2. Verificar quota de API
3. Verificar logs no Vercel
4. Contatar suporte Anthropic
```

### Pergunta: Como atualizar a chave?
```
Resposta:
1. Gerar nova chave em console.anthropic.com
2. Ir para Vercel → Environment Variables
3. Atualizar ANTHROPIC_API_KEY
4. Fazer redeploy
5. Testar no preview
```

---

## ✨ Checklist Final

Antes de considerar completo:

- [ ] Projeto criado no Vercel
- [ ] GitHub conectado
- [ ] ANTHROPIC_API_KEY adicionada (Produção)
- [ ] Build bem-sucedido (✅ 81/81 páginas)
- [ ] Deploy em produção
- [ ] Acessível via URL
- [ ] Sidebar funciona
- [ ] Módulos abrem corretamente
- [ ] Chatbot abre (botão 💬)
- [ ] IA responde a perguntas
- [ ] Dados aparecem corretamente
- [ ] Sem erros no console (F12)

---

## 🎉 Parabéns!

Se você chegou aqui, seu **HULA Agro 2.0** está:

✅ Em produção  
✅ Com IA funcionando  
✅ Analisando dados da fazenda  
✅ Pronto para fazer diferença!

---

## 📚 Próximas Leituras

Após fazer deploy, leia:

1. **README_EXECTUVO.md** - Sumário executivo
2. **AI_AVANCADO.md** - Como usar a IA
3. **EXEMPLOS_IA.md** - Exemplos de análises
4. **PRODUCAO_AVANCADA.md** - Módulo de produção

---

## 🆘 Precisa de Ajuda?

### Documentação
- `/AI_AVANCADO.md` - Guia da IA
- `/PRODUCAO_AVANCADA.md` - Guia de Produção
- `/EXEMPLOS_IA.md` - Exemplos práticos

### Recursos Externos
- Anthropic Docs: https://docs.anthropic.com
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**Data de Criação:** 26 de Janeiro de 2026  
**Status:** ✅ PRONTO PARA DEPLOY  
**Próximo Passo:** Adicionar ANTHROPIC_API_KEY e fazer deploy!  

Boa sorte! 🚀
