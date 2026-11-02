export default function Cuenta({ usuario }) {
  return (
    <section className="tarjeta">
      <h1>Cuenta</h1>
      <dl className="datos-cuenta">
        <dt>Nombre</dt>
        <dd>{usuario.nombre}</dd>
        <dt>Email</dt>
        <dd>{usuario.email}</dd>
      </dl>
    </section>
  )
}
