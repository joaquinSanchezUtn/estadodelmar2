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
- Todo control (campo, selector, chip, botón secundario, interruptor apagado) lleva un borde `bordeControl`, o `celesteBorde` en el botón secundario: pasan 3:1 contra blanco, nube y todas las burbujas (WCAG 1.4.11). `bordeAgua` y `bordeCielo` son solo para superficies decorativas (burbujas, tarjetas), nunca para reconocer un control.
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

- **Logo**: el emblema (la ola con el brote) que se ve en el encabezado (`LogoDelSitio.tsx`) sale del archivo que pasó Joaquin, un diseño hecho para una marca llamada «Marea Interior — Navegando la vida». Se usó **solo el dibujo circular**, recortado y sin el texto de ese nombre ni el fondo (que era un crema casi liso, sacado por color): el sitio sigue llamándose «Estado del mar» en todos lados. Si en realidad el proyecto va a rebautizarse «Marea Interior», eso hay que decidirlo aparte; no se tocó ningún texto por las dudas. El archivo vive en el bucket público de Storage (`publico/logo-estado-del-mar.webp`, WebP con transparencia) y se referencia por URL desde `src/lib/activos.ts`, no está en el repo. El bucket `publico` es de solo lectura para cualquiera; solo se escribe desde el panel de Supabase o una Edge Function con `service_role`.
- **Navegación en celular**: botón hamburguesa que abre un panel a pantalla completa, con cierre por Escape y por botón visible. A partir de `md:` los enlaces van en línea.
- **Todas las pantallas se construyen antes del backend** (mapa acordado con Joaquin, en 5 tandas: Acceso, Cuenta y suscripción, Contenido, Legales y soporte, Admin). Cada pantalla tiene sus estados (cargando, vacío, error, éxito, validación) y funciona contra datos simulados. Quedan fuera favoritos, historial, progreso, comentarios, chats, cuestionarios, newsletter y niveles.
- **Mapa de pantallas** (todas construidas, con sus estados y datos simulados): públicas `/`, `/ventanas` (búsqueda y filtro en la URL), `/estado/:id`, `/tema/:slug`, `/quien-soy`, `/terminos`, `/privacidad`, `/contacto`; acceso `/ingresar`, `/registrarme`, `/verificar-email`, `/recuperar`, `/nueva-contrasena`, `/auth/callback`, `/cuenta-eliminada`; con sesión `/mi-cuenta`, `/suscripcion/resultado`; admin `/admin`, `/admin/quien-soy`, `/admin/ventanas`, `/admin/ventanas/nueva|:slug`, `/admin/ventanas/:slug/contenidos/nuevo|:id`. Solo en desarrollo: `/dev/falla`. Las pantallas secundarias se cargan bajo demanda (`lazy` en `rutas.tsx`); la home, el catálogo, los estados, el tema e Ingresar van directas porque participan de la transición de la ventana.
- **"Quién soy"** (migraciones 0004 y 0005, `quien_soy`): una sola fila con los datos de la dueña — nombre, foto (por ahora un enlace `https://` que ella pega, no una subida real: no hay backend de imágenes todavía), una descripción libre y una lista de campos `{ etiqueta, valor }` que arma como quiera desde `/admin/quien-soy` (agregar, sacar, reordenar; todo se guarda junto, de un saque). Mismo patrón que `temas`: pública si `publicado` (arranca en `false`, como `temas`: la fila sembrada nace vacía, y una tabla pública mostrando nada apenas se corre la migración es peor que arrancar oculta), la RLS la deja ver siempre a la admin (para previsualizar aunque esté oculta) y el cliente nunca puede insertar ni borrar: no solo por los `grant` (que alguien podría agregar sin querer, como casi pasa acá), sino por un índice único sobre una expresión constante (`quien_soy_fila_unica`), que lo hace estructuralmente imposible.
  - **Lo que encontró la auditoría de 0004, corregido en 0005**: `alter default privileges ... revoke execute on functions` (0001) no cierra el `EXECUTE` de `PUBLIC` sobre una función nueva — sí funciona para tablas, no para funciones; toda función nueva necesita su propio `revoke` explícito (quedó anotado en el comentario de 0001). `campos_de_perfil_validos()` no tenía `set search_path = ''` (la única función del proyecto sin esa línea). El constraint de `campos` no rechazaba claves de más en cada elemento. `actualizado_en` la escribe un trigger, no el cliente.
