# Auditoría contra el pedido de la dueña — 2026-09-30

Solo diagnóstico: no se corrigió nada. Evidencia sacada del código (`main`, commit `c1aaa9b`), de la base real (consultas con la anon key, sin sesión) y del panel en producción.

**Estado de la base al momento de auditar:**
- Las 8 ventanas de la carga masiva todavía se estaban subiendo.
- Hay 5 ventanas: "Usted no es su mente" (publicada, con su pieza de video en borrador), "Ser proactivo", "Plan de vida", "El dolor" y "Fortalecer el espíritu" (esta última con la pieza todavía sin archivo). Cada una tiene **solo una pieza de video**. No hay ninguna meditación ni ninguna ejercitación cargada.

## 1. Tabla de los 25 puntos

| # | Requisito | Estado | Evidencia |
|---|---|---|---|
| 1 | Sensación de "ventanas que dan a otro lugar" | CUMPLIDO | `src/componentes/ventana/OjoDeBuey.tsx:23` (cada ventana es un ojo de buey con el mar de su estado), `src/componentes/layout/PaginasAnimadas.tsx` (la ventana se abre y crece hasta ser la cabecera del tema). Se interpretó como ojo de buey, no como cámara en vivo: no hay imagen real ni "en vivo". |
| 2 | Videos psicoeducativos para suscriptoras | CUMPLIDO | `src/datos/tipos.ts:22` (tipo `video`), `src/componentes/tema/VideoContenido.tsx`, `supabase/functions/firmar-video-bunny/index.ts` (firma solo con `tiene_acceso()`). Se probó en producción: subir, guardar y reproducir. |
| 3 | Ventana **propia** de meditaciones | AUSENTE | La meditación existe solo como un tipo de pieza dentro de cada tema (`tipos.ts:22`, `0001_inicial.sql:51`). No hay ninguna ruta ni sección de meditaciones (`src/rutas.tsx:44-73`). |
| 4 | Una ejercitación por cada problemática | PARCIAL | La estructura existe: tipo `ejercitacion`, texto con consigna (`EjercitacionContenido.tsx:6`) y editor en el panel. Pero no está cargada ninguna, y nada exige que cada ventana tenga la suya. La portada promete "una ejercitación práctica por cada malestar" (`home/PlanMensual.tsx`) y "cada ventana reúne un video, una meditación y una ejercitación" (`home/Ventanas.tsx:21`): hoy eso no es cierto para ninguna ventana. |
| 5 | Los 9 temas nombrados | AUSENTE (0 de 9) | No existe ninguno de: Ansiedad, Desilusión, Control, Sentido de la vida, Crianza de hijos, Pareja, Armonía familiar, Miedos. "Desapego" está en la carga masiva en curso, en borrador y con un solo video. En el código solo aparecen como texto de ejemplo del buscador (`CatalogoVentanas.tsx:51`, `AdminVentanas.tsx:45`). |
| 6 | Temas filosóficos, transpersonales, espirituales | AUSENTE | No hay categoría ni etiqueta: una ventana solo tiene `estado_mar` (`0001_inicial.sql:36`). "Profundidades" y "Horizonte" rozan esa idea desde la metáfora, pero no la resuelven. No se encontraron las palabras "filosófico", "transpersonal" ni "espiritual" en el sitio. |
| 7 | Sumar temas sin tocar código | CUMPLIDO | `src/datos/admin.ts` (`guardarTemaAdmin`, crear y editar ventanas), `pages/AdminEditorVentana.tsx`. Se usó hoy para crear ventanas. |
| 8 | Un solo nivel, abono mensual | CUMPLIDO | `supabase/functions/iniciar-suscripcion/index.ts:62` (`frequency: 1, frequency_type: "months"`, un solo precio en `MP_PRECIO_ARS`). |
| 9 | Pago desde Argentina **y** desde otros países | PARCIAL / sin verificar | Solo Mercado Pago, en pesos (`iniciar-suscripcion/index.ts:62`, `currency_id: "ARS"`). No hay evidencia de que una suscripción de MP Argentina acepte a alguien de otro país, y no hay una segunda plataforma. |
| 10 | Alta y baja automáticas según el pago | PARCIAL | El código está completo: el webhook valida la firma, es idempotente y consulta a la API (`webhook-mercado-pago/index.ts:152,174,229`), y `tiene_acceso()` mira la fecha (`0007_tope_proximo_cobro_nulo.sql:15`). `MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET` están cargados desde el 25/9 (CLAUDE.md dice que no; está desactualizado). Pero **nunca se probó un cobro real ni en sandbox**, no se sabe si el webhook está configurado en el panel de MP, y la forma de `GET /authorized_payments/{id}` no está confirmada. |
| 11 | Inscribirse y desinscribirse cuando quieran | PARCIAL | Cancelar y reactivar existen (`cuenta/SuscripcionActiva.tsx`, `cancelar-suscripcion/index.ts:54`, que pausa y deja acceso hasta el próximo cobro). Suscribirse depende del punto 10, que no está probado. "Eliminar mi cuenta" devuelve `no-disponible` (`src/auth/accionesReales.ts:102`). |
| 12 | Panel propio para subir y modificar | CUMPLIDO | `/admin/*` (`rutas.tsx:64-72`): ventanas, piezas (video, audio y consigna), orden, publicar y "Quién soy". Límites: la foto de "Quién soy" es un enlace, no una subida; los textos de la portada y de los 8 estados no se pueden editar desde el panel. |
| 13 | Menú público, contenido para suscriptoras | CUMPLIDO | Los títulos se ven sin sesión: `temas` tiene grant a anon (`0001_inicial.sql:129`) y los datos públicos de cada pieza viajan en `temas.piezas` (`0002:127`). El contenido está detrás de `contenidos_con_acceso` (`0002:179`). |
| 14 | Perfil con historial y favoritos | FUERA DE ALCANCE | No hay código. Las palabras "historial" que aparecen en `EjercitacionContenido.tsx`, `SuscripcionResultado.tsx` y `accionesReales.ts` se refieren al historial del navegador, no a una función del sitio. |
| 15 | Comentarios, chats, cuestionarios | FUERA DE ALCANCE | No hay código ni tablas. |
| 16 | Emails de bienvenida y newsletter | FUERA DE ALCANCE | No hay código. Los únicos correos son los de Supabase Auth (verificación y recuperación). |
| 17 | 8 estados × 3 campos, en datos y en pantalla | CUMPLIDO | Datos: `src/datos/constantes.ts:5-53`. En pantalla: `home/TarjetaEstado.tsx:21-22` (estado interno y enseñanza), `pages/PaginaDeEstado.tsx:52-53` y `tema/CabeceraTema.tsx:66` (enseñanza). |
| 18 | "El problema no son las olas, sino creer que somos las olas" | PARCIAL | Aparece la idea, pero no la frase: `home/Portada.tsx:43-45` dice "No somos las olas. Somos el océano." La frase del documento no está en ningún lado. |
| 19 | Metáfora larga "La mente es como la superficie del mar…" | AUSENTE | No aparece en el código ni en el repo. Tampoco está el texto original: hay que pedírselo. |
| 20 | Gimnasio del alma: meditación, respiración, autoconocimiento, servicio | PARCIAL | "Gimnasio del alma" está en `Portada.tsx:37`. Solo la meditación tiene lugar (como pieza). "Respiración", "autoconocimiento" y "servicio" (en ese sentido) no aparecen. |
| 21 | Login con Google y con email | PARCIAL | Email: real (`accionesReales.ts:28`). Google: `ingresarConGoogle()` devuelve `no-disponible` (`accionesReales.ts:35`) y el botón está deshabilitado. Faltan las credenciales en Google Cloud. |
| 22 | El rol admin no se obtiene desde el cliente | CUMPLIDO | `profiles.role` solo admite `user`/`admin` (`0001:25`), el cliente solo tiene `select` (`0001:126`) y `update (nombre)` (`0002:112`). Las funciones Edge verifican `profiles.role` con service_role. |
| 23 | Premium no llega a quien no pagó | CUMPLIDO (sin sesión) / por código (con sesión) | **Probado de verdad** con la anon key, sin sesión: `contenidos`, `archivos_contenido`, `profiles`, `suscripciones` y `eventos_mp` responden 401 "permission denied"; `tiene_acceso()`/`es_admin()` también; `firmar-video-bunny` da 401. `temas` devuelve solo la ventana publicada. **No se probó** una sesión sin suscripción (no hay cuenta de prueba de ese tipo): para ese caso la evidencia es la policy `contenidos_con_acceso` (`0002:179`) más `tiene_acceso()`. |
| 24 | Celular, tablet y escritorio | Sin verificar en esta auditoría | El código es mobile first: clases `md:`, menú hamburguesa (`layout/MenuMovil.tsx:20`) y `npm run escala`. El redimensionado de Chrome no se aplicó, así que no se pudo ver a 390 px. A escritorio no hay scroll horizontal. |
| 25 | Ningún secreto en `VITE_*` | CUMPLIDO | Solo `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_DATOS_DE_PRUEBA` (`.env.example`, `src/lib/supabase.ts:3-4`, `src/datos/base.ts:9`). Las claves de MP y Bunny son secrets de Supabase. |

