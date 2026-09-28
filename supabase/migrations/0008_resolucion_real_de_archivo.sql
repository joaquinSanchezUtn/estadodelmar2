-- Migración 0008: `firmar-video-bunny` tenía una resolución fija (`RESOLUCION = "720p"`) para armar el
-- nombre del archivo que le pide a Bunny (`play_720p.mp4`). Bunny nunca genera un rendition MAYOR a la
-- resolución original del video subido: una pieza grabada en menos de 720p (un celular viejo, un
-- reencuadre vertical) queda sin ese archivo, y la URL firmada le devuelve un 403 silencioso a toda
-- suscriptora que intente reproducirla. Encontrado al probar una subida real de punta a punta (Tanda de
-- los videos), no en la auditoría original — ahí no había forma de notarlo sin un archivo real de bajo
-- lado.
--
-- La solución: `guardar-archivo-bunny` ya vuelve a preguntarle a Bunny por el video al guardarlo (para
-- confirmar `status === 4`); ahora también guarda qué resoluciones confirmó terminadas
-- (`availableResolutions`, un string de Bunny como "360p,720p,1080p") y `firmar-video-bunny` arma la URL
-- con la mejor real, nunca con un número supuesto.

begin;

alter table public.archivos_contenido add column resolucion text not null default '720p';
-- El default es solo para no romper la migración si ya hubiera filas (hoy no las hay, fuera de las de
-- prueba): de acá en más, la única escritora (`guardar-archivo-bunny`) siempre manda un valor real, así
-- que un default fijo después de este punto reintroduciría el mismo bug en silencio.
alter table public.archivos_contenido alter column resolucion drop default;

comment on column public.archivos_contenido.resolucion is
  'La resolución MP4 fallback más alta que Bunny confirmó terminada para este video (por ejemplo "720p"), calculada de `availableResolutions` en guardar-archivo-bunny. Nunca un valor fijo supuesto: firmar-video-bunny la usa tal cual para armar play_{resolucion}.mp4.';

commit;
