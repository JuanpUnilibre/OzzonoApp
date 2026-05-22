import { useState } from 'react'
import PantallaVenta from './components/PantallaVenta'
import PantallaAdmin from './components/PantallaAdmin'

function App() {
  const [pantalla, setPantalla] = useState('venta')

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">⚡ Ozzono</h1>
        <button
          className="btn-nav"
          onClick={() => setPantalla(pantalla === 'venta' ? 'admin' : 'venta')}
        >

          {pantalla === 'venta' 
            ? <><span className="material-icons">hardware</span> Admin</> 
            : <><span className="material-icons">storefront</span> Ventas</>}


        </button>
      </header>
      <main className="main">
        {pantalla === 'venta'
          ? <PantallaVenta />
          : <PantallaAdmin />}
      </main>
    </div>
  )
}

export default App