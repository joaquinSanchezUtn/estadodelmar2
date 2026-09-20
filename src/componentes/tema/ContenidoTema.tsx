import { AnimatePresence, motion } from 'motion/react'
import { revelar, transicionLayout } from '../../animaciones/movimiento'
import type { TemaVisible } from '../../datos/tipos'
import ContenidoAbierto from './ContenidoAbierto'
import ContenidoBloqueado from './ContenidoBloqueado'

// Lo que se muestra lo decide el dato recibido (acceso abierto o bloqueado), no la sesión.
// Al ganar acceso el vidrio se despeja y el contenido crece en su lugar: se siente como algo
// que se abre, no como otra pantalla. Los `layout` hacen que el alto cambie sin saltos; el
// contenido interno también lo lleva para no estirarse.
//
// SEGURIDAD: la vista abierta NO tiene animación de salida. Al perder el acceso, el contenido
// premium tiene que salir del DOM en el mismo instante; una salida animada lo dejaría en
// pantalla (y en el HTML) unos cientos de milisegundos de más.
export default function ContenidoTema({ tema }: { tema: TemaVisible }) {
  return (
    <motion.div layout transition={{ layout: transicionLayout }}>
      <AnimatePresence mode="wait" initial={false}>
        {tema.acceso === 'abierto' ? (
          <motion.div key="abierto" layout variants={revelar} initial="oculto" animate="visible">
            <ContenidoAbierto contenidos={tema.contenidos} />
          </motion.div>
        ) : (
          <motion.div key="bloqueado" layout variants={revelar} initial="oculto" animate="visible" exit="salida">
            <ContenidoBloqueado piezas={tema.piezas} estado={tema.estadoMar} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
