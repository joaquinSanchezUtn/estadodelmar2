# Estado del mar

Sitio de suscripción: un "gimnasio del alma". Contenido psicoeducativo, meditaciones y ejercitaciones prácticas organizados por temas emocionales. La dueña sube y edita todo el contenido desde un panel propio.

## Stack

- React + Vite + Tailwind
- Supabase: Postgres, Auth (Google + email), Storage, Edge Functions
- Mercado Pago: suscripción mensual recurrente (`preapproval`), plan único
- Bunny Stream: videos y audios, con URLs firmadas

## La metáfora marina

Es el sistema de navegación del sitio, no un adorno. El usuario ubica su estado y desde ahí llega al contenido:

| Estado del mar | Estado interno | Enseñanza |
|---|---|---|
| Mar en calma | Paz interior, serenidad, equilibrio | La mente clara ve la realidad con más objetividad |
| Olas suaves | Alegría, entusiasmo, curiosidad, tristeza pasajera | Las emociones son parte de la vida; se viven sin perder el equilibrio |
| Mar agitado | Estrés, preocupación, ansiedad, enojo, miedo | Reaccionar impulsivamente impide ver con claridad |
| Tormenta | Crisis, pérdidas, conflictos, grandes desafíos | Las tormentas no duran para siempre |
| Profundidades | El Ser profundo, la conciencia, la esencia | Aunque la superficie esté turbulenta, abajo reina el silencio |
| Mareas | Ciclos de energía, motivación, ánimo | Todo tiene ritmos; respetarlos favorece el bienestar |
| Corrientes | Creencias, hábitos, condicionamientos | Influyen en nuestra dirección sin que lo notemos |
| Horizonte | Propósito, sentido de vida, trascendencia | Mirar el horizonte evita quedar atrapado en la ola del momento |

Idea central: *no somos las olas, somos el océano*. Las prácticas no eliminan las tormentas; fortalecen la capacidad de permanecer en la profundidad mientras las olas pasan.

Tono: sereno, cálido, adulto. Sin jerga de autoayuda, sin promesas, sin urgencia comercial.

## Sistema visual

Claro y suave en todo el sitio, con celestes y tonos blancos como el mar. Nada de fondos oscuros ni de saturación alta. Lo que da profundidad es el **rango de valores dentro del registro claro**: el fondo de página es un gris azulado claro, las burbujas blancas flotan por ser más claras, y las tintadas por estar más saturadas.

Tipografías (Google Fonts): **Fraunces** para títulos, **Karla** para texto.

Los tokens viven en `tailwind.config.js` (`mar.*` y `estado.*`); ahí están los valores y su porqué. Reglas duras, validadas por cálculo:
- Dos burbujas contiguas nunca están a menos de 6 puntos de luminosidad (HSL) entre sí, y ninguna burbuja a menos de 5 puntos del fondo de página.
- Todo texto pasa 4.5:1 sobre la superficie que lo lleva, incluidas las ocho tarjetas de estado. `tinta` es el texto principal, `tintaSuave` el secundario y `tintaTenue` el más suave; el botón primario es `celeste` con borde `celesteBorde` y texto `tintaBoton`; los enlaces son `agua`. Nunca texto claro sobre `celeste`.
- Cada uno de los ocho estados tiene su matiz (`estado.calma`, `estado.olasSuaves`, `estado.agitado`, `estado.tormenta`, `estado.profundidades`, `estado.mareas`, `estado.corrientes`, `estado.horizonte`), con cinco roles: `fondo`, `agua`, `linea`, `aro` y `aroClaro`. Tailwind no arma clases dinámicas: se usan desde el mapa `src/componentes/objetos/estados/colores.ts`.
- El agua de un ojo de buey va siempre tintada con el color del estado, nunca blanca. Las sombras tienen que verse.

## La escala

Todo tamaño sale de `tailwind.config.js`; el componente no inventa medidas. `npm run escala` recorre `src/` y falla ante cualquier valor suelto (`text-[15px]`, `rounded-xl`, `z-[60]`, `p-1.5`, `min-h-[44px]`…). Correrlo antes de cerrar cualquier cambio visual. Una excepción puntual se marca con un comentario `escala-ok: <motivo>` en la misma línea.

