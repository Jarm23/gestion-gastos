export default function Inicio({ usuario, onLogout }) {
  return (
    <div className="auth-card">
      <h1>Hola, {usuario.nombre}</h1>
      <p className="subtitle">Has iniciado sesión como {usuario.email}</p>
      <p>Aquí irá tu panel de gastos.</p>
      <button type="button" className="primary" onClick={onLogout}>
        Cerrar sesión
      </button>
    </div>
  )
}
