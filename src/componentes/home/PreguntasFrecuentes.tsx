import Seccion from './Seccion'

// Solo lo que el sistema hace hoy (cancelar pausa el cobro y deja el acceso hasta el fin del período; el
// pago es con Mercado Pago). La de la terapia es un cuidado, no una promesa: la revisa la dueña.
const preguntas = [
  {
    p: '¿Puedo cancelar cuando quiera?',
    r: 'Sí, desde Mi cuenta. No se te vuelve a cobrar y seguís con acceso hasta que termine el mes que ya pagaste.',
  },
  { p: '¿Cómo se paga?', r: 'Con Mercado Pago. El cobro es mensual y automático, y el medio de pago lo cambiás desde Mi cuenta.' },
  {
    p: '¿Qué incluye la suscripción?',
    r: 'Todos los temas publicados y los que se vayan sumando, cada uno con su video, su meditación guiada y su ejercitación.',
  },
  {
    p: '¿Reemplaza una terapia?',
    r: 'No. Es un espacio de práctica y aprendizaje que acompaña, pero no reemplaza la atención profesional. Si estás atravesando una crisis, buscá ayuda profesional o el servicio de emergencias de tu zona.',
  },
]

export default function PreguntasFrecuentes() {
  return (
    <Seccion id="preguntas" titulo="Preguntas frecuentes">
      <div className="mx-auto flex max-w-lectura flex-col gap-3">
        {preguntas.map(({ p, r }) => (
          <details key={p} className="group rounded-burbuja border border-mar-bordeAgua bg-mar-blanco px-5 py-4 shadow-suave">
            <summary className="flex min-h-control-sm cursor-pointer list-none items-center justify-between gap-4 font-bold text-mar-tinta">
              {p}
              <span aria-hidden="true" className="text-titulo-s text-mar-primario transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2 text-cuerpo text-mar-tintaSuave">{r}</p>
          </details>
        ))}
      </div>
    </Seccion>
  )
}
