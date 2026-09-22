-- Migración inicial: perfiles, temas (ventanas) y contenidos.
--
-- Primer admin: no hay forma de promoverlo desde la app. Se hace una sola vez,
-- a mano, desde el SQL Editor de Supabase (corre como service_role):
--   update public.profiles set role = 'admin' where id = '<uuid de la dueña en Authentication>';

begin;

-- Las tablas futuras nacen cerradas: Supabase da acceso a anon y authenticated por defecto, y así una
-- tabla nueva sin revoke quedaría abierta.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
-- OJO, esto no hace lo mismo para funciones (verificado en la auditoría de la migración 0005): el
-- EXECUTE de PUBLIC sobre una función nueva no lo toca ningún default privilege. Cada función que se
-- agregue de acá en más necesita su propio `revoke execute ... from public, anon` explícito (y su
-- `grant` a `authenticated` si el cliente la tiene que poder llamar), igual que ya hacían `es_admin()`
-- y `tiene_acceso()` acá abajo.
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- ─── Tablas ────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  suscripcion_activa boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.temas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  descripcion text,
  estado_mar text check (
    estado_mar in (
      'calma', 'olas_suaves', 'agitado', 'tormenta',
      'profundidades', 'mareas', 'corrientes', 'horizonte'
    )
  ),
  publicado boolean not null default false,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.temas enable row level security;

create table public.contenidos (
  id uuid primary key default gen_random_uuid(),
  tema_id uuid not null references public.temas (id) on delete cascade,
  tipo text not null check (tipo in ('video', 'meditacion', 'ejercitacion')),
  titulo text not null,
  cuerpo text,
  bunny_video_id text,
  publicado boolean not null default false,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.contenidos enable row level security;

create index contenidos_tema_id_idx on public.contenidos (tema_id);

-- ─── Funciones ─────────────────────────────────────────────────────────────

create function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Única definición de "es suscriptor": suscripción activa o admin.
create function public.tiene_acceso()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and (suscripcion_activa or role = 'admin')
  );
$$;

-- Crea el perfil al registrarse. El rol es siempre 'user': nunca se toma de
-- raw_user_meta_data ni de nada que el cliente pueda escribir.
create function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger al_registrarse
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- Las funciones no se llaman desde afuera salvo las de acceso, y solo con sesión.
revoke execute on function public.es_admin() from public, anon;
revoke execute on function public.tiene_acceso() from public, anon;
revoke execute on function public.crear_perfil() from public, anon, authenticated;
grant execute on function public.es_admin() to authenticated;
grant execute on function public.tiene_acceso() to authenticated;

-- ─── Privilegios ───────────────────────────────────────────────────────────
-- Parten de cero: Supabase da todo por defecto a anon y authenticated.

revoke all on public.profiles, public.temas, public.contenidos from anon, authenticated;

-- profiles: el cliente solo lee. role y suscripcion_activa los escribe service_role.
grant select on public.profiles to authenticated;

-- temas: el catálogo lo ve cualquiera; la escritura la filtra la policy de admin.
grant select on public.temas to anon, authenticated;
grant insert, update, delete on public.temas to authenticated;

-- contenidos: solo con sesión; anon no tiene ningún privilegio.
grant select, insert, update, delete on public.contenidos to authenticated;

-- ─── RLS ───────────────────────────────────────────────────────────────────

-- profiles: cada quien lee solo su fila. No hay policy de escritura.
create policy profiles_lectura_propia on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

-- temas: catálogo público de publicados; el admin ve y escribe todo.
create policy temas_catalogo_publico on public.temas
  for select to anon, authenticated
  using (publicado);

create policy temas_admin on public.temas
  for all to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- contenidos: solo publicados y con acceso; el admin ve y escribe todo.
create policy contenidos_con_acceso on public.contenidos
  for select to authenticated
  using (publicado and public.tiene_acceso());

create policy contenidos_admin on public.contenidos
  for all to authenticated
  using (public.es_admin())
  with check (public.es_admin());

commit;
