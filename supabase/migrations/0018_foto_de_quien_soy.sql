-- Migración 0018: la foto de "Quién soy" se sube desde el panel, igual que las de ventanas y temas (0015, 0016),
-- en vez de pegar un enlace a una imagen alojada en otro lado.
--
-- `quien_soy` tiene grants de update por columna (0004): la columna nueva necesita el suyo, a diferencia de
-- `temas`. Se lee con el grant de tabla y la RLS de siempre.
--
-- Va al bucket público `publico`, carpeta `quien-soy/`, con las mismas reglas que las otras dos: solo la admin,
-- solo jpg, png o webp (los tipos del bucket ya están limitados desde la 0015), sin policy de update (nadie
-- pisa ni renombra un archivo existente).
--
-- `foto_url` ya no se usa, pero se deja: la versión publicada del sitio la pide hasta que salga el deploy, y
-- sin la columna "Quién soy" dejaría de cargar en ese rato. Se borra en una migración aparte.

begin;

alter table public.quien_soy
  add column foto text,
  add constraint quien_soy_foto_formato check (foto is null or foto ~ '^quien-soy/[a-z0-9_-]+\.(jpg|png|webp)$');

grant update (foto) on public.quien_soy to authenticated;

create policy publico_quien_soy_admin_leer on storage.objects
  for select to authenticated
  using (bucket_id = 'publico' and name like 'quien-soy/%' and (select public.es_admin()));

create policy publico_quien_soy_admin_subir on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'publico'
    and name ~ '^quien-soy/[a-z0-9_-]+\.(jpg|png|webp)$'
    and (select public.es_admin())
  );

create policy publico_quien_soy_admin_borrar on storage.objects
  for delete to authenticated
  using (bucket_id = 'publico' and name like 'quien-soy/%' and (select public.es_admin()));

commit;
