import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function PantallaVenta() {
  const [productos, setProductos] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [tipo, setTipo] = useState('pagado')
  const [nombreFiado, setNombreFiado] = useState('')
  const [montoNequi, setMontoNequi] = useState('')
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    cargarProductos()
  }, [])

  async function cargarProductos() {
    const { data } = await supabase.from('productos').select('*')
    setProductos(data || [])
  }

  function calcularComision(monto) {
    if (!monto || monto <= 0) return 0
    return (Math.floor(monto / 50000) + 1) * 1000
  }

  function getPrecio() {
    if (seleccionado?.categoria === 'nequi')
      return calcularComision(parseInt(montoNequi) || 0)
    return (seleccionado?.precio || 0) * cantidad
  }

  async function registrarVenta() {
    if (tipo === 'fiado' && !nombreFiado.trim())
      return alert('Escribe el nombre de quien fía')
    if (seleccionado?.categoria === 'nequi' && parseInt(montoNequi) <= 0)
      return alert('Escribe el monto de la transacción')

    setCargando(true)
    const { error } = await supabase.from('ventas').insert({
      producto_id: seleccionado.id,
      nombre_producto: seleccionado.nombre,
      precio: getPrecio(),
      cantidad: seleccionado.categoria === 'nequi' ? 1 : cantidad,
      tipo,
      nombre_fiado: tipo === 'fiado' ? nombreFiado.trim() : null
    })
    setCargando(false)

    if (!error) {
      setExito(true)
      setTimeout(() => { setExito(false); cerrar() }, 1500)
    } else {
      alert('Error al guardar la venta')
    }
  }

  function cerrar() {
    setSeleccionado(null)
    setCantidad(1)
    setTipo('pagado')
    setNombreFiado('')
    setMontoNequi('')
  }

  const imagenes = {
  'Águila Litro': '/productos/aguila-litro.png',
  'Águila Personal': '/productos/aguila-personal.png',
  'Costeña Roja': '/productos/costena-roja.png',
  'Costeñita Lata': '/productos/costenita-lata.png',
  'Hielo': '/productos/hielo.png',
  'Nequi': '/productos/nequi.png',
  }

  const cervezas = productos.filter(p => p.categoria === 'cerveza')
  const hielo = productos.find(p => p.categoria === 'hielo')
  const nequi = productos.find(p => p.categoria === 'nequi')

  return (
    <div>
      <h2 className="titulo-seccion">¿Qué vas a vender?</h2>

      <p className="categoria-label">Cervezas</p>
      <div className="grid-productos">
        {cervezas.map(p => (
          <div key={p.id} className="card-producto" onClick={() => setSeleccionado(p)}>
            <img src={imagenes[p.nombre]} alt={p.nombre} className="producto-img" />
            <span className="producto-nombre">{p.nombre}</span>
            <span className="producto-precio">${p.precio.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {hielo && (
        <>
          <p className="categoria-label">Hielo</p>
          <div className="grid-productos grid-1">
            <div className="card-producto card-wide" onClick={() => setSeleccionado(hielo)}>
              <img src={imagenes[p.nombre]} alt={p.nombre} className="producto-img" />
              <span className="producto-nombre">{hielo.nombre}</span>
              <span className="producto-precio">${hielo.precio.toLocaleString()} c/u</span>
            </div>
          </div>
        </>
      )}

      {nequi && (
        <>
          <p className="categoria-label">Nequi</p>
          <div className="grid-productos grid-1">
            <div className="card-producto card-wide" onClick={() => setSeleccionado(nequi)}>
              <img src={imagenes[p.nombre]} alt={p.nombre} className="producto-img" />
              <span className="producto-nombre">{nequi.nombre}</span>
              <span className="producto-precio">Comisión variable</span>
            </div>
          </div>
        </>
      )}

      {seleccionado && (
        <div className="modal-overlay" onClick={cerrar}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {exito ? (
              <div className="exito">
                <span>✅</span>
                <p>¡Venta registrada!</p>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <img src={imagenes[seleccionado.nombre]} alt={seleccionado.nombre} className="modal-img" />
                  <h3>{seleccionado.nombre}</h3>
                  <button className="btn-cerrar" onClick={cerrar}>✕</button>
                </div>

                {seleccionado.categoria === 'nequi' ? (
                  <div className="campo">
                    <label>Monto de la transacción</label>
                    <input
                      className="input"
                      type="number"
                      placeholder="Ej: 30000"
                      value={montoNequi}
                      onChange={e => setMontoNequi(e.target.value)}
                    />
                    {parseInt(montoNequi) > 0 && (
                      <p className="comision-nequi">
                        Comisión a cobrar: <strong>${calcularComision(parseInt(montoNequi)).toLocaleString()}</strong>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="cantidad-control">
                    <label>Cantidad</label>
                    <div className="cantidad-row">
                      <button onClick={() => setCantidad(Math.max(1, cantidad - 1))}>−</button>
                      <span>{cantidad}</span>
                      <button onClick={() => setCantidad(cantidad + 1)}>+</button>
                    </div>
                  </div>
                )}

                <div className="tipo-control">
                  <button className={`btn-tipo ${tipo === 'pagado' ? 'activo' : ''}`} onClick={() => setTipo('pagado')}>
                    💵 Pagado
                  </button>
                  <button className={`btn-tipo ${tipo === 'fiado' ? 'activo fiado' : ''}`} onClick={() => setTipo('fiado')}>
                    📝 Fiado
                  </button>
                </div>

                {tipo === 'fiado' && (
                  <div className="campo">
                    <label>¿A nombre de quién?</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="Nombre"
                      value={nombreFiado}
                      onChange={e => setNombreFiado(e.target.value)}
                    />
                  </div>
                )}

                <div className="total-row">
                  <span>Total:</span>
                  <strong>${getPrecio().toLocaleString()}</strong>
                </div>

                <button className="btn-confirmar" onClick={registrarVenta} disabled={cargando}>
                  {cargando ? 'Guardando...' : '✅ Confirmar venta'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}