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

Claro y suave en todo el sitio. Nada de fondos oscuros ni de saturación alta: la calma se transmite con luz, aire y contraste bajo pero legible.

Tipografías (Google Fonts): **Fraunces** para títulos, **Karla** para texto.

En `tailwind.config.js`, bajo `theme.extend.colors`:

```js
mar: {
  marfil:      '#FBFAF6',  // fondo general
  arenaClara:  '#F6F1E8',  // sección cálida
  aguaClara:   '#F1F5F4',  // sección fría
  espuma:      '#EEF4F3',  // bloque destacado frío
  blanco:      '#FFFFFF',  // tarjetas
  bordeArena:  '#E3DFD3',
  bordeAgua:   '#DCE7E4',
  tinta:       '#2C444D',  // texto principal
  tintaSuave:  '#556E77',  // texto secundario
  tintaTenue:  '#6B8188',  // pies, metadatos
  arena:       '#D9A461',  // botón primario (texto #2A3E45)
  arenaOscura: '#A8703A',  // texto sobre claro
  agua:        '#3B7B72',  // enlaces y acentos
  aguaSuave:   '#8FBDB4',  // bordes de cita, íconos
}
```

Reglas: el texto principal es siempre `tinta` sobre fondos claros; el botón primario es `arena` con texto `#2A3E45`; los enlaces son `agua`. Nunca poner texto claro sobre `arena`, ni usar `tintaTenue` en texto menor a 14px.

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
- **El frontend se construye antes del backend**, con datos de prueba y sesión simulada. Todo el acceso a datos pasa por `src/datos/contenido.ts`, que después se reemplaza por consultas a Supabase sin tocar componentes.

## Pendientes de decisión

- El precio del plan mensual. En el prototipo y en el código figura como `[PRECIO]`, literal.

## Fuera de alcance por ahora

Múltiples niveles de membresía, comentarios, chats, cuestionarios, newsletters, perfil con historial y favoritos. Se decidió no hacerlos todavía.
