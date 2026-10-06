import { supabase } from '../lib/supabase'
import { esAdmin } from './acceso'
import type { Paso, ResultadoAdmin, TextosDePortada } from './tipos'

export const MAXIMO_PASOS = 6

// Los textos de la portada y de «Cómo funciona» (migración 0017). La tabla está cerrada: el público la lee
// por `portada_publica()`, que devuelve solo los textos de la única fila.
export async function obtenerPortada(): Promise<TextosDePortada | null> {
  const { data, error } = await supabase.rpc('portada_publica').maybeSingle()
  if (error) throw error
  if (!data) return null
  const d = data as Record<string, unknown>
  return {
    etiqueta: (d.etiqueta as string | null) ?? null,
    titulo: d.titulo as string,
    tituloDestacado: (d.titulo_destacado as string | null) ?? null,
    texto: (d.texto as string | null) ?? null,
    comoTitulo: d.como_titulo as string,
    comoTexto: (d.como_texto as string | null) ?? null,
    pasos: Array.isArray(d.pasos) ? (d.pasos as Paso[]) : [],
  }
}

// Lo que se edita en el panel: acá todo es string (vacío = no se muestra; se guarda como null).
export type DatosDePortada = Omit<TextosDePortada, 'etiqueta' | 'tituloDestacado' | 'texto' | 'comoTexto'> & {
  etiqueta: string
  tituloDestacado: string
  texto: string
  comoTexto: string
}

const largo = (v: string, max: number, nombre: string, errores: Record<string, string>, clave: string) => {
  if (v.length > max) errores[clave] = `${nombre} no puede pasar de ${max} caracteres.`
}

// Guarda todo junto, de un saque, como «Quién soy». Si el `update` no devuelve la fila, es que la sesión dejó
// de ser admin en el medio (la fila nunca deja de existir: ver el índice único de la 0017).
export async function guardarPortadaAdmin(d: DatosDePortada): Promise<ResultadoAdmin> {
  if (!(await esAdmin())) return { ok: false, mensaje: 'No tenés permiso para hacer esto.' }

  const t = {
    etiqueta: d.etiqueta.trim(),
    titulo: d.titulo.trim(),
    tituloDestacado: d.tituloDestacado.trim(),
    texto: d.texto.trim(),
    comoTitulo: d.comoTitulo.trim(),
    comoTexto: d.comoTexto.trim(),
  }
  // Una tarjeta con el título y el texto en blanco no dice nada: se descarta sola.
  const pasos = d.pasos.map((p) => ({ titulo: p.titulo.trim(), texto: p.texto.trim() })).filter((p) => p.titulo || p.texto)

  const errores: Record<string, string> = {}
  if (!t.titulo) errores.titulo = 'El título no puede quedar vacío.'
  if (!t.comoTitulo) errores.comoTitulo = 'El título no puede quedar vacío.'
  largo(t.etiqueta, 60, 'La etiqueta', errores, 'etiqueta')
  largo(t.titulo, 80, 'El título', errores, 'titulo')
  largo(t.tituloDestacado, 80, 'El segundo renglón', errores, 'tituloDestacado')
  largo(t.texto, 400, 'El texto', errores, 'texto')
  largo(t.comoTitulo, 60, 'El título', errores, 'comoTitulo')
  largo(t.comoTexto, 200, 'El subtítulo', errores, 'comoTexto')
  if (pasos.length > MAXIMO_PASOS) errores.pasos = `Hasta ${MAXIMO_PASOS} tarjetas.`
  else if (pasos.some((p) => !p.titulo || !p.texto)) errores.pasos = 'Cada tarjeta necesita un título y un texto.'
  else if (pasos.some((p) => p.titulo.length > 60 || p.texto.length > 200)) errores.pasos = 'Alguna tarjeta quedó demasiado larga (el título hasta 60 caracteres, el texto hasta 200).'
  if (Object.keys(errores).length) return { ok: false, mensaje: 'Revisá los campos marcados.', errores }

  const { data: fila, error: errorLectura } = await supabase.from('portada').select('id').maybeSingle()
  if (errorLectura) return { ok: false, mensaje: 'No pudimos guardar. Probá de nuevo en un rato.' }
  if (!fila) return { ok: false, mensaje: 'No tenés permiso para hacer esto.' }
  const { data: actualizado, error } = await supabase
    .from('portada')
    .update({
      etiqueta: t.etiqueta || null,
      titulo: t.titulo,
      titulo_destacado: t.tituloDestacado || null,
      texto: t.texto || null,
      como_titulo: t.comoTitulo,
      como_texto: t.comoTexto || null,
      pasos,
    })
    .eq('id', fila.id)
    .select('id')
    .maybeSingle()
  if (error) return { ok: false, mensaje: 'No pudimos guardar. Probá de nuevo en un rato.' }
  if (!actualizado) return { ok: false, mensaje: 'No tenés permiso para hacer esto.' }
  return { ok: true }
}

// Los textos de siempre (los mismos que siembra la 0017). La portada los usa para reservar el lugar mientras
// carga, y los muestra si la lectura falla: la home nunca queda sin su primer pantalla.
export const portadaInicial: TextosDePortada = {
  etiqueta: 'Un gimnasio del alma',
  titulo: 'No somos las olas.',
  tituloDestacado: 'Somos el océano.',
  texto: 'Videos, meditaciones y ejercicios para atravesar la ansiedad, los duelos y los cambios sin perder el centro. A tu ritmo, desde cualquier lugar.',
  comoTitulo: 'Cómo funciona',
  comoTexto: 'Tres pasos, cada vez que lo necesites.',
  pasos: [
    { titulo: 'Abrí tu ventana', texto: 'Calma, tormenta, mareas… cada ventana abre los temas que te pueden ayudar.' },
    { titulo: 'Comprendé y meditá', texto: 'Un video breve explica qué te pasa y una meditación guiada te lleva a la profundidad.' },
    { titulo: 'Llevalo a tu vida', texto: 'Una ejercitación concreta para practicar lo aprendido en tu día a día.' },
  ],
}
