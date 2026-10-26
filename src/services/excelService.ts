import type { Order } from '../types/order'
import type { Customer } from '../types/customer'
import type { Consignee } from '../types/consignee'

interface ExcelRequest {
  order: Order
  customer: Customer
  consignee: Consignee | null
}

export async function descargarExcel({
  order,
  customer,
  consignee,
}: ExcelRequest): Promise<void> {
  const response = await fetch('/api/pedidos/exportar-excel', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order,
      customer,
      consignee,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)

    throw new Error(
      error?.message ?? 'No fue posible generar el Excel'
    )
  }

  const archivo = await response.blob()
  const url = URL.createObjectURL(archivo)

  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `pedido_${order.folio.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`

  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}