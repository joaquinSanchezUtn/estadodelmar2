import { lazy, Suspense } from 'react'
import { Route, Routes, type Location } from 'react-router-dom'
import RutaDeAdmin from './auth/RutaDeAdmin'
import RutaConSesion from './auth/RutaConSesion'
import CatalogoVentanas from './pages/CatalogoVentanas'
import Home from './pages/Home'
import Ingresar from './pages/Ingresar'
import NoEncontrada from './pages/NoEncontrada'
import PaginaDeEstado from './pages/PaginaDeEstado'
import Tema from './pages/Tema'


// Las pantallas que no son la puerta de entrada se cargan cuando se las visita: el primer JS es más chico.
// La home, el catálogo, los estados, el tema y Ingresar son parte de la transición de la ventana y del primer
// recorrido: van directas.
const Admin = lazy(() => import('./pages/Admin'))
const AdminEditorContenido = lazy(() => import('./pages/AdminEditorContenido'))
const AdminEditorVentana = lazy(() => import('./pages/AdminEditorVentana'))
const AdminQuienSoy = lazy(() => import('./pages/AdminQuienSoy'))
const AdminVentanas = lazy(() => import('./pages/AdminVentanas'))
const Contacto = lazy(() => import('./pages/Contacto'))
const CuentaEliminada = lazy(() => import('./pages/CuentaEliminada'))
const MiCuenta = lazy(() => import('./pages/MiCuenta'))
const NuevaContrasena = lazy(() => import('./pages/NuevaContrasena'))
const Privacidad = lazy(() => import('./pages/Privacidad'))
const QuienSoy = lazy(() => import('./pages/QuienSoy'))
const Recuperar = lazy(() => import('./pages/Recuperar'))
const Registrarme = lazy(() => import('./pages/Registrarme'))
const RetornoAuth = lazy(() => import('./pages/RetornoAuth'))
const SuscripcionResultado = lazy(() => import('./pages/SuscripcionResultado'))
const Terminos = lazy(() => import('./pages/Terminos'))
const VerificarEmail = lazy(() => import('./pages/VerificarEmail'))

// SOLO DESARROLLO: rompe a propósito para ver la pantalla de error.
function FallaDeDesarrollo(): never {
  throw new Error('Falla de prueba')
}

// SOLO DESARROLLO: la pantalla que reemplaza a Mercado Pago no existe (ni se compila) en producción.
const SimularPago = import.meta.env.DEV ? lazy(() => import('./pages/SimularPago')) : () => null

// Recibe `location` para que la página que sale conserve su ruta mientras se desvanece.
export default function Rutas({ location }: { location: Location }) {
  return (
    <Suspense fallback={<p role="status" className="p-6 text-cuerpo text-mar-tintaSuave">Cargando…</p>}>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/ventanas" element={<CatalogoVentanas />} />
        <Route path="/estado/:id" element={<PaginaDeEstado />} />
        <Route path="/tema/:slug" element={<Tema />} />
        <Route path="/ingresar" element={<Ingresar />} />
        <Route path="/registrarme" element={<Registrarme />} />
        <Route path="/verificar-email" element={<VerificarEmail />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/nueva-contrasena" element={<NuevaContrasena />} />
        <Route path="/auth/callback" element={<RetornoAuth />} />
        <Route path="/cuenta-eliminada" element={<CuentaEliminada />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/quien-soy" element={<QuienSoy />} />
        {import.meta.env.DEV && <Route path="/dev/falla" element={<FallaDeDesarrollo />} />}
        <Route element={<RutaConSesion />}>
          <Route path="/mi-cuenta" element={<MiCuenta />} />
          <Route path="/suscripcion/resultado" element={<SuscripcionResultado />} />
          {import.meta.env.DEV && <Route path="/suscripcion/simular-pago" element={<SimularPago />} />}
        </Route>
        <Route element={<RutaDeAdmin />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/quien-soy" element={<AdminQuienSoy />} />
          <Route path="/admin/ventanas" element={<AdminVentanas />} />
          <Route path="/admin/ventanas/nueva" element={<AdminEditorVentana />} />
          <Route path="/admin/ventanas/:slug" element={<AdminEditorVentana />} />
          <Route path="/admin/ventanas/:slug/contenidos/nuevo" element={<AdminEditorContenido />} />
          <Route path="/admin/ventanas/:slug/contenidos/:id" element={<AdminEditorContenido />} />
        </Route>
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </Suspense>
  )
}
