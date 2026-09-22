// URLs de los archivos que viven fuera del código, en el bucket público de Supabase Storage
// ("publico"): solo lectura para cualquiera; solo se escribe desde el panel de Supabase o una
// Edge Function con service_role (ver Storage → Policies). Por ahora, el logo.
const base = import.meta.env.VITE_SUPABASE_URL as string

export const URL_LOGO = `${base}/storage/v1/object/public/publico/logo-estado-del-mar.webp`
