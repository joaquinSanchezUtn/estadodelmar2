-- Migración 0014: "Ecos del océano", la segunda sección de frases del día (la pestaña del costado
-- izquierdo; las "Semillas del mar" van a la derecha). Arranca vacía: la dueña las carga desde
-- /admin/ecos, y mientras no haya ninguna publicada la pestaña no aparece.
--
-- Ojo con el nombre: la tabla `ecos` (0013) es la de las Semillas, que se llamaron "Ecos del océano" unas
-- horas. Esta es `ecos_del_oceano`. Mismo diseño que la 0013: `numero` fija el orden de la rotación (lo
-- da la base, nunca el cliente); cualquiera lee las publicadas y solo la admin escribe, nunca `using (true)`.

begin;

create table public.ecos_del_oceano (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  texto text not null,
  publicado boolean not null default true,
  creado_en timestamptz not null default now(),
  constraint ecos_del_oceano_texto_largo check (char_length(btrim(texto)) between 1 and 500)
);
alter table public.ecos_del_oceano enable row level security;

revoke all on public.ecos_del_oceano from anon, authenticated;
grant select on public.ecos_del_oceano to anon, authenticated;
grant insert (texto, publicado), update (texto, publicado), delete on public.ecos_del_oceano to authenticated;

create policy ecos_del_oceano_lectura_publica on public.ecos_del_oceano
  for select to anon, authenticated
  using (publicado);

create policy ecos_del_oceano_admin on public.ecos_del_oceano
  for all to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

commit;
