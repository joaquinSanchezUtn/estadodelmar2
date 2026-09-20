import { Outlet } from 'react-router-dom'
import { useScrollAlNavegar } from '../lib/useScrollAlNavegar'
import Encabezado from './Encabezado'
import Pie from './Pie'

export default function Layout() {
  useScrollAlNavegar()

  return (
    <div className="flex min-h-screen flex-col">
      <Encabezado />
      <main className="flex-1">
        <Outlet />
      </main>
      <Pie />
    </div>
  )
}
