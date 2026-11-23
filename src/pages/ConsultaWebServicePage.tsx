
import { useState } from 'react'
import {
  obtenerClientes,
  obtenerProductos,
  obtenerPedidos,
} from '../services/webService'
import type {
  ClienteWS,
  ProductoWS,
  PedidoWS,
} from '../services/webService'

type Apartado = 'clientes' | 'productos' | 'pedidos'

export default function ConsultaWebServicePage() {
  const [apartado, setApartado] = useState<Apartado>('clientes')
  const [clientes, setClientes] = useState<ClienteWS[]>([])
  const [productos, setProductos] = useState<ProductoWS[]>([])
  const [pedidos, setPedidos] = useState<PedidoWS[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [consultado, setConsultado] = useState(false)

  function cambiarApartado(valor: Apartado) {
    setApartado(valor)
    setError('')
    setConsultado(false)
  }

  async function ejecutarConsulta() {
    if (cargando) return

    setError('')
    setConsultado(false)
    setCargando(true)

    try {
      if (apartado === 'clientes') {
        setClientes(await obtenerClientes())
      }

      if (apartado === 'productos') {
        setProductos(await obtenerProductos(busqueda.trim()))
      }

      if (apartado === 'pedidos') {
        if (!desde || !hasta) {
          throw new Error('Selecciona ambas fechas')
        }

        if (desde > hasta) {
          throw new Error('La fecha inicial no puede superar la final')
        }

        setPedidos(await obtenerPedidos(desde, hasta))
      }

      setConsultado(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible realizar la consulta'
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <section>
      <h2>Consultas del Web Service</h2>
      <p>Consulta de información en tiempo real, sin almacenamiento local.</p>

      <div className="header-actions">
        {(['clientes', 'productos', 'pedidos'] as const).map((opcion) => (
          <button
            key={opcion}
            type="button"
            className={
              apartado === opcion ? 'primary-button' : 'secondary-button'
            }
            onClick={() => cambiarApartado(opcion)}
          >
            {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        {apartado === 'productos' && (
          <label className="form-label">
            Buscar producto
            <input
              className="form-control"
              value={busqueda}
              maxLength={100}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ejemplo: CCALVENI"
            />
          </label>
        )}

        {apartado === 'pedidos' && (
          <div>
            <label className="form-label">
              Desde
              <input
                className="form-control"
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </label>

            <label className="form-label">
              Hasta
              <input
                className="form-control"
                type="date"
                value={hasta}
                min={desde || undefined}
                onChange={(e) => setHasta(e.target.value)}
              />
            </label>
          </div>
        )}

        <button
          type="button"
          className="primary-button"
          disabled={cargando}
          onClick={() => void ejecutarConsulta()}
        >
          {cargando ? 'Consultando...' : 'Consultar'}
        </button>
      </div>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      {consultado && (
        <div style={{ marginTop: 20, overflowX: 'auto' }}>
          {apartado === 'clientes' && (
            <>
              <p>Clientes encontrados: {clientes.length}</p>
              <table>
                <thead>
                  <tr>
                    <th>ID cliente</th>
                    <th>Tienda</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>{cliente.id_cliente}</td>
                      <td>{cliente.nombre_tienda}</td>
                      <td>
                        {cliente.nombre} {cliente.paterno} {cliente.materno}
                      </td>
                      <td>{cliente.telefono}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clientes.length === 0 && <p>No se encontraron clientes.</p>}
            </>
          )}

          {apartado === 'productos' && (
            <>
              <p>Productos encontrados: {productos.length}</p>
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.codigo}>
                      <td>{producto.codigo}</td>
                      <td>{producto.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {productos.length === 0 && (
                <p>No se encontraron productos.</p>
              )}
            </>
          )}

          {apartado === 'pedidos' && (
            <>
              <p>Registros encontrados: {pedidos.length}</p>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Orden</th>
                    <th>Cliente</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr key={pedido.idPedido}>
                      <td>{pedido.idPedido}</td>
                      <td>{pedido.ordenCompra}</td>
                      <td>{pedido.ClienteProbeedor}</td>
                      <td>{pedido.Descripcion}</td>
                      <td>{pedido.cantidad}</td>
                      <td>{pedido.Estatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pedidos.length === 0 && (
                <p>No se encontraron pedidos en el período.</p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}
