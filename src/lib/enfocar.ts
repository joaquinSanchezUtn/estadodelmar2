// Lleva el foco al primer campo con error, para quien navega con teclado o lector de pantalla.
export const enfocarCampo = (formulario: HTMLFormElement, nombre: string) =>
  (formulario.elements.namedItem(nombre) as HTMLElement | null)?.focus()
