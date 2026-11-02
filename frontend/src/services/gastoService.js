import { request } from './api'

export function listarGastos(anio) {
  return request(`/gastos?anio=${anio}`)
}

export function crearGasto(gasto) {
  return request('/gastos', { method: 'POST', body: gasto })
}

export function eliminarGasto(id) {
  return request(`/gastos/${id}`, { method: 'DELETE' })
}
