import { Link } from 'react-router-dom'
import PaginaLegal, { type Seccion } from '../componentes/legal/PaginaLegal'
import { usePrecio } from '../lib/usePrecio'

const crearSecciones = (precio: string): Seccion[] => [
  {
    id: 'servicio',
    titulo: 'Qué es este servicio',
    parrafos: [
      'Estado del mar es un sitio de suscripción que ofrece contenido psicoeducativo, meditaciones y ejercitaciones prácticas, organizados por temas emocionales («ventanas»). Lo ofrece [RAZÓN SOCIAL], CUIT [CUIT], con domicilio en [DOMICILIO].',
    ],
  },
  {
    id: 'aviso',
    titulo: 'Aviso importante',
    parrafos: [
      'Los contenidos son educativos y de acompañamiento personal. No son atención psicológica, psiquiátrica ni médica, no reemplazan un tratamiento y no establecen una relación terapéutica.',
      'Si estás atravesando una crisis o sentís que corrés riesgo, buscá ayuda profesional o el servicio de emergencias de tu zona. Este sitio no puede ayudarte en una urgencia.',
    ],
  },
  {
    id: 'cuenta',
    titulo: 'Tu cuenta',
    parrafos: [
      'Para suscribirte necesitás una cuenta, que podés crear con tu email o con Google. Los datos que das tienen que ser ciertos y tenés que mantener tu contraseña en reserva. La cuenta es personal: no se comparte.',
      <>Podés cambiar tu nombre, tu contraseña o eliminar tu cuenta cuando quieras desde <Link to="/mi-cuenta" className="underline">Mi cuenta</Link>.</>,
    ],
  },
  {
    id: 'suscripcion',
    titulo: 'La suscripción y el pago',
    parrafos: [
      `Hay un solo plan, mensual, de ${precio} por mes. Se renueva automáticamente cada mes hasta que lo canceles. El pago lo procesa Mercado Pago: el sitio no guarda los datos de tu tarjeta.`,
      'Si el precio cambia, te avisamos con anticipación por correo y el cambio rige recién desde la renovación siguiente. Si no lo aceptás, podés cancelar antes.',
    ],
  },
  {
    id: 'cancelacion',
    titulo: 'Cancelación y arrepentimiento',
    parrafos: [
      'Podés darte de baja en cualquier momento desde Mi cuenta. Seguís teniendo acceso hasta el final del período que ya pagaste y después la suscripción no se renueva ni se te cobra de nuevo.',
      'Tenés derecho a arrepentirte de la contratación dentro de los plazos que fija la normativa de defensa del consumidor [PLAZO Y PROCEDIMIENTO A CONFIRMAR CON ASESORÍA LEGAL]. Para ejercerlo, escribinos desde la página de contacto.',
    ],
  },
  {
    id: 'uso',
    titulo: 'Uso del contenido',
    parrafos: [
      'Los videos, audios y textos son propiedad de [RAZÓN SOCIAL] o se usan con autorización. Tu suscripción te da una licencia personal, limitada y no transferible para verlos y escucharlos. No podés copiarlos, redistribuirlos, publicarlos ni compartir tu acceso con otras personas.',
    ],
  },
  {
    id: 'suspension',
    titulo: 'Suspensión de cuentas',
    parrafos: ['Podemos suspender o cerrar una cuenta que incumpla estos términos, por ejemplo si se comparte el acceso o se copia el contenido. Antes te vamos a avisar, salvo que haya un abuso grave.'],
  },
  {
    id: 'cambios',
    titulo: 'Disponibilidad y cambios',
    parrafos: [
      'Hacemos lo posible para que el sitio esté siempre disponible, pero puede haber interrupciones por mantenimiento o por causas ajenas. Las ventanas se van sumando y a veces se ajustan o se retiran. Si cambiamos estos términos de forma importante, te lo avisamos.',
    ],
  },
  {
    id: 'responsabilidad',
    titulo: 'Límite de responsabilidad',
    parrafos: [
      'El servicio se ofrece tal como está descripto. En la medida que la ley lo permite, [RAZÓN SOCIAL] no responde por decisiones que tomes a partir del contenido ni por daños indirectos. Esto no limita los derechos que la ley te reconoce como consumidor o consumidora.',
    ],
  },
  {
    id: 'ley',
    titulo: 'Ley aplicable y contacto',
    parrafos: [
      <>Estos términos se rigen por las leyes de la República Argentina. Por cualquier duda, escribinos desde la página de <Link to="/contacto" className="underline">contacto</Link> o a [EMAIL DE CONTACTO].</>,
    ],
  },
]

export default function Terminos() {
  const precio = usePrecio()
  return <PaginaLegal titulo="Términos y condiciones" actualizado="[FECHA]" secciones={crearSecciones(precio)} />
}
