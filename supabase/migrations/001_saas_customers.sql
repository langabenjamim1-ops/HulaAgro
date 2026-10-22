-- HULA Agro SaaS: inscrição de clientes, organizações, planos e assinaturas.
-- Aplicar DEPOIS de 00_hula_agro_complete_schema.sql. Seguro para reaplicar.

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'trialing',
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS default_farm_id uuid REFERENCES public.farms(id) ON DELETE SET NULL;

ALTER TABLE public.farms
  ADD COLUMN IF NOT EXISTS email text;

DO $$ BEGIN
  ALTER TABLE public.tenants ADD CONSTRAINT tenants_status_check
    CHECK (status IN ('trialing','active','past_due','suspended','cancelled'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price numeric(12,2),
  currency char(3) NOT NULL DEFAULT 'MZN',
  billing_interval text NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month','year','none')),
  trial_days integer NOT NULL DEFAULT 14 CHECK (trial_days BETWEEN 0 AND 365),
  farm_limit integer NOT NULL DEFAULT 1 CHECK (farm_limit > 0),
  user_limit integer NOT NULL DEFAULT 3 CHECK (user_limit > 0),
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.subscription_plans (code,name,description,price,currency,billing_interval,trial_days,farm_limit,user_limit,features)
VALUES ('trial','Avaliação','Acesso de avaliação ao HULA Agro',0,'MZN','none',14,1,3,'{"ai":true,"wialon":true}'::jsonb)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing','active','past_due','paused','cancelled','expired')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  trial_ends_at timestamptz,
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz,
  cancelled_at timestamptz,
  payment_provider text,
  provider_customer_id text,
  provider_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_current_per_tenant
  ON public.subscriptions(tenant_id) WHERE status IN ('trialing','active','past_due','paused');
CREATE INDEX IF NOT EXISTS subscriptions_tenant_history_idx ON public.subscriptions(tenant_id,created_at DESC);
CREATE INDEX IF NOT EXISTS tenants_status_created_idx ON public.tenants(status,created_at DESC);

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  invoice_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','open','paid','void','uncollectible')),
  currency char(3) NOT NULL DEFAULT 'MZN',
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  issued_at timestamptz,
  due_at timestamptz,
  paid_at timestamptz,
  provider_invoice_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS invoices_tenant_created_idx ON public.invoices(tenant_id,created_at DESC);

-- Atualizações de estado de cliente efectuadas por equipa autorizada ficam auditadas.
CREATE TABLE IF NOT EXISTS public.tenant_audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  old_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  new_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active plans" ON public.subscription_plans;
CREATE POLICY "Public can view active plans" ON public.subscription_plans
  FOR SELECT TO anon, authenticated USING (is_active AND is_public);

DROP POLICY IF EXISTS "Tenant members view subscriptions" ON public.subscriptions;
CREATE POLICY "Tenant members view subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Tenant members view invoices" ON public.invoices;
CREATE POLICY "Tenant members view invoices" ON public.invoices
  FOR SELECT TO authenticated USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Platform admins view audit log" ON public.tenant_audit_log;
CREATE POLICY "Platform admins view audit log" ON public.tenant_audit_log
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'platform_admin'));

-- Um utilizador não pode promover-se, trocar de tenant nem mudar o aviário por UPDATE próprio.
CREATE OR REPLACE FUNCTION public.protect_profile_membership()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() = OLD.id AND (NEW.tenant_id IS DISTINCT FROM OLD.tenant_id OR NEW.role IS DISTINCT FROM OLD.role OR NEW.default_farm_id IS DISTINCT FROM OLD.default_farm_id) THEN
    RAISE EXCEPTION 'tenant, role e exploração padrão só podem ser alterados por administração autorizada';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS protect_profile_membership_trigger ON public.profiles;
CREATE TRIGGER protect_profile_membership_trigger BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_membership();

-- Inscrição Auth cria a organização, o perfil proprietário, um aviário e um período de avaliação.
CREATE OR REPLACE FUNCTION public.handle_new_customer_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_tenant_id uuid;
  v_farm_id uuid;
  v_plan public.subscription_plans%ROWTYPE;
  v_org_name text;
  v_farm_name text;
  v_trial_end timestamptz;
BEGIN
  v_org_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'organization_name'),''), NULLIF(trim(NEW.raw_user_meta_data->>'full_name'),''), split_part(NEW.email,'@',1));
  v_farm_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'farm_name'),''), v_org_name);
  SELECT * INTO v_plan FROM public.subscription_plans WHERE code='trial' AND is_active LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Plano de avaliação não configurado'; END IF;
  v_trial_end := now() + make_interval(days => v_plan.trial_days);

  INSERT INTO public.tenants (name,email,phone,plan,farms_limit,status,owner_user_id,trial_started_at,trial_ends_at)
  VALUES (v_org_name,NEW.email,NEW.raw_user_meta_data->>'phone',v_plan.code,v_plan.farm_limit,'trialing',NEW.id,now(),v_trial_end)
  RETURNING id INTO v_tenant_id;

  INSERT INTO public.profiles (id,tenant_id,full_name,phone,role)
  VALUES (NEW.id,v_tenant_id,NULLIF(trim(NEW.raw_user_meta_data->>'full_name'),''),NEW.raw_user_meta_data->>'phone','owner');

  INSERT INTO public.farms (tenant_id,farm_name,location,email)
  VALUES (v_tenant_id,v_farm_name,NULLIF(trim(NEW.raw_user_meta_data->>'farm_location'),''),NEW.email)
  RETURNING id INTO v_farm_id;
  UPDATE public.profiles SET default_farm_id=v_farm_id WHERE id=NEW.id;

  INSERT INTO public.subscriptions (tenant_id,plan_id,status,starts_at,trial_ends_at,current_period_start,current_period_end)
  VALUES (v_tenant_id,v_plan.id,'trialing',now(),v_trial_end,now(),v_trial_end);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_customer_signup ON auth.users;
CREATE TRIGGER on_auth_user_customer_signup AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_customer_signup();

-- Gestão de clientes: só plataforma-admin pode ler/alterar todos os tenants.
DROP POLICY IF EXISTS "Platform admins manage tenants" ON public.tenants;
CREATE POLICY "Platform admins manage tenants" ON public.tenants
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.role='platform_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.role='platform_admin'));

DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT TO authenticated USING (id IN (SELECT tenant_id FROM public.profiles WHERE id=auth.uid()));

-- Cliente vê/actualiza o seu perfil, sem poder alterar tenant, função ou aviário padrão.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id=auth.uid()) WITH CHECK (id=auth.uid());

-- Apenas funções server-side/admin alteram estado de assinatura ou facturas.
REVOKE INSERT, UPDATE, DELETE ON public.subscription_plans, public.subscriptions, public.invoices, public.tenant_audit_log FROM anon, authenticated;
GRANT SELECT ON public.subscription_plans, public.subscriptions, public.invoices TO authenticated;
GRANT SELECT ON public.subscription_plans TO anon;

COMMENT ON TABLE public.tenants IS 'Clientes/organizações inscritas no HULA Agro.';
COMMENT ON TABLE public.subscriptions IS 'Plano e ciclo de assinatura por cliente; preparado para integração com processador de pagamentos.';
COMMENT ON TABLE public.invoices IS 'Facturas emitidas aos clientes.';
