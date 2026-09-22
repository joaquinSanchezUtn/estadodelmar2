import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local')
}

// Solo la anon key es pública: el acceso real lo controla RLS en la base.
// flowType 'pkce': los enlaces de confirmación, recuperación y OAuth vuelven con `?code=` (no con el
// token suelto en el hash de la URL). Es más seguro y además pone los errores en la query string,
// donde `useSearchParams` los puede leer (RetornoAuth.tsx).
export const supabase = createClient(url, anonKey, { auth: { flowType: 'pkce' } })
