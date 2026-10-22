# Marketplace HULA Agro

O marketplace permite aos clientes autenticados anunciar ovos, aves, ração, medicamentos, equipamentos, serviços e outros artigos. O vendedor gere os seus anúncios; o comprador envia um pedido; o vendedor pode aceitar/recusar, e o comprador pode cancelar enquanto o pedido está pendente. Um pedido aceite pode ser marcado como concluído por qualquer uma das partes.

Ao enviar um pedido, o sistema reserva a quantidade de forma atómica para evitar vender o mesmo stock duas vezes. Se o comprador cancelar ou o vendedor recusar, a quantidade volta ao anúncio. Cada cliente só pode alterar os seus próprios anúncios e os pedidos em que participa.

## Activar

No SQL Editor do projecto Supabase, aplique por esta ordem, uma vez cada:

1. `supabase/migrations/00_hula_agro_complete_schema.sql` — apenas se o esquema base ainda não existir.
2. `supabase/migrations/001_saas_customers.sql` — clientes, perfis e assinaturas.
3. `supabase/migrations/002_marketplace.sql` — anúncios, stock e pedidos.

Se já aplicou o esquema base e `001_saas_customers.sql`, aplique apenas `002_marketplace.sql`. O marketplace aparece no menu **Marketplace → Comprar e vender**. É necessário iniciar sessão e ter uma conta em avaliação ou activa.

O pedido no sistema não cobra dinheiro nem confirma entrega. Comprador e vendedor combinam pagamento e logística directamente. A integração de pagamentos não está ligada.
