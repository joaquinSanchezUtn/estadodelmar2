-- Aceptación de términos para quien entra con Google.
--
-- Al registrarse con email, `crear_perfil` (0002) fecha la aceptación con `acepta_terminos` de la
-- metadata del registro. Con Google no hay formulario: el botón avisa "Al continuar con Google aceptás
-- los Términos y la Política de privacidad", pero `terminos_aceptados_en` quedaba en null. Esta función
-- la llama el front al volver de Google (`/auth/callback?tipo=google`) y la fecha la pone el servidor,
-- nunca el cliente. Solo escribe la primera vez y solo el perfil propio.

create or replace function public.aceptar_terminos()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
     set terminos_aceptados_en = now()
   where id = (select auth.uid())
     and terminos_aceptados_en is null
     and not public.sesion_de_recuperacion();
$$;

-- `alter default privileges` no cierra el EXECUTE de PUBLIC sobre funciones nuevas (ver 0001/0005).
revoke execute on function public.aceptar_terminos() from public, anon;
grant execute on function public.aceptar_terminos() to authenticated;
