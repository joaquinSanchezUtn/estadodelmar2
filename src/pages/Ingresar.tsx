import Boton from '../componentes/base/Boton'
import Campo from '../componentes/base/Campo'
import { Google } from '../componentes/base/iconos'
import Seccion from '../componentes/layout/Seccion'

// Formulario visual: todavía no se conecta a ninguna autenticación.
// Pendiente: las páginas de crear cuenta y recuperar contraseña.
export default function Ingresar() {
  return (
    <Seccion fondo="degrade" angosta className="min-h-[70vh]">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-4xl font-light">Ingresar</h1>
        <p className="mb-8 text-base leading-relaxed text-mar-tintaSuave">
          Entrá a tu cuenta para acceder a las ventanas.
        </p>

        <Boton variante="secundario" className="w-full gap-3 bg-mar-blanco font-medium">
          <Google />
          Continuar con Google
        </Boton>

        <div role="separator" className="my-6 flex items-center gap-4 text-sm text-mar-tintaSuave">
          <span className="h-px flex-1 bg-mar-bordeAgua" aria-hidden="true" />o con tu email
          <span className="h-px flex-1 bg-mar-bordeAgua" aria-hidden="true" />
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
          <Campo etiqueta="Email" name="email" type="email" autoComplete="email" required />
          <Campo
            etiqueta="Contraseña"
            name="contrasena"
            type="password"
            autoComplete="current-password"
            required
          />
          <Boton type="submit" className="mt-2 w-full">
            Ingresar
          </Boton>
        </form>

        <nav aria-label="Otras opciones" className="mt-6 flex flex-col items-start gap-1 text-base">
          <a href="#" className="inline-flex min-h-[44px] items-center hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
          <a href="#" className="inline-flex min-h-[44px] items-center hover:underline">
            ¿No tenés cuenta? Crear cuenta
          </a>
        </nav>
      </div>
    </Seccion>
  )
}
