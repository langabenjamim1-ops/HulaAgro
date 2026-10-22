-- HULA Agro Marketplace: anúncios e pedidos de compra entre clientes.
-- Aplicar depois de 001_saas_customers.sql.

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  seller_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 4 AND 140),
  description text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 5000),
  category text NOT NULL CHECK (category IN ('eggs','birds','feed','medicines','equipment','services','other')),
  listing_type text NOT NULL DEFAULT 'product' CHECK (listing_type IN ('product','service')),
  item_condition text NOT NULL DEFAULT 'new' CHECK (item_condition IN ('new','used','not_applicable')),
  quantity numeric(12,3) NOT NULL CHECK (quantity >= 0),
  unit text NOT NULL DEFAULT 'unidade' CHECK (char_length(unit) BETWEEN 1 AND 30),
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  currency char(3) NOT NULL DEFAULT 'MZN' CHECK (currency IN ('MZN','ZAR','USD')),
  location text,
  image_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','paused','sold','removed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS marketplace_active_created_idx ON public.marketplace_listings(status,created_at DESC) WHERE status='active';
CREATE INDEX IF NOT EXISTS marketplace_seller_created_idx ON public.marketplace_listings(seller_tenant_id,created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_category_idx ON public.marketplace_listings(category,status);

CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE RESTRICT,
  listing_title text NOT NULL,
  buyer_tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  buyer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  seller_tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  seller_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  quantity numeric(12,3) NOT NULL CHECK (quantity > 0),
  unit text NOT NULL,
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  total numeric(14,2) NOT NULL CHECK (total >= 0),
  currency char(3) NOT NULL,
  buyer_note text CHECK (char_length(buyer_note) <= 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','cancelled','completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS marketplace_orders_buyer_idx ON public.marketplace_orders(buyer_user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_orders_seller_idx ON public.marketplace_orders(seller_user_id,created_at DESC);

-- Nome comercial público só para vendedores com anúncios actualmente activos.
CREATE OR REPLACE VIEW public.marketplace_public_sellers AS
SELECT DISTINCT t.id AS tenant_id,t.name,(
  SELECT f.location FROM public.farms f WHERE f.tenant_id=t.id ORDER BY f.created_at LIMIT 1
) AS location
FROM public.tenants t JOIN public.marketplace_listings l ON l.seller_tenant_id=t.id
WHERE l.status='active';
GRANT SELECT ON public.marketplace_public_sellers TO authenticated;

CREATE OR REPLACE FUNCTION public.marketplace_current_tenant_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT tenant_id FROM public.profiles WHERE id=auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.marketplace_account_can_trade(p_tenant_id uuid DEFAULT public.marketplace_current_tenant_id())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.tenants WHERE id=p_tenant_id AND (status='active' OR (status='trialing' AND trial_ends_at>now())))
$$;

CREATE OR REPLACE FUNCTION public.marketplace_assign_listing_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_tenant_id uuid;
BEGIN
  SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id=auth.uid();
  IF v_tenant_id IS NULL OR NOT public.marketplace_account_can_trade(v_tenant_id) THEN
    RAISE EXCEPTION 'A conta não está activa para publicar anúncios';
  END IF;
  NEW.seller_user_id := auth.uid();
  NEW.seller_tenant_id := v_tenant_id;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS marketplace_assign_listing_owner_trigger ON public.marketplace_listings;
CREATE TRIGGER marketplace_assign_listing_owner_trigger BEFORE INSERT ON public.marketplace_listings
FOR EACH ROW EXECUTE FUNCTION public.marketplace_assign_listing_owner();

CREATE OR REPLACE FUNCTION public.marketplace_keep_listing_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.seller_user_id IS DISTINCT FROM OLD.seller_user_id OR NEW.seller_tenant_id IS DISTINCT FROM OLD.seller_tenant_id THEN
    RAISE EXCEPTION 'O vendedor do anúncio não pode ser alterado';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS marketplace_keep_listing_owner_trigger ON public.marketplace_listings;
CREATE TRIGGER marketplace_keep_listing_owner_trigger BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW EXECUTE FUNCTION public.marketplace_keep_listing_owner();

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Signed in users browse active listings" ON public.marketplace_listings;
CREATE POLICY "Signed in users browse active listings" ON public.marketplace_listings
  FOR SELECT TO authenticated USING (status='active' OR seller_user_id=auth.uid());
DROP POLICY IF EXISTS "Active customers create own listings" ON public.marketplace_listings;
CREATE POLICY "Active customers create own listings" ON public.marketplace_listings
  FOR INSERT TO authenticated WITH CHECK (
    seller_user_id=auth.uid() AND seller_tenant_id=public.marketplace_current_tenant_id()
    AND public.marketplace_account_can_trade(seller_tenant_id)
  );
DROP POLICY IF EXISTS "Sellers manage own listings" ON public.marketplace_listings;
CREATE POLICY "Sellers manage own listings" ON public.marketplace_listings
  FOR UPDATE TO authenticated USING (seller_user_id=auth.uid()) WITH CHECK (seller_user_id=auth.uid());
DROP POLICY IF EXISTS "Sellers delete own listings" ON public.marketplace_listings;
CREATE POLICY "Sellers delete own listings" ON public.marketplace_listings
  FOR DELETE TO authenticated USING (seller_user_id=auth.uid() AND status IN ('draft','paused'));

DROP POLICY IF EXISTS "Buyers and sellers view own orders" ON public.marketplace_orders;
CREATE POLICY "Buyers and sellers view own orders" ON public.marketplace_orders
  FOR SELECT TO authenticated USING (buyer_user_id=auth.uid() OR seller_user_id=auth.uid());
REVOKE INSERT, UPDATE, DELETE ON public.marketplace_orders FROM anon, authenticated;
GRANT SELECT ON public.marketplace_listings, public.marketplace_orders TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.marketplace_listings TO authenticated;

-- Pedido: valida e reserva stock atomicamente; não processa pagamento.
CREATE OR REPLACE FUNCTION public.marketplace_create_order(p_listing_id uuid,p_quantity numeric,p_note text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth AS $$
DECLARE v_listing public.marketplace_listings%ROWTYPE; v_tenant_id uuid; v_order_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Inicie sessão para fazer um pedido'; END IF;
  SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id=auth.uid();
  IF v_tenant_id IS NULL OR NOT public.marketplace_account_can_trade(v_tenant_id) THEN RAISE EXCEPTION 'A conta não está activa para comprar'; END IF;
  IF p_quantity IS NULL OR p_quantity <= 0 THEN RAISE EXCEPTION 'Indique uma quantidade válida'; END IF;
  SELECT * INTO v_listing FROM public.marketplace_listings WHERE id=p_listing_id FOR UPDATE;
  IF NOT FOUND OR v_listing.status <> 'active' THEN RAISE EXCEPTION 'Este anúncio já não está disponível'; END IF;
  IF v_listing.seller_user_id=auth.uid() THEN RAISE EXCEPTION 'Não pode comprar o seu próprio anúncio'; END IF;
  IF p_quantity > v_listing.quantity THEN RAISE EXCEPTION 'A quantidade pedida excede o stock disponível'; END IF;
  INSERT INTO public.marketplace_orders (listing_id,listing_title,buyer_tenant_id,buyer_user_id,seller_tenant_id,seller_user_id,quantity,unit,unit_price,total,currency,buyer_note)
  VALUES (v_listing.id,v_listing.title,v_tenant_id,auth.uid(),v_listing.seller_tenant_id,v_listing.seller_user_id,p_quantity,v_listing.unit,v_listing.unit_price,p_quantity*v_listing.unit_price,v_listing.currency,NULLIF(trim(p_note),''))
  RETURNING id INTO v_order_id;
  UPDATE public.marketplace_listings SET quantity=quantity-p_quantity,status=CASE WHEN quantity-p_quantity=0 THEN 'sold' ELSE status END,updated_at=now() WHERE id=v_listing.id;
  RETURN v_order_id;
END;
$$;

-- Pedido pendente: vendedor aceita/rejeita; comprador cancela. Aceites podem ser concluídos por qualquer lado.
CREATE OR REPLACE FUNCTION public.marketplace_update_order(p_order_id uuid,p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth AS $$
DECLARE v_order public.marketplace_orders%ROWTYPE; v_is_buyer boolean; v_is_seller boolean;
BEGIN
  SELECT * INTO v_order FROM public.marketplace_orders WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pedido não encontrado'; END IF;
  v_is_buyer := v_order.buyer_user_id=auth.uid();
  v_is_seller := v_order.seller_user_id=auth.uid();
  IF NOT v_is_buyer AND NOT v_is_seller THEN RAISE EXCEPTION 'Sem permissão para alterar este pedido'; END IF;
  IF v_order.status='pending' AND p_status='cancelled' AND v_is_buyer THEN
    UPDATE public.marketplace_orders SET status='cancelled',updated_at=now(),resolved_at=now() WHERE id=p_order_id;
    UPDATE public.marketplace_listings SET quantity=quantity+v_order.quantity,status=CASE WHEN status='sold' THEN 'active' ELSE status END,updated_at=now() WHERE id=v_order.listing_id;
  ELSIF v_order.status='pending' AND p_status='rejected' AND v_is_seller THEN
    UPDATE public.marketplace_orders SET status='rejected',updated_at=now(),resolved_at=now() WHERE id=p_order_id;
    UPDATE public.marketplace_listings SET quantity=quantity+v_order.quantity,status=CASE WHEN status='sold' THEN 'active' ELSE status END,updated_at=now() WHERE id=v_order.listing_id;
  ELSIF v_order.status='pending' AND p_status='accepted' AND v_is_seller THEN
    UPDATE public.marketplace_orders SET status='accepted',updated_at=now() WHERE id=p_order_id;
  ELSIF v_order.status='accepted' AND p_status='completed' AND (v_is_buyer OR v_is_seller) THEN
    UPDATE public.marketplace_orders SET status='completed',updated_at=now(),resolved_at=now() WHERE id=p_order_id;
  ELSE
    RAISE EXCEPTION 'Transição de estado não permitida';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.marketplace_create_order(uuid,numeric,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.marketplace_update_order(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.marketplace_create_order(uuid,numeric,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.marketplace_update_order(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.marketplace_current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.marketplace_account_can_trade(uuid) TO authenticated;

COMMENT ON TABLE public.marketplace_listings IS 'Anúncios de produtos e serviços publicados por clientes HULA Agro.';
COMMENT ON TABLE public.marketplace_orders IS 'Pedidos de compra com stock reservado atomicamente; não representa pagamento recebido.';
