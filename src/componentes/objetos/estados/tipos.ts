import type { TargetAndTransition, Variants } from 'motion/react'

// Arma las variantes de una pieza del dibujo: cómo se mueve en reposo y cómo al enfocar.
// Si los bucles están apagados (celular, reduced motion) devuelve variantes vacías y el
// dibujo queda quieto.
export type Agua = (reposo: TargetAndTransition, enfocar: TargetAndTransition) => Variants

export type PropsDibujo = { agua: Agua }
