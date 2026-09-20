# Frontend completo — instrucciones para Claude Code

El frontend se construye **sin base de datos y sin autenticación real**. Todo sale de datos de prueba y de un estado de sesión simulado. Eso es a propósito: así se puede ver y corregir cada pantalla antes de conectar Supabase, y la conexión posterior toca un solo archivo en lugar de veinte.

Son tres tandas. **Cada una es una sesión nueva de Claude Code.** Al terminar una, cerrás la sesión y abrís otra para la siguiente: `CLAUDE.md` se relee solo y las sesiones cortas gastan mucho menos.

Requisito: el esqueleto del paso 2 de `PROMPT-CLAUDE-CODE.md` ya tiene que estar hecho.

---

## Cómo usar este archivo

En cada tanda, abrí `claude` en `~/Developer/estado-del-mar` y pegá una línea:

> Leé `CLAUDE.md` y `PROMPT-FRONTEND.md`, y hacé la **tanda 1**. Mostrame los archivos que vas a crear antes de escribirlos.

Después la tanda 2, y después la tanda 3.

---

## La regla que ordena todo

El frontend nunca decide quién ve qué. Hoy lee un estado simulado y mañana leerá Supabase, pero **en ningún momento el gate real vive acá**: cuando el backend esté conectado, los datos premium simplemente no llegarán al navegador si no corresponde. Ocultar contenido en la interfaz es cortesía visual, no seguridad.

Por eso todo lo simulado va concentrado en dos carpetas y está marcado para borrar. Ningún componente importa datos de prueba directamente.

---

# Tanda 1 — Base, sistema visual y datos simulados

## 1. Tailwind

En `tailwind.config.js`, cargá los colores `mar.*` y las fuentes tal como están definidos en `CLAUDE.md` (Fraunces para títulos, Karla para texto). Sumá las fuentes de Google en `index.html` con un solo `<link>`.

## 2. Capa de datos

`src/datos/tipos.ts` — los tipos `EstadoMar`, `Tema` y `Contenido`, con los mismos campos que el modelo de datos de `CLAUDE.md`.

`src/datos/mock.ts` — los ocho estados del mar (con su estado interno y su enseñanza, copiados de la tabla de `CLAUDE.md`) y ocho o nueve temas de ejemplo, cada uno con sus tres contenidos. Textos creíbles y en el tono del proyecto: sereno, adulto, sin jerga de autoayuda. Arriba del archivo, un comentario: `// DATOS DE PRUEBA — se borra cuando entra Supabase.`

`src/datos/contenido.ts` — la única puerta de entrada a los datos. Funciones `async` que hoy devuelven cosas del mock con un retardo mínimo simulado, y que mañana se reemplazan por consultas a Supabase sin tocar ningún componente:

```ts
listarEstados()
listarTemas()            // catálogo público: título, slug, estado, descripción
obtenerTema(slug)        // el tema con sus contenidos, o null
```

Ningún componente importa `mock.ts`. Todos pasan por `contenido.ts`.

## 3. Sesión simulada

`src/auth/SesionContext.tsx` — un contexto con la forma que va a tener la sesión real: `{ usuario, rol, accesoActivo, cargando }`. Los roles posibles son `visitante`, `suscriptora` y `admin`.

`src/auth/ConmutadorDev.tsx` — un botón chico, fijo abajo a la derecha, que cambia entre los tres roles. Sirve para revisar todas las pantallas sin backend. Tiene que estar envuelto en `if (import.meta.env.DEV)` para que no exista en producción, y llevar el comentario `// SOLO DESARROLLO — se borra cuando entra Supabase Auth.`

## 4. Componentes base

En `src/componentes/base/`, chicos y sin lógica de negocio: `Boton` (variantes primario / secundario / fantasma), `Tarjeta`, `Sello` (las etiquetas tipo "Publicada" / "Borrador"), `Candado` (el ícono de contenido bloqueado), `Campo` (input con su `<label>` de verdad).

Los íconos son SVG inline con trazo, en su propio archivo `src/componentes/base/iconos.tsx`. Sin librerías de íconos y sin emoji.

## 5. Layout

`src/componentes/layout/Encabezado.tsx` — logo a la izquierda, navegación a la derecha. **En celular, un botón hamburguesa que abre un panel a pantalla completa** con los enlaces y el acceso a la cuenta; se cierra con la tecla Escape, con un botón de cerrar visible, y al navegar. El botón lleva `aria-label` y `aria-expanded`. A partir de `md:` se muestran los enlaces en línea y la hamburguesa desaparece.

`src/componentes/layout/PieDePagina.tsx` y `src/componentes/layout/Layout.tsx` (encabezado + contenido + pie).

Al terminar la tanda 1, mostrame el árbol de archivos y decime qué quedó pendiente. No arranques la tanda 2.

---

