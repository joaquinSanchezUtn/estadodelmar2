-- Migración 0022: descuento para el primer cobro (pedido de Joaquin, 2026-11-22). La dueña lo prende y lo
-- apaga a mano desde /admin/precio, con un porcentaje. Mientras está prendido:
--   · la home y Mi cuenta muestran el precio normal tachado y el del primer mes;
--   · quien se suscribe POR PRIMERA VEZ (nunca tuvo una suscripción más allá de un checkout abandonado) paga
--     el primer cobro con descuento, y desde el segundo, el precio normal: `iniciar-suscripcion` crea la
--     preapproval con el monto rebajado y marca `descuento_pendiente`; cuando el webhook recibe ese primer
--     cobro aprobado, le pone a la preapproval el precio normal vigente y apaga la marca.
--   · Las suscripciones que ya existen no cambian.
--
-- `cambiar-precio` saltea las que tienen `descuento_pendiente` (todavía no pagaron su primer mes rebajado):
-- el webhook las pasa al precio normal que haya en ese momento.

begin;

alter table public.plan
  add column descuento_pct integer,
  add constraint plan_descuento_razonable check (descuento_pct is null or descuento_pct between 1 and 90);

alter table public.suscripciones
  add column descuento_pendiente boolean not null default false,
  -- Huella del email (HMAC-SHA256 con la sal del secret `CONTACTO_SAL_IP`, la misma del contacto; nunca el email): sobrevive al
  -- `on delete set null` de `user_id`, así borrar la cuenta y volver a crearla con el mismo email no repite el
  -- descuento. El email se normaliza (minúsculas; en Gmail, sin puntos ni «+algo») antes de la huella.
  add column email_huella text;

create index suscripciones_email_huella_idx on public.suscripciones (email_huella) where email_huella is not null;

commit;
