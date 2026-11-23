
export interface ClienteWS {
  id: number
  id_cliente: string
  nombre_tienda: string
  nombre: string
  paterno: string
  materno: string
  correo: string
  telefono: string
}

export interface ProductoWS {
  codigo: string
  descripcion: string
}

export interface PedidoWS {
  idPedido: number
  ordenCompra: string
  Consignado: string
  ClienteProbeedor: string
  idAgente: number
  Fecha_Ped: string
  Fecha_Emb: string | null
  Fecha_Can: string | null
  Fecha_precio: string | null
  codigo: string
  Descripcion: string
  cantidad: number
  costo: number
  moneda: string
  Estatus: string
}

async function consultar<T>(ruta: string): Promise<T[]> {
  const respuesta = await fetch(ruta, {
    credentials: 'include',
  })

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null)
    throw new Error(error?.message ?? 'Error al consultar el Web Service')
  }

  const datos: unknown = await respuesta.json()

  if (!Array.isArray(datos)) {
    throw new Error('La respuesta no contiene un arreglo')
  }

  return datos as T[]
}

export function obtenerClientes() {
  return consultar<ClienteWS>('/api/webservice/clientes')
}

export function obtenerProductos(datos = '') {
  return consultar<ProductoWS>(
    `/api/webservice/productos?datos=${encodeURIComponent(datos)}`
  )
}

export function obtenerPedidos(desde: string, hasta: string) {
  const parametros = new URLSearchParams({ desde, hasta })

  return consultar<PedidoWS>(
    `/api/webservice/pedidos?${parametros.toString()}`
  )
}
