import Aviso from './Aviso'
import Boton from './Boton'

// Lo que se ve cuando una sección no pudo cargar: dice qué pasó y deja reintentar sin salir de la página.
export default function ErrorDeCarga({ texto, onReintentar }: { texto: string; onReintentar: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-6">
      <Aviso className="w-full">{texto}</Aviso>
      <Boton compacto variante="secundario" onClick={onReintentar}>
        Reintentar
      </Boton>
    </div>
  )
}
