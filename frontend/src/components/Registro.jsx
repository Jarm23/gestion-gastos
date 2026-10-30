import { useState } from 'react'
import { registrar } from '../services/authService'

export default function Registro({ onRegistrado, onIrALogin }) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }
    setCargando(true)
    try {
      await registrar(nombre, email, password)
      onRegistrado()
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Crear cuenta</h1>
      <p className="subtitle">Empieza a controlar tus gastos</p>

      {error && <div className="alert error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          autoComplete="name"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="confirmar">Repite la contraseña</label>
        <input
          id="confirmar"
          type="password"
          autoComplete="new-password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          required
        />

        <button type="submit" className="primary" disabled={cargando}>
          {cargando ? 'Creando cuenta…' : 'Registrarme'}
        </button>
      </form>

      <p className="switch">
        ¿Ya tienes cuenta?{' '}
        <button type="button" className="link" onClick={onIrALogin}>
          Inicia sesión
        </button>
      </p>
    </div>
  )
}
