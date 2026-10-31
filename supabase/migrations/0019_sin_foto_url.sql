-- Migración 0019: se borra `quien_soy.foto_url`, el enlace pegado de antes. Desde la 0018 la foto se sube desde el
-- panel y ningún front la usa. Lo que tenía guardado (`https://ibb.co/SwGtxnsb`) era una página web, no una imagen.
-- Su constraint y su grant por columna se van con ella.

begin;

alter table public.quien_soy drop column foto_url;

commit;