## 2. Huecos, de más grave a menos grave
Gravedad es cuánto se aleja de lo que ella pidió.

**1. El sitio promete un contenido que hoy no tiene (puntos 3, 4, 5 y 6).**
- **Qué pidió:** temas concretos (9 nombrados y otros filosóficos y transpersonales), cada uno con video, meditación y ejercitación, y una ventana propia de meditaciones.
- **Qué hay:** 8 ventanas de otros temas ("Ser proactivo", "Plan de vida", "El dolor"…), cada una con un solo video. Ninguna meditación, ninguna ejercitación, ninguna categoría, ninguna sección de meditaciones. La portada igual promete "video, meditación y ejercitación" en cada ventana.
- **Qué falta:**
  - Cargar el contenido: es trabajo de ella, el sistema ya lo permite.
  - Decidir cómo se muestra una ventana incompleta.
  - Construir la ventana de meditaciones y la dimensión "filosófico / transpersonal".
- **Trabajo estimado:** el contenido, fuera de nuestras manos. La ventana de meditaciones (una ruta que liste todas las meditaciones publicadas, más el enlace en el menú): alrededor de 1 día. Una categoría o etiqueta (columna, panel y filtro): 1 a 2 días.

**2. El cobro no está probado y no se sabe si sirve fuera de Argentina (puntos 9, 10 y 11).**
- **Qué pidió:** que se pueda pagar desde Argentina y desde otros países, con alta y baja automáticas.
- **Qué hay:** Mercado Pago en pesos, con el código completo y las claves cargadas, sin un solo cobro probado. Desde el 30/9 el sitio publicado usa este flujo real: si algo falla, falla con suscriptoras reales.
- **Qué falta:**
  - Una prueba de punta a punta en el sandbox de MP.
  - Confirmar que el webhook esté configurado.
  - Investigar si MP deja suscribirse desde el exterior; si no, sumar una segunda plataforma.
  - Hacer real "Eliminar mi cuenta".
