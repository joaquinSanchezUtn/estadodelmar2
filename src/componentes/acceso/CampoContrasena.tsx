import { useState, type ComponentProps } from 'react'
import Campo from '../base/Campo'
import { Ojo, OjoTachado } from '../base/iconos'

// Campo de contraseña con botón para verla. El botón mide 44px y no cambia el foco del campo.
export default function CampoContrasena(props: Omit<ComponentProps<typeof Campo>, 'type' | 'derecha'>) {
  const [visible, setVisible] = useState(false)

  return (
    <Campo
      {...props}
      type={visible ? 'text' : 'password'}
      derecha={
        <button
          type="button"
          aria-label={visible ? 'Ocultar la contraseña' : 'Mostrar la contraseña'}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="flex size-11 items-center justify-center text-mar-tintaSuave hover:text-mar-tinta"
        >
          {visible ? <OjoTachado /> : <Ojo />}
        </button>
      }
    />
  )
}