- **La ventana que se abre** ahora también sale del catálogo y de la página de cada estado (`esListado` en `PaginasAnimadas`), con las mismas ida y vuelta sin desvío.
- **Reproductor propio** (`src/componentes/reproductor/`): la URL firmada se pide recién al dar reproducir, se renueva una vez ante un fallo, y al desmontarse suelta el medio. En desarrollo la URL es un audio de silencio generado en el navegador (`medioSimulado.ts`).
- **Ojos de buey**: el agua es el cielo con degradé y dos olas rellenas (`Relleno.tsx`), más altas cuanto más movido el mar del estado. El `Grano` (textura de papel al 4 %) cubre la página, y el encabezado es siempre un vidrio translúcido: borde y sombra aparecen al scrollear.
- **Acceso: ya es real (Supabase Auth), desde esta sesión.** El contrato sigue en `src/auth/tipos.ts` (`AccionesDeAcceso`/`AccionesDeCuenta`); `src/auth/accionesReales.ts` lo implementa contra `supabase.auth.*`, y `SesionContext` arma `usuario`/`rol`/`enRecuperacion` escuchando un único `onAuthStateChange` (ningún action actualiza ese estado a mano: cada uno ya cambia la sesión de Supabase, y eso es lo que dispara el evento). `flowType: 'pkce'` en `src/lib/supabase.ts`: los enlaces vuelven con `?code=`, no con el token en el hash. Las respuestas de registro y recuperación siguen siendo iguales exista o no el email (es el comportamiento por defecto de Supabase con "Confirm email" activo). Solo se vuelve a una ruta interna (`destinoSeguro`), y el email viaja por `location.state`, nunca por la URL.
  - **Google diferido**: `ingresarConGoogle()` devuelve `no-disponible`; `BotonGoogle` se ve deshabilitado y no intenta nada. Falta crear las credenciales en Google Cloud y cargarlas en *Authentication → Sign In / Providers* de Supabase.
  - **`eliminarCuenta()` devuelve `no-disponible`**: de verdad necesita una Edge Function con `service_role` que cancele en Mercado Pago, revoque sesiones y recién ahí borre (ver más abajo). El cliente no puede hacerlo solo.
  - **Primer admin**: se promueve a mano, una sola vez, desde el SQL Editor (instrucciones en el comentario de `0001_inicial.sql`): `update public.profiles set role = 'admin' where id = '<uuid de Authentication → Users>'`.
  - **Email de Supabase**: el proyecto nuevo manda correos con el servicio de prueba compartido de Supabase, con un límite muy bajo (se agota con pocos envíos seguidos). Para probar sin gastarlo, se crea una cuenta ya confirmada desde *Authentication → Users → Add user* (con "Auto confirm user" tildado). Antes de un lanzamiento real hace falta cargar un SMTP propio en *Authentication → Emails*.
  - **Contraseña mínima**: 8 caracteres, configurado en el proveedor Email de Supabase para que coincida con la validación del front.
  - **URL de retorno**: en *Authentication → URL Configuration → Redirect URLs* están `http://localhost:5173/auth/callback` y `https://estado-del-mar.vercel.app/auth/callback` (Site URL sigue en localhost: solo es el *fallback*, no afecta a ninguno de los dos).
