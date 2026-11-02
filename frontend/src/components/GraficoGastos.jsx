import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { listarCategorias } from '../services/categoriaService'
import { listarGastos } from '../services/gastoService'
import { formatoEuros, formatoEurosCompacto, MESES } from '../utils/formato'

const clave = (categoria) => `c${categoria.id}`

// Tramo de la barra apilada: separado del de abajo por un hueco y redondeado solo arriba del todo
function Tramo({ x, y, width, height, fill, esBase, esTope }) {
  if (!height) return null
  const alto = esBase ? height : Math.max(height - 2, 1)
  if (!esTope) return <rect x={x} y={y} width={width} height={alto} fill={fill} />
  const r = Math.min(4, alto, width / 2)
  return (
    <path
      d={`M${x},${y + alto} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${y + alto} Z`}
      fill={fill}
    />
  )
}

function DetalleMes({ active, payload, categorias }) {
  const fila = payload?.[0]?.payload
  if (!active || !fila?.total) return null
  return (
    <div className="grafico-detalle">
      <strong>{fila.mes}: {formatoEuros(fila.total)}</strong>
      <ul>
        {categorias.filter((c) => fila[clave(c)]).map((c) => (
          <li key={c.id}>
            <span className="muestra" style={{ background: c.color }} />
            <span>{c.nombre}</span>
            <span className="grafico-detalle-valor">{formatoEuros(fila[clave(c)])}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function GraficoGastos({ onIrARegistro }) {
  const anioActual = new Date().getFullYear()
  const [anio, setAnio] = useState(anioActual)
  const [categorias, setCategorias] = useState([])
  const [gastos, setGastos] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

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

  const datos = useMemo(() => {
    const meses = MESES.map((mes) => ({ mes, total: 0 }))
    gastos.forEach((gasto) => {
      const fila = meses[Number(gasto.fecha.slice(5, 7)) - 1]
      const k = `c${gasto.categoriaId}`
      fila[k] = (fila[k] || 0) + gasto.monto
      fila.total += gasto.monto
    })
    return meses
  }, [gastos])

  const totalAnio = datos.reduce((suma, fila) => suma + fila.total, 0)

  return (
    <section className="tarjeta">
      <div className="cabecera-grafico">
        <div>
          <h1>Gastos mensuales</h1>
          <p className="total-anio">{formatoEuros(totalAnio)}</p>
          <p className="subtitle">Total de {anio}</p>
        </div>
        <div className="selector-anio">
          <button type="button" aria-label="Año anterior" onClick={() => setAnio(anio - 1)}>‹</button>
          <span>{anio}</span>
          <button
            type="button"
            aria-label="Año siguiente"
            disabled={anio >= anioActual}
            onClick={() => setAnio(anio + 1)}
          >
            ›
          </button>
        </div>
      </div>

      {error && <div className="alert error" role="alert">{error}</div>}

      {!error && !cargando && gastos.length === 0 && (
        <div className="vacio">
          <p>No hay gastos registrados en {anio}.</p>
          <button type="button" className="link" onClick={onIrARegistro}>
            Registrar un gasto
          </button>
        </div>
      )}

      {gastos.length > 0 && (
        <>
          <div className="grafico" style={{ opacity: cargando ? 0.5 : 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datos} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="mes" tickLine={false} axisLine={{ stroke: '#d1d5db' }} tick={{ fill: '#6b7280', fontSize: 13 }} />
                <YAxis
                  width={64}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280', fontSize: 13 }}
                  tickFormatter={formatoEurosCompacto}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                  content={<DetalleMes categorias={categorias} />}
                />
                {/* La categoría más prioritaria queda en la base de cada barra */}
                {categorias.map((categoria, i) => (
                  <Bar
                    key={categoria.id}
                    dataKey={clave(categoria)}
                    name={categoria.nombre}
                    stackId="gastos"
                    fill={categoria.color}
                    maxBarSize={24}
                    isAnimationActive={false}
                    shape={(props) => (
                      <Tramo
                        {...props}
                        esBase={categorias.slice(0, i).every((c) => !props.payload[clave(c)])}
                        esTope={categorias.slice(i + 1).every((c) => !props.payload[clave(c)])}
                      />
                    )}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ul className="leyenda">
            {categorias.map((categoria) => (
              <li key={categoria.id}>
                <span className="muestra" style={{ background: categoria.color }} />
                {categoria.nombre}
              </li>
            ))}
          </ul>

          <details className="tabla-grafico">
            <summary>Ver los datos en una tabla</summary>
            <div className="tabla-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Categoría</th>
                    {MESES.map((mes) => <th scope="col" key={mes}>{mes}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((categoria) => (
                    <tr key={categoria.id}>
                      <th scope="row">{categoria.nombre}</th>
                      {datos.map((fila) => (
                        <td key={fila.mes}>{fila[clave(categoria)] ? formatoEuros(fila[clave(categoria)]) : '–'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row">Total</th>
                    {datos.map((fila) => (
                      <td key={fila.mes}>{fila.total ? formatoEuros(fila.total) : '–'}</td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  )
}
