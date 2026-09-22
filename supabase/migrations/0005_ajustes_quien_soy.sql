-- Migración 0005: lo que encontró la auditoría de seguridad sobre "Quién soy" (0004), verificado
-- empíricamente contra un Postgres real antes de escribir esto.
--
-- 1. `alter default privileges ... revoke execute on functions` (0001) NO cierra el EXECUTE que
--    PUBLIC tiene por defecto sobre una función nueva — sí funciona para tablas, no para funciones.
--    `campos_de_perfil_validos()` (0004) y `recalcular_piezas()` (0002) habían quedado invocables
--    por cualquiera (incluido anon) sin ningún `revoke` explícito. Ninguna de las dos expone datos
--    (la primera es una función pura, la segunda solo se puede llamar como trigger), pero rompía la
--    garantía que promete el comentario de 0001: de acá en más, cada función nueva necesita su propio
--    revoke, y quedó anotado ahí.
-- 2. `campos_de_perfil_validos()` no tenía `set search_path = ''` (la única función del proyecto sin
--    esa línea): un `search_path` manipulado puede hacer que ` ? `/`->`/`->>` resuelvan a otra cosa y
--    el constraint deje pasar cualquier cosa. Hoy no es alcanzable (el cliente no controla el
--    search_path de su propia sesión), pero es la misma regla que ya siguen todas las demás.
-- 3. El constraint no rechazaba claves de más en cada elemento de `campos` (solo exigía que existan
--    `etiqueta` y `valor`, no que sean las únicas): una fila con un campo de un array de 20 elementos
--    con una clave extra de varios KB pasaba. Ahora se exige que sean exactamente esas dos claves.
-- 4. "Una sola fila para siempre" dependía solo de que nadie agregue `grant insert, delete` (la
--    policy `quien_soy_admin`, `for all`, ya autorizaba insert/delete por RLS). Ahora hay un índice
--    único sobre una expresión constante, que lo hace imposible aunque alguien agregue esos grants
--    más adelante; y la policy se separa en solo select/update.
-- 5. `actualizado_en` era una columna que el cliente podía escribir y `guardarQuienSoyAdmin` nunca
--    mandaba: quedaba parada en la fecha del seed para siempre, o cualquier admin podía falsearla.
--    Ahora la pone un trigger, y se le saca el grant al cliente.
-- 6. `foto_url` era la única columna sin largo máximo. Se le pone el mismo criterio que a las demás.
-- 7. La fila sembrada nacía `publicado = true` y vacía: `/quien-soy` quedaba pública mostrando una
--    página sin nada apenas se corría la migración. Arranca oculta, como `temas.publicado`.

begin;

-- ─── 1 y 2: funciones ──────────────────────────────────────────────────────

create or replace function public.campos_de_perfil_validos(campos jsonb)
returns boolean
language sql
immutable
set search_path = ''
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
        or exists (select 1 from jsonb_object_keys(e) k where k not in ('etiqueta', 'valor'))
    );
$$;

revoke execute on function public.campos_de_perfil_validos(jsonb) from public, anon;
grant execute on function public.campos_de_perfil_validos(jsonb) to authenticated;

-- Solo se puede invocar como trigger (lo exige Postgres); nadie necesita llamarla directo.
revoke execute on function public.recalcular_piezas() from public, anon, authenticated;

-- ─── 3 y 6: columnas ───────────────────────────────────────────────────────

alter table public.quien_soy
  drop constraint quien_soy_foto_url_formato,
  add constraint quien_soy_foto_url_formato check (foto_url is null or (foto_url ~ '^https://' and char_length(foto_url) <= 500));

-- ─── 4: una sola fila, de verdad ───────────────────────────────────────────

create unique index quien_soy_fila_unica on public.quien_soy ((true));

drop policy quien_soy_admin on public.quien_soy;

create policy quien_soy_admin_lectura on public.quien_soy
  for select to authenticated
  using (public.es_admin());

create policy quien_soy_admin_edicion on public.quien_soy
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- ─── 5: actualizado_en la pone la base ─────────────────────────────────────

revoke update (actualizado_en) on public.quien_soy from authenticated;

create function public.marcar_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create trigger quien_soy_marca_actualizado
  before update on public.quien_soy
  for each row execute function public.marcar_actualizado();

-- ─── 7: arranca oculta ──────────────────────────────────────────────────────

update public.quien_soy set publicado = false;
alter table public.quien_soy alter column publicado set default false;

commit;
