-- Ser admin exige un segundo factor (un código de una app de autenticación en el celular, TOTP).
--
-- Hasta acá, `es_admin()` dependía solo de `profiles.role` y de que la sesión no fuera de recuperación:
-- quien consiguiera la contraseña de Google de la dueña, o entrara a su correo, quedaba admin completo
-- (auditoría de seguridad del 2026-10-01, hallazgo M1). Ahora además la sesión tiene que estar en nivel
-- `aal2`: Supabase solo lo da después de verificar un código del segundo factor en ESA sesión.
--
-- Todo lo que pregunta por admin lo hereda solo, porque todo pasa por esta función: las policies de
-- `temas`, `contenidos`, `archivos_contenido`, `quien_soy` y `mensajes_contacto`, la rama admin de
-- `tiene_acceso()` y las Edge Functions de Bunny (que llaman `rpc('es_admin')` con el JWT de quien pide).
--
-- El front (`RutaDeAdmin`) pide el código, o la primera vez guía para configurar el factor.
-- Si la dueña pierde el celular: borrar su factor desde el SQL Editor y vuelve a configurarlo al entrar:
--   delete from auth.mfa_factors where user_id = (select id from auth.users where email = '<su email>');

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    not public.sesion_de_recuperacion()
    and coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2'
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    );
$$;
