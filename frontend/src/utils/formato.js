const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
const eurosCompacto = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function formatoEuros(valor) {
  return euros.format(valor)
}

export function formatoEurosCompacto(valor) {
  return eurosCompacto.format(valor)
}

export function formatoFecha(fecha) {
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

// Fecha local en formato yyyy-mm-dd; toISOString daría la fecha en UTC
export function hoyISO() {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}
