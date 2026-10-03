-- Migración 0016: cada tema puede llevar una foto, que la dueña sube desde el editor del tema (igual que las
-- ventanas, 0015). Sin foto, la tarjeta del tema sigue mostrando el dibujo del aspecto de su ventana.
--
-- La foto no es contenido premium: es la portada de un tema cuyo título ya es público. Los grants de `temas`
-- son de tabla (0001), así que la columna nueva ya queda cubierta: la lee quien puede leer el tema
-- (`temas_catalogo_publico` / `temas_admin`) y la escribe solo la admin.
--
-- Va al bucket público `publico`, carpeta `temas/`, con las mismas reglas que `ventanas/`: solo la admin,
-- solo jpg, png o webp (los tipos del bucket ya están limitados desde la 0015), sin policy de update (nadie
-- pisa ni renombra un archivo existente).

begin;

alter table public.temas
  add column foto text,
  add constraint temas_foto_formato check (foto is null or foto ~ '^temas/[a-z0-9_-]+\.(jpg|png|webp)$');

create policy publico_temas_admin_leer on storage.objects
  for select to authenticated
  using (bucket_id = 'publico' and name like 'temas/%' and (select public.es_admin()));

create policy publico_temas_admin_subir on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'publico'
    and name ~ '^temas/[a-z0-9_-]+\.(jpg|png|webp)$'
    and (select public.es_admin())
  );

create policy publico_temas_admin_borrar on storage.objects
  for delete to authenticated
  using (bucket_id = 'publico' and name like 'temas/%' and (select public.es_admin()));

commit;
