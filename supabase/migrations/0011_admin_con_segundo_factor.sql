-- Ser admin exige un segundo factor (un código de una app de autenticación en el celular, TOTP).
--
-- Hasta acá, `es_admin()` dependía solo de `profiles.role` y de que la sesión no fuera de recuperación:
-- quien consiguiera la contraseña de Google de la dueña, o entrara a su correo, quedaba admin completo
-- (auditoría de seguridad del 2026-10-01, hallazgo M1). Ahora además:
--   * la sesión tiene que estar en nivel `aal2`: Supabase solo lo da después de verificar un código del
--     segundo factor en ESA sesión;
--   * ese código tiene que haberse verificado hace menos de 12 horas: si no, un refresh token robado
--     daría admin para siempre sin volver a pedir el código. Pasado ese plazo, el panel lo vuelve a pedir.
--
-- Todo camino de admin pasa por `es_admin()`: las policies de `temas`, `contenidos`, `archivos_contenido`,
-- `quien_soy` y `mensajes_contacto`, las Edge Functions de Bunny (`rpc('es_admin')` con el JWT de quien
-- pide) y, desde esta migración, también la rama admin de `tiene_acceso()`, que antes leía
-- `profiles.role` directo y dejaba ver el contenido premium con la sola contraseña.
--
-- El front (`SegundoFactor`, que envuelve `RutaDeAdmin`) pide el código o, la primera vez, guía para
-- configurarlo. Mientras la cuenta admin no tenga un factor verificado, lo configura quien entre primero
-- con su cuenta: por eso hay que configurarlo apenas se aplica esto, con la dueña presente.
--
-- Si la dueña pierde el celular, desde el SQL Editor y con ella presente para configurarlo enseguida
-- (borrar también las sesiones corta a quien tuviera una abierta con el celular perdido):
--   delete from auth.mfa_factors where user_id = (select id from auth.users where email = '<su email>');
--   delete from auth.sessions    where user_id = (select id from auth.users where email = '<su email>');

begin;

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
      select 1 from jsonb_array_elements(coalesce((select auth.jwt() -> 'amr'), '[]'::jsonb)) e
      where e ->> 'method' = 'totp'
        and (e ->> 'timestamp')::bigint > extract(epoch from now()) - 12 * 3600
    )
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    );
$$;

-- Igual que en la 0007, salvo la rama admin: ahora pasa por `es_admin()`.
create or replace function public.tiene_acceso()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    not public.sesion_de_recuperacion()
    and (
      public.es_admin()
      or exists (
        select 1 from public.suscripciones s
        where s.user_id = (select auth.uid())
          and (
            (
              s.estado = 'activa'
              and (
                (s.proximo_cobro is not null and s.proximo_cobro >= (now() at time zone 'America/Argentina/Buenos_Aires')::date - 3)
                or (s.proximo_cobro is null and s.ultimo_evento >= now() - interval '35 days')
              )
            )
            or (
              s.estado in ('cancelada', 'en_gracia')
              and s.acceso_hasta >= (now() at time zone 'America/Argentina/Buenos_Aires')::date
            )
          )
      )
    );
$$;

commit;
