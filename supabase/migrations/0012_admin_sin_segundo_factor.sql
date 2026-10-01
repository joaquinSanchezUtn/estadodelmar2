-- Vuelve atrás el segundo factor de la 0011, por decisión de Joaquin (2026-10-01: "me parece innecesario
-- de momento"). `es_admin()` vuelve a ser la de la 0003: rol admin y sesión que no sea de recuperación.
--
-- Lo que SÍ queda de la 0011: `tiene_acceso()` pasa por `es_admin()` en vez de leer `profiles.role`
-- directo, así hay una sola definición de admin. Para volver a exigir el código alcanza con reaplicar
-- el `es_admin()` de la 0011 (y volver a poner `SegundoFactor` en `RutaDeAdmin`, ver el historial de git).

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    not public.sesion_de_recuperacion()
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    );
$$;

-- El intento de configuración que quedó a medias (factores sin verificar) no sirve para nada.
delete from auth.mfa_factors where status = 'unverified';
