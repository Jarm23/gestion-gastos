const API_URL = '/api/v1/auth'
const STORAGE_KEY = 'usuario'

async function post(path, body) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.mensaje || 'Ha ocurrido un error, inténtalo de nuevo')
  }
  return data
}

export async function login(email, password) {
  const usuario = await post('/login', { email, password })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario))
  return usuario
}

export function registrar(nombre, email, password) {
  return post('/registro', { nombre, email, password })
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getUsuarioActual() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}
