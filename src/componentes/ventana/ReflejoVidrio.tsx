// Reflejo de vidrio: un arco claro en el cuarto superior izquierdo y un resplandor muy suave,
// con opacidad baja. Es decorativo (aria-hidden) y no recibe clics.
export default function ReflejoVidrio() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_26%_16%,rgba(255,255,255,0.34),rgba(255,255,255,0)_58%)]"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <path
          d="M17 46 A33.2 33.2 0 0 1 46 17"
          fill="none"
          stroke="white"
          strokeOpacity="0.5"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    </>
  )
}
