import { useEffect, useState } from 'react'
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
} from '../services/categoriaService'
import { actualizarGrupo, crearGrupo, eliminarGrupo, listarGrupos } from '../services/grupoService'

const COLOR_NUEVA = '#e34948'
const COLOR_GRUPO_NUEVO = '#475569'

function GruposAjustes({ grupos, categorias, onCambio }) {
  const [editandoId, setEditandoId] = useState(null)
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState(COLOR_GRUPO_NUEVO)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  function prepararNuevo() {
    setEditandoId(null)
    setNombre('')
    setColor(COLOR_GRUPO_NUEVO)
  }

  function handleEditar(grupo) {
    setError('')
    setEditandoId(grupo.id)
    setNombre(grupo.nombre)
    setColor(grupo.color)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const datos = { nombre, color }
      if (editandoId) {
        await actualizarGrupo(editandoId, datos)
      } else {
        await crearGrupo(datos)
      }
      prepararNuevo()
      await onCambio()
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  async function handleEliminar(grupo) {
    if (!window.confirm(`¿Eliminar el grupo "${grupo.nombre}"? Sus categorías se conservan, solo quedan sin grupo.`)) {
      return
    }
    setError('')
    try {
      await eliminarGrupo(grupo.id)
      if (editandoId === grupo.id) prepararNuevo()
      await onCambio()
    } catch (err) {
      setError(err.message)
    }
  }

  const categoriasDe = (grupo) => categorias.filter((c) => c.grupoId === grupo.id).map((c) => c.nombre)

  return (
    <section className="tarjeta">
      <h2>Grupos de categorías</h2>
      <p className="ayuda">
        Un grupo suma varias categorías en una sola porción del gráfico. Asigna cada categoría a su grupo al editarla.
      </p>

      {error && <div className="alert error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="campos-fila">
          <div>
            <label htmlFor="nombre-grupo">{editandoId ? 'Nombre del grupo' : 'Nuevo grupo'}</label>
            <input
              id="nombre-grupo"
              maxLength={50}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="color-grupo">Color en el gráfico</label>
            <input id="color-grupo" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="primary" disabled={cargando}>
          {editandoId ? 'Guardar grupo' : 'Crear grupo'}
        </button>
        {editandoId && (
          <button type="button" className="link cancelar" onClick={prepararNuevo}>
            Cancelar
          </button>
        )}
      </form>

      {grupos.length > 0 && (
        <ul className="lista">
          {grupos.map((grupo) => {
            const incluidas = categoriasDe(grupo)
            return (
              <li key={grupo.id}>
                <span className="muestra" style={{ background: grupo.color }} />
                <span className="lista-texto">
                  <span>{grupo.nombre}</span>
                  <small>{incluidas.length ? incluidas.join(' · ') : 'Sin categorías todavía'}</small>
                </span>
                <button type="button" className="link" onClick={() => handleEditar(grupo)}>
                  Editar
                </button>
                <button type="button" className="link peligro" onClick={() => handleEliminar(grupo)}>
                  Eliminar
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default function Ajustes() {
  const [categorias, setCategorias] = useState([])
  const [grupos, setGrupos] = useState([])
  const [editandoId, setEditandoId] = useState(null)
  const [nombre, setNombre] = useState('')
  const [prioridad, setPrioridad] = useState(1)
  const [color, setColor] = useState(COLOR_NUEVA)
  const [grupoId, setGrupoId] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  // Una categoría nueva se propone justo por encima de la última, para que Ocio siga siendo la menos prioritaria
  function prepararNueva(lista) {
    setEditandoId(null)
    setNombre('')
    setPrioridad(Math.max(lista.length, 1))
    setColor(COLOR_NUEVA)
    setGrupoId('')
  }

  async function recargar() {
    const [lista, listaGrupos] = await Promise.all([listarCategorias(), listarGrupos()])
    setCategorias(lista)
    setGrupos(listaGrupos)
    return lista
  }

  useEffect(() => {
    recargar()
      .then(prepararNueva)
      .catch((err) => setError(err.message))
  }, [])

  function handleEditar(categoria) {
    setError('')
    setEditandoId(categoria.id)
    setNombre(categoria.nombre)
    setPrioridad(categoria.prioridad)
    setColor(categoria.color)
    setGrupoId(categoria.grupoId ?? '')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const datos = { nombre, prioridad, color, grupoId: grupoId === '' ? null : Number(grupoId) }
      if (editandoId) {
        await actualizarCategoria(editandoId, datos)
      } else {
        await crearCategoria(datos)
      }
      prepararNueva(await recargar())
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
      prepararNueva(await recargar())
    } catch (err) {
      setError(err.message)
    }
  }

  // Al crear hay una posición más que categorías existentes
  const posiciones = categorias.length + (editandoId ? 0 : 1)
  const nombreGrupo = Object.fromEntries(grupos.map((g) => [g.id, g.nombre]))

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
            <div>
              <label htmlFor="grupo-categoria">Grupo</label>
              <select id="grupo-categoria" value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
                <option value="">Sin grupo</option>
                {grupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>
                ))}
              </select>
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
              <span className="lista-texto">
                <span>{categoria.nombre}</span>
                {categoria.grupoId && <small>{nombreGrupo[categoria.grupoId]}</small>}
              </span>
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

      <GruposAjustes
        grupos={grupos}
        categorias={categorias}
        onCambio={async () => {
          await recargar()
        }}
      />
    </>
  )
}
