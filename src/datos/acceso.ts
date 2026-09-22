// Envoltorios finos sobre las dos funciones de la base (`tiene_acceso()`, `es_admin()`, migración
// 0002/0001): la decisión real vive ahí. Esto solo evita pedirla para quien no tiene sesión, y le da
// un nombre a cada RPC. Nadie más en el front vuelve a comparar fechas ni roles a mano.
import { supabase } from '../lib/supabase'

async function llamarRPC(fn: 'tiene_acceso' | 'es_admin'): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return false
  const { data } = await supabase.rpc(fn)
  return data === true
}

export const tengoAcceso = () => llamarRPC('tiene_acceso')
export const esAdmin = () => llamarRPC('es_admin')
