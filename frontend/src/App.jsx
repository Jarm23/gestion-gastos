import { useState } from 'react'
import Login from './components/Login'
import Registro from './components/Registro'
import Inicio from './components/Inicio'
import { getUsuarioActual, logout } from './services/authService'
import './App.css'

function App() {
  const [usuario, setUsuario] = useState(getUsuarioActual)
  const [vista, setVista] = useState('login')
  const [mensaje, setMensaje] = useState('')

  if (usuario) {
    return (
      <Inicio
        usuario={usuario}
        onLogout={() => {
          logout()
          setUsuario(null)
          setVista('login')
        }}
      />
    )
  }

  if (vista === 'registro') {
    return (
      <Registro
        onRegistrado={() => {
          setMensaje('Cuenta creada. Ya puedes iniciar sesión.')
          setVista('login')
        }}
        onIrALogin={() => setVista('login')}
      />
    )
  }

  return (
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
  )
}

export default App
