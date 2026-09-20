import type { Usuario } from '../../datos/tipos'
import Tarjeta from '../base/Tarjeta'

export default function DatosCuenta({ usuario }: { usuario: Usuario }) {
  return (
    <Tarjeta className="p-6">
      <h2 className="mb-4 text-xl font-normal">Tus datos</h2>
      <dl className="flex flex-col gap-1 sm:grid sm:grid-cols-[140px_1fr] sm:gap-x-4 sm:gap-y-3">
        <dt className="text-[15px] text-mar-tintaSuave">Nombre</dt>
        <dd className="mb-2 text-base text-mar-tinta sm:mb-0">{usuario.nombre}</dd>
        <dt className="text-[15px] text-mar-tintaSuave">Email</dt>
        <dd className="break-all text-base text-mar-tinta">{usuario.email}</dd>
      </dl>
    </Tarjeta>
  )
}
