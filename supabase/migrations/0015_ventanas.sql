-- Migración 0015: las "ventanas" (los estados del mar de la home: Mar en calma, Tormenta…) pasan a ser una
-- tabla que la dueña edita desde /admin/estados: agregar, editar, ordenar, ocultar, borrar y subir una foto.
-- Hasta acá eran ocho constantes del front (`src/datos/constantes.ts`) y `temas.estado_mar` los fijaba con
-- un check. Esta migración siembra esas ocho, con los mismos ids, así no cambia ninguna dirección
-- (/estado/olas-suaves) ni ningún tema.
--
-- `estilo` es uno de los ocho aspectos que ya existen (color de la tarjeta y dibujo animado, validados por
-- contraste, ver tailwind.config.js): una ventana nueva elige uno. La foto es opcional; sin foto se ve el
-- dibujo del estilo.
--
-- La foto vive en el bucket público `publico`, carpeta `ventanas/`. Hasta acá ese bucket solo se escribía
-- desde el panel de Supabase; ahora la admin puede subir, reemplazar y borrar SOLO dentro de `ventanas/` y
-- solo imágenes jpg, png o webp (nunca svg: un svg público puede llevar script).

begin;

create table public.estados (
  id text primary key,
  nombre text not null,
  estado_interno text not null,
  ensenanza text not null,
  estilo text not null,
  foto text,
  orden integer not null default 0,
  publicado boolean not null default true,
  creado_en timestamptz not null default now(),
  -- En la URL los guiones bajos van como guiones (/estado/olas-suaves).
  constraint estados_id_formato check (id ~ '^[a-z0-9]+(_[a-z0-9]+)*$' and char_length(id) <= 40),
  constraint estados_nombre_largo check (char_length(btrim(nombre)) between 1 and 60),
  constraint estados_interno_largo check (char_length(btrim(estado_interno)) between 1 and 200),
  constraint estados_ensenanza_largo check (char_length(btrim(ensenanza)) between 1 and 300),
  constraint estados_estilo_valido check (
    estilo in ('calma', 'olas_suaves', 'agitado', 'tormenta', 'profundidades', 'mareas', 'corrientes', 'horizonte')
  ),
  constraint estados_foto_formato check (foto is null or foto ~ '^ventanas/[a-z0-9_-]+\.(jpg|png|webp)$')
);
alter table public.estados enable row level security;

insert into public.estados (id, nombre, estado_interno, ensenanza, estilo, orden) values
  ('calma', 'Mar en calma', 'Paz interior, serenidad, equilibrio', 'La mente clara ve la realidad con más objetividad', 'calma', 1),
  ('olas_suaves', 'Olas suaves', 'Alegría, entusiasmo, curiosidad, tristeza pasajera', 'Las emociones son parte de la vida; se viven sin perder el equilibrio', 'olas_suaves', 2),
  ('agitado', 'Mar agitado', 'Estrés, preocupación, ansiedad, enojo, miedo', 'Reaccionar impulsivamente impide ver con claridad', 'agitado', 3),
  ('tormenta', 'Tormenta', 'Crisis, pérdidas, conflictos, grandes desafíos', 'Las tormentas no duran para siempre', 'tormenta', 4),
  ('profundidades', 'Profundidades', 'El Ser profundo, la conciencia, la esencia', 'Aunque la superficie esté turbulenta, abajo reina el silencio', 'profundidades', 5),
  ('mareas', 'Mareas', 'Ciclos de energía, motivación, ánimo', 'Todo tiene ritmos; respetarlos favorece el bienestar', 'mareas', 6),
  ('corrientes', 'Corrientes', 'Creencias, hábitos, condicionamientos', 'Influyen en nuestra dirección sin que lo notemos', 'corrientes', 7),
  ('horizonte', 'Horizonte', 'Propósito, sentido de vida, trascendencia', 'Mirar el horizonte evita quedar atrapado en la ola del momento', 'horizonte', 8);

revoke all on public.estados from anon, authenticated;
grant select on public.estados to anon, authenticated;
grant insert (id, nombre, estado_interno, ensenanza, estilo, foto, orden, publicado) on public.estados to authenticated;
grant update (nombre, estado_interno, ensenanza, estilo, foto, orden, publicado) on public.estados to authenticated;
grant delete on public.estados to authenticated;

create policy estados_lectura_publica on public.estados
  for select to anon, authenticated
  using (publicado);

create policy estados_admin on public.estados
  for all to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

-- Los temas apuntan a una ventana que exista. `on delete restrict`: la base no deja borrar una ventana con
-- temas adentro (el panel avisa que primero hay que pasarlos a otra).
alter table public.temas drop constraint temas_estado_mar_check;
alter table public.temas
  add constraint temas_estado_mar_fkey foreign key (estado_mar) references public.estados (id)
  on update cascade on delete restrict;

-- Las fotos: 5 MB como máximo en todo el bucket (el logo pesa mucho menos) y solo jpg, png o webp. Los tipos
-- los valida Storage al subir: la policy de abajo mira solo el nombre, y sin esto se podía subir un svg (que
-- puede llevar script) llamado `.png`. Hasta acá el bucket aceptaba svg e ico; el logo es webp.
-- La admin escribe solo en `ventanas/`. La lectura no necesita policy: el bucket es público y se sirve por URL.
-- Sin policy de update a propósito: nadie puede pisar ni renombrar un archivo existente (tampoco el logo).
update storage.buckets
   set file_size_limit = 5242880,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
 where id = 'publico';

create policy publico_ventanas_admin_leer on storage.objects
  for select to authenticated
  using (bucket_id = 'publico' and name like 'ventanas/%' and (select public.es_admin()));

create policy publico_ventanas_admin_subir on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'publico'
    and name ~ '^ventanas/[a-z0-9_-]+\.(jpg|png|webp)$'
    and (select public.es_admin())
  );

create policy publico_ventanas_admin_borrar on storage.objects
  for delete to authenticated
  using (bucket_id = 'publico' and name like 'ventanas/%' and (select public.es_admin()));

commit;
