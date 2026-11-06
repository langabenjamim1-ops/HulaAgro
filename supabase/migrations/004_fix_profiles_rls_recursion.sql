-- Corrige "infinite recursion detected in policy for relation profiles", que impedia
-- carregar o perfil do cliente (e portanto o chatbot de IA). Seguro para reaplicar.

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'platform_admin')
$$;

GRANT EXECUTE ON FUNCTION public.current_tenant_id(), public.is_platform_admin() TO authenticated;

DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;
CREATE POLICY "Users can view profiles in their tenant" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid() OR tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT TO authenticated USING (id = public.current_tenant_id());

-- Garante as colunas usadas pelo assistente (caso a migração 001 não tenha sido aplicada por completo).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_farm_id uuid REFERENCES public.farms(id) ON DELETE SET NULL;

-- Contas existentes sem aviário padrão passam a usar o primeiro aviário do seu cliente.
UPDATE public.profiles p SET default_farm_id = (
  SELECT f.id FROM public.farms f WHERE f.tenant_id = p.tenant_id ORDER BY f.created_at LIMIT 1
) WHERE p.default_farm_id IS NULL;
