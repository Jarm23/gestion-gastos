import { useEffect, useMemo, useState } from 'react'
import GraficoCircular from './GraficoCircular'
import { listarCategorias } from '../services/categoriaService'
import { listarGastos } from '../services/gastoService'
import { listarGrupos } from '../services/grupoService'
import { exportarGastosExcel } from '../utils/exportarExcel'
import { formatoEuros, formatoFecha, nombreMes } from '../utils/formato'
import { esGastosFijos, resumirGastos } from '../utils/resumen'

const dosDigitos = (n) => String(n).padStart(2, '0')
const prefijoMes = (anio, mes) => `${anio}-${dosDigitos(mes)}`

export default function GraficoGastos({ onIrARegistro }) {
  const hoy = new Date()
  const anioActual = hoy.getFullYear()
  const mesActual = hoy.getMonth() + 1

  // mes 0 significa el año completo
  const [periodo, setPeriodo] = useState({ anio: anioActual, mes: mesActual })
  const [categorias, setCategorias] = useState([])
  const [grupos, setGrupos] = useState([])
  const [gastos, setGastos] = useState([])
  // Solo hace falta pedirlos aparte cuando el gráfico principal muestra otro año
  const [gastosAnioActual, setGastosAnioActual] = useState([])
  const [agrupar, setAgrupar] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [exportando, setExportando] = useState(false)

  const { anio, mes } = periodo

  useEffect(() => {
    let vigente = true
    Promise.all([listarCategorias(), listarGrupos()])
      .then(([listaCategorias, listaGrupos]) => {
        if (!vigente) return
        setCategorias(listaCategorias)
        setGrupos(listaGrupos)
      })
      .catch((err) => vigente && setError(err.message))
    return () => {
      vigente = false
    }
  }, [])

  useEffect(() => {
    let vigente = true
    setCargando(true)
    listarGastos(anio)
      .then((lista) => {
        if (!vigente) return
        setGastos(lista)
        setError('')
      })
      .catch((err) => vigente && setError(err.message))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [anio])

  useEffect(() => {
    if (anio === anioActual) return undefined
    let vigente = true
    listarGastos(anioActual)
      .then((lista) => vigente && setGastosAnioActual(lista))
      .catch((err) => vigente && setError(err.message))
    return () => {
      vigente = false
    }
  }, [anio, anioActual])

  const gastosPeriodo = useMemo(() => {
    const prefijo = mes ? prefijoMes(anio, mes) : `${anio}-`
    return gastos.filter((gasto) => gasto.fecha.startsWith(prefijo))
  }, [gastos, anio, mes])

  // Las categorías llegan ordenadas por prioridad, así que el círculo empieza por la más prioritaria
  const resumen = useMemo(
    () => resumirGastos({ gastos: gastosPeriodo, categorias, grupos, agrupar }),
    [gastosPeriodo, categorias, grupos, agrupar],
  )

  // Segundo gráfico: el mes en curso sin la categoría Gastos Fijos
  const categoriasVariables = useMemo(() => categorias.filter((c) => !esGastosFijos(c)), [categorias])
  const hayGastosFijos = categoriasVariables.length < categorias.length
  const resumenMesVariable = useMemo(() => {
    const prefijo = prefijoMes(anioActual, mesActual)
    const delMes = (anio === anioActual ? gastos : gastosAnioActual).filter((g) => g.fecha.startsWith(prefijo))
    return resumirGastos({ gastos: delMes, categorias: categoriasVariables, grupos, agrupar })
  }, [anio, anioActual, mesActual, gastos, gastosAnioActual, categoriasVariables, grupos, agrupar])

  const gruposPorMes = useMemo(() => {
    const porMes = new Map()
    ;[...gastosPeriodo]
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)
      .forEach((gasto) => {
        const numeroMes = Number(gasto.fecha.slice(5, 7))
        if (!porMes.has(numeroMes)) porMes.set(numeroMes, { mes: numeroMes, gastos: [], total: 0 })
        const bloque = porMes.get(numeroMes)
        bloque.gastos.push(gasto)
        bloque.total += gasto.monto
      })
    return [...porMes.values()]
  }, [gastosPeriodo])

  const colorDe = useMemo(
    () => Object.fromEntries(categorias.map((categoria) => [categoria.id, categoria.color])),
    [categorias],
  )

  const etiquetaPeriodo = mes ? `${nombreMes(mes)} ${anio}` : `${anio}`
  const etiquetaMesActual = `${nombreMes(mesActual)} ${anioActual}`
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
        // El Excel siempre resume por categoría, aunque el gráfico esté agrupado
        resumen: resumirGastos({ gastos: gastosPeriodo, categorias }),
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
            <h1>{agrupar ? 'Gastos por grupo' : 'Gastos por categoría'}</h1>
            <button type="button" className="boton-pequeno" onClick={onIrARegistro}>
              + Añadir gasto
            </button>
          </div>
          <div className="controles-periodo">
            {grupos.length > 0 && (
              <div className="modo-periodo" role="group" aria-label="Ver por">
                <button type="button" aria-pressed={!agrupar} onClick={() => setAgrupar(false)}>Categorías</button>
                <button type="button" aria-pressed={agrupar} onClick={() => setAgrupar(true)}>Grupos</button>
              </div>
            )}
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

        {resumen.length > 0 && <GraficoCircular resumen={resumen} etiqueta={etiquetaPeriodo} atenuado={cargando} />}
      </section>

      <section className="tarjeta">
        <h2>Este mes sin Gastos Fijos</h2>
        <p className="ayuda">
          {hayGastosFijos
            ? `Lo que llevas gastado en ${etiquetaMesActual} además de los gastos fijos.`
            : 'No tienes una categoría llamada "Gastos Fijos", así que se muestra todo el mes.'}
        </p>
        {resumenMesVariable.length > 0 ? (
          <GraficoCircular resumen={resumenMesVariable} etiqueta={etiquetaMesActual} />
        ) : (
          !cargando && (
            <div className="vacio">
              <p>Aún no hay gastos fuera de Gastos Fijos en {etiquetaMesActual}.</p>
            </div>
          )
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

          {gruposPorMes.map((bloque) => (
            <div key={bloque.mes} className="grupo-mes">
              <h3>
                <span>{nombreMes(bloque.mes)} {anio}</span>
                <span className="lista-importe">{formatoEuros(bloque.total)}</span>
              </h3>
              <ul className="lista">
                {bloque.gastos.map((gasto) => (
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
