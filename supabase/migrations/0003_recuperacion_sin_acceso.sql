-- Migración 0003: una sesión de recuperación de contraseña no tiene que dar acceso.
--
-- Encontrado por la auditoría de seguridad de la Tanda de datos: `SesionContext.tsx` confina el rol
-- a 'visitante' mientras `enRecuperacion` es cierto, pero eso es solo lo que la interfaz MUESTRA. El
-- catálogo (`contenido.ts`) ya pregunta el acceso real con `tiene_acceso()` en cada pedido, y esa
-- función no sabía nada de `enRecuperacion`: contestaba `true` igual. Con un enlace de recuperación
-- en la mano (reenviado, en una casilla compartida) se podía navegar el contenido premium entero sin
-- llegar a elegir una contraseña nueva.
--
-- La sesión que arma un enlace de recuperación tiene 'recovery' en el claim `amr` del JWT (así es como
-- Supabase la distingue de un ingreso normal). Rechazar esos JWT acá es la única barrera que importa:
-- es la misma que ya usan `tiene_acceso()`/`es_admin()` en el resto del código, y no depende de nada
-- que el cliente pueda manipular.

begin;

create or replace function public.sesion_de_recuperacion()
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1 from jsonb_array_elements(coalesce((select auth.jwt() -> 'amr'), '[]'::jsonb)) e
    where e ->> 'method' = 'recovery'
  );
$$;

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
      exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
      or exists (
        select 1 from public.suscripciones s
        where s.user_id = (select auth.uid())
          and (
            s.estado = 'activa'
            or (
              s.estado in ('cancelada', 'en_gracia')
              and s.acceso_hasta >= (now() at time zone 'America/Argentina/Buenos_Aires')::date
            )
          )
      )
    );
$$;

revoke execute on function public.sesion_de_recuperacion() from public, anon;
grant execute on function public.sesion_de_recuperacion() to authenticated;

commit;
