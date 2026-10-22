# Configuração de Variáveis de Ambiente - HULA AGRO

## 🔧 Variáveis Necessárias

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...xxxxx
ANTHROPIC_API_KEY=sk-ant-v0-xxxxx
```

---

## 📍 Onde Encontrar Cada Variável

### 1. NEXT_PUBLIC_SUPABASE_URL

**Passo a passo:**
1. Abra https://app.supabase.com
2. Faça login com sua conta
3. Selecione o projeto HULA AGRO
4. Vá para Settings (⚙️) → API
5. Copie "Project URL"
6. Exemplo: `https://abcdef123456.supabase.co`

**Salve como:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdef123456.supabase.co
```

---

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY

**Passo a passo:**
1. Mesmo lugar acima (Settings → API)
2. Procure "anon public" 
3. Copie a chave completa
4. Começa com `eyJhbGc...` (base64)
5. Exemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Salve como:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3. ANTHROPIC_API_KEY

**Passo a passo:**
1. Abra https://console.anthropic.com
2. Clique em "API Keys" (menu esquerdo)
3. Clique "Create Key"
4. Nomeie: "HULA AGRO"
5. Clique "Create"
6. Copie a chave (começa com `sk-ant-v0-`)

**Salve como:**
```
ANTHROPIC_API_KEY=sk-ant-v0-xxxxxxxxxxxxx
```

---

## 🔐 Adicionar no Vercel

### Opção 1: Dashboard Vercel (Recomendado)

1. Acesse https://vercel.com/dashboard
2. Selecione o projeto HULA AGRO
3. Vá para Settings → Environment Variables
4. Clique "Add New"
5. Preencha cada variável:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://abcdef123456.supabase.co
✅ Add
```

Repita para as outras 2 variáveis.

### Opção 2: CLI Vercel

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Cole: https://abcdef123456.supabase.co
# Enter

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Cole: eyJhbGc...xxxxx
# Enter

vercel env add ANTHROPIC_API_KEY
# Cole: sk-ant-v0-xxxxx
# Enter
```

### Opção 3: vercel.json

Edite `vercel.json`:
```json
{
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "ANTHROPIC_API_KEY": "@anthropic_api_key"
  }
}
```

Depois no dashboard, configure os secrets.

---

## 🖥️ Local Development

### Criar .env.local

Na raiz do projeto:

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://abcdef123456.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...xxxxx
ANTHROPIC_API_KEY=sk-ant-v0-xxxxxxxxxxxxx
EOF
```

### Testar

```bash
npm run dev
# Abra http://localhost:3000
# Verifique se IA e banco funcionam
```

---

## ✅ Verificar se Está Correto

### Local

```bash
# Mostrar variáveis (não mostre as chaves!)
echo "SUPABASE_URL configurado?"
grep -q NEXT_PUBLIC_SUPABASE_URL .env.local && echo "✅ Sim"

echo "ANTHROPIC_KEY configurado?"
grep -q ANTHROPIC_API_KEY .env.local && echo "✅ Sim"
```

### Vercel

1. Dashboard → Project Settings → Environment Variables
2. Procure pelas 3 variáveis
3. Devem estar lá (valores ocultos por segurança)

### Funcionamento

```bash
# Testar IA
curl -X POST http://localhost:3000/api/ai/advanced-chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Olá"}]}'

# Testar Supabase
# Acessar Dashboard → deve carregar dados
```

---

## 🚨 Troubleshooting

### "API Key inválida"

- [ ] Copiou a chave completa? (sem espaços)
- [ ] Usou a chave certa? (não role, não service)
- [ ] Expirou? Gere uma nova

### "Supabase connection timeout"

- [ ] URL correta? (começa com https://)
- [ ] Projeto ativo no Supabase?
- [ ] Internet conectada?

### "Variáveis não aparecem no Vercel"

- [ ] Reinicie deploy após adicionar
- [ ] Limpe cache: Settings → Deployments → Redeploy
- [ ] Verifique se está em "All Environments"

### "Build falha no Vercel"

- [ ] Variáveis adicionadas ANTES do deploy?
- [ ] Valores corretos (sem quotes extras)?
- [ ] Não commitou .env.local no Git?

---

## 🔒 Segurança

### Cuidado!

⚠️ **Nunca faça:**
- Commit de `.env.local` no Git
- Compartilhe chaves com outros
- Use chaves em URLs
- Coloque em issues/discussões

### Bom prática

✅ **Faça:**
- Use `.env.local` para desenvolvimento
- Use Vercel Secrets para produção
- Rotacione chaves regularmente
- Use diferentes chaves por ambiente

---

## 📝 Checklist Final

- [ ] SUPABASE_URL encontrada e copiada
- [ ] SUPABASE_ANON_KEY encontrada e copiada
- [ ] ANTHROPIC_API_KEY encontrada e copiada
- [ ] `.env.local` criado localmente (desenvolvimento)
- [ ] Variáveis adicionadas no Vercel (produção)
- [ ] Testado: `npm run dev` funciona
- [ ] Build passa sem erros: `npm run build`
- [ ] Deploy no Vercel bem-sucedido

---

## 🆘 Precisa de Ajuda?

1. Releia este arquivo com atenção
2. Verifique os valores copiados
3. Teste localmente primeiro
4. Depois faça deploy

Se ainda tiver dúvidas:
- Supabase Docs: https://supabase.com/docs
- Anthropic API: https://docs.anthropic.com
- Vercel Env Vars: https://vercel.com/docs/concepts/projects/environment-variables
