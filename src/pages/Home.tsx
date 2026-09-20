import { useState } from 'react'
import EstadosDelMar from '../components/home/EstadosDelMar'
import PlanMensual from '../components/home/PlanMensual'
import Portada from '../components/home/Portada'
import Ventanas from '../components/home/Ventanas'
import type { EstadoId } from '../data/estados'

export default function Home() {
  const [estado, setEstado] = useState<EstadoId | null>(null)

  // Elegir un estado filtra las ventanas y baja hasta ellas; elegirlo de nuevo lo quita.
  const elegir = (id: EstadoId) => {
    setEstado(estado === id ? null : id)
    if (estado !== id) document.getElementById('ventanas')?.scrollIntoView()
  }

  return (
    <>
      <Portada />
      <EstadosDelMar activo={estado} onElegir={elegir} />
      <Ventanas estado={estado} onVerTodas={() => setEstado(null)} />
      <PlanMensual />
    </>
  )
}
