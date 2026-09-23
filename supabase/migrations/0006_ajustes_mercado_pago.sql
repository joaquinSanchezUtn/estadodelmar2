-- Migración 0006: lo que encontró la auditoría de seguridad sobre la integración de Mercado Pago.
-- Dos arreglos del lado de la base (los del código van en las Edge Functions, no acá):
--
-- 1. `estado = 'activa'` era el único estado sin fecha: si el webhook que la saca de ahí nunca llega
--    (se cae, MP no reintenta más, un despliegue con el secreto mal puesto), la fila queda con acceso
--    para siempre. Ahora también compara contra `proximo_cobro` (con 3 días de margen, para no cortar
--    a alguien un ratito antes de que se procese el cobro del mes).
-- 2. Nada impedía que una persona tuviera dos filas "vivas" en `suscripciones` a la vez (por ejemplo,
--    volviendo atrás en el navegador y creando una segunda suscripción antes de terminar la primera):
--    la de más atrás quedaba invisible e incancelable desde el sitio, cobrando para siempre. Ahora un
--    índice único lo hace imposible a nivel de base, no solo a nivel de código.

begin;

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
            (
              s.estado = 'activa'
              and (s.proximo_cobro is null or s.proximo_cobro >= (now() at time zone 'America/Argentina/Buenos_Aires')::date - 3)
            )
            or (
              s.estado in ('cancelada', 'en_gracia')
              and s.acceso_hasta >= (now() at time zone 'America/Argentina/Buenos_Aires')::date
            )
          )
      )
    );
$$;

-- Una sola fila "viva" (todavía puede llegar a dar o seguir dando acceso) por persona.
create unique index suscripciones_una_viva_por_usuario
  on public.suscripciones (user_id)
  where estado in ('iniciada', 'pendiente', 'activa', 'en_gracia');

commit;
