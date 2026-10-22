# 🚀 HULA AGRO 2.0 - GUIA DO CLIENTE

## Bem-vindo ao HULA AGRO 2.0!

Sistema inteligente de gestão avícola pronto para sua operação.

---

## 📋 Conteúdo

1. [Requisitos](#requisitos)
2. [Instalação Local](#instalação-local)
3. [Configuração](#configuração)
4. [Deploy](#deploy)
5. [Primeiros Passos](#primeiros-passos)
6. [Adicionar Seus Dados](#adicionar-seus-dados)
7. [Suporte](#suporte)

---

## ✅ Requisitos

- Node.js 18+ instalado
- npm ou pnpm
- Conta Vercel (gratuita)
- Conta Anthropic (gratuita com crédito)
- 30 minutos

---

## 💻 Instalação Local

### 1. Clonar o Projeto

```bash
git clone https://seu-repo-aqui
cd hula-agro-2.0
```

### 2. Instalar Dependências

```bash
npm install
# ou
pnpm install
```

### 3. Configurar Variáveis de Ambiente

Crie arquivo `.env.local`:

```env
# Supabase (fornecido)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# IA (obter em console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-v0-...

# Banco de dados (opcional, fornecido)
POSTGRES_URL=postgresql://...
```

### 4. Testar Localmente

```bash
npm run dev
# Abra http://localhost:3000
```

---

## ⚙️ Configuração

### Obter Chaves Necessárias

#### Anthropic API Key (Gratuito)

1. Vá para [console.anthropic.com](https://console.anthropic.com)
2. Crie conta (grátis)
3. Vá para: `API Keys`
4. Clique: `Create Key`
5. Copie: `sk-ant-v0-...`

#### Supabase (Fornecido por Nós)

Você receberá:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🌐 Deploy

### Opção A: Vercel (Recomendado)

1. Vá para [vercel.com](https://vercel.com)
2. Clique: `Import Project`
3. Cole a URL do GitHub
4. Clique: `Import`
5. Vá para: `Settings` → `Environment Variables`
6. Adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ANTHROPIC_API_KEY=sk-ant-v0-...
   ```
7. Clique: `Deploy`

✅ Seu app estará online em 2 minutos!

### Opção B: Seu Servidor

```bash
npm run build
npm run start
```

---

## 🎯 Primeiros Passos

### 1. Acessar o Sistema

```
https://seu-deployment.vercel.app
```

### 2. Explorar a Interface

- **Sidebar:** Navegação de módulos
- **Dashboard:** Visão geral (vazio, pronto para seus dados)
- **Chatbot:** Botão 💬 no canto inferior direito

### 3. Testar a IA

Clique no 💬 e faça uma pergunta:
```
"Olá, como funciona o sistema?"
```

---

## 📊 Adicionar Seus Dados

### Método 1: Via Interface (Recomendado)

1. Vá para módulo `Operações` → `Lotes`
2. Clique: `+ Novo Lote`
3. Preencha:
   - Data de início
   - Quantidade de aves
   - Tipo (frangos, poedeiras, etc.)
4. Clique: `Salvar`

### Método 2: Via IA

1. Clique no 💬
2. Diga: "Adicione um novo lote de 5000 frangos"
3. A IA ajudará com dados

### Método 3: Importar dados

```bash
# CSV → Banco de dados
# Contacte suporte para ajuda
```

---

## 🤖 Usando a IA

### Funcionalidades Principais

A IA pode ajudar com:

#### 1. Análise de Saúde
```
"Como está a saúde dos lotes?"
→ IA analisa dados e recomenda
```

#### 2. Planejamento de Ração
```
"Qual ração devo usar?"
→ IA recomenda baseado em dados
```

#### 3. Relatórios
```
"Gere relatório de semana passada"
→ IA cria documento pronto
```

#### 4. Alertas
```
"Há algo crítico?"
→ IA avisa problemas
```

#### 5. Análise Financeira
```
"Qual foi meu lucro?"
→ IA calcula com precisão
```

---

## 🆘 Suporte

### Documentação Completa

- `README.md` - Visão geral
- `docs/` - Guias detalhados
- Comentários no código

### Problemas Comuns

**P: Chatbot não responde?**
- Verifique ANTHROPIC_API_KEY
- Veja console do navegador (F12)

**P: Dados não salvam?**
- Verifique Supabase URL e chave
- Veja logs de erro (F12)

**P: Página em branco?**
- Execute: `npm run dev` novamente
- Limpe cache: `Ctrl+Shift+Del`

**P: Erro no build?**
- Delete: `node_modules`
- Execute: `npm install` novamente

---

## 📱 Estrutura de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `batches` | Seus lotes/granjas |
| `daily_records` | Dados diários (postura, ração, etc) |
| `health_records` | Vacinação e saúde |
| `costs` | Custos operacionais |
| `sensors` | IoT (se integrado) |

### Adicionar Registros

```sql
-- Exemplo: adicionar lote
INSERT INTO batches (initial_quantity, start_date, type)
VALUES (5000, '2026-01-26', 'broiler');
```

---

## 🔧 Customizações

### Alterar Logo

1. Substitua: `public/logo.png`
2. Reinicie: `npm run dev`

### Alterar Cores

Edite: `app/globals.css`

```css
:root {
  --primary: #283106;  /* Verde HULA */
  --secondary: #f0f2ed; /* Branco */
}
```

### Adicionar Módulos

1. Copie pasta: `app/modules/template/`
2. Customize conteúdo
3. Adicione ao sidebar

---

## 📈 Dicas de Uso

### Melhor Experiência

1. ✅ Adicione dados regularmente
2. ✅ Use a IA para decisões
3. ✅ Monitore alertas
4. ✅ Gere relatórios semanalmente
5. ✅ Acompanhe custos

### Ganhos Esperados

- 📊 20% mais precisão nos dados
- ⚡ 50% menos tempo em análises
- 💰 15% redução de custos
- 📈 Melhor tomada de decisão

---

## 🚀 Próximos Passos

### Hoje
1. [ ] Instalar localmente
2. [ ] Configurar variáveis
3. [ ] Testar chatbot

### Esta Semana
1. [ ] Deploy no Vercel
2. [ ] Adicionar primeiros dados
3. [ ] Explorar módulos

### Este Mês
1. [ ] Usar IA regularmente
2. [ ] Gerar primeiros relatórios
3. [ ] Otimizar processos

---

## 📞 Contato & Suporte

### Email
```
suporte@hula-agro.com
```

### Chat
```
Pelo próprio sistema (💬)
```

### Documentação
```
docs.hula-agro.com
```

---

## ⚖️ Termos

### Você recebe:
- ✅ Acesso completo ao código
- ✅ Direito de usar e modificar
- ✅ Suporte por 30 dias
- ✅ Atualizações gratuitas

### Você deve:
- ✅ Manter backups regularmente
- ✅ Respeitar termos de uso
- ✅ Reportar bugs

---

## 🎓 Recursos Adicionais

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Anthropic Docs](https://docs.anthropic.com)
- [Video Tutorials](https://seu-site.com/tutoriais)

---

## ✅ Checklist de Setup

- [ ] Node.js 18+ instalado
- [ ] Projeto clonado
- [ ] Dependências instaladas
- [ ] .env.local configurado
- [ ] Teste local funcionando
- [ ] Deploy no Vercel
- [ ] IA respondendo
- [ ] Dados adicionados

---

**Status:** 🟢 Pronto para Começar!

Bem-vindo ao HULA AGRO 2.0! 🚀

Data: 26 de Janeiro de 2026
Versão: 2.0
Support: 24/7
