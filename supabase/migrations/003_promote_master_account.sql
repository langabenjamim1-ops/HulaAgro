-- Executar no SQL Editor somente depois de a conta ter sido criada em /inscrever.
-- Promove exclusivamente o utilizador inicial autorizado para administrador global.
UPDATE public.profiles AS p
SET role = 'platform_admin'
FROM auth.users AS u
WHERE p.id = u.id
  AND lower(u.email) = lower('benjamim.langa@multisis-mz.com')
RETURNING p.id, p.full_name, p.role;
