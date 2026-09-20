import { motion } from 'motion/react'
import { transicion } from '../../animaciones/movimiento'
import type { EstadoMarId } from '../../datos/tipos'
import DibujoEstado from '../objetos/DibujoEstado'

// ─────────────────────────────────────────────────────────────────────────────
// ATENCIÓN — SEGURIDAD. NO "MEJORAR" ESTE COMPONENTE.
//
// Lo que se ve borroso acá es SIEMPRE un dibujo decorativo (el agua de la ventana), nunca
// contenido premium real. Jamás se debe poner texto, video, descripción o cualquier dato de
// pago con un filtro de blur encima: ese dato viajaría igual al navegador, y se lee quitando
// una línea de CSS desde la consola.
//
// El contenido premium NO EXISTE en el HTML hasta que corresponde (la base no lo entrega sin
// suscripción activa). El desenfoque es un efecto estético; la protección la da que el dato
// no esté.
//
// Por eso este componente NO acepta `children`: dibuja él mismo el sustituto decorativo a
// partir del estado del mar. Así no hay forma de pasarle contenido real, ni por error. Si
// alguien quiere una "vista previa difuminada" del contenido real, la respuesta es no.
// ─────────────────────────────────────────────────────────────────────────────

// Reposo y enfoque llegan del padre (variantes 'reposo' / 'enfocar'); en la vista bloqueada
// que se abre, 'salida' despeja el vidrio del todo.
// El efecto de vidrio empañado lo da sobre todo la capa translúcida de arriba; el desenfoque
// es apenas un velo, para que el dibujo del agua siga viéndose y reconociéndose. El tinte
// se apaga un poco (saturate) y al enfocar el vidrio se aclara: da ganas de entrar.
const vidrio = {
  reposo: { filter: 'blur(1.6px) saturate(0.72)', opacity: 1 },
  enfocar: { filter: 'blur(0.6px) saturate(0.95)', opacity: 1, transition: transicion.rapida },
  salida: { filter: 'blur(0px) saturate(1)', opacity: 0, transition: transicion.media },
}
const escarcha = {
  reposo: { opacity: 1 },
  enfocar: { opacity: 0.45, transition: transicion.rapida },
  salida: { opacity: 0, transition: transicion.media },
}

export default function VidrioEsmerilado({ estado }: { estado: EstadoMarId | null }) {
  return (
    <>
      <motion.div variants={vidrio} className="absolute inset-0">
        <DibujoEstado estado={estado} />
      </motion.div>
      <motion.span variants={escarcha} aria-hidden="true" className="absolute inset-0 bg-mar-blanco/30" />
    </>
  )
}
