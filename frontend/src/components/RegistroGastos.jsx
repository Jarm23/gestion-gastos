import { useEffect, useState } from 'react'
import { listarCategorias } from '../services/categoriaService'
import { crearGasto, eliminarGasto, listarGastos } from '../services/gastoService'
import { formatoEuros, formatoFecha, hoyISO } from '../utils/formato'

export default function RegistroGastos({ onIrAAjustes }) {
  const [categorias, setCategorias] = useState([])
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [fecha, setFecha] = useState(hoyISO)
  const [mes, setMes] = useState(() => hoyISO().slice(0, 7))
  const [gastos, setGastos] = useState([])
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [cargando, setCargando] = useState(false)

  const anio = mes.slice(0, 4)

  useEffect(() => {
    listarCategorias()
      .then((lista) => {
        setCategorias(lista)
        setCategoriaId(lista[0]?.id ?? '')
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    let vigente = true
    listarGastos(anio)
      .then((lista) => vigente && setGastos(lista))
      .catch((err) => vigente && setError(err.message))
    return () => {
      vigente = false
    }
  }, [anio])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setExito('')
    setCargando(true)
    try {
      await crearGasto({ descripcion, monto, categoriaId, fecha })
      setDescripcion('')
      setMonto('')
      setExito('Gasto registrado')
      // Muestra en la lista el mes del gasto recién creado
      setMes(fecha.slice(0, 7))
      if (fecha.slice(0, 4) === anio) {
        setGastos(await listarGastos(anio))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  async function handleEliminar(gasto) {
    if (!window.confirm(`¿Eliminar "${gasto.descripcion}"?`)) return
    setError('')
    setExito('')
    try {
      await eliminarGasto(gasto.id)
      setGastos(gastos.filter((g) => g.id !== gasto.id))
    } catch (err) {
      setError(err.message)
    }
  }

  const gastosDelMes = gastos.filter((g) => g.fecha.startsWith(mes))

  return (
    <>
      <section className="tarjeta">
        <h1>Registro de gastos</h1>
        <p className="subtitle">Las categorías aparecen ordenadas por prioridad.</p>

        {exito && <div className="alert success">{exito}</div>}
        {error && <div className="alert error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="descripcion">Descripción</label>
          <input
            id="descripcion"
            maxLength={255}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />

          <div className="campos-fila">
            <div>
              <label htmlFor="monto">Importe (€)</label>
              <input
                id="monto"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="fecha">Fecha</label>
              <input
                id="fecha"
                type="date"
                max={hoyISO()}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
          </div>

          <label htmlFor="categoria">Categoría</label>
          <select
            id="categoria"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.prioridad}. {c.nombre}</option>
            ))}
          </select>
          <p className="ayuda">
            ¿Necesitas otra?{' '}
            <button type="button" className="link" onClick={onIrAAjustes}>
              Crea tu categoría en Ajustes
            </button>
          </p>

          <button type="submit" className="primary" disabled={cargando}>
            {cargando ? 'Guardando…' : 'Registrar gasto'}
          </button>
        </form>
      </section>

      <section className="tarjeta">
        <div className="cabecera-lista">
          <h2>Gastos del mes</h2>
          <input
            type="month"
            aria-label="Mes"
            max={hoyISO().slice(0, 7)}
            value={mes}
            onChange={(e) => e.target.value && setMes(e.target.value)}
          />
        </div>

        {gastosDelMes.length === 0 ? (
          <p className="subtitle">No hay gastos en este mes.</p>
        ) : (
          <ul className="lista">
            {gastosDelMes.map((gasto) => (
              <li key={gasto.id}>
                <div className="lista-texto">
                  <span>{gasto.descripcion}</span>
                  <small>{formatoFecha(gasto.fecha)} · {gasto.categoria}</small>
                </div>
                <span className="lista-importe">{formatoEuros(gasto.monto)}</span>
                <button type="button" className="link peligro" onClick={() => handleEliminar(gasto)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
