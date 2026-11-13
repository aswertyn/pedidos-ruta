
import type { Order } from '../types/order'
import type { Customer } from '../types/customer'
import type { Consignee } from '../types/consignee'

interface EnviarPedidoRequest {
  order: Order
  customer: Customer
  consignee: Consignee | null
}

export async function enviarPedidoN8n({
  order,
  customer,
  consignee,
}: EnviarPedidoRequest): Promise<void> {

  const consigneePayload = order.manualConsignee
    ? {
        type: 'manual',
        consigneeNumber: null,
        name: order.consigneeName,
        phone: order.consigneePhone,
        ...order.manualConsignee,
      }
    : consignee
      ? {
          ...consignee,
          type: 'registered',
        }
      : null

  const orderPayload = { ...order }

  delete (orderPayload as Partial<Order>).consigneeName
  delete (orderPayload as Partial<Order>).consigneePhone
  delete (orderPayload as Partial<Order>).manualConsignee

  const response = await fetch('/api/pedidos/enviar', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order: orderPayload,
      customer,
      consignee: consigneePayload,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)

    throw new Error(
      error?.message ?? 'No fue posible enviar el pedido a n8n'
    )
  }
}
