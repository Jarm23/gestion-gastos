import { useEffect, useState } from 'react'
import Login from './components/Login'
import Registro from './components/Registro'
import Inicio from './components/Inicio'
import { getUsuarioActual, logout } from './services/authService'
import { onSesionExpirada } from './services/api'
import './App.css'

function App() {
  const [usuario, setUsuario] = useState(getUsuarioActual)
  const [vista, setVista] = useState('login')
  const [mensaje, setMensaje] = useState('')

  function cerrarSesion() {
    logout()
    setUsuario(null)
    setVista('login')
  }

  useEffect(() => {
    onSesionExpirada(() => {
      cerrarSesion()
      setMensaje('Tu sesión ha caducado. Vuelve a iniciar sesión.')
    })
  }, [])

  if (usuario) {
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
          onIrALogin={() => setVista('login')}
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
      />
    </div>
  )
}

export default App
