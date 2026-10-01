import { useState } from 'react'
import { Link } from 'react-router-dom'
import Aviso from '../componentes/base/Aviso'
import Boton from '../componentes/base/Boton'
import Pagina from '../componentes/layout/Pagina'
import FormularioContacto from '../componentes/soporte/FormularioContacto'

// Antes de escribir: a veces la respuesta ya está en el sitio. Son enlaces a lugares que existen.
const atajos = [
  { to: '/mi-cuenta', titulo: 'Suscripción y pagos', texto: 'Ver tu plan, cambiar el medio de pago o darte de baja.' },
  { to: '/#preguntas', titulo: 'Preguntas frecuentes', texto: 'Cómo funciona el sitio, en pocas palabras.' },
  { to: '/quien-soy', titulo: 'Quién te responde', texto: 'Conocé a quien está detrás del sitio.' },
]

export default function Contacto() {
  const [enviado, setEnviado] = useState(false)

  return (
    <Pagina ancho="ancho">
      <header className="mx-auto flex max-w-parrafo flex-col items-center gap-3 pt-4 text-center">
        <h1 className="text-titulo-l md:text-titulo-xl">Contacto</h1>
        <p className="text-destacado text-mar-tintaSuave">
          Escribinos por una duda, un problema con tu cuenta o para pedir algo sobre tus datos. Te respondemos por email.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <section className="rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave md:p-8">
          {enviado ? (
            <div className="flex flex-col items-start gap-5">
              <Aviso tono="info" className="w-full">
                Recibimos tu mensaje. Te respondemos por email en los próximos días.
              </Aviso>
              <Boton to="/" variante="secundario">
                Volver al inicio
              </Boton>
            </div>
          ) : (
            <FormularioContacto onEnviado={() => setEnviado(true)} />
          )}
        </section>

        <aside className="flex flex-col gap-6">
          <Aviso tono="info">
            Este canal no es para urgencias. Si estás atravesando una crisis, buscá ayuda profesional o el servicio de emergencias de tu zona.
          </Aviso>
          <section className="rounded-burbuja border border-mar-bordeAgua bg-mar-blanco p-6 shadow-suave">
            <h2 className="mb-4 text-titulo-s">Antes de escribir</h2>
            <ul className="flex flex-col gap-4">
              {atajos.map((a) => (
                <li key={a.to} className="border-l-3 border-mar-atardecer pl-4">
                  <Link to={a.to} className="font-bold text-mar-primario no-underline hover:underline">
                    {a.titulo} →
                  </Link>
                  <p className="mt-1 text-meta text-mar-tintaSuave">{a.texto}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </Pagina>
  )
}
