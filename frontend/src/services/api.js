const API_URL = '/api/v1'

let alExpirarSesion = () => {}

export function onSesionExpirada(callback) {
  alExpirarSesion = callback
}

export async function request(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor')
  }
  const data = await res.json().catch(() => ({}))
  if (res.status === 401) {
    alExpirarSesion()
  }
  if (!res.ok) {
    throw new Error(data.mensaje || 'Ha ocurrido un error, inténtalo de nuevo')
  }
  return data
}
