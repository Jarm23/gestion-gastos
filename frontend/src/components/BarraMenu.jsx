import { useEffect, useRef, useState } from 'react'

const OPCIONES = [
  { vista: 'cuenta', texto: 'Cuenta' },
  { vista: 'registro', texto: 'Registro Gastos' },
  { vista: 'ajustes', texto: 'Ajustes' },
]

export default function BarraMenu({ vista, onNavegar, onLogout }) {
  const [abierto, setAbierto] = useState(false)
  const menuRef = useRef(null)
  const botonRef = useRef(null)

  useEffect(() => {
    if (!abierto) return undefined

    function alPulsarFuera(e) {
      if (!menuRef.current.contains(e.target)) setAbierto(false)
    }
    function alPulsarTecla(e) {
      if (e.key === 'Escape') {
        setAbierto(false)
        botonRef.current.focus()
      }
    }
    document.addEventListener('mousedown', alPulsarFuera)
    document.addEventListener('keydown', alPulsarTecla)
    return () => {
      document.removeEventListener('mousedown', alPulsarFuera)
      document.removeEventListener('keydown', alPulsarTecla)
    }
  }, [abierto])

  function navegar(destino) {
    setAbierto(false)
    onNavegar(destino)
  }

  return (
    <header className="barra">
      <button type="button" className="barra-titulo" onClick={() => navegar('grafico')}>
        Gestión de Gastos
      </button>

      <nav className="menu" ref={menuRef}>
        <button
          type="button"
          className="menu-boton"
          ref={botonRef}
          aria-expanded={abierto}
          aria-controls="menu-opciones"
          onClick={() => setAbierto(!abierto)}
        >
          Menú <span aria-hidden="true">▾</span>
        </button>

        {abierto && (
          <ul className="menu-lista" id="menu-opciones">
            {OPCIONES.map((opcion) => (
              <li key={opcion.vista}>
                <button
                  type="button"
                  aria-current={vista === opcion.vista ? 'page' : undefined}
                  onClick={() => navegar(opcion.vista)}
                >
                  {opcion.texto}
                </button>
              </li>
            ))}
            <li className="menu-separador">
              <button type="button" onClick={onLogout}>
                Cerrar sesión
              </button>
            </li>
          </ul>
        )}
      </nav>
    </header>
  )
}
