-- Migración 0017: los textos del principio de la home, editables desde /admin/portada. Hasta acá estaban
-- escritos en `Portada.tsx` y `ComoFunciona.tsx`:
--   · la portada («No somos las olas. Somos el océano.»): etiqueta, título en dos renglones y texto;
--   · «Cómo funciona»: título, subtítulo y las tarjetas numeradas (`pasos`, una lista de { titulo, texto }
--     que la dueña edita, agrega, borra y reordena; el número sale del orden, no se guarda).
--
-- Mismo patrón que `quien_soy` (0004/0005): una sola fila, sembrada acá con los textos de siempre; el cliente
-- nunca inserta ni borra (sin grants, y además el índice único sobre una expresión constante lo hace
-- imposible), solo la admin hace `update`, y todo se guarda junto, de un saque.
--
-- Lectura: son textos públicos por definición (los ve cualquiera que entre al sitio), pero la tabla igual
-- queda cerrada (solo la admin la lee y la edita, nunca `using (true)`). El público la lee por la función
-- `portada_publica()`, que devuelve solo las columnas de texto de la única fila. Lo opcional vacío (null) no
-- se muestra; sin pasos, la sección «Cómo funciona» no aparece.

begin;

-- Un `check` no puede llevar una subquery: la validación de cada tarjeta vive en esta función aparte.
create function public.pasos_validos(pasos jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select
    jsonb_typeof(pasos) = 'array'
    and jsonb_array_length(pasos) <= 6
    and not exists (
      select 1 from jsonb_array_elements(pasos) e
      where jsonb_typeof(e) <> 'object'
        or not (e ? 'titulo') or not (e ? 'texto')
        or jsonb_typeof(e -> 'titulo') <> 'string' or jsonb_typeof(e -> 'texto') <> 'string'
        or char_length(btrim(e ->> 'titulo')) not between 1 and 60
        or char_length(btrim(e ->> 'texto')) not between 1 and 200
        or exists (select 1 from jsonb_object_keys(e) k where k not in ('titulo', 'texto'))
    );
$$;

-- Toda función nueva necesita su propio revoke (ver 0001 y 0005).
revoke execute on function public.pasos_validos(jsonb) from public, anon;
grant execute on function public.pasos_validos(jsonb) to authenticated;

create table public.portada (
  id uuid primary key default gen_random_uuid(),
  etiqueta text,
  titulo text not null,
  titulo_destacado text,
  texto text,
  como_titulo text not null,
  como_texto text,
  pasos jsonb not null default '[]'::jsonb,
  actualizado_en timestamptz not null default now(),
  constraint portada_etiqueta_largo check (etiqueta is null or char_length(btrim(etiqueta)) between 1 and 60),
  constraint portada_titulo_largo check (char_length(btrim(titulo)) between 1 and 80),
  constraint portada_titulo_destacado_largo check (titulo_destacado is null or char_length(btrim(titulo_destacado)) between 1 and 80),
  constraint portada_texto_largo check (texto is null or char_length(btrim(texto)) between 1 and 400),
  constraint portada_como_titulo_largo check (char_length(btrim(como_titulo)) between 1 and 60),
  constraint portada_como_texto_largo check (como_texto is null or char_length(btrim(como_texto)) between 1 and 200),
  constraint portada_pasos_formato check (public.pasos_validos(pasos))
);
alter table public.portada enable row level security;

create unique index portada_fila_unica on public.portada ((true));

insert into public.portada (etiqueta, titulo, titulo_destacado, texto, como_titulo, como_texto, pasos) values (
  'Un gimnasio del alma',
  'No somos las olas.',
  'Somos el océano.',
  'Videos, meditaciones y ejercicios para atravesar la ansiedad, los duelos y los cambios sin perder el centro. A tu ritmo, desde cualquier lugar.',
  'Cómo funciona',
  'Tres pasos, cada vez que lo necesites.',
  '[
    {"titulo": "Abrí tu ventana", "texto": "Calma, tormenta, mareas… cada ventana abre los temas que te pueden ayudar."},
    {"titulo": "Comprendé y meditá", "texto": "Un video breve explica qué te pasa y una meditación guiada te lleva a la profundidad."},
    {"titulo": "Llevalo a tu vida", "texto": "Una ejercitación concreta para practicar lo aprendido en tu día a día."}
  ]'::jsonb
);

revoke all on public.portada from anon, authenticated;
grant select on public.portada to authenticated;
grant update (etiqueta, titulo, titulo_destacado, texto, como_titulo, como_texto, pasos) on public.portada to authenticated;

create policy portada_admin_lectura on public.portada
  for select to authenticated
  using ((select public.es_admin()));

create policy portada_admin_edicion on public.portada
  for update to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

create function public.portada_publica()
returns table (etiqueta text, titulo text, titulo_destacado text, texto text, como_titulo text, como_texto text, pasos jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select p.etiqueta, p.titulo, p.titulo_destacado, p.texto, p.como_titulo, p.como_texto, p.pasos
  from public.portada p
  limit 1;
$$;

-- Abierta a propósito a anon: es lo que ve cualquiera en la home.
revoke execute on function public.portada_publica() from public;
grant execute on function public.portada_publica() to anon, authenticated;

-- `actualizado_en` la pone la base (la función es la de 0005, la misma que usa `quien_soy`).
create trigger portada_marca_actualizado
  before update on public.portada
  for each row execute function public.marcar_actualizado();

commit;
