# Frontend completo — instrucciones para Claude Code

El frontend se construye **sin base de datos y sin autenticación real**. Todo sale de datos de prueba y de un estado de sesión simulado. Eso es a propósito: así se puede ver y corregir cada pantalla antes de conectar Supabase, y la conexión posterior toca un solo archivo en lugar de veinte.

Son tres tandas. **Cada una es una sesión nueva de Claude Code.** Al terminar una, cerrás la sesión y abrís otra: `CLAUDE.md` se relee solo y las sesiones cortas gastan mucho menos.

Requisito: el esqueleto del paso 2 de `PROMPT-CLAUDE-CODE.md` ya tiene que estar hecho.

## Cómo usar este archivo

En cada tanda, abrí `claude` en `~/Developer/estado-del-mar` y pegá una línea:

> Leé `CLAUDE.md` y `PROMPT-FRONTEND.md`, y hacé la **tanda 1**. Mostrame los archivos que vas a crear antes de escribirlos.

---

# La idea visual: burbujas sobre el mar

El fondo de la página es marfil continuo, con objetos decorativos suaves flotando detrás. **Cada sección vive dentro de una burbuja**: una tarjeta grande de esquinas muy redondeadas, con su propio tono de fondo, un borde apenas visible y una sombra difusa que la despega del fondo. Entre burbujas hay aire. Nada de secciones a sangre completa pegadas una a otra.

Esa es la metáfora traducida a interfaz: el contenido flota, respira, y el movimiento es lento y orgánico como agua — nunca brusco ni publicitario.

## Librerías a instalar

- **`motion`** — Motion para React (antes Framer Motion), de motion.dev. Es la base de todo el movimiento del sitio. Se importa desde `motion/react`. Consultá su documentación vigente antes de escribir: la API cambió de nombre y hay guías desactualizadas dando vueltas.
- **`clsx`** y **`tailwind-merge`** — para combinar clases condicionales sin pisarse. Armá un helper `cn()` en `src/lib/cn.ts`.

**No instales una librería de scroll suave** (Lenis, Locomotive y parecidas). Pelean con el scroll nativo del trackpad, rompen el `Ctrl+F` del navegador y confunden a quien usa teclado. El sitio se siente fluido por las animaciones de entrada, no por secuestrar el scroll. Si igual lo querés, decímelo y lo agrego, pero no lo pongas por tu cuenta.

Nada más. Sin librerías de componentes, sin librerías de íconos, sin state manager.

---

# El sistema de movimiento

Definilo **una sola vez** en `src/animaciones/movimiento.ts` y usalo en todo el sitio desde ahí. Ningún componente escribe sus propias curvas ni duraciones sueltas: si un valor se repite en dos archivos, va al sistema.

## Curvas y tiempos

Una sola curva de salida para todo: `[0.22, 1, 0.36, 1]` — arranca rápido y se asienta despacio, que es como se mueve el agua. Para lo que rebota levemente (paneles, aparición de contenido desbloqueado), un resorte suave: `{ type: 'spring', stiffness: 260, damping: 28 }`.

Tres duraciones y ninguna más: **rápida 180ms** (hover, press), **media 420ms** (entradas, transiciones de ruta), **lenta 700ms** (entradas grandes, héroe).

## Las animaciones con nombre

Exportá cada una como variante reutilizable. Estos son los nombres; usalos tal cual en el código:

**`emerger`** — la entrada base de toda burbuja y toda tarjeta: de `opacity: 0, y: 24, scale: 0.98` a su estado natural, duración media. Se dispara al entrar en pantalla con `whileInView`, `viewport={{ once: true, margin: '-80px' }}`.

**`cascada`** — contenedor que escalona a sus hijos con `staggerChildren: 0.07`. Se usa en las grillas de estados y de ventanas, y en los enlaces del panel móvil. El escalonado total nunca pasa de 600ms: con nueve tarjetas, bajá el stagger, no alargues la espera.

**`flotar`** — movimiento infinito y mínimo para los objetos decorativos: `y` de -6 a 6, entre 6 y 9 segundos, `repeat: Infinity, repeatType: 'reverse'`. Cada objeto arranca con un desfase distinto para que no latan todos juntos.

**`marea`** — deriva horizontal muy lenta para las olas SVG: 24 segundos, lineal, infinita. Dos capas de ola a velocidades distintas dan sensación de profundidad.

**`elevar`** — hover de tarjeta o burbuja clickeable: `y: -4`, sombra más abierta, duración rápida.

**`presionar`** — `whileTap: { scale: 0.98 }` en todo lo clickeable. Es lo que hace que el sitio se sienta sólido al tacto.

