import { useState } from 'react'
import BarraMenu from './BarraMenu'
import GraficoGastos from './GraficoGastos'
import Cuenta from './Cuenta'
import RegistroGastos from './RegistroGastos'
import Ajustes from './Ajustes'

export default function Inicio({ usuario, onLogout }) {
  const [vista, setVista] = useState('grafico')

  return (
    <div className="app">
      <BarraMenu vista={vista} onNavegar={setVista} onLogout={onLogout} />
      <main className="contenido">
        {vista === 'grafico' && <GraficoGastos onIrARegistro={() => setVista('registro')} />}
        {vista === 'cuenta' && <Cuenta usuario={usuario} />}
        {vista === 'registro' && <RegistroGastos onIrAAjustes={() => setVista('ajustes')} />}
        {vista === 'ajustes' && <Ajustes />}
      </main>
    </div>
  )
}