- **Tipografía** (8 niveles, con interlineado incluido): `text-etiqueta` (12, con `uppercase`), `text-meta` (14), `text-cuerpo` (16), `text-destacado` (18), `text-titulo-s` (20), `text-titulo-m` (24), `text-titulo-l` (32), `text-titulo-xl` (fluido 40→56: el h1 de portada, el de cabecera de tema y el precio). El cuerpo nunca baja de 16px. Títulos en Fraunces (`font-titulo`), `font-light` desde `titulo-l`.
- **Espaciado**: múltiplos de 4px (clases 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24). Sin medios pasos (`.5`).
- **Radios**: `rounded-control` (12, campos), `rounded-tarjeta` (16), `rounded-burbuja` (28), `rounded-burbujaGrande` (40) y `rounded-full` (pastillas y círculos). Bordes: `border` (1px), `border-2` y `border-3` (aro de los ojos de buey).
- **Controles**: `min-h-control` (48px, estándar) y `min-h-control-sm` (44px, mínimo táctil); `size-12` / `size-16` para el botón de reproducir (`BotonReproducir`). Tres variantes de botón, todas pastilla: primario (peso 700), secundario y fantasma (500). Todo lo que tenga que verse como botón usa `Boton` o `clasesBoton()`; no se arma a mano.
- **Barras de scroll**: finas y del color del mar, definidas una sola vez en `index.css` (`scrollbar-width`, `scrollbar-color`, `scrollbar-gutter: stable`). No se estilan barras en componentes.
- **Anchos**: toda página va dentro de `<Pagina ancho="angosto|lectura|ancho">` (448, 768 y 1152px con el respiro incluido; la burbuja mide 48px menos). `max-w-parrafo` (672) limita una línea de texto corrido, `max-w-ojo` (168) el ojo de buey. El encabezado y el pie alinean su texto con el de las burbujas (`px-4 md:px-16`). Nunca `max-w-3xl` ni similares.
- **Capas**: `z-encabezado` (40), `z-menu` (50), `z-flotante` (60).
- **Sombras**: solo las de `boxShadow` (`burbuja`, `tarjeta`, `ojo`, `ojoFoco`, `ventana`, `elevada`, `encabezado`).
- Al sumar un token nuevo a la config, agregarlo también a `src/lib/cn.ts`: si no, `twMerge` lo confunde con un color y lo pisa.

## Contenido

Cada **ventana** es un tema (Ansiedad, Desilusión, Control, Sentido de la vida, Crianza, Pareja, Armonía familiar, Desapego, Miedos… la lista crece). Una ventana contiene video psicoeducativo, meditación y ejercitación para poner en práctica.

Los títulos de las ventanas son **públicos** (el menú lo ve cualquiera); el contenido de adentro es **premium**.

## Reglas que no se negocian

1. El rol de admin vive en `profiles.role`, protegido por RLS. Nadie puede escribirlo desde el cliente.
2. Toda tabla de contenido premium tiene RLS activo. Ninguna policy usa `USING (true)`.
3. Las URLs de video se firman en Edge Functions, con vencimiento corto, previa verificación de suscripción activa.
4. Los webhooks de Mercado Pago validan firma y consultan la API por el estado real. Son idempotentes.
5. Ningún secreto en variables `VITE_*`. Solo la anon key es pública.
6. Mobile first. Funciona en celular, tablet y escritorio.

## Convenciones

- Comentarios y textos de interfaz en español (voseo argentino en la interfaz).
- Componentes chicos, un propósito por archivo, menos de 150 líneas.
- Complejidad mínima necesaria: nada de abstracciones para casos que todavía no existen.
- El esqueleto y las decisiones de arquitectura se consensúan con Joaquin antes de implementarlas.

## Agentes