- **Catálogo y panel: ya son reales (Supabase), desde esta sesión** — la Tanda de datos. `contenido.ts`/`admin.ts` consultan `temas`/`contenidos` directo; la visibilidad la deciden las RLS de la migración 0002 (`temas_catalogo_publico`/`temas_admin`, `contenidos_con_acceso`/`contenidos_admin`), no un chequeo de rol en el cliente. `src/datos/acceso.ts` expone `tengoAcceso()`/`esAdmin()`, dos envoltorios finos sobre `tiene_acceso()`/`es_admin()` (las mismas funciones de la base): son la única razón por la que el front todavía pregunta algo, para decidir la rama 'bloqueado' de un tema o mostrar un mensaje claro antes de intentar una escritura — la barrera real sigue siendo la base. `mock.ts` y `sesionSimulada.ts` (el puente `rolSimulado()`) ya no existen. `VITE_DATOS_DE_PRUEBA` dejó de controlar el catálogo: ahora solo gatea lo que sigue simulado (pago y suscripción de Mercado Pago, el contacto, el origen del medio de Bunny Stream), todo Edge Functions pendientes. Los ocho estados del mar pasaron de `mock.ts` a `src/datos/constantes.ts` (nunca fueron un dato de prueba). Consecuencia: recién ahora el catálogo depende de que haya contenido real cargado desde `/admin`; hasta que la dueña cargue algo, `/ventanas` sale vacío en cualquier build (antes lo llenaba el mock).
- **Mercado Pago: ya es real, desde esta sesión (la Tanda de Mercado Pago).** Cinco Edge Functions, todas con `withSupabase`: `iniciar-suscripcion` crea el `preapproval` en MP (sin `card_token_id`, así arma `init_point` en vez de cobrar directo) y guarda la fila en `iniciada`; `cancelar-suscripcion` pausa el preapproval (`status: "paused"`, nunca `"cancelled"`: eso es terminal en MP) y deja `acceso_hasta = proximo_cobro`; `reactivar-suscripcion` hace el UPDATE en la base primero —apoyado en el índice único de "una fila viva por persona" (migración 0006) como candado atómico— y recién si funciona llama a MP, revirtiendo la fila si MP falla; `cambiar-medio-de-pago` devuelve la URL del mismo checkout de MP (`/subscriptions/checkout?preapproval_id=...`), sin probar todavía contra un cambio de tarjeta real; `webhook-mercado-pago` valida `x-signature` (falla cerrado si falta el secreto), es idempotente (`eventos_mp`, el insert es el candado) y nunca confía en el body: siempre vuelve a pedirle el estado real a la API. Las cuatro funciones de usuario rechazan una sesión de recuperación de contraseña (`amr: recovery`) igual que `tiene_acceso()` en la base, porque usan `service_role` y no pasan por esa RLS. El precio sigue siendo `[PRECIO]` (variable `MP_PRECIO_ARS`, sin *fallback* a propósito: mejor que falle a que cobre un número viejo sin avisar). `src/datos/suscripcionSimulada.ts`, `SimularPago.tsx` y `ConmutadorDev.tsx` ya no existen.
  - **`en_gracia`** (cobro rebotado, 3 días de gracia) tiene pantalla propia (`SuscripcionEnGracia.tsx`, con botón para actualizar el medio de pago); ya no se confunde con `cancelada`.
  - **Migración 0006**: le puso fecha a `activa` (antes de esta sesión duraba para siempre) y sumó el índice único de "una fila viva por persona". **Migración 0007**: la auditoría de *verificación* encontró que el webhook no refrescaba `proximo_cobro` en una renovación mensual normal (solo lo hacía al pasar a `activa` la primera vez), así que con el tope que le puso la 0006 cualquier suscripción de más de un mes terminaba cortando el acceso sola. Se arregló en dos partes: `procesarCobro` ahora refresca `proximo_cobro` en todo cobro aprobado (no solo al recuperarse de `en_gracia`), y la 0007 le puso un tope de 35 días al caso `proximo_cobro is null` como red de contención del lado de la base.
  - **Todavía sin probar de punta a punta contra el sandbox real de Mercado Pago**: falta que Joaquin cargue `MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET` directo en Supabase (Edge Functions → Secrets; nunca en el chat) y configure el webhook en el panel de MP con la URL de `webhook-mercado-pago`. Hasta entonces quedan sin confirmar: el nombre exacto del parámetro que MP agrega al volver del checkout (`SuscripcionResultado.tsx` asume `preapproval_id`) y la forma de la respuesta de `GET /authorized_payments/{id}` (usada para detectar un cobro rebotado).
  - **Fuera de esta tanda, a propósito**: el "derecho de arrepentimiento" (cancelación con reintegro inmediato) no está implementado; hoy cancelar siempre extiende el acceso hasta `proximo_cobro`, nunca corta antes.
