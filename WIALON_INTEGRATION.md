# HULA Agro + Wialon

A integração adiciona ao dashboard do HULA Agro:

- mapa interativo com OpenStreetMap;
- unidades/dispositivos Wialon;
- posição, velocidade, altitude e satélites;
- estado online/offline;
- sensores configurados no Wialon;
- último valor calculado dos sensores;
- atualização automática a cada 15 segundos;
- popup do dispositivo no mapa.

## 1. Configuração

Adicione às variáveis de ambiente:

```env
WIALON_TOKEN=SEU_TOKEN_WIALON
WIALON_API_HOST=https://hst-api.wialon.com
```

Não coloque o token em componentes React ou em variáveis `NEXT_PUBLIC_*`.

O token deve ter pelo menos acesso de acompanhamento online (256) e visualização de dados (512). Para apenas visualizar unidades e sensores, não é necessário dar permissões de edição ou de envio de comandos.

## 2. Instalação

Com Bun:

```bash
bun add leaflet react-leaflet
bun add -d @types/leaflet
```

Depois:

```bash
bun run build
```

## 3. Funcionamento

O frontend chama:

`GET /api/wialon/units`

A rota no servidor:

1. autentica no Wialon com `token/login`;
2. procura todas as unidades com `core/search_items`;
3. pede posição e sensores;
4. pede os últimos valores de sensores com `unit/calc_last`;
5. devolve apenas os dados necessários ao HULA Agro.

O token fica somente no servidor.

## 4. Arquitetura

```text
Wialon
  │
  │ Remote API
  ▼
Next.js /api/wialon/units
  │
  ├── unidades
  ├── posição
  ├── estado
  └── sensores/valores
  │
  ▼
HULA Agro Dashboard
  ├── mapa
  ├── lista de dispositivos
  └── sensores
```

## 5. Próxima fase para SaaS

A versão inicial usa `WIALON_TOKEN` global para uma conta Wialon.

Para vender HULA Agro para várias empresas, o próximo passo é substituir o token global por uma configuração por `tenant`, por exemplo:

- `wialon_connections`
- `tenant_id`
- `wialon_host`
- `wialon_token_encrypted`
- `enabled`
- `last_sync_at`

Cada cliente poderá então ligar a sua própria conta Wialon sem misturar unidades entre clientes.

Também é recomendável adicionar sincronização de unidades para associar:

`Wialon Unit → Fazenda → Aviário/Galpão → veículo/equipamento`

e, depois, usar sensores para alimentar os módulos de ambiente, combustível, temperatura, humidade e outros indicadores do HULA Agro.
