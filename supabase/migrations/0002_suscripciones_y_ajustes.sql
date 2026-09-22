-- Migración 0002: suscripciones con fecha, ajustes de seguridad y lo que necesita el front.
--
-- Qué cambia respecto de 0001 (todo salió de las auditorías de seguridad):
--  1. `profiles.suscripcion_activa` (un sí/no) no puede decir «canceló pero tiene acceso hasta el 20».
--     Se reemplaza por la tabla `suscripciones`, y `tiene_acceso()` compara la fecha en cada consulta:
--     Mercado Pago no avisa cuando termina el período de una suscripción cancelada.
--  2. `contenidos_con_acceso` ahora exige también que la ventana esté publicada: antes, las piezas de
--     un borrador se le entregaban a cualquier suscriptora.
--  3. `bunny_video_id` sale de `contenidos` a `archivos_contenido`, que solo lee la dueña (y la Edge
--     Function con service_role). El navegador de una suscriptora nunca lo ve.
--  4. Los datos públicos de las piezas (tipo y duración) viajan en `temas.piezas`, mantenido por un
--     trigger: la vista bloqueada los muestra sin abrir la policy de `contenidos`.
--  5. Restricciones de formato (dirección, largos, una pieza de cada tipo por ventana).
--  6. Un perfil puede cambiar su nombre y nada más; el rol sigue sin poder escribirse desde el cliente.
--
-- Los ocho estados del mar (nombre, enseñanza) no son una tabla: son parte de la metáfora y viven como
-- constante en el front. `temas.estado_mar` ya los restringe con un check desde 0001.
--
-- Reglas de negocio acordadas: si un cobro rebota hay 3 días de gracia con acceso; el arrepentimiento
-- corta el acceso en el momento (acceso_hasta = ayer) y se reintegra el pago.

begin;

-- ─── Suscripciones ─────────────────────────────────────────────────────────
-- Una fila por suscripción de Mercado Pago (preapproval). Solo la escribe service_role: el webhook
-- y las Edge Functions, después de consultar el estado real a la API de Mercado Pago.

create table public.suscripciones (
  id uuid primary key default gen_random_uuid(),
  -- Al eliminar la cuenta la fila se conserva (user_id queda en null) para poder reconciliar
  -- un webhook tardío en lugar de crear una fila huérfana.
  user_id uuid references auth.users (id) on delete set null,
  preapproval_id text not null unique,
  estado text not null check (estado in ('iniciada', 'activa', 'en_gracia', 'pendiente', 'cancelada', 'vencida')),
  -- Hasta cuándo hay acceso cuando el estado es 'cancelada' (fin del período pago; ayer si se arrepintió)
  -- o 'en_gracia' (3 días desde el cobro fallido).
  acceso_hasta date,
  proximo_cobro date,
  medio_de_pago text, -- solo para mostrar («Visa terminada en 4242»); nunca datos completos de tarjeta
  ultimo_evento timestamptz not null default now(), -- para descartar eventos viejos que llegan desordenados
  created_at timestamptz not null default now()
);
alter table public.suscripciones enable row level security;
create index suscripciones_user_id_idx on public.suscripciones (user_id);

-- Cada webhook recibido, para que procesarlo dos veces no haga nada (idempotencia).
create table public.eventos_mp (
  id text primary key,
  tipo text,
  recibido_en timestamptz not null default now()
);
alter table public.eventos_mp enable row level security; -- sin policies: solo service_role

-- ─── Funciones de acceso ───────────────────────────────────────────────────

-- Única definición de «tiene acceso». La fecha se compara acá, en cada consulta.
create or replace function public.tiene_acceso()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
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
    );
$$;

-- ─── Perfiles ──────────────────────────────────────────────────────────────

alter table public.profiles
  add column nombre text check (nombre is null or char_length(nombre) between 1 and 80),
  add column terminos_aceptados_en timestamptz;

alter table public.profiles drop column suscripcion_activa;

