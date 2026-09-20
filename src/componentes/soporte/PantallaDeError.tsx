import Boton from '../base/Boton'
import Burbuja from '../base/Burbuja'
import Pagina from '../layout/Pagina'

// Lo que se ve cuando algo falla de verdad: qué pasó, sin culpar a nadie, y cómo seguir.
export default function PantallaDeError({ onReintentar }: { onReintentar: () => void }) {
  return (
    <main>
      <Pagina ancho="lectura" className="pt-6 md:pt-12">
        <Burbuja tono="aguaClara" entrada="ninguna" interior="flex flex-col items-start gap-4 py-6">
          <h1 className="text-titulo-m font-light md:text-titulo-l">Algo salió mal</h1>
          <p className="max-w-angosto text-cuerpo text-mar-tintaSuave">
            Tuvimos un problema para mostrar esta pantalla. No es algo que hayas hecho vos. Podés intentar de nuevo o volver al inicio.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Boton onClick={onReintentar}>Intentar de nuevo</Boton>
            {/* Un enlace común (recarga completa): así se limpia cualquier estado que haya quedado roto. */}
            <a href="/" className="inline-flex min-h-control items-center justify-center rounded-full px-8 text-cuerpo font-medium text-mar-tintaSuave no-underline hover:bg-mar-tinta/5 hover:text-mar-tinta">
              Volver al inicio
            </a>
          </div>
        </Burbuja>
      </Pagina>
    </main>
  )
}
