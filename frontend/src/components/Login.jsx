import { useState } from 'react'
import { login } from '../services/authService'

export default function Login({ onLogin, onIrARegistro, onIrARecuperar, mensajeInicial }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const usuario = await login(email, password)
      onLogin(usuario)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Gestión de Gastos</h1>
      <p className="subtitle">Inicia sesión en tu cuenta</p>

      {mensajeInicial && <div className="alert success">{mensajeInicial}</div>}
      {error && <div className="alert error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit}>
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <p className="olvido">
          <button type="button" className="link" onClick={onIrARecuperar}>
            ¿Olvidaste tu contraseña?
          </button>
        </p>

        <button type="submit" className="primary" disabled={cargando}>
          {cargando ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="switch">
        ¿No tienes cuenta?{' '}
        <button type="button" className="link" onClick={onIrARegistro}>
          Regístrate
        </button>
      </p>
    </div>
  )
}
