import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function PantallaAdmin() {
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarVentas()
  }, [])

  async function cargarVentas() {
    const { data } = await supabase
      .from('ventas')
      .select('*')
      .order('fecha', { ascending: false })
    setVentas(data || [])
    setCargando(false)
  }

  async function reiniciarDatos() {
    const confirmado = window.confirm('⚠️ ¿Seguro que quieres borrar TODAS las ventas? Esto no se puede deshacer.')
    if (!confirmado) return
    await supabase.from('ventas').delete().neq('id', 0)
    setVentas([])
  }

  const ventasPagadas = ventas.filter(v => v.tipo === 'pagado')
  const fiados = ventas.filter(v => v.tipo === 'fiado')
  const totalRecaudado = ventasPagadas.reduce((sum, v) => sum + v.precio, 0)

  // Agrupar ventas por producto
  const porProducto = ventas.reduce((acc, v) => {
    const key = v.nombre_producto
    if (!acc[key]) acc[key] = { nombre: key, cantidad: 0, total: 0 }
    acc[key].cantidad += v.cantidad
    acc[key].total += v.precio
    return acc
  }, {})

  // Agrupar fiados por persona
  const fiadosPorPersona = fiados.reduce((acc, v) => {
    const key = v.nombre_fiado
    if (!acc[key]) acc[key] = { nombre: key, total: 0, items: [] }
    acc[key].total += v.precio
    acc[key].items.push(v.nombre_producto)
    return acc
  }, {})

  if (cargando) return <p style={{ textAlign: 'center', color: '#64748B', marginTop: 40 }}>Cargando...</p>

  return (
    <div>
      <h2 className="titulo-seccion">📊 Panel Admin</h2>

      {/* Stats generales */}
      <div className="stat-card">
        <h3>Total recaudado</h3>
        <div className="stat-numero">${totalRecaudado.toLocaleString()}</div>
      </div>

      <div className="stat-card">
        <h3>Total ventas registradas</h3>
        <div className="stat-numero">{ventas.length}</div>
      </div>

      {/* Ventas por producto */}
      <div className="stat-card">
        <h3>Ventas por producto</h3>
        {Object.values(porProducto).length === 0 ? (
          <p style={{ color: '#64748B', marginTop: 8 }}>Sin ventas aún</p>
        ) : (
          Object.values(porProducto).map(p => (
            <div key={p.nombre} className="lista-item">
              <span>{p.nombre}</span>
              <span style={{ color: '#38BDF8' }}>{p.cantidad} uds — ${p.total.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>

      {/* Fiados */}
      <div className="stat-card">
        <h3>📝 Fiados pendientes</h3>
        {Object.values(fiadosPorPersona).length === 0 ? (
          <p style={{ color: '#64748B', marginTop: 8 }}>No hay fiados 🎉</p>
        ) : (
          Object.values(fiadosPorPersona).map(f => (
            <div key={f.nombre} className="lista-item">
              <div>
                <div className="fiado-nombre">{f.nombre}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{f.items.join(', ')}</div>
              </div>
              <span className="fiado-deuda">${f.total.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>

      <button className="btn-reset" onClick={reiniciarDatos}>
        🗑️ Reiniciar todos los datos
      </button>
    </div>
  )
}