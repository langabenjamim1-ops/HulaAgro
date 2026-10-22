# Inscrição e gestão de clientes HULA Agro

## O que a migração cria

`supabase/migrations/001_saas_customers.sql` adiciona contacto e estado à organização, catálogo de planos, assinaturas, facturas e auditoria. Quando uma pessoa se inscreve em `/inscrever`, o trigger Auth cria um cliente, perfil proprietário, aviário e avaliação de 14 dias. O formulário e a página de entrada ficam disponíveis na raiz (`/`) e em `/entrar`.

O preço do plano ainda não é definido. A tabela de planos permite configurá-lo; a cobrança automática exige configurar um processador de pagamentos e as respectivas credenciais/webhooks.

O token Wialon actualmente é uma configuração global da instalação e, por isolamento, o chatbot só o consulta para utilizadores `platform_admin`. A ligação Wialon independente por cliente precisa de guardar credenciais encriptadas por organização e não é activada por esta migração.

## Activar no Supabase

1. No SQL Editor do projecto Supabase, execute o ficheiro completo `supabase/migrations/001_saas_customers.sql`. A migração pressupõe que `00_hula_agro_complete_schema.sql` já foi aplicado; **não volte a executar o esquema base** num projecto que já tem os dados.
2. Em **Authentication → URL Configuration**, configure o Site URL e Redirect URLs para `http://localhost:3000` e para o domínio publicado.
3. Em **Authentication → Providers → Email**, active confirmação de email. O perfil, cliente e aviário são criados no registo Auth; a sessão fica disponível após a confirmação, conforme a configuração do projecto.
4. Abra a aplicação em `/`, escolha **Inscrever a minha exploração** e crie a primeira conta.
5. Para tornar a conta inicial administradora da plataforma, execute `supabase/migrations/003_promote_master_account.sql` no SQL Editor depois de o utilizador existir em Auth. O resultado deve devolver uma linha com `platform_admin`; zero linhas significa que a inscrição ainda não criou o perfil.

6. Entre novamente. A administração de clientes está em **Sistema → Gestão de clientes**. Só `platform_admin` pode listar clientes e alterar o estado das contas; cada alteração é guardada em `tenant_audit_log`.

Para venda e compra entre clientes, aplique também `supabase/migrations/002_marketplace.sql` e siga [`MARKETPLACE_SETUP.md`](MARKETPLACE_SETUP.md).

## Manter o aviário já existente

O registo cria um aviário novo para cada cliente. Se quiser usar o registo `Meu Aviário` criado anteriormente em vez do aviário criado no formulário, associe-o à conta proprietária no SQL Editor. Substitua o email e UUID pelos valores correctos:

```sql
UPDATE public.farms AS f
SET tenant_id = p.tenant_id
FROM public.profiles AS p
JOIN auth.users AS u ON u.id = p.id
WHERE lower(u.email) = lower('admin@exemplo.co.mz')
  AND f.id = '6a35766a-5714-47b3-8493-8dab8d671bfb';

UPDATE public.profiles AS p
SET default_farm_id = f.id
FROM auth.users AS u, public.farms AS f
WHERE p.id = u.id
  AND lower(u.email) = lower('admin@exemplo.co.mz')
  AND f.id = '6a35766a-5714-47b3-8493-8dab8d671bfb';
```

O assistente usa `profiles.default_farm_id` da sessão autenticada; não há um ID global que permita a um cliente consultar dados de outro.