**`abrirPanel`** — el panel del menú móvil entra con el resorte suave desde arriba, y sus enlaces entran en `cascada` detrás.

**`revelar`** — la transición de contenido bloqueado a desbloqueado: `AnimatePresence` con `mode: 'wait'`, la fila con candado se desvanece y la abierta crece en su lugar. Usá animación de `layout` para que el alto cambie sin saltos.

**`transicionDeRuta`** — al cambiar de página, salida `opacity: 0, y: -8` y entrada `opacity: 0, y: 8` → natural, duración media. Envolvé las rutas en `AnimatePresence` con la key en el `pathname`.

## Las tres reglas que no se rompen

**1. `prefers-reduced-motion` manda.** Leé `useReducedMotion()` de `motion/react` en el sistema y, cuando esté activo, devolvé variantes sin desplazamiento ni escala: solo un fundido corto o nada. Todas las animaciones infinitas se detienen. Esto no es opcional ni un extra: para algunas personas el movimiento causa mareo real, y este es un sitio sobre calma.

**2. Solo `transform`, `opacity` y `filter`.** Nunca animes `width`, `height`, `top`, `left`, `margin` ni `padding` a mano — cuando el alto tenga que cambiar, usá la animación de `layout` de Motion. `will-change` solo donde haga falta y nunca en un elemento infinito.

**3. La animación nunca se interpone.** El contenido del héroe se ve al instante, sin esperar scroll ni entrada. Ningún `delay` de la primera pantalla pasa de 150ms. Nada queda invisible si la animación falla. Nada tarda más de lo que el usuario tarda en querer hacer clic.

---

# Los objetos decorativos

Van en `src/componentes/objetos/`, todos SVG inline propios, todos con `aria-hidden="true"` y `pointer-events-none`. Sin imágenes externas, sin emoji, sin gradientes de arcoíris.

**`Olas`** — dos o tres capas de curva suave en tonos de `aguaClara` y `espuma`, animadas con `marea`. Se usan en el borde de las burbujas grandes y detrás del héroe.

**`Manchas`** — círculos muy difusos (`blur` alto, opacidad baja) en arena y agua, detrás de las burbujas, animados con `flotar`. Dos o tres por pantalla como máximo: son atmósfera, no decoración.

**`Burbujitas`** — pocos círculos chicos de contorno fino que suben lentamente. Solo en el héroe y en el bloque de suscripción.

**El objeto más importante: los ocho estados del mar.** Cada estado lleva su propio dibujo de línea, y el dibujo *dice* el estado:

| Estado | Dibujo |
|---|---|
| Mar en calma | una línea horizontal casi recta |
| Olas suaves | una onda baja y regular |
| Mar agitado | ondas cortas y desparejas |
| Tormenta | picos altos y quebrados |
| Profundidades | líneas horizontales que se aclaran hacia abajo |
| Mareas | dos curvas iguales desfasadas |
| Corrientes | líneas de flujo con una flecha suave |
| El horizonte | una línea recta con un círculo bajo apoyado encima |

Cada uno respira con una animación propia y muy contenida: la calma casi no se mueve, la tormenta se agita algo más. Al pasar el mouse por la tarjeta, el dibujo se anima un poco más fuerte. Esto es lo que va a hacer que la home se sienta viva y que la metáfora se entienda sin leer una palabra.

---

# Tanda 1 — Base, sistema visual, movimiento y datos simulados

## 1. Tailwind

Colores `mar.*` y fuentes según `CLAUDE.md` (Fraunces títulos, Karla texto), con el `<link>` de Google Fonts en `index.html`. Agregá al `theme.extend`: radios `burbuja: '28px'` y `burbujaGrande: '40px'`, y una sombra `burbuja: '0 2px 40px -12px rgba(44, 68, 77, 0.14)'`.

## 2. El sistema de movimiento

`src/animaciones/movimiento.ts` con todo lo de la sección anterior: curvas, duraciones, las nueve variantes con nombre, y el manejo de `prefers-reduced-motion`. Este archivo se escribe antes que cualquier componente.

## 3. Capa de datos

`src/datos/tipos.ts` — `EstadoMar`, `Tema`, `Contenido`, con los campos del modelo de `CLAUDE.md`.

`src/datos/mock.ts` — los ocho estados (estado interno y enseñanza, copiados de la tabla de `CLAUDE.md`) y ocho o nueve temas con sus tres contenidos cada uno. Textos creíbles, en el tono del proyecto: sereno, adulto, sin jerga de autoayuda. Arriba: `// DATOS DE PRUEBA — se borra cuando entra Supabase.`

