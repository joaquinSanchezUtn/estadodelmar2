-- Migración 0007: la 0006 le puso fecha al estado 'activa' (antes duraba para siempre), pero dejó sin
-- tope el caso `proximo_cobro is null` — y ese caso era alcanzable en producción, no un resto teórico:
-- antes de esta migración, el webhook nunca actualizaba `proximo_cobro` en una renovación mensual
-- exitosa (solo lo hacía al pasar A 'activa' por primera vez), así que cualquier suscripción con más
-- de un cobro terminaba con la fecha vieja o nula. El arreglo real está en `procesarCobro` de
-- `webhook-mercado-pago` (ahora refresca `proximo_cobro` en cada cobro aprobado, no solo al recuperar
-- una `en_gracia`); esto es la red de contención del lado de la base, para el rato entre que se
-- autoriza un preapproval y llega el primer webhook con la fecha real — o si algún día vuelve a
-- faltar: sin este tope, un `proximo_cobro` nulo daba acceso indefinido.
--
-- Encontrado por la auditoría de verificación de la Tanda de Mercado Pago.

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
