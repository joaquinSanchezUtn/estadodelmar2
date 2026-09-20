import { Component, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import PantallaDeError from './PantallaDeError'

type Props = { claveDeRuta: string; children: ReactNode }
type Estado = { fallo: boolean }

class Limite extends Component<Props, Estado> {
  state: Estado = { fallo: false }

  static getDerivedStateFromError(): Estado {
    return { fallo: true }
  }

  componentDidCatch(error: unknown) {
    // Pendiente: mandar el error a un servicio de monitoreo. Sin datos personales.
    console.error('Error de pantalla:', error)
  }

  // Al navegar a otra pantalla el error se limpia solo.
  componentDidUpdate(previas: Props) {
    if (previas.claveDeRuta !== this.props.claveDeRuta && this.state.fallo) this.setState({ fallo: false })
  }

  render() {
    return this.state.fallo ? <PantallaDeError onReintentar={() => this.setState({ fallo: false })} /> : this.props.children
  }
}

// Si una pantalla se rompe, se ve un mensaje amable en lugar de una página en blanco.
export default function LimiteDeErrores({ children }: { children: ReactNode }) {
  return <Limite claveDeRuta={useLocation().key}>{children}</Limite>
}
