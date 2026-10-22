# Deploy HULA AGRO no Vercel - Guia Completo

## 🚀 Pré-requisitos

Antes de fazer deploy, você precisa de:

1. **Conta Vercel** (https://vercel.com)
2. **Repositório GitHub** com o código
3. **Variáveis de Ambiente:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`

---

## 📋 Passo 1: Preparar Repositório

### 1.1 Criar repositório GitHub

```bash
cd /vercel/share/v0-project
git init
git add .
git commit -m "Initial commit: HULA AGRO 2.0"
git branch -M main
git remote add origin https://github.com/seu-usuario/hula-agro.git
git push -u origin main
```

### 1.2 Arquivo .gitignore (verificar)

```
node_modules/
.env.local
.env.*.local
.next/
out/
build/
dist/
*.log
.DS_Store
```

---

## 🔐 Passo 2: Configurar Variáveis de Ambiente

### 2.1 Obter Chaves

**Supabase:**
1. Abra https://app.supabase.com
2. Selecione seu projeto
3. Vá para Settings → API
4. Copie `Project URL` e `Anon Key`

**Anthropic:**
1. Abra https://console.anthropic.com
2. Vá para API Keys
3. Clique "Create Key"
4. Copie a chave

### 2.2 Adicionar no Vercel

1. Acesse https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá para Settings → Environment Variables
4. Adicione as 3 variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL = [sua_url_supabase]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [sua_anon_key]
   ANTHROPIC_API_KEY = [sua_api_key]
   ```

---

## ⚙️ Passo 3: Conectar Repositório ao Vercel

### Opção A: Via Vercel Dashboard (Recomendado)

1. Abra https://vercel.com/new
2. Selecione "Import Git Repository"
3. Cole URL do GitHub: `https://github.com/seu-usuario/hula-agro`
4. Autentique com GitHub
5. Selecione o repositório
6. Clique "Import"

### Opção B: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 🔧 Passo 4: Configurar Projeto no Vercel

1. **Framework:** Next.js (auto-detectado)
2. **Build Command:** `npm run build` (padrão)
3. **Output Directory:** `.next` (padrão)
4. **Install Command:** `npm install` (padrão)

### Clique "Deploy"

Aguarde 2-5 minutos enquanto Vercel:
- Faz clone do repositório
- Instala dependências
- Executa build
- Faz deploy

---

## ✅ Passo 5: Verificar Deploy

### 5.1 Verificar Build

No dashboard Vercel:
- ✅ Build bem-sucedido (Log mostrará "Ready")
- ✅ Sem erros TypeScript
- ✅ 82 páginas compiladas

### 5.2 Testar URL

Acesse a URL do seu projeto:
```
https://seu-projeto.vercel.app
```

Você deve ver:
- Dashboard carregando
- Chatbot funcionando
- Botão PWA disponível

### 5.3 Verificar PWA

1. Abra DevTools (F12)
2. Vá para Application
3. Verifique Service Workers (deve estar "active")
4. Verifique Manifest (deve estar válido)

---

## 🌍 Passo 6: Configurar Domínio Customizado (Opcional)

### 6.1 Adicionar Domínio

1. Vá para Project Settings → Domains
2. Clique "Add Domain"
3. Digite seu domínio: `seu-dominio.com`
4. Siga as instruções de DNS

### 6.2 Configurar DNS

No seu provedor de domínio:
```
CNAME: seu-dominio.com → cname.vercel.app
```

---

## 🔒 Passo 7: Configurar Segurança

### 7.1 HTTPS (Automático)

Vercel ativa HTTPS automaticamente com Let's Encrypt

### 7.2 Headers de Segurança

Já configurados em `vercel.json`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

---

## 📊 Passo 8: Monitorar Produção

### 8.1 Analytics

Vercel mostra automaticamente:
- Tempo de build
- Deployment time
- Performance metrics
- Error rates

### 8.2 Logs

1. Vá para Deployments
2. Clique no deployment
3. Veja logs de build e runtime

---

## 🚨 Troubleshooting

### Build falhando?

```bash
# Local:
npm run build

# Se falhar, veja erros
npm run lint
```

### PWA não funciona?

1. DevTools → Application → Service Workers
2. Verifique se está "activated and running"
3. Limpe cache e recarregue

### API retornando erro?

1. Verifique variáveis de ambiente no Vercel
2. Teste local: `npm run dev`
3. Verifique logs: Deployments → Logs

---

## 📈 Passo 9: Otimizações Pós-Deploy

### 9.1 Configurar CDN

Vercel CDN automático em 300+ regiões

### 9.2 Configurar Cache

Em `vercel.json` (já configurado):
- Static files: 1 dia
- Images: 30 dias
- Fonts: 1 ano

### 9.3 Monitorar Performance

1. Vá para Analytics
2. Verifique Core Web Vitals
3. Otimize se necessário

---

## 🎉 Sucesso!

Seu HULA AGRO está online em:
```
https://seu-projeto.vercel.app
```

Compartilhe com clientes!

---

## 📞 Suporte

**Problemas?**
- Logs: Dashboard → Deployments → Logs
- Console: F12 → Console tab
- GitHub Issues: crie issue se bug

**Documentação:**
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- PWA Guide: PWA_GUIA.md (deste projeto)