`src/datos/contenido.ts` — la única puerta a los datos. Funciones `async` que hoy leen del mock con un retardo mínimo simulado y mañana se vuelven consultas a Supabase sin tocar componentes:

```ts
listarEstados()
listarTemas()        // catálogo público: título, slug, estado, descripción
obtenerTema(slug)    // el tema con sus contenidos, o null
```

Ningún componente importa `mock.ts`. Todos pasan por `contenido.ts`.

## 4. Sesión simulada

`src/auth/SesionContext.tsx` — la forma que va a tener la sesión real: `{ usuario, rol, accesoActivo, cargando }`, con roles `visitante`, `suscriptora` y `admin`.

`src/auth/ConmutadorDev.tsx` — botón chico fijo abajo a la derecha para cambiar de rol y revisar todas las pantallas sin backend. Envuelto en `if (import.meta.env.DEV)`, con el comentario `// SOLO DESARROLLO — se borra cuando entra Supabase Auth.`

## 5. Componentes base

En `src/componentes/base/`:

**`Burbuja`** — el componente que define el sitio. Recibe un tono (`marfil`, `arenaClara`, `aguaClara`, `espuma`, `blanco`), padding generoso, `rounded-burbuja md:rounded-burbujaGrande`, borde de 1px del tono correspondiente, `shadow-burbuja`, y entra con `emerger` al aparecer en pantalla. Acepta hijos y un objeto decorativo opcional de fondo.

**`Tarjeta`** — burbuja chica. Cuando es clickeable, aplica `elevar` en hover y `presionar` al tocar, y se renderiza como `<a>`, nunca como `div`.

`Boton` (primario / secundario / fantasma, todos con `presionar`), `Sello` (etiquetas Publicada / Borrador), `Candado`, `Campo` (input con su `<label>` real), y `iconos.tsx` con los SVG de trazo inline.

## 6. Layout

`Encabezado.tsx` — logo a la izquierda, navegación a la derecha. **En celular, botón hamburguesa que abre un panel a pantalla completa** con `abrirPanel`; los enlaces entran en `cascada`. Se cierra con Escape, con un botón visible, y al navegar; el foco queda atrapado dentro mientras está abierto y vuelve al botón al cerrar. El botón lleva `aria-label` y `aria-expanded`. Desde `md:` los enlaces van en línea y la hamburguesa desaparece. Al scrollear, el encabezado gana un fondo translúcido con `backdrop-blur` y una sombra mínima — animado, sin saltos.

`PieDePagina.tsx` y `Layout.tsx` (encabezado + contenido + pie), con el `AnimatePresence` de `transicionDeRuta` envolviendo las rutas.

## 7. Los objetos

Todo lo de la sección de objetos decorativos, incluidos los ocho dibujos de estado del mar con su animación propia.

Al terminar la tanda 1, mostrame el árbol de archivos y decime qué quedó pendiente. No arranques la tanda 2.

---

# Tanda 2 — El sitio público

La referencia de estructura y paleta está en el canvas "Estado del mar — prototipo" de la galería de artifacts. Seguí su contenido y su orden, pero **el prototipo es estático y plano: acá cada sección pasa a ser una burbuja y todo entra con movimiento.** No copies el layout a sangre completa.

## `/` — Home

Cada punto es su propia burbuja, separadas por aire:

1. **Héroe** — "No somos las olas. Somos el océano.", el párrafo de entrada, dos botones. Burbuja grande en `aguaClara` con `Olas` y `Burbujitas` de fondo. **Visible al instante**, sin entrada por scroll: solo un fundido corto del texto escalonado.
2. **¿Cómo está tu mar hoy?** — los ocho estados en tarjetas, cada una con su dibujo animado. Una columna en celular, dos en tablet, cuatro en escritorio. Grilla en `cascada`.
3. **Las ventanas** — el catálogo de temas: etiqueta del estado arriba, título, descripción y candado. Los títulos se ven siempre, incluso para visitantes. Burbuja en `arenaClara`, grilla en `cascada`.
4. **La propuesta** — qué incluye cada ventana (video, meditación, ejercitación). Tres piezas con su ícono, en `cascada`.
5. **Suscripción** — el plan mensual. El precio va como `[PRECIO]`, literal, hasta que se defina. Burbuja en `espuma`, con `Manchas` de fondo.

## `/tema/:slug` — Ventana temática

Título, etiqueta del estado y descripción son públicos siempre, en una burbuja de cabecera con el dibujo del estado en grande al costado. Debajo, según el rol:

