import { useEffect, useState } from 'react'
import Login from './components/Login'
import Registro from './components/Registro'
import RecuperarPassword from './components/RecuperarPassword'
import RestablecerPassword from './components/RestablecerPassword'
import Inicio from './components/Inicio'
import { getUsuarioActual, logout } from './services/authService'
import { onSesionExpirada } from './services/api'
import './App.css'

// El enlace de recuperación llega como /?token=...; se lee una vez y se quita de la URL
// para que no quede en el historial ni se comparta por error
function leerTokenDeLaUrl() {
  const token = new URLSearchParams(window.location.search).get('token')
  if (token) {
    window.history.replaceState(null, '', window.location.pathname)
  }
  return token
}

function App() {
  const [usuario, setUsuario] = useState(getUsuarioActual)
  const [tokenRecuperacion] = useState(leerTokenDeLaUrl)
  const [vista, setVista] = useState(() => (tokenRecuperacion ? 'restablecer' : 'login'))
  const [mensaje, setMensaje] = useState('')

  function cerrarSesion() {
    logout()
    setUsuario(null)
    setVista('login')
  }

  function irALogin() {
    setMensaje('')
    setVista('login')
  }

  useEffect(() => {
    onSesionExpirada(() => {
      cerrarSesion()
      setMensaje('Tu sesión ha caducado. Vuelve a iniciar sesión.')
    })
  }, [])

  if (usuario && vista !== 'restablecer') {
    return <Inicio usuario={usuario} onLogout={cerrarSesion} />
  }

  if (vista === 'registro') {
    return (
      <div className="auth-page">
        <Registro
          onRegistrado={() => {
            setMensaje('Cuenta creada. Ya puedes iniciar sesión.')
            setVista('login')
          }}
          onIrALogin={irALogin}
        />
      </div>
    )
  }

  if (vista === 'recuperar') {
    return (
      <div className="auth-page">
        <RecuperarPassword onIrALogin={irALogin} />
      </div>
    )
  }

  if (vista === 'restablecer') {
    return (
      <div className="auth-page">
        <RestablecerPassword
          token={tokenRecuperacion}
          onRestablecida={() => {
            // Con la contraseña cambiada, se cierra cualquier sesión abierta en este navegador
            logout()
            setUsuario(null)
            setMensaje('Contraseña cambiada. Ya puedes iniciar sesión.')
            setVista('login')
          }}
          onIrALogin={irALogin}
        />
      </div>
    )
  }

  return (
    <div className="auth-page">
      <Login
        key={mensaje}
        mensajeInicial={mensaje}
        onLogin={(u) => {
          setMensaje('')
          setUsuario(u)
        }}
        onIrARegistro={() => {
          setMensaje('')
          setVista('registro')
        }}
        onIrARecuperar={() => {
          setMensaje('')
          setVista('recuperar')
        }}
      />
    </div>
  )
}

export default App