- `seguridad` — audita auth, RLS, roles y acceso premium. Correlo antes de cerrar cualquier tarea que toque esos temas.
- `frontend` — pantallas y componentes React + Tailwind.
- `integraciones` — Mercado Pago y Bunny Stream, siempre del lado del servidor.

## Decisiones tomadas

- **Navegación en celular**: botón hamburguesa que abre un panel a pantalla completa, con cierre por Escape y por botón visible. A partir de `md:` los enlaces van en línea.
- **Todas las pantallas se construyen antes del backend** (mapa acordado con Joaquin, en 5 tandas: Acceso, Cuenta y suscripción, Contenido, Legales y soporte, Admin). Cada pantalla tiene sus estados (cargando, vacío, error, éxito, validación) y funciona contra datos simulados. Quedan fuera favoritos, historial, progreso, comentarios, chats, cuestionarios, newsletter y niveles.
- **Suscripción simulada** (`src/datos/suscripcionSimulada.ts` + las funciones de `contenido.ts`): cinco estados (`activa`, `cancelada` con acceso hasta fin de período, `pendiente`, `vencida`, `administradora`) y `accesoDe()` decide cuáles dan acceso (equivale a `tiene_acceso()`). El pago es una pantalla externa (Mercado Pago): en desarrollo la reemplaza `/suscripcion/simular-pago`, que no existe en producción. `/suscripcion/resultado` usa `?estado=` solo como pista de texto y consulta el servidor: la URL nunca da acceso. En desarrollo, el conmutador de la esquina recorre los cinco estados. Las acciones simuladas fallan en producción (`sinBackend`) y su código no entra al bundle.
- **Mapa de pantallas** (todas construidas, con sus estados y datos simulados): públicas `/`, `/ventanas` (búsqueda y filtro en la URL), `/estado/:id`, `/tema/:slug`, `/terminos`, `/privacidad`, `/contacto`; acceso `/ingresar`, `/registrarme`, `/verificar-email`, `/recuperar`, `/nueva-contrasena`, `/auth/callback`, `/cuenta-eliminada`; con sesión `/mi-cuenta`, `/suscripcion/resultado`; admin `/admin`, `/admin/ventanas`, `/admin/ventanas/nueva|:slug`, `/admin/ventanas/:slug/contenidos/nuevo|:id`. Solo en desarrollo: `/suscripcion/simular-pago`, `/dev/falla`. Las pantallas secundarias se cargan bajo demanda (`lazy` en `rutas.tsx`); la home, el catálogo, los estados, el tema e Ingresar van directas porque participan de la transición de la ventana.
- **La ventana que se abre** ahora también sale del catálogo y de la página de cada estado (`esListado` en `PaginasAnimadas`), con las mismas ida y vuelta sin desvío.
- **Reproductor propio** (`src/componentes/reproductor/`): la URL firmada se pide recién al dar reproducir, se renueva una vez ante un fallo, y al desmontarse suelta el medio. En desarrollo la URL es un audio de silencio generado en el navegador (`medioSimulado.ts`).
- **Ojos de buey**: el agua es el cielo con degradé y dos olas rellenas (`Relleno.tsx`), más altas cuanto más movido el mar del estado. El `Grano` (textura de papel al 4 %) cubre la página, y el encabezado es siempre un vidrio translúcido: borde y sombra aparecen al scrollear.
- **Acceso simulado**: el contrato está en `src/auth/tipos.ts` (`AccionesDeAcceso`) y lo implementa `SesionContext`; en desarrollo lo respalda `src/auth/accionesSimuladas.ts` + `src/datos/cuentasSimuladas.ts` (cuentas de ejemplo, contraseña `mar12345`), y en producción todo responde `no-disponible`. Al entrar Supabase Auth cambia solo esa implementación. Las respuestas de registro y recuperación son iguales exista o no el email. Solo se vuelve a una ruta interna (`destinoSeguro`), y el email viaja por `location.state`, nunca por la URL.
- **El frontend se construye antes del backend**, con datos de prueba y sesión simulada. Todo el acceso a datos pasa por `src/datos/contenido.ts`, que después se reemplaza por consultas a Supabase sin tocar componentes.

