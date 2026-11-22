-- Varias piezas del mismo tipo por tema (pedido de Joaquin, 2026-11-22): un tema puede tener varios videos,
-- varias meditaciones y varias ejercitaciones, en el orden que elija la dueña (`contenidos.orden`, que ya
-- existía desde la 0001).
--
-- Solo se saca la restricción `contenidos_una_por_tipo` (0002). No cambian ni las policies ni los grants:
-- la admin ya podía insertar, editar y borrar piezas (`contenidos_admin`), y la vista pública bloqueada
-- (`temas.piezas`) ya era una lista ordenada por `orden` que arma el trigger `recalcular_piezas()`, así que
-- con varias del mismo tipo sigue mostrando solo tipo y duración de cada una, nunca contenido premium.

alter table public.contenidos drop constraint contenidos_una_por_tipo;

-- Para leer las piezas de un tema en orden sin recorrer la tabla entera.
create index if not exists contenidos_tema_orden_idx on public.contenidos (tema_id, orden);

-- Mismo desempate que el front (`orden`, después `created_at`): las piezas viejas tienen todas el mismo
-- `orden`, y sin esto la vista bloqueada podía listarlas en otro orden que la abierta. El cuerpo es el de la
-- 0002 con ese único cambio (`create or replace` conserva el trigger y los permisos de la función).
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
        (select jsonb_agg(jsonb_build_object('tipo', c.tipo, 'duracion_min', c.duracion_min) order by c.orden, c.created_at)
         from public.contenidos c where c.tema_id = id_tema and c.publicado),
        '[]'::jsonb)
      where t.id = id_tema;
    end if;
  end loop;
  return null;
end;
$$;
