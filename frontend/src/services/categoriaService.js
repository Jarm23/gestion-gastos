import { request } from './api'

export function listarCategorias() {
  return request('/categorias')
}

export function crearCategoria(categoria) {
  return request('/categorias', { method: 'POST', body: categoria })
}

export function actualizarCategoria(id, categoria) {
  return request(`/categorias/${id}`, { method: 'PUT', body: categoria })
}

export function eliminarCategoria(id) {
  return request(`/categorias/${id}`, { method: 'DELETE' })
}
