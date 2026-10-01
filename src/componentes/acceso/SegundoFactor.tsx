import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { vaciarCache } from '../../lib/useCarga'
import Boton from '../base/Boton'
import Campo from '../base/Campo'
import PaginaDeAcceso from './PaginaDeAcceso'

type Paso =
  | { tipo: 'cargando' }
  | { tipo: 'listo' }
  | { tipo: 'codigo'; factorId: string }
  | { tipo: 'configurar'; factorId: string; qr: string; secreto: string }
  | { tipo: 'fallo' }

// La puerta del panel: la base solo reconoce a la admin con una sesión verificada con el segundo factor
// (`aal2`, migración 0011). Si ya tiene la app configurada, pide el código; si no, la guía para
// configurarla. Es experiencia de uso: la barrera real es `es_admin()` en la base.
export default function SegundoFactor({ children }: { children: ReactNode }) {
  const [paso, setPaso] = useState<Paso>({ tipo: 'cargando' })
  const [error, setError] = useState<string>()
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let vivo = true
    ;(async () => {
      const { data: nivel } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (nivel?.currentLevel === 'aal2') return vivo && setPaso({ tipo: 'listo' })
      const { data: factores, error: errorLista } = await supabase.auth.mfa.listFactors()
      if (errorLista) return vivo && setPaso({ tipo: 'fallo' })
      const verificado = factores.totp.find((f) => f.status === 'verified')
      if (verificado) return vivo && setPaso({ tipo: 'codigo', factorId: verificado.id })
      // Un intento anterior que quedó a medias (se cerró la pestaña antes de escribir el código).
      await Promise.all(factores.all.filter((f) => f.status === 'unverified').map((f) => supabase.auth.mfa.unenroll({ factorId: f.id })))
      const { data: nuevo, error: errorAlta } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Panel de Estado del mar' })
      if (!vivo) return
      if (errorAlta || !nuevo) return setPaso({ tipo: 'fallo' })
      setPaso({ tipo: 'configurar', factorId: nuevo.id, qr: nuevo.totp.qr_code, secreto: nuevo.totp.secret })
    })()
    return () => {
      vivo = false
    }
  }, [])

  const verificar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (paso.tipo !== 'codigo' && paso.tipo !== 'configurar') return
    const codigo = String(new FormData(e.currentTarget).get('codigo') ?? '').replace(/\s/g, '')
    if (!/^\d{6}$/.test(codigo)) return setError('Son los 6 números que muestra la app.')
    setEnviando(true)
    setError(undefined)
    const { error: errorCodigo } = await supabase.auth.mfa.challengeAndVerify({ factorId: paso.factorId, code: codigo })
    setEnviando(false)
    if (errorCodigo) return setError('El código no coincide o ya cambió. Probá con el que muestra la app ahora.')
    vaciarCache() // lo que se leyó antes de verificar se leyó sin permisos de admin
    setPaso({ tipo: 'listo' })
  }

  if (paso.tipo === 'listo') return <>{children}</>
  if (paso.tipo === 'cargando') return <p role="status" className="p-6 text-mar-tintaSuave">Cargando…</p>
  if (paso.tipo === 'fallo') {
    return (
      <PaginaDeAcceso titulo="No pudimos abrir el panel" texto="Algo falló al revisar tu código de seguridad. Recargá la página y probá de nuevo.">
        <Boton onClick={() => location.reload()}>Recargar</Boton>
      </PaginaDeAcceso>
    )
  }

  const formulario = (
    <form onSubmit={verificar} noValidate className="flex flex-col gap-4">
      <Campo etiqueta="Código de 6 números" name="codigo" inputMode="numeric" autoComplete="one-time-code" maxLength={7} autoFocus error={error} />
      <Boton type="submit" disabled={enviando} aria-busy={enviando}>
        {enviando ? 'Verificando…' : paso.tipo === 'configurar' ? 'Activar y entrar al panel' : 'Entrar al panel'}
      </Boton>
    </form>
  )

  if (paso.tipo === 'codigo') {
    return (
      <PaginaDeAcceso titulo="Código de seguridad" texto="Abrí tu app de autenticación y escribí el código de «Estado del mar».">
        {formulario}
        <p className="mt-4 text-meta text-mar-tintaSuave">¿Perdiste el celular? Pedile a Joaquín que restablezca tu código.</p>
      </PaginaDeAcceso>
    )
  }

  return (
    <PaginaDeAcceso
      titulo="Protegé tu panel"
      texto="Para entrar al panel vas a usar, además de tu cuenta, un código que cambia cada 30 segundos en tu celular. Se configura una sola vez."
    >
      <ol className="mb-6 flex list-decimal flex-col gap-2 pl-5 text-cuerpo text-mar-tinta">
        <li>Instalá en tu celular una app de códigos: Google Authenticator o Microsoft Authenticator.</li>
        <li>En la app, tocá «+» y escaneá este código.</li>
        <li>Escribí abajo los 6 números que te muestra.</li>
      </ol>
      <img src={paso.qr} alt="Código QR para configurar la app de autenticación" className="mx-auto mb-4 size-48 rounded-tarjeta border border-mar-bordeAgua bg-mar-blanco p-2" />
      <p className="mb-6 break-all text-center text-meta text-mar-tintaSuave">
        ¿No podés escanear? Cargá esta clave a mano: <span className="font-bold text-mar-tinta">{paso.secreto}</span>
      </p>
      {formulario}
    </PaginaDeAcceso>
  )
}
