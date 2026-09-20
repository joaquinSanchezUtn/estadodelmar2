import { Route, Routes } from 'react-router-dom'
import AdminRoute from './auth/AdminRoute'
import ProtectedRoute from './auth/ProtectedRoute'
import Layout from './componentes/layout/Layout'
import Admin from './pages/Admin'
import Home from './pages/Home'
import Ingresar from './pages/Ingresar'
import MiCuenta from './pages/MiCuenta'
import NoEncontrada from './pages/NoEncontrada'
import Tema from './pages/Tema'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tema/:slug" element={<Tema />} />
        <Route path="/ingresar" element={<Ingresar />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/mi-cuenta" element={<MiCuenta />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}