- **El frontend se construyó antes del backend**, con datos de prueba y sesión simulada; esa etapa ya terminó (ver arriba y "Acceso" más arriba). Todo el acceso a datos sigue pasando por `src/datos/contenido.ts`, ahora contra Supabase.

- **Burbujas y ojos de buey**: cada sección del sitio vive en una `Burbuja` (esquinas muy redondeadas, borde apenas visible, sombra difusa). Las ventanas son ojos de buey (`OjoDeBuey`): un `<a>` real con el dibujo de línea del estado del mar de adentro. Las de contenido pago se ven a través de un vidrio esmerilado (`VidrioEsmerilado`).
- **El vidrio esmerilado solo desenfoca un dibujo decorativo, nunca contenido premium real.** Poner texto, video o descripción de pago detrás de un blur es una fuga: el dato viaja igual al navegador. El contenido premium no existe en el HTML hasta que corresponde. Ver el comentario del componente.
- **Movimiento**: Motion (`motion/react`), y todo sale de `src/animaciones/movimiento.ts` (una curva, tres duraciones, variantes con nombre). Solo se anima `transform`, `opacity` y `filter`. Con `prefers-reduced-motion` no queda ningún bucle y la ventana no vuela (solo fundido). Los bucles infinitos y las decoraciones grandes no se cargan en celular.
- **La ventana que se abre** (la burbuja crece hasta ser la cabecera del tema): `layoutId` compartido en `src/componentes/layout/PaginasAnimadas.tsx`. Es frágil y está verificado en Chrome real (ida, vuelta, interrupción, entrada directa, producción). Antes de tocarlo, releer los comentarios de ese archivo. Lo que costó encontrar: `overflow-anchor: none` en el contenedor; no tocar el scroll durante la transición y aterrizar en un solo paso con `useInstantLayoutTransition`; memoizar el `LayoutGroup`; `popLayout` exige `ref` en el hijo directo; y no re-renderizar la pantalla a mitad de la transición.
- **Trampas de Motion**: `AnimatePresence initial={false}` apaga las animaciones de montaje de todos los descendientes, y los bucles saltan al último fotograma. Dentro de `AnimatePresence` los hijos no reciben `whileInView` del padre: cada uno se dispara solo. Una lista con `whileInView` que se llena con datos que llegan después tiene que montarse recién cuando llegan: si entra en pantalla mientras muestra esqueletos (monitores altos), queda "visible" sin hijos y los `motion.li` que aparecen después nacen ocultos para siempre.
- **Rendimiento del movimiento**: los dibujos de los estados (`DibujoEstado`) solo se mueven mientras están en pantalla (`useInView`): fuera de la vista no gastan procesador. Mientras una página se va (`data-pagina="sale"`) el pie se oculta al instante, porque al dejar de ocupar lugar saltaba a mitad de pantalla y se veía encima de la transición.
- **Tailwind**: al cambiar `tailwind.config.js` hay que reiniciar el servidor de desarrollo; si no, sirve un CSS viejo (las clases nuevas no existen).

