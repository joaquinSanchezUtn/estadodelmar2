import clsx from 'clsx'
import type { ReactNode } from 'react'

const tonos = {
  agua: 'border-mar-bordeAgua',
  arena: 'border-mar-bordeArena',
}

type Props = { tono?: keyof typeof tonos; className?: string; children: ReactNode }

export default function Tarjeta({ tono = 'agua', className, children }: Props) {
  return (
    <div className={clsx('rounded-xl border bg-mar-blanco p-5', tonos[tono], className)}>
      {children}
    </div>
  )
}
