-- Migración 0021: el precio del plan mensual, editable por la dueña desde /admin/precio (pedido de Joaquin,
-- 2026-11-22). Hasta acá vivía en el secret `MP_PRECIO_ARS`, que solo se cambiaba desde el panel de Supabase.
--
-- Una sola fila (como `portada` y `quien_soy`: el índice único sobre una expresión constante hace imposible una
-- segunda). Sembrada con el precio que tenía el secret ese día ($9.999).
--
-- Nadie la escribe desde el cliente, ni siquiera la admin: cambiar el precio también cambia el monto de las
-- suscripciones que ya existen en Mercado Pago (decisión de Joaquin: «todas, también las actuales»), y eso lo
-- hace la Edge Function `cambiar-precio` (service_role) después de verificar `es_admin()`. Así el número de la
-- base y lo que cobra Mercado Pago no pueden separarse por un update suelto desde el navegador.
--
-- Lectura: la admin, por RLS. El público ve el precio por `obtener-precio` (service_role), como hasta ahora;
-- `iniciar-suscripcion` lo lee de acá para cobrar, y `reactivar-suscripcion` para reactivar con el precio vigente.

begin;

create table public.plan (
  id uuid primary key default gen_random_uuid(),
  precio_ars integer not null,
  actualizado_en timestamptz not null default now(),
  constraint plan_precio_razonable check (precio_ars between 100 and 10000000)
);
alter table public.plan enable row level security;

create unique index plan_fila_unica on public.plan ((true));

insert into public.plan (precio_ars) values (9999);

revoke all on public.plan from anon, authenticated;
grant select on public.plan to authenticated;

create policy plan_admin_lee on public.plan
  for select to authenticated
  using (public.es_admin());

commit;
