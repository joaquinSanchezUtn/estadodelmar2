import { incluyeElPlan } from '../../datos/constantes'
import { cn } from '../../lib/cn'

// Lo que trae el plan, con una tilde por línea. Igual en Mi cuenta y en la invitación de cada tema.
export default function ListaIncluye({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {incluyeElPlan.map((t) => (
        <li key={t} className="flex items-start gap-3 text-left text-cuerpo text-mar-tinta">
          <span aria-hidden="true" className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-mar-primarioSuave text-meta font-bold text-mar-primario">
            ✓
          </span>
          {t}
        </li>
      ))}
    </ul>
  )
}