- **Burbujas y ojos de buey**: cada sección del sitio vive en una `Burbuja` (esquinas muy redondeadas, borde apenas visible, sombra difusa). Las ventanas son ojos de buey (`OjoDeBuey`): un `<a>` real con el dibujo de línea del estado del mar de adentro. Las de contenido pago se ven a través de un vidrio esmerilado (`VidrioEsmerilado`).
- **El vidrio esmerilado solo desenfoca un dibujo decorativo, nunca contenido premium real.** Poner texto, video o descripción de pago detrás de un blur es una fuga: el dato viaja igual al navegador. El contenido premium no existe en el HTML hasta que corresponde. Ver el comentario del componente.
- **Movimiento**: Motion (`motion/react`), y todo sale de `src/animaciones/movimiento.ts` (una curva, tres duraciones, variantes con nombre). Solo se anima `transform`, `opacity` y `filter`. Con `prefers-reduced-motion` no queda ningún bucle y la ventana no vuela (solo fundido). Los bucles infinitos y las decoraciones grandes no se cargan en celular.
- **La ventana que se abre** (la burbuja crece hasta ser la cabecera del tema): `layoutId` compartido en `src/componentes/layout/PaginasAnimadas.tsx`. Es frágil y está verificado en Chrome real (ida, vuelta, interrupción, entrada directa, producción). Antes de tocarlo, releer los comentarios de ese archivo. Lo que costó encontrar: `overflow-anchor: none` en el contenedor; no tocar el scroll durante la transición y aterrizar en un solo paso con `useInstantLayoutTransition`; memoizar el `LayoutGroup`; `popLayout` exige `ref` en el hijo directo; y no re-renderizar la pantalla a mitad de la transición.
- **Trampas de Motion**: `AnimatePresence initial={false}` apaga las animaciones de montaje de todos los descendientes, y los bucles saltan al último fotograma. Dentro de `AnimatePresence` los hijos no reciben `whileInView` del padre: cada uno se dispara solo. Una lista con `whileInView` que se llena con datos que llegan después tiene que montarse recién cuando llegan: si entra en pantalla mientras muestra esqueletos (monitores altos), queda "visible" sin hijos y los `motion.li` que aparecen después nacen ocultos para siempre.
- **Tailwind**: al cambiar `tailwind.config.js` hay que reiniciar el servidor de desarrollo; si no, sirve un CSS viejo (las clases nuevas no existen).

## Pendientes de decisión

- El precio del plan mensual. En el prototipo y en el código figura como `[PRECIO]`, literal.

## Para respaldar en Supabase (salió de las auditorías de `seguridad`)

Hoy son gates del front o decisiones de base todavía sin tomar. Ninguno se sostiene solo:

