// Mismo formato que genera "Exportar a Excel": hoja "Gastos" con estas columnas
export const COLUMNAS = { fecha: 'Fecha', descripcion: 'Descripción', categoria: 'Categoría', importe: 'Importe' }
export const MAXIMO_GASTOS = 1000

// Sin mayúsculas, tildes ni espacios de más: "  Alimentacion " encuentra "Alimentación"
export function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
}

const dosDigitos = (n) => String(n).padStart(2, '0')

function fechaValida(anio, mes, dia) {
  const fecha = new Date(Date.UTC(anio, mes - 1, dia))
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia
}

/** Devuelve 'yyyy-mm-dd' o null. Acepta fechas de Excel, su número de serie y texto dd/mm/aaaa o aaaa-mm-dd. */
export function aFechaISO(valor) {
  if (valor instanceof Date) {
    // read-excel-file entrega las fechas a medianoche UTC
    return Number.isNaN(valor.getTime()) ? null : valor.toISOString().slice(0, 10)
  }
  if (typeof valor === 'number' && valor > 0) {
    // Celda numérica sin formato de fecha: días desde el 30/12/1899
    return new Date(Date.UTC(1899, 11, 30) + Math.round(valor) * 86400000).toISOString().slice(0, 10)
  }
  const texto = String(valor ?? '').trim()
  let partes = texto.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (partes) {
    const [, dia, mes, anio] = partes.map(Number)
    return fechaValida(anio, mes, dia) ? `${anio}-${dosDigitos(mes)}-${dosDigitos(dia)}` : null
  }
  partes = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (partes) {
    const [, anio, mes, dia] = partes.map(Number)
    return fechaValida(anio, mes, dia) ? `${anio}-${dosDigitos(mes)}-${dosDigitos(dia)}` : null
  }
  return null
}

/** Devuelve el importe redondeado a céntimos o NaN. Acepta números y texto como "12,50", "1.234,56" o "12.50 €". */
export function aImporte(valor) {
  if (typeof valor === 'number') return Math.round(valor * 100) / 100
  let texto = String(valor ?? '').replace(/[€\s]/g, '')
  if (!texto) return NaN
  // Si hay coma, es la coma decimal española y los puntos son de miles
  if (texto.includes(',')) texto = texto.replace(/\./g, '').replace(',', '.')
  if (!/^-?\d+(\.\d+)?$/.test(texto)) return NaN
  return Math.round(Number(texto) * 100) / 100
}

const estaVacia = (fila) => fila.every((celda) => celda === null || celda === undefined || String(celda).trim() === '')

const claveGasto = ({ fecha, descripcion, monto, categoriaId }) =>
  `${fecha}|${normalizar(descripcion)}|${Math.round(monto * 100)}|${categoriaId}`

/**
 * Convierte las filas del Excel (la primera es la cabecera) en gastos listos para enviar.
 * Cada resultado lleva `errores` (la fila no se puede importar) y `duplicado`
 * (ya existe un gasto idéntico, o se repite dentro del propio archivo).
 */
export function validarFilas(filas, { categorias, gastosExistentes = [], hoy }) {
  if (!filas.length) throw new Error('El archivo está vacío')

  const [cabecera, ...datos] = filas
  const titulos = cabecera.map(normalizar)
  const indice = Object.fromEntries(
    Object.entries(COLUMNAS).map(([clave, titulo]) => [clave, titulos.indexOf(normalizar(titulo))]),
  )
  const faltan = Object.keys(COLUMNAS).filter((clave) => indice[clave] === -1)
  if (faltan.length) {
    throw new Error(
      `Faltan columnas: ${faltan.map((c) => COLUMNAS[c]).join(', ')}. ` +
        `La primera fila debe tener ${Object.values(COLUMNAS).join(', ')}.`,
    )
  }

  const categoriaPorNombre = new Map(categorias.map((c) => [normalizar(c.nombre), c]))
  const existentes = new Set(gastosExistentes.map(claveGasto))
  const vistas = new Set()

  return datos
    .map((fila, i) => ({ fila, numeroFila: i + 2 })) // la cabecera es la fila 1 en Excel
    .filter(({ fila }) => !estaVacia(fila))
    // La fila "Total" que añade la exportación no es un gasto
    .filter(({ fila }) => normalizar(fila[indice.categoria]) !== 'total' || fila[indice.fecha])
    .map(({ fila, numeroFila }) => {
      const textoCategoria = String(fila[indice.categoria] ?? '').trim()
      const fecha = aFechaISO(fila[indice.fecha])
      const descripcion = String(fila[indice.descripcion] ?? '').trim()
      const categoria = categoriaPorNombre.get(normalizar(textoCategoria))
      const monto = aImporte(fila[indice.importe])

      const errores = []
      if (!fecha) errores.push('fecha no válida')
      else if (fecha > hoy) errores.push('fecha futura')
      if (!descripcion) errores.push('sin descripción')
      else if (descripcion.length > 255) errores.push('descripción de más de 255 caracteres')
      if (!textoCategoria) errores.push('sin categoría')
      else if (!categoria) errores.push(`la categoría "${textoCategoria}" no existe`)
      if (Number.isNaN(monto)) errores.push('importe no válido')
      else if (monto <= 0) errores.push('el importe debe ser mayor que 0')

      const gasto = {
        fecha,
        descripcion,
        monto,
        categoriaId: categoria?.id ?? null,
        categoria: categoria?.nombre ?? textoCategoria,
      }

      let duplicado = false
      if (!errores.length) {
        const clave = claveGasto(gasto)
        duplicado = existentes.has(clave) || vistas.has(clave)
        vistas.add(clave)
      }

      return { numeroFila, gasto, errores, duplicado }
    })
}

/** Lee la hoja "Gastos" (o la primera si no existe) como una tabla de filas. */
export async function leerFilasExcel(archivo) {
  // La librería solo se descarga cuando alguien importa
  const { default: leerExcel } = await import('read-excel-file/browser')
  let hojas
  try {
    hojas = await leerExcel(archivo)
  } catch {
    throw new Error('No se pudo leer el archivo. Comprueba que es un Excel (.xlsx).')
  }
  const hoja = hojas.find((h) => normalizar(h.sheet) === 'gastos') ?? hojas[0]
  return hoja?.data ?? []
}