- **Visitante o sin acceso** — las tres piezas listadas con candado y duración, sin abrirse, y una burbuja que invita a suscribirse.
- **Con acceso** — el video con reproductor de reemplazo (recuadro con botón de play, sin integrar Bunny todavía), la meditación, y la ejercitación con su texto y un área de notas.

**El cambio entre ambos estados usa `revelar`**: al conmutar el rol en desarrollo, el candado se desvanece y el contenido crece en su lugar, sin recargar ni saltar. Es la transición más importante del sitio — que se sienta como algo que se abre, no como una pantalla distinta.

Un slug inexistente muestra un estado vacío amable con un enlace de vuelta, no un error.

## `/ingresar`

Burbuja centrada y angosta. Botón de Google con su logo, arriba y destacado; separador; campos de email y contraseña. Enlaces a crear cuenta y recuperar contraseña. Los `<input>` llevan `type`, `autoComplete` y `<label>` asociado, y el foco se marca con un anillo visible. El `onSubmit` solo previene el envío.

También una pantalla 404 dentro del layout, con un objeto decorativo y un enlace de vuelta.

Al terminar, mostrame qué archivos creaste y qué quedó pendiente. No arranques la tanda 3.

---

# Tanda 3 — Área de miembros y panel de admin

## `/mi-cuenta`

Burbujas apiladas: los datos de la persona, el estado de la suscripción con la fecha del próximo cobro, y la baja. El botón de baja abre una confirmación **en la misma página**, animada con el resorte suave — nunca un `confirm()` del navegador, que bloquea todo y se ve ajeno. La baja todavía no hace nada.

## `/admin`

Solo visible con rol `admin`. Dos columnas en escritorio, apiladas en celular:

- **Listado de ventanas** con buscador, estado del mar, cantidad de contenidos y sello de publicada o borrador. Al filtrar, las filas entran y salen con `AnimatePresence` — sin parpadeos.
- **Editor de la ventana seleccionada**: título, slug, estado del mar (`<select>` con los ocho), descripción pública, lista de contenidos con tipo y duración, zona de arrastre de archivos con su botón alternativo, interruptor de "visible en el sitio", y botones de vista previa y guardar. Al cambiar de ventana seleccionada, el editor hace una transición corta, no un salto.

La zona de arrastre responde visualmente al `dragover` con un cambio de borde y una escala mínima. Nada guarda nada todavía: estado local y punto.

## Rutas protegidas

`RutaConSesion` y `RutaDeAdmin`, que leen el contexto y redirigen si no corresponde. **Comentario obligatorio en ambos**: son solo experiencia de usuario; la protección real vive en las políticas RLS de la base.

---

# Lo que aplica a las tres tandas

**Mobile first.** Clases base para celular, después `sm:` `md:` `lg:`. Revisá cada pantalla a 375, 768 y 1440. Sin scroll horizontal en ningún ancho — cuidado especial con los objetos decorativos, que son lo primero que lo rompe: recortalos con `overflow-hidden` en su contenedor. Áreas táctiles de 44px. Cuerpo de texto de 16px o más.

**En celular, menos movimiento.** Las animaciones infinitas se reducen a una o dos por pantalla, y los objetos decorativos grandes no se cargan. Un celular de gama media tiene que ir fluido.

**Accesibilidad real.** `<button>` para acciones, `<a href>` para navegar, nunca un `div` con `onClick`. Todo input con su `<label>`. Botones de solo ícono con `aria-label`. El foco del teclado siempre visible. Los objetos decorativos con `aria-hidden`.

**Lo que no hay que hacer:** instalar librerías fuera de las tres indicadas; escribir CSS fuera de Tailwind; integrar Supabase, Mercado Pago o Bunny; inventar el precio; textos en inglés en la interfaz; animar propiedades de layout a mano; abstracciones para casos que todavía no existen.

**Cuando la tanda esté lista**, corré `npm run build` para confirmar que compila, y decime en pocas líneas qué archivos creaste y qué quedó pendiente. No pegues el código completo en la respuesta.

---

# Qué viene después

Con el frontend terminado, la fase siguiente es Supabase: el esquema con RLS y el login con Google. El trabajo va a ser reemplazar el cuerpo de las funciones de `src/datos/contenido.ts` por consultas reales, cambiar `SesionContext` por la sesión de Supabase Auth, y borrar `mock.ts` y `ConmutadorDev.tsx`. Si durante estas tres tandas algún componente terminó importando datos de prueba por su cuenta, esa fase se vuelve el triple de larga — por eso la regla de que todo pase por `contenido.ts`.

---

Referencia de la librería de movimiento: [Motion for React — instalación](https://motion.dev/docs/react-installation) · [Motion for React — guía](https://motion.dev/docs/react)
