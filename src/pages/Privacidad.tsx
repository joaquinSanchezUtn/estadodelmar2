import { Link } from 'react-router-dom'
import PaginaLegal, { type Seccion } from '../componentes/legal/PaginaLegal'

const secciones: Seccion[] = [
  {
    id: 'responsable',
    titulo: 'Quién es responsable de tus datos',
    parrafos: ['[RAZÓN SOCIAL], CUIT [CUIT], con domicilio en [DOMICILIO]. Contacto para temas de privacidad: [EMAIL DE CONTACTO].'],
  },
  {
    id: 'datos',
    titulo: 'Qué datos guardamos',
    parrafos: [
      'Tu nombre y tu email, cómo ingresás (email o Google) y el estado de tu suscripción (activa, cancelada, vencida). Si ingresás con Google, recibimos de Google tu nombre y tu email; nada más.',
      'Las notas que escribís en una ejercitación quedan solo en tu pantalla: no se envían ni se guardan.',
    ],
  },
  {
    id: 'no-guardamos',
    titulo: 'Qué no guardamos',
    parrafos: ['No guardamos los datos de tu tarjeta ni de tu medio de pago: los procesa Mercado Pago. Nosotros solo sabemos si el pago fue aprobado.'],
  },
  {
    id: 'uso',
    titulo: 'Para qué los usamos',
    parrafos: ['Para que puedas ingresar, para saber si tenés acceso al contenido, para cobrar y renovar la suscripción, y para responderte cuando nos escribís. No los usamos para publicidad ni los vendemos.'],
  },
  {
    id: 'terceros',
    titulo: 'Con quién los compartimos',
    parrafos: [
      'Con los servicios que hacen posible el sitio, solo lo necesario para que funcionen: Supabase (cuentas y base de datos), Mercado Pago (pagos) y Bunny Stream (entrega de videos y audios). Estos proveedores pueden almacenar datos fuera de la Argentina [DETALLAR PAÍSES Y GARANTÍAS CON ASESORÍA LEGAL].',
    ],
  },
  {
    id: 'cookies',
    titulo: 'Cookies y almacenamiento',
    parrafos: ['Usamos solo lo técnico imprescindible para mantener tu sesión iniciada. No usamos cookies de publicidad ni de seguimiento.'],
  },
  {
    id: 'plazo',
    titulo: 'Cuánto tiempo los conservamos',
    parrafos: [
      'Mientras tu cuenta exista. Si la eliminás, borramos tus datos personales; solo conservamos lo que la ley nos obliga a guardar, como los registros de facturación y de pagos, por el plazo legal.',
    ],
  },
  {
    id: 'derechos',
    titulo: 'Tus derechos',
    parrafos: [
      'Según la Ley 25.326 de Protección de Datos Personales, podés acceder a tus datos, rectificarlos, actualizarlos y pedir su supresión. Podés cambiar tu nombre y tu contraseña, o eliminar tu cuenta, desde Mi cuenta; y para cualquier otro pedido escribinos.',
      'La Agencia de Acceso a la Información Pública, como órgano de control de la ley, tiene la atribución de atender las denuncias y reclamos de quienes se vean afectados en sus derechos [VERIFICAR TEXTO CON ASESORÍA LEGAL].',
      <>Para ejercer tus derechos, escribinos desde la página de <Link to="/contacto" className="underline">contacto</Link>.</>,
    ],
  },
  {
    id: 'seguridad',
    titulo: 'Seguridad',
    parrafos: ['Protegemos las cuentas con contraseñas cifradas, conexiones seguras y accesos restringidos. Ningún sistema es infalible: si hubiera un incidente que te afecte, te lo vamos a informar.'],
  },
  {
    id: 'cambios',
    titulo: 'Cambios en esta política',
    parrafos: ['Si la modificamos de forma importante, te avisamos por correo o desde el sitio antes de que rija.'],
  },
]

export default function Privacidad() {
  return <PaginaLegal titulo="Política de privacidad" actualizado="[FECHA]" secciones={secciones} />
}
