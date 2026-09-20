import { Route, Routes, type Location } from 'react-router-dom'
import RutaDeAdmin from './auth/RutaDeAdmin'
import RutaConSesion from './auth/RutaConSesion'
import Admin from './pages/Admin'
import Home from './pages/Home'
import Ingresar from './pages/Ingresar'
import MiCuenta from './pages/MiCuenta'
import NoEncontrada from './pages/NoEncontrada'
import Tema from './pages/Tema'

// Recibe `location` para que la página que sale conserve su ruta mientras se desvanece.
export default function Rutas({ location }: { location: Location }) {
  return (
    <Routes location={location}>
      <Route path="/" element={<Home />} />
      <Route path="/tema/:slug" element={<Tema />} />
      <Route path="/ingresar" element={<Ingresar />} />
      <Route element={<RutaConSesion />}>
        <Route path="/mi-cuenta" element={<MiCuenta />} />
      </Route>
      <Route element={<RutaDeAdmin />}>
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<NoEncontrada />} />
    </Routes>
  )
}
