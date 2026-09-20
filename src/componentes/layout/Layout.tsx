import { Outlet } from 'react-router-dom'
import ConmutadorDev from '../../auth/ConmutadorDev'
import { useScrollAlNavegar } from '../../lib/useScrollAlNavegar'
import Encabezado from './Encabezado'
import PieDePagina from './PieDePagina'

export default function Layout() {
  useScrollAlNavegar()

  return (
    <div className="flex min-h-screen flex-col">
      <Encabezado />
      <main className="flex-1">
        <Outlet />
      </main>
      <PieDePagina />
      {import.meta.env.DEV && <ConmutadorDev />}
    </div>
  )
}
