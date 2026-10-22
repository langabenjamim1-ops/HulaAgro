# Guia PWA - HULA AGRO

## O que é uma Progressive Web App (PWA)?

Uma PWA é um aplicativo web que funciona como um app nativo no seu celular, tablet ou computador. Pode ser instalado, funciona offline e recebe notificações push.

## Características do HULA AGRO PWA

### 1. Instalável
- **Android:** Menu ⋮ → Instalar app
- **iPhone:** Safari → Compartilhar → Adicionar na Tela Inicial
- **Windows/Mac:** Clique no ícone na barra de endereço
- **Standalone:** Funciona em tela cheia sem UI do navegador

### 2. Offline
- Dashboard funciona offline (com dados em cache)
- Páginas visitadas recentemente ficam em cache
- Aviso visual quando offline
- Sincronização quando reconectar

### 3. Notificações Push
- Alertas de mortalidade alta
- Avisos de ração baixa
- Lembretes de vacinação
- Novos relatórios disponíveis

### 4. App-like Experience
- Ícone no home screen
- Splash screen ao abrir
- Tema de cores personalizado
- Sem barra de navegação do navegador

## Como Instalar

### Android
1. Abra HULA AGRO no navegador (Chrome/Edge/Brave)
2. Clique no botão de instalação no topo
3. Confirme a instalação
4. App aparece na tela inicial

### iPhone (iOS 15+)
1. Abra HULA AGRO no Safari
2. Toque em Compartilhar (ícone de caixa com seta)
3. Selecione "Adicionar na Tela Inicial"
4. Nomeie o app (ex: HULA AGRO)
5. Toque "Adicionar"

### Windows/Mac
1. Abra HULA AGRO no Chrome/Edge
2. Clique no ícone de app na barra de endereço
3. Clique "Instalar"
4. Confirme

## Funcionalidades

### Dashboard Offline
- Visualize dados em cache quando offline
- Atualize quando reconectar
- Página offline automática se problema

### Notificações Push
1. Ative as notificações (permissão)
2. Receba alertas mesmo com app fechado
3. Clique para abrir a página relevante

### Cache Inteligente
- Arquivos estáticos: 7 dias
- Imagens: 1 dia
- API: 1 dia
- HTML: 24 horas

## Configuração para Desenvolvedor

### Variáveis de Ambiente

```bash
# .env.local

# Opcional: Desabilitar PWA (desenvolvimento)
NEXT_PUBLIC_DISABLE_PWA=false

# Opcional: VAPID para push notifications (Supabase)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua_chave_publica

# Supabase (existente)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Integração com Supabase (Push Notifications)

1. Gere par de chaves VAPID em:
   https://www.npmjs.com/package/web-push

```bash
npx web-push generate-vapid-keys
```

2. Configure em Supabase Edge Functions (opcional)

3. Use a API de notificações:

```typescript
import { useNotifications, farmAlerts } from '@/lib/pwa/use-notifications'

const { sendAlert } = useNotifications()

// Enviar alerta
await sendAlert(
  farmAlerts.highMortality(15)
)

// Ou alerta customizado
await sendAlert({
  type: 'mortality',
  severity: 'critical',
  message: 'Mortalidade acima de 10%',
  action: {
    label: 'Verificar',
    url: '/modules/health'
  }
})
```

### Componentes Disponíveis

#### InstallButton
Exibe botão de instalação automático:

```tsx
import { InstallButton } from '@/components/pwa/install-button'

// Já incluído no layout
<InstallButton />
```

#### NotificationsSetup
Painel para gerenciar notificações:

```tsx
import { NotificationsSetup } from '@/components/pwa/notifications-setup'

<NotificationsSetup />
```

### Hook useNotifications

```typescript
import { useNotifications, farmAlerts } from '@/lib/pwa/use-notifications'

export function MyComponent() {
  const { isReady, hasPermission, sendAlert, sendNotification } = useNotifications()

  const handleAlert = async () => {
    await sendAlert(farmAlerts.highMortality(12))
  }

  return (
    <button onClick={handleAlert} disabled={!hasPermission}>
      Testar Notificação
    </button>
  )
}
```

## Arquivos PWA

```
public/
├── manifest.json           # Configuração do app
├── icons/
│   ├── icon-192.png       # Ícone 192x192
│   ├── icon-512.png       # Ícone 512x512
│   ├── icon-192-maskable.png  # Ícone adaptativo 192x192
│   └── icon-512-maskable.png  # Ícone adaptativo 512x512
├── screenshots/
│   ├── screenshot-540x720.png     # Mobile
│   └── screenshot-1280x720.png    # Desktop
└── sw.js                  # Service worker

app/
├── layout.tsx             # Metadata PWA + componentes
└── offline/page.tsx       # Página offline

lib/pwa/
├── notifications.ts       # API de notificações
└── use-notifications.ts   # Hook React

components/pwa/
├── install-button.tsx     # Botão de instalação
└── notifications-setup.tsx # Painel de notificações

next.config.mjs            # Configuração next-pwa
```

## Testing

### Testar Instalação (DevTools)
1. F12 → Application
2. Manifest → Verifique JSON
3. Service Workers → Ativo?
4. Cache Storage → Dados em cache?

### Testar Offline
1. DevTools → Network
2. Marque "Offline"
3. Teste navegação

### Testar Notificações
1. Enable em NotificationsSetup
2. Clique em "Testar" (se disponível)
3. Deve aparecer notificação

## Deployment (Vercel)

1. PWA funciona automaticamente no Vercel
2. HTTPS necessário (Vercel fornece)
3. Adicione variáveis de ambiente se usar push

```bash
# Vercel CLI
vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY
```

## Troubleshooting

### App não instala
- [ ] Usando HTTPS? (necessário)
- [ ] Manifest.json válido? (DevTools → Application)
- [ ] Ícones existem? (public/icons/)
- [ ] Navegador suportado? (Chrome, Edge, Firefox)

### Notificações não funcionam
- [ ] Permissão concedida? (Configurações)
- [ ] VAPID_PUBLIC_KEY configurado?
- [ ] Service Worker ativo? (DevTools)
- [ ] Offline/online status correto?

### Cache não funciona
- [ ] SW está registered? (DevTools → SW)
- [ ] Reinicie o app após primeira instalação
- [ ] Limpe cache em DevTools se necessário

### Offline mostra erro de rede
- Isto é normal - página offline será mostrada
- Verifique que /offline rota existe
- Limpe cache se persistir

## Compatibilidade

| Navegador | Suporte | Instalável |
|-----------|---------|-----------|
| Chrome | ✅ | ✅ |
| Edge | ✅ | ✅ |
| Firefox | ⚠️ | ❌ |
| Safari (iOS) | ✅ | ✅* |
| Safari (Mac) | ✅ | ⚠️ |

*Safari: Adicionar à Tela Inicial (não oficialmente PWA)

## Performance

Cache sizes (aproximado):
- Static assets: 50-100 MB
- Images: 100-200 MB
- API data: 10-20 MB
- Total: até 300 MB

Service Worker: ~200 KB

## Segurança

- Certificado HTTPS obrigatório
- Mesma origem para recursos
- CORS configurado corretamente
- API segura (autenticação)

## Recursos Adicionais

- [MDN PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Guide](https://web.dev/progressive-web-apps/)
- [Web.dev PWA Checklist](https://web.dev/pwa-checklist/)

## Suporte

Para problemas com PWA:
1. Verifique console (F12)
2. Veja DevTools → Application
3. Consulte Troubleshooting acima
4. Entre em contato com suporte

---

Enjoy using HULA AGRO as a native app! 🚀
