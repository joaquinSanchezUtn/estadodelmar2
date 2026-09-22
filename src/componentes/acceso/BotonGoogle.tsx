import Boton from '../base/Boton'
import { Google } from '../base/iconos'

// Diferido: ingresar con Google necesita credenciales de Google Cloud cargadas en Supabase, un
// trámite aparte. El botón se ve, pero no intenta nada: evita un pedido que sabemos que va a fallar.
export default function BotonGoogle() {
  return (
    <div className="flex flex-col gap-2">
      <Boton variante="secundario" disabled className="w-full gap-3 bg-mar-blanco">
        <Google />
        Continuar con Google
      </Boton>
      <p className="text-meta text-mar-tintaSuave">Por ahora, entrá con tu email.</p>
    </div>
  )
}
