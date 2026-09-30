-- Migración 0009: el enfoque de cada ventana y los mensajes de contacto (ver AUDITORIA.md).
--
-- 1. `temas.enfoque`: el pedido original distingue temas psicológicos, filosóficos y transpersonales
--    ("más allá de la personalidad, incluyendo la parte espiritual"). Es una dimensión aparte del estado
--    del mar: una ventana tiene un estado (desde dónde se llega) y un enfoque (desde dónde se lo mira).
--    Opcional, como `estado_mar`. Los grants de `temas` son de tabla, así que la columna nueva ya queda
--    cubierta por las mismas RLS (`temas_catalogo_publico`/`temas_admin`).
--
-- 2. `mensajes_contacto`: el formulario de /contacto fallaba en todo build publicado (no tenía backend).
--    Los mensajes se guardan acá y la dueña los lee en /admin/mensajes. El cliente NUNCA inserta: lo
--    hace la Edge Function `enviar-contacto` (service_role). La admin solo lee y marca como leído.
--    El límite de envíos vive en un trigger (no en la función): contar e insertar en la misma
--    transacción, con un lock por IP, es lo único que aguanta varios envíos en paralelo.

begin;

alter table public.temas
  add column enfoque text check (enfoque in ('psicologico', 'filosofico', 'transpersonal'));

create table public.mensajes_contacto (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 1 and 80),
  -- Estricto a propósito (sin `%`): el email termina en un `mailto:` del panel.
  email text not null check (char_length(email) between 3 and 254 and email ~ '^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  asunto text not null check (asunto in ('consulta', 'cuenta', 'pagos', 'datos', 'otro')),
  mensaje text not null check (char_length(mensaje) between 10 and 2000),
  -- Hash de la IP con sal propia del servidor: alcanza para limitar envíos sin guardar la IP en claro.
  ip_hash text not null,
  -- Llegó con el tope global de la hora superado: se guarda igual (así un bot no bloquea el formulario
  -- para todos), pero marcado para que la dueña lo mire con desconfianza.
  sospechoso boolean not null default false,
  leido boolean not null default false,
  creado_en timestamptz not null default now()
);
alter table public.mensajes_contacto enable row level security;
create index mensajes_contacto_ip_fecha on public.mensajes_contacto (ip_hash, creado_en desc);
create index mensajes_contacto_fecha on public.mensajes_contacto (creado_en desc);

-- Hasta 3 mensajes por IP por hora (se rechaza) y 60 en total por hora (se marca como sospechoso).
-- El advisory lock por IP serializa los envíos paralelos de una misma IP dentro de la transacción.
create function public.limitar_mensajes_contacto()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.ip_hash));
  if (select count(*) from public.mensajes_contacto
      where ip_hash = new.ip_hash and creado_en > now() - interval '1 hour') >= 3 then
    raise exception 'limite_por_ip' using errcode = 'P0001';
  end if;
  new.sospechoso := (select count(*) from public.mensajes_contacto where creado_en > now() - interval '1 hour') >= 60;
  new.leido := false;
  new.creado_en := now();
  return new;
end;
$$;
-- Ver 0005: una función nueva necesita su propio revoke, el default de 0001 no alcanza.
revoke execute on function public.limitar_mensajes_contacto() from public, anon, authenticated;

create trigger mensajes_contacto_limite
  before insert on public.mensajes_contacto
  for each row execute function public.limitar_mensajes_contacto();

revoke all on public.mensajes_contacto from anon, authenticated;
grant select on public.mensajes_contacto to authenticated;
grant update (leido) on public.mensajes_contacto to authenticated;

-- Dos policies acotadas, no `for all`: si algún día se agregara un grant de insert o delete por error,
-- ninguna policy lo habilitaría.
create policy mensajes_contacto_admin_lee on public.mensajes_contacto
  for select to authenticated
  using (public.es_admin());

create policy mensajes_contacto_admin_marca on public.mensajes_contacto
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

commit;
