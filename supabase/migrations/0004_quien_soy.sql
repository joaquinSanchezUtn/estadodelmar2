-- Migración 0004: "Quién soy", la ventana pública con los datos de la dueña.
--
-- Una sola fila (la seedea esta misma migración; el cliente nunca puede insertar ni borrar, solo
-- `update` de sus columnas, y solo si es admin — así que nunca puede haber una segunda fila). `campos`
-- es una lista libre de pares etiqueta/valor, en el orden en que se muestran: la dueña arma, saca y
-- reordena filas desde el panel, sin que el esquema de la tabla tenga que cambiar.
--
-- Mismo patrón que `temas`: pública si `publicado`, la dueña la ve y la edita siempre (RLS con
-- `es_admin()`), nunca `using (true)`.

begin;

-- Un `check` no puede llevar una subquery adentro: la validación de cada elemento del array vive en
-- esta función aparte.
create function public.campos_de_perfil_validos(campos jsonb)
returns boolean
language sql
immutable
as $$
  select
    jsonb_typeof(campos) = 'array'
    and jsonb_array_length(campos) <= 20
    and not exists (
      select 1 from jsonb_array_elements(campos) e
      where jsonb_typeof(e) <> 'object'
        or not (e ? 'etiqueta') or not (e ? 'valor')
        or jsonb_typeof(e -> 'etiqueta') <> 'string' or jsonb_typeof(e -> 'valor') <> 'string'
        or char_length(e ->> 'etiqueta') not between 1 and 60
        or char_length(e ->> 'valor') not between 1 and 300
    );
$$;

create table public.quien_soy (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  descripcion text,
  foto_url text,
  -- [{ etiqueta, valor }], en el orden en que se muestran.
  campos jsonb not null default '[]'::jsonb,
  publicado boolean not null default true,
  actualizado_en timestamptz not null default now(),
  constraint quien_soy_nombre_largo check (nombre is null or char_length(nombre) between 1 and 100),
  constraint quien_soy_descripcion_larga check (descripcion is null or char_length(descripcion) <= 2000),
  constraint quien_soy_foto_url_formato check (foto_url is null or foto_url ~ '^https://'),
  constraint quien_soy_campos_formato check (public.campos_de_perfil_validos(campos))
);
alter table public.quien_soy enable row level security;

insert into public.quien_soy default values;

revoke all on public.quien_soy from anon, authenticated;
grant select on public.quien_soy to anon, authenticated;
grant update (nombre, descripcion, foto_url, campos, publicado, actualizado_en) on public.quien_soy to authenticated;

create policy quien_soy_lectura_publica on public.quien_soy
  for select to anon, authenticated
  using (publicado);

create policy quien_soy_admin on public.quien_soy
  for all to authenticated
  using (public.es_admin())
  with check (public.es_admin());

commit;
