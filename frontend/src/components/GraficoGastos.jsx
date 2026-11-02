import { useEffect, useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { listarCategorias } from '../services/categoriaService'
import { listarGastos } from '../services/gastoService'
import { exportarGastosExcel } from '../utils/exportarExcel'
import { formatoEuros, formatoFecha, formatoPorcentaje, nombreMes } from '../utils/formato'

const dosDigitos = (n) => String(n).padStart(2, '0')

function DetalleCategoria({ active, payload, total }) {
  const fila = payload?.[0]?.payload
  if (!active || !fila) return null
  return (
    <div className="grafico-detalle">
      <strong>{fila.nombre}</strong>
      <ul>
        <li>
          <span className="muestra" style={{ background: fila.color }} />
          <span>{formatoPorcentaje(fila.total, total)}</span>
          <span className="grafico-detalle-valor">{formatoEuros(fila.total)}</span>
        </li>
      </ul>
    </div>
  )
}

export default function GraficoGastos({ onIrARegistro }) {
  const hoy = new Date()
  const anioActual = hoy.getFullYear()
  const mesActual = hoy.getMonth() + 1

  // mes 0 significa
  const [periodo, setPeriodo] = useState({ anio: anioActual, mes: mesActual })
  const [categorias, setCategorias] = useState([])
  const [gastos, setGastos] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [exportando, setExportando] = useState(false)

  const { anio, mes } = periodo

  useEffect(() => {
    let vigente = true
    setCargando(true)
    Promise.all([listarCategorias(), listarGastos(anio)])
      .then(([listaCategorias, listaGastos]) => {
        if (!vigente) return
        setCategorias(listaCategorias)
        setGastos(listaGastos)
        setError('')
      })
      .catch((err) => vigente && setError(err.message))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [anio])

  const gastosPeriodo = useMemo(() => {
    const prefijo = mes ? `${anio}-${dosDigitos(mes)}` : `${anio}-`
    return gastos.filter((gasto) => gasto.fecha.startsWith(prefijo))
  }, [gastos, anio, mes])

  // Las categorías llegan ordenadas por prioridad, así que el círculo empieza por la más prioritaria
  const resumen = useMemo(
    () =>
      categorias
        .map((categoria) => ({
          id: categoria.id,
          nombre: categoria.nombre,
          color: categoria.color,
          total: Math.round(
            gastosPeriodo
              .filter((gasto) => gasto.categoriaId === categoria.id)
              .reduce((suma, gasto) => suma + gasto.monto * 100, 0),
          ) / 100,
        }))
        .filter((fila) => fila.total > 0),
    [categorias, gastosPeriodo],
  )

  const total = resumen.reduce((suma, fila) => suma + fila.total, 0)

  const gruposPorMes = useMemo(() => {
    const grupos = new Map()
    ;[...gastosPeriodo]
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)
      .forEach((gasto) => {
        const numeroMes = Number(gasto.fecha.slice(5, 7))
        if (!grupos.has(numeroMes)) grupos.set(numeroMes, { mes: numeroMes, gastos: [], total: 0 })
        const grupo = grupos.get(numeroMes)
        grupo.gastos.push(gasto)
        grupo.total += gasto.monto
      })
    return [...grupos.values()]
  }, [gastosPeriodo])

  const colorDe = useMemo(
    () => Object.fromEntries(categorias.map((categoria) => [categoria.id, categoria.color])),
    [categorias],
  )

  const etiquetaPeriodo = mes ? `${nombreMes(mes)} ${anio}` : `${anio}`
  const esUltimoPeriodo = mes
    ? anio * 12 + mes >= anioActual * 12 + mesActual
    : anio >= anioActual

  function mover(delta) {
    setPeriodo(({ anio: a, mes: m }) => {
      if (!m) return { anio: a + delta, mes: 0 }
      const indice = a * 12 + (m - 1) + delta
      return { anio: Math.floor(indice / 12), mes: (indice % 12) + 1 }
    })
  }

  function cambiarModo(porMes) {
    setPeriodo(({ anio: a }) => ({ anio: a, mes: porMes ? (a === anioActual ? mesActual : 12) : 0 }))
  }

  async function handleExportar() {
    setError('')
    setExportando(true)
    try {
      await exportarGastosExcel({
        gastos: gastosPeriodo,
        resumen,
        nombreArchivo: `gastos-${anio}${mes ? `-${dosDigitos(mes)}` : ''}.xlsx`,
      })
    } catch {
      setError('No se pudo crear el archivo de Excel')
    } finally {
      setExportando(false)
    }
  }

  return (
    <>
      <section className="tarjeta">
        <div className="cabecera-grafico">
          <div className="titulo-grafico">
            <h1>Gastos por categoría</h1>
            <button type="button" className="boton-pequeno" onClick={onIrARegistro}>
              + Añadir gasto
            </button>
          </div>
          <div className="controles-periodo">
            <div className="modo-periodo" role="group" aria-label="Periodo">
              <button type="button" aria-pressed={mes !== 0} onClick={() => cambiarModo(true)}>Mes</button>
              <button type="button" aria-pressed={mes === 0} onClick={() => cambiarModo(false)}>Año</button>
            </div>
            <div className="selector-anio">
              <button type="button" aria-label="Periodo anterior" onClick={() => mover(-1)}>‹</button>
              <span className="etiqueta-periodo">{etiquetaPeriodo}</span>
              <button
                type="button"
                aria-label="Periodo siguiente"
                disabled={esUltimoPeriodo}
                onClick={() => mover(1)}
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {error && <div className="alert error" role="alert">{error}</div>}

        {!error && !cargando && resumen.length === 0 && (
          <div className="vacio">
            <p>No hay gastos registrados en {etiquetaPeriodo}.</p>
            <button type="button" className="link" onClick={onIrARegistro}>
              Registrar un gasto
            </button>
          </div>
        )}

        {resumen.length > 0 && (
          <div className="grafico-circular" style={{ opacity: cargando ? 0.5 : 1 }}>
            <div className="grafico">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resumen}
                    dataKey="total"
                    nameKey="nombre"
                    innerRadius="68%"
                    outerRadius="100%"
                    paddingAngle={2}
                    cornerRadius={4}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {resumen.map((fila) => (
                      <Cell key={fila.id} fill={fila.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<DetalleCategoria total={total} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grafico-centro">
                <span className="grafico-centro-total">{formatoEuros(total)}</span>
                <span className="grafico-centro-texto">{etiquetaPeriodo}</span>
              </div>
            </div>

            <ul className="leyenda-detalle">
              {resumen.map((fila) => (
                <li key={fila.id}>
                  <span className="muestra" style={{ background: fila.color }} />
                  <span className="leyenda-nombre">{fila.nombre}</span>
                  <span className="leyenda-porcentaje">{formatoPorcentaje(fila.total, total)}</span>
                  <span className="leyenda-importe">{formatoEuros(fila.total)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {gastosPeriodo.length > 0 && (
        <section className="tarjeta" style={{ opacity: cargando ? 0.5 : 1 }}>
          <div className="cabecera-lista">
            <h2>Gastos registrados</h2>
            <button type="button" className="secundario" onClick={handleExportar} disabled={exportando}>
              {exportando ? 'Exportando…' : 'Exportar a Excel'}
            </button>
          </div>

          {gruposPorMes.map((grupo) => (
            <div key={grupo.mes} className="grupo-mes">
              <h3>
                <span>{nombreMes(grupo.mes)} {anio}</span>
                <span className="lista-importe">{formatoEuros(grupo.total)}</span>
              </h3>
              <ul className="lista">
                {grupo.gastos.map((gasto) => (
                  <li key={gasto.id}>
                    <time className="lista-fecha" dateTime={gasto.fecha}>{formatoFecha(gasto.fecha)}</time>
                    <span className="muestra" style={{ background: colorDe[gasto.categoriaId] }} />
                    <span className="lista-texto">
                      <span>{gasto.descripcion}</span>
                      <small>{gasto.categoria}</small>
                    </span>
                    <span className="lista-importe">{formatoEuros(gasto.monto)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </>
  )
}