# Tanda 2 — El sitio público

Tres pantallas. La referencia visual está en el canvas "Estado del mar — prototipo" de la galería de artifacts; seguí su estructura y su paleta, no hace falta que sea idéntico píxel por píxel.

## `/` — Home

En este orden:

1. **Hero** — "No somos las olas. Somos el océano.", el párrafo de entrada, y dos botones (ver las ventanas, cómo funciona).
2. **¿Cómo está tu mar hoy?** — los ocho estados en tarjetas. Una columna en celular, dos en tablet, cuatro en escritorio. Cada tarjeta es un enlace real.
3. **Las ventanas** — el catálogo de temas, con el estado del mar como etiqueta arriba, el título, la descripción y un candado. Los títulos se ven siempre, aunque el usuario sea visitante.
4. **La propuesta** — sección corta que explica qué incluye cada ventana (video, meditación, ejercitación).
5. **Suscripción** — el plan mensual. El precio va como `[PRECIO]`, literal, hasta que se defina.

## `/tema/:slug` — Ventana temática

El título, la etiqueta del estado y la descripción son públicos siempre. Debajo, lo que se muestra depende del rol:

- **Visitante o sin acceso**: las tres piezas de contenido listadas con candado y su duración, sin poder abrirse, y abajo un bloque que invita a suscribirse.
- **Con acceso**: el video con un reproductor de reemplazo (un recuadro con botón de play, sin integrar Bunny todavía), la meditación, y la ejercitación con su texto y un área de notas.

Un slug que no existe muestra un estado vacío amable con un enlace de vuelta, no un error.

## `/ingresar`

Formulario visual, sin lógica: botón de Google (con el logo, arriba y destacado), separador, y campos de email y contraseña. Enlaces a crear cuenta y recuperar contraseña. Los `<input>` llevan `type`, `autoComplete` y su `<label>` asociado. El `onSubmit` no hace nada todavía más que prevenir el envío.

También una pantalla 404 dentro del layout.

Al terminar, mostrame qué archivos creaste y qué quedó pendiente. No arranques la tanda 3.

---

# Tanda 3 — Área de miembros y panel de admin

## `/mi-cuenta`

Los datos de la persona (nombre, email), el estado de su suscripción con la fecha del próximo cobro, y un botón para darse de baja que abre una confirmación en la misma página — **nunca un `confirm()` del navegador**. La baja todavía no hace nada.

## `/admin`

Solo visible cuando el rol simulado es `admin`. Dos columnas en escritorio, una sola apilada en celular:

- **Listado de ventanas** con buscador, el estado del mar, la cantidad de contenidos y el sello de publicada o borrador.
- **Editor de la ventana seleccionada**: título, slug, estado del mar (un `<select>` con los ocho), descripción pública, la lista de contenidos con su tipo y duración, una zona para arrastrar archivos con su botón alternativo de elegir archivo, un interruptor de "visible en el sitio", y los botones de vista previa y guardar.

Nada guarda nada todavía: los formularios mantienen su estado local y punto.

## Rutas protegidas

`RutaConSesion` y `RutaDeAdmin`, que leen el contexto y redirigen si no corresponde. **Comentario obligatorio en ambos**: son solo experiencia de usuario; la protección real vive en las políticas RLS de la base.

---

# Lo que aplica a las tres tandas

**Mobile first.** Clases base para celular, después `sm:` `md:` `lg:`. Revisá cada pantalla a 375, 768 y 1440. Sin scroll horizontal en ningún ancho. Áreas táctiles de 44px mínimo. Texto de cuerpo de 16px o más.

**Accesibilidad real, no decorativa.** `<button>` para acciones y `<a href>` para navegar — nunca un `div` con `onClick`. Todo input con su `<label>`. Los botones de solo ícono llevan `aria-label`. El foco del teclado se ve.

**Lo que no hay que hacer:** instalar librerías de componentes, de íconos o de estado; escribir CSS fuera de Tailwind; integrar Supabase, Mercado Pago o Bunny; inventar el precio; poner textos en inglés en la interfaz; crear abstracciones para casos que todavía no existen.

**Cuando la tanda esté lista**, corré `npm run build` para confirmar que compila, y decime en pocas líneas qué archivos creaste y qué quedó pendiente. No pegues el código completo en la respuesta.

---

# Qué viene después

Con el frontend terminado, la fase siguiente es Supabase: el esquema con RLS y el login con Google. El trabajo ahí es reemplazar el cuerpo de las funciones de `src/datos/contenido.ts` por consultas reales, cambiar `SesionContext` por la sesión de Supabase Auth, y borrar `mock.ts` y `ConmutadorDev.tsx`. Si durante estas tres tandas algún componente terminó importando datos de prueba por su cuenta, esa fase se vuelve el triple de larga — por eso la regla de que todo pase por `contenido.ts`.
