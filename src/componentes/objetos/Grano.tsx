// El grano: una textura casi invisible sobre toda la página que le da tacto de papel a las superficies lisas.
// Decorativa: sin clics, fuera del lector de pantalla y sin animación. Va debajo del menú y del encabezado.
export default function Grano() {
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-menu bg-grano opacity-4" />
}