- **Auth**: verificación de email obligatoria; rate limiting de login, registro, recuperación y reenvío (la espera de 60 s del front es cosmética); captcha; mínimo de contraseña igual al del front (8) y chequeo contra HIBP; "secure password change" (reautenticación para cambiar la contraseña); invalidar las otras sesiones al cambiarla; `flowType: 'pkce'` y limpiar la URL tras el intercambio.
- **Recuperación**: `enRecuperacion` debe salir del evento `PASSWORD_RECOVERY` (nunca de la URL) y sobrevivir a una recarga (`sessionStorage`); no se arregla aflojando la condición.
- **Términos**: guardar la aceptación (fecha y versión) en `profiles`, escrita por el trigger.
- **`contenidos`**: `bunny_video_id` no puede ser legible por el cliente (grant por columna o tabla aparte que solo lea la Edge Function).
- **Piezas de la vista bloqueada** (`tipo` y `duracion_min` sin suscripción): desnormalizar en `temas` o exponer por una función; nunca aflojar la policy de `contenidos`.
- **Suscripción y acceso**: una tabla `suscripciones` (`preapproval_id` único, `estado`, `acceso_hasta`, `user_id`) en lugar del booleano `suscripcion_activa`, que no puede representar «cancelada con acceso hasta X». `tiene_acceso()` compara la fecha en cada consulta (`cancelada` y `acceso_hasta >= current_date`): Mercado Pago no avisa cuando termina el período, así que ningún webhook lo va a cortar. Las transiciones se validan en el servidor: cancelar exige `activa`; reactivar exige `cancelada` con período vigente.
- **Webhook de Mercado Pago**, en este orden: (1) validar `x-signature` (HMAC-SHA256 sobre `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` con `timingSafeEqual`, y `ts` reciente) y cortar con 401 si no valida, antes de tocar la base; (2) del cuerpo tomar solo el id y consultar el estado real con `GET /preapproval/{id}`; (3) idempotencia con una tabla `eventos_mp` (`insert … on conflict do nothing`) y descartar eventos viejos por `last_modified`; (4) responder 200 siempre que la firma sea válida.
- **Resultado del pago**: `/suscripcion/resultado` ya consulta el pago concreto (`preapproval_id` en la URL de retorno), no el estado general de la persona. Falta limpiar ese parámetro de la URL tras leerlo.
- **Eliminar cuenta**: una sola Edge Function, en este orden: cancelar la preapproval en Mercado Pago **incondicionalmente** (también una `vencida`, que puede estar pausada con reintentos), revocar todas las sesiones (`auth.admin.signOut(id, 'global')`; el JWT ya emitido sigue válido hasta una hora) y recién ahí borrar. La fila de suscripción se conserva con `user_id = null` para reconciliar webhooks tardíos. El front no promete la cancelación hasta que la función responde ok.
- **Sesión de recuperación**: en Supabase es una sesión plena; el confinamiento del front no existe en la base. O `tiene_acceso()` rechaza los JWT con `amr = recovery`, o se quita la promesa.
- **Datos que cambian sin que la persona haga nada** (el webhook marca `vencida` con una pestaña abierta): refetch al recuperar el foco, o Realtime sobre la suscripción. `actualizarPerfil` tiene que devolver el perfil que guardó el servidor.
- **Contenido de ventanas en borrador**: la policy `contenidos_con_acceso` mira `contenidos.publicado` pero no `temas.publicado`; tiene que exigir también `exists (select 1 from temas t where t.id = tema_id and t.publicado)`. La Edge Function que firma la URL de Bunny repite tres condiciones antes de firmar: pieza publicada, ventana publicada y `tiene_acceso()`.
- **Subida de archivos (panel)**: una Edge Function que verifica `es_admin()` emite la URL de subida a Bunny, atada a una pieza y con vencimiento corto, y **fija tipo y tamaño máximo en la propia llamada**; es ella la que escribe `bunny_video_id`. El cliente nunca dicta nombre, tamaño ni tipo MIME como verdad (hoy los manda el navegador).
- **Identificadores y direcciones**: ids opacos (`gen_random_uuid()`, que ya usa la migración), nunca derivados del slug; `check` en `temas.slug` con el mismo formato, largo máximo (60) y palabras reservadas (`nueva`, `nuevo`, `ventanas`, `contenidos`, `admin`).
- **Formulario de contacto**: Edge Function con rate limit por IP y por usuario, honeypot evaluado en el servidor (responde 200 igual), lista blanca del asunto, y `nombre`/`email`/`asunto` nunca interpolados en cabeceras de correo (rechazar `\r` y `\n`).
- **Reproductor**: la URL firmada devuelve su duración (`duracionSeg`) y no un instante absoluto. `init_point` de Mercado Pago validado en el servidor (solo mercadopago.com). `obtenerEstadoDelPago` filtra por `user_id`. `listarTemas` filtra `publicado` en la consulta, no en el cliente.
- **`VITE_DATOS_DE_PRUEBA`**: es un solo carácter entre un build limpio y uno con datos de prueba; nunca en un build que se publique de verdad.

## Fuera de alcance por ahora

Múltiples niveles de membresía, comentarios, chats, cuestionarios, newsletters, perfil con historial y favoritos. Se decidió no hacerlos todavía.