-- Al registrarse: el rol es siempre 'user'. El nombre sí puede venir de los metadatos (es solo un dato
-- para mostrar); la aceptación de los términos la fecha el servidor, no el cliente.
create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, email, nombre, terminos_aceptados_en)
  values (
    new.id,
    new.email,
    nullif(left(btrim(coalesce(meta ->> 'nombre', meta ->> 'full_name', meta ->> 'name', '')), 80), ''),
    case when meta ->> 'acepta_terminos' = 'true' then now() end
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

-- Cada quien puede cambiar SU nombre. El grant es por columna: `role` sigue sin poder escribirse desde
-- el cliente (no hay grant ni policy que lo permita).
grant update (nombre) on public.profiles to authenticated;
create policy profiles_editar_nombre on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- La suscripción propia, solo lectura. El navegador nunca la escribe.
grant select on public.suscripciones to authenticated;
create policy suscripciones_lectura_propia on public.suscripciones
  for select to authenticated
  using (user_id = (select auth.uid()));

-- ─── Ventanas y piezas ─────────────────────────────────────────────────────

alter table public.temas
  add column piezas jsonb not null default '[]'::jsonb, -- [{tipo, duracion_min}] de las piezas publicadas
  add constraint temas_slug_formato check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and char_length(slug) <= 60
    and slug not in ('nueva', 'nuevo', 'ventanas', 'contenidos', 'admin') -- chocan con rutas del panel
  ),
  add constraint temas_titulo_largo check (char_length(titulo) between 2 and 80),
  add constraint temas_descripcion_largo check (descripcion is null or char_length(descripcion) <= 240);

-- bunny_video_id se muda a una tabla que el cliente no lee (ver más abajo).
alter table public.contenidos drop column bunny_video_id;

alter table public.contenidos
  add column duracion_min integer check (duracion_min is null or duracion_min between 1 and 600),
  add constraint contenidos_titulo_largo check (char_length(titulo) between 2 and 100),
  add constraint contenidos_cuerpo_largo check (cuerpo is null or char_length(cuerpo) <= 5000),
  add constraint contenidos_ejercitacion_con_consigna check (tipo <> 'ejercitacion' or char_length(coalesce(cuerpo, '')) >= 10),
  add constraint contenidos_una_por_tipo unique (tema_id, tipo);

-- Las piezas públicas de una ventana se recalculan cuando cambian sus contenidos.
create or replace function public.recalcular_piezas()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  id_tema uuid;
begin
  foreach id_tema in array array[
    case when tg_op <> 'INSERT' then old.tema_id end,
    case when tg_op <> 'DELETE' then new.tema_id end
  ] loop
    if id_tema is not null then
      update public.temas t
      set piezas = coalesce(
        (select jsonb_agg(jsonb_build_object('tipo', c.tipo, 'duracion_min', c.duracion_min) order by c.orden)
         from public.contenidos c where c.tema_id = id_tema and c.publicado),
        '[]'::jsonb)
      where t.id = id_tema;
    end if;
  end loop;
  return null;
end;
$$;

create trigger contenidos_recalculan_piezas
  after insert or update or delete on public.contenidos
  for each row execute function public.recalcular_piezas();

-- Las piezas de un borrador NO se entregan: la policy mira también que la ventana esté publicada.
drop policy contenidos_con_acceso on public.contenidos;
create policy contenidos_con_acceso on public.contenidos
  for select to authenticated
  using (
    publicado
    and public.tiene_acceso()
    and exists (select 1 from public.temas t where t.id = tema_id and t.publicado)
  );

-- ─── Archivos de video y audio ─────────────────────────────────────────────
-- El identificador de Bunny y los datos del archivo. Solo la dueña los lee; los escribe la Edge Function
-- de subida (service_role), que fija tipo y tamaño en la propia llamada a Bunny.

create table public.archivos_contenido (
  contenido_id uuid primary key references public.contenidos (id) on delete cascade,
  bunny_video_id text not null,
  nombre text not null,
  bytes bigint not null check (bytes >= 0),
  created_at timestamptz not null default now()
);
alter table public.archivos_contenido enable row level security;

grant select on public.archivos_contenido to authenticated;
create policy archivos_contenido_admin on public.archivos_contenido
  for select to authenticated
  using (public.es_admin());

commit;