- **Trabajo estimado:** prueba en sandbox, medio día. Investigación del pago internacional, medio día. Segunda plataforma (por ejemplo Stripe o PayPal), 3 a 5 días, porque duplica el webhook y el modelo de suscripción. Eliminar la cuenta, 1 día.

**3. El "gimnasio del alma" tiene una sola de sus cuatro prácticas (punto 20).**
- **Qué pidió:** meditación, respiración, autoconocimiento y servicio.
- **Qué hay:** solo la meditación.
- **Qué falta:** decidir si cada práctica es un tipo de pieza, una sección o solo un texto. Según lo que se decida, puede ser desde un párrafo hasta 2 o 3 días de trabajo.

**4. El texto más fuerte del documento no está (puntos 18 y 19).**
- **Qué pidió:** la enseñanza central y la metáfora larga.
- **Qué hay:** una paráfrasis en la portada. La metáfora larga no aparece.
- **Qué falta:** el texto original, que no está en el repo, y decidir dónde va (la portada o una página "La metáfora").
- **Trabajo estimado:** unas horas, una vez que esté el texto.

**5. Falta el login con Google (punto 21).** Es solo configuración: crear las credenciales en Google Cloud y cargarlas en Supabase. Una hora.

**6. Dos pantallas rotas en producción que no estaban en la lista.**
- **Contacto:** `enviarMensajeDeContacto` llama a `sinBackend()` en todo build publicado (`src/datos/contenido.ts:174-175`), así que el formulario de `/contacto` falla para cualquiera. Arreglarlo es 1 día: una función Edge con límite de envíos, trampa para bots y correo.
- **Eliminar mi cuenta:** está en `/mi-cuenta` pero no hace nada (ver hueco 2).

**7. El celular no se verificó en esta tanda (punto 24).** Es de riesgo bajo, porque el diseño se construyó mobile first, pero hay que mirarlo en un teléfono de verdad.

## 3. Mejoras propuestas

1. **Avisar en el panel qué ventanas están incompletas** (sin meditación o sin ejercitación). La portada promete las tres piezas, y así la dueña ve qué le falta cargar.
2. **Que los textos de la portada y de los 8 estados se editen desde el panel.** Ella quiere no depender de un programador, y hoy cambiar una frase de la metáfora exige tocar código.
3. **Una descripción pública por ventana.** Las 8 ventanas cargadas no tienen descripción, y es lo único que ve alguien sin suscripción antes de decidir si paga.
4. **Conectar Vercel con GitHub** (o documentar bien el deploy manual). Hasta hoy, el sitio publicado estaba congelado en el 22/9 sin que nadie lo notara.
5. **Subir la foto de "Quién soy" desde el panel**, en vez de pegar un enlace. Es la única parte del panel que todavía le pide algo técnico.

## 4. Decisiones pendientes con ustedes

1. **Meditaciones:** ¿una ventana propia que reúna todas, una pieza dentro de cada tema (como está hoy), o las dos cosas?
2. **Lo filosófico, transpersonal y espiritual:** ¿una categoría nueva que cruce con los estados del mar, o alcanza con Profundidades y Horizonte?
3. **Pago desde el exterior:** ¿se investiga MP internacional, se suma una segunda plataforma, o por ahora se lanza solo para Argentina?
4. **Respiración, autoconocimiento y servicio:** ¿son tipos de pieza, secciones o parte del texto de presentación?
5. **La metáfora larga y la enseñanza central:** hace falta que la dueña pase el texto exacto, y decidir dónde va.
6. **El nombre:** apareció "Navegando" (el estado que no existe) y el logo dice «Marea Interior — Navegando la vida». ¿Se rebautiza el sitio? Afecta el nombre, los textos y posiblemente un noveno estado.
7. **El precio final:** el sitio publicado muestra $ 9.999, tomado de `MP_PRECIO_ARS`. ¿Es el definitivo?
8. **Ventanas incompletas publicadas:** ¿se puede publicar una ventana que solo tiene video, o se espera a tener las tres piezas? Hoy "Usted no es su mente" está publicada con su video en borrador, así que se ve vacía.