## Pendientes de decisión

- El precio del plan mensual. En el prototipo y en el código figura como `[PRECIO]`, literal.

## Para respaldar en Supabase (salió de las auditorías de `seguridad`)

**Ya resuelto en la migración `0002_suscripciones_y_ajustes.sql`** (probada contra un Postgres real con 45 casos de permisos): tabla `suscripciones` con `acceso_hasta` y `tiene_acceso()` por fecha (con los 3 días de gracia como estado `en_gracia`), la policy de `contenidos` que exige ventana publicada, `bunny_video_id` movido a `archivos_contenido` (solo lo lee la dueña), `temas.piezas` mantenido por trigger, restricciones de formato y direcciones reservadas, tabla `eventos_mp` para la idempotencia del webhook, aceptación de términos fechada por el servidor y nombre editable con grant por columna. Lo que sigue en la lista de abajo y no está en esa migración (Edge Functions, rate limits, captcha, etc.) sigue pendiente.

Hoy son gates del front o decisiones de base todavía sin tomar. Ninguno se sostiene solo:

- **Auth**: verificación de email obligatoria; rate limiting de login, registro, recuperación y reenvío (la espera de 60 s del front es cosmética); captcha; mínimo de contraseña igual al del front (8) y chequeo contra HIBP; "secure password change" (reautenticación para cambiar la contraseña); invalidar las otras sesiones al cambiarla; `flowType: 'pkce'` y limpiar la URL tras el intercambio.
- **Recuperación**: `enRecuperacion` debe salir del evento `PASSWORD_RECOVERY` (nunca de la URL) y sobrevivir a una recarga (`sessionStorage`); no se arregla aflojando la condición.
- **Términos**: guardar la aceptación (fecha y versión) en `profiles`, escrita por el trigger.
- **`contenidos`**: `bunny_video_id` no puede ser legible por el cliente (grant por columna o tabla aparte que solo lea la Edge Function).
- **Piezas de la vista bloqueada** (`tipo` y `duracion_min` sin suscripción): desnormalizar en `temas` o exponer por una función; nunca aflojar la policy de `contenidos`.
- **Resuelto en las migraciones 0006 y 0007, y en las cinco Edge Functions de la Tanda de Mercado Pago** (ver el detalle en "Decisiones tomadas"): la tabla `suscripciones` (`preapproval_id` único, `estado`, `acceso_hasta`, `proximo_cobro`, `user_id`) reemplazó al booleano `suscripcion_activa`. `tiene_acceso()` compara la fecha en cada consulta (`activa` con `proximo_cobro` vigente + 3 días de gracia, o `cancelada`/`en_gracia` con `acceso_hasta` vigente), con un tope de 35 días para `proximo_cobro is null` (sin ese tope, la 0006 sola dejaba una suscripción sin fecha conocida con acceso indefinido). Las transiciones se validan en el servidor: `cancelar-suscripcion` exige `activa`; `reactivar-suscripcion` exige `cancelada` con período vigente y hace el UPDATE en la base antes de llamar a Mercado Pago (el índice único de "una fila viva por persona" es el candado atómico contra reactivar un preapproval viejo mientras ya existe uno nuevo).
- **Resuelto: el webhook de Mercado Pago** (`webhook-mercado-pago`), en el orden que decía este documento: valida `x-signature` (falla cerrado si falta el secreto, ventana de 5 minutos contra reproducción) antes de tocar la base; la reserva en `eventos_mp` es un `insert … on conflict do nothing`, atómica; según el tipo, vuelve a pedirle el estado real a la API antes de escribir; si el procesamiento falla, libera la reserva y responde distinto de 200 para que Mercado Pago reintente. Sin probar todavía contra un cobro rebotado real: la forma exacta de `GET /authorized_payments/{id}` no está confirmada.
- **Resultado del pago**: `/suscripcion/resultado` ya consulta el pago concreto (`preapproval_id` en la URL de retorno), no el estado general de la persona. Falta limpiar ese parámetro de la URL tras leerlo.
- **Eliminar cuenta**: una sola Edge Function, en este orden: cancelar la preapproval en Mercado Pago **incondicionalmente** (también una `vencida`, que puede estar pausada con reintentos), revocar todas las sesiones (`auth.admin.signOut(id, 'global')`; el JWT ya emitido sigue válido hasta una hora) y recién ahí borrar. La fila de suscripción se conserva con `user_id = null` para reconciliar webhooks tardíos. El front no promete la cancelación hasta que la función responde ok.
- **Resuelto en la migración 0003**: `tiene_acceso()` y `es_admin()` rechazan los JWT con `amr` de tipo `recovery` (función `sesion_de_recuperacion()`). Encontrado por la auditoría de la Tanda de datos: al conectar el catálogo a Supabase, el confinamiento de `SesionContext.tsx` había dejado de ser real (era solo lo que mostraba la interfaz) porque `contenido.ts` preguntaba `tiene_acceso()` directo a la base, sin pasar por ese confinamiento.
- **Datos que cambian sin que la persona haga nada** (el webhook marca `vencida` con una pestaña abierta): refetch al recuperar el foco, o Realtime sobre la suscripción. `actualizarPerfil` tiene que devolver el perfil que guardó el servidor.
- **Resuelto en la migración 0002 y ya en uso desde la Tanda de datos**: la policy `contenidos_con_acceso` exige ventana publicada además de pieza publicada, y `listarTemas()` filtra `publicado` en la consulta (no en el cliente). Sigue pendiente: la Edge Function que firma la URL de Bunny tiene que repetir esas mismas tres condiciones antes de firmar (pieza publicada, ventana publicada, `tiene_acceso()`) — la RLS de `contenidos` no alcanza para eso porque el id de Bunny vive en `archivos_contenido`, aparte.
- **Subida de archivos (panel)**: una Edge Function que verifica `es_admin()` emite la URL de subida a Bunny, atada a una pieza y con vencimiento corto, y **fija tipo y tamaño máximo en la propia llamada**; es ella la que escribe `bunny_video_id`. El cliente nunca dicta nombre, tamaño ni tipo MIME como verdad (hoy los manda el navegador).
- **Identificadores y direcciones**: ids opacos (`gen_random_uuid()`, que ya usa la migración), nunca derivados del slug; `check` en `temas.slug` con el mismo formato, largo máximo (60) y palabras reservadas (`nueva`, `nuevo`, `ventanas`, `contenidos`, `admin`).
- **Formulario de contacto**: Edge Function con rate limit por IP y por usuario, honeypot evaluado en el servidor (responde 200 igual), lista blanca del asunto, y `nombre`/`email`/`asunto` nunca interpolados en cabeceras de correo (rechazar `\r` y `\n`).
- **Reproductor**: la URL firmada devuelve su duración (`duracionSeg`) y no un instante absoluto. `init_point` de Mercado Pago validado en el servidor (solo mercadopago.com).
- **`VITE_DATOS_DE_PRUEBA`**: es un solo carácter entre un build limpio y uno con datos de prueba; nunca en un build que se publique de verdad. La auditoría de la Tanda de datos encontró que `vercel.json` lo prendía en **todos** los deploys de Vercel (producción incluida) desde que se armó el deploy inicial: se sacó de `vercel.json` y la variable del proyecto en Vercel quedó solo en el entorno "Development" (que ningún deploy real usa). Efecto concreto que tenía: `/suscripcion/simular-pago` no existe en producción (se compila solo con `import.meta.env.DEV`), así que con la bandera puesta ahí nadie podía llegar a pagar.

## Fuera de alcance por ahora

Múltiples niveles de membresía, comentarios, chats, cuestionarios, newsletters, perfil con historial y favoritos. Se decidió no hacerlos todavía.
