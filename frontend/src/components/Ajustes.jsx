import { useEffect, useState } from 'react'
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
} from '../services/categoriaService'

const COLOR_NUEVA = '#e34948'

export default function Ajustes() {
  const [categorias, setCategorias] = useState([])
  const [editandoId, setEditandoId] = useState(null)
  const [nombre, setNombre] = useState('')
  const [prioridad, setPrioridad] = useState(1)
  const [color, setColor] = useState(COLOR_NUEVA)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  // Una categoría nueva se propone justo por encima de la última, para que Ocio siga siendo la menos prioritaria
  function prepararNueva(lista) {
    setEditandoId(null)
    setNombre('')
    setPrioridad(Math.max(lista.length, 1))
    setColor(COLOR_NUEVA)
  }

  async function recargar() {
    const lista = await listarCategorias()
    setCategorias(lista)
    prepararNueva(lista)
  }

  useEffect(() => {
    listarCategorias()
      .then((lista) => {
        setCategorias(lista)
        prepararNueva(lista)
      })
      .catch((err) => setError(err.message))
  }, [])

  function handleEditar(categoria) {
    setError('')
    setEditandoId(categoria.id)
    setNombre(categoria.nombre)
    setPrioridad(categoria.prioridad)
    setColor(categoria.color)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const datos = { nombre, prioridad, color }
      if (editandoId) {
        await actualizarCategoria(editandoId, datos)
      } else {
        await crearCategoria(datos)
      }
      await recargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  async function handleEliminar(categoria) {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return
    setError('')
    try {
      await eliminarCategoria(categoria.id)
      await recargar()
    } catch (err) {
      setError(err.message)
    }
  }

  // Al crear hay una posición más que categorías existentes
  const posiciones = categorias.length + (editandoId ? 0 : 1)

  return (
    <>
      <section className="tarjeta">
        <h1>Ajustes</h1>
        <h2>{editandoId ? 'Editar categoría' : 'Nueva categoría'}</h2>

        {error && <div className="alert error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="nombre-categoria">Nombre</label>
          <input
            id="nombre-categoria"
            maxLength={50}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <div className="campos-fila">
            <div>
              <label htmlFor="prioridad-categoria">Prioridad (1 es la más alta)</label>
              <select
                id="prioridad-categoria"
                value={prioridad}
                onChange={(e) => setPrioridad(Number(e.target.value))}
              >
                {Array.from({ length: posiciones }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="color-categoria">Color en el gráfico</label>
              <input
                id="color-categoria"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="primary" disabled={cargando}>
            {editandoId ? 'Guardar cambios' : 'Crear categoría'}
          </button>
          {editandoId && (
            <button type="button" className="link cancelar" onClick={() => prepararNueva(categorias)}>
              Cancelar
            </button>
          )}
        </form>
      </section>

      <section className="tarjeta">
        <h2>Categorías por prioridad</h2>
        <ul className="lista">
          {categorias.map((categoria) => (
            <li key={categoria.id}>
              <span className="prioridad">{categoria.prioridad}</span>
              <span className="muestra" style={{ background: categoria.color }} />
              <span className="lista-texto">{categoria.nombre}</span>
              <button type="button" className="link" onClick={() => handleEditar(categoria)}>
                Editar
              </button>
              <button type="button" className="link peligro" onClick={() => handleEliminar(categoria)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
