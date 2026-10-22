# Configuração da IA e dos dados do aviário

O assistente usa Gemini e consulta o aviário padrão do utilizador autenticado no HULA Agro. Não usa um UUID de aviário global partilhado entre clientes.

No `.env.local`, configure:

- `GEMINI_API_KEY`: chave da API Gemini.
- `NEXT_PUBLIC_SUPABASE_URL`: URL do projecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave pública Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: chave de serviço, usada apenas no servidor. Nunca a exponha no browser, no Git ou numa mensagem.
- `WIALON_TOKEN`: opcional; habilita o estado e os sensores Wialon.
- `WIALON_API_HOST`: opcional; por padrão usa `https://hst-api.wialon.com`.

As inscrições e a associação de aviários são criadas pela migração `supabase/migrations/001_saas_customers.sql`. Consulte `CLIENTES_SAAS_SETUP.md` para aplicar o SQL, configurar confirmação de email e iniciar a primeira conta. Depois de alterar `.env.local`, reinicie o servidor.

A IA consulta apenas dados do aviário associado à sessão autenticada. Pode ler lotes, produção, mortalidade, saúde, ambiente, sensores Wialon, custos, compras e stock de medicamentos. Não altera registos.
