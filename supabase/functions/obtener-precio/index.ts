// Devuelve el precio real del plan mensual: el mismo número que usa `iniciar-suscripcion` para cobrar, para
// que la interfaz nunca muestre uno distinto del que de verdad se cobra. Desde la 0021 vive en la tabla `plan`
// (la dueña lo cambia desde /admin/precio); antes era el secret `MP_PRECIO_ARS`, que ya no se usa.
//
// Pública a propósito (`auth: "none"`): el precio ya se ve sin sesión, en la portada. La tabla está cerrada al
// público (solo la admin la lee), así que se lee con service_role y se devuelve solo el número. Si algo falla,
// no es un error para quien mira: `precioArs: null` y el front muestra el placeholder `[PRECIO]`.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@1.9.0";

export default {
  fetch: withSupabase({ auth: "none" }, async (_req, ctx) => {
    const { data, error } = await ctx.supabaseAdmin.from("plan").select("precio_ars").maybeSingle();
    if (error) console.error("[obtener-precio] lectura de plan", error);
    return Response.json({ precioArs: data?.precio_ars ?? null });
  }),
};
