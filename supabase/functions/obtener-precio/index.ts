// Devuelve el precio real del plan mensual — el mismo `MP_PRECIO_ARS` que usa `iniciar-suscripcion`
// para cobrar — para que la interfaz nunca muestre un número desincronizado del que de verdad se
// cobra. Antes de esta función, el precio vivía en dos lugares que nadie mantenía sincronizados: el
// secret (lo que cobra Mercado Pago) y el texto `[PRECIO]` repetido a mano en cuatro pantallas (lo que
// ve la persona). Ahora hay un solo número, leído en los dos lados desde el mismo secret.
//
// Pública a propósito (`auth: "none"`): el precio ya se ve sin sesión, en la portada. Si el secreto
// todavía no está cargado (ver CLAUDE.md, "Pendientes de decisión"), no es un error: se devuelve
// `precioArs: null` y el front sigue mostrando el placeholder `[PRECIO]`.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const PRECIO = Deno.env.get("MP_PRECIO_ARS");

export default {
  fetch: withSupabase({ auth: "none" }, async () => {
    const numero = PRECIO ? Number(PRECIO) : NaN;
    return Response.json({ precioArs: Number.isFinite(numero) ? numero : null });
  }),
};
