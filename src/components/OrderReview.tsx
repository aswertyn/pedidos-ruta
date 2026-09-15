import type { Order } from '../types/order'
import type { Agent } from '../types/agent'
import type { Customer } from '../types/customer'
import type { Consignee } from '../types/consignee'

interface OrderReviewProps {
  order: Order
  agent: Agent
  customer: Customer
  consignee: Consignee | null
}

function OrderReview({
  order,
  agent,
  customer,
  consignee,
}: OrderReviewProps) {
  return (
    <section>
      <h2>Revisar pedido</h2>

      <h3>Agente</h3>
      <p>
        <strong>Número:</strong> {agent.agentNumber}
      </p>
      <p>
        <strong>Nombre:</strong> {agent.name}
      </p>

      <h3>Cliente</h3>
      <p>
        <strong>Número:</strong> {customer.customerNumber}
      </p>
      <p>
        <strong>Nombre:</strong> {customer.name}
      </p>

      <h3>Lugar de entrega</h3>

      {consignee ? (
        <>
          <p>
            <strong>Consignación:</strong> {consignee.consigneeNumber}
          </p>
          <p>
            <strong>Dirección:</strong> {consignee.address}
          </p>
          <p>
            <strong>Población:</strong> {consignee.city}
          </p>
        </>
      ) : order.manualConsignee ? (
        <>
          <p>
            <strong>Dirección:</strong> {order.manualConsignee.address}
          </p>
          <p>
            <strong>Población:</strong> {order.manualConsignee.city}
          </p>
          <p>
            <strong>Horario:</strong>{' '}
            {order.manualConsignee.receivingStartTime} -{''}
            {order.manualConsignee.receivingEndTime}
          </p>
        </>
      ) : (
        <p>Sin lugar de entrega.</p>
      )}

      <h3>Productos</h3>

      {order.items.map((item, index) => (
        <div key={`${item.productNumber}-${index}`}>
          <p>
            <strong>{item.model}</strong>
          </p>

          <p>
            Tipo:{' '}
            {item.productType === 'mattress'
              ? 'Colchón'
              : item.productType === 'box'
                ? 'Box'
                : 'Tarima'}
          </p>

          <p>Tamaño: {item.bedSize}</p>
          <p>Cantidad: {item.quantity}</p>
          <p>Precio: ${item.price.toFixed(2)}</p>

          <p>
            Subtotal: ${(item.quantity * item.price).toFixed(2)}
          </p>
        </div>
      ))}

      <h3>Total</h3>
      <p>
        $
        {order.items
          .reduce(
            (total, item) => total + item.quantity * item.price,
            0,
          )
          .toFixed(2)}
      </p>

      <h3>Datos del pedido</h3>

      <p>
        <strong>Fecha:</strong> {order.orderDate}
      </p>

      <p>
        <strong>Tipo de entrega:</strong>{' '}
        {order.deliveryPriority === 'urgent'
          ? 'Urgente'
          : order.deliveryPriority === 'immediate'
            ? 'Inmediato'
            : 'Programado'}
      </p>

      {order.purchaseOrder && (
        <p>
          <strong>Orden de compra:</strong> {order.purchaseOrder}
        </p>
      )}

      {order.observations && (
        <p>
          <strong>Observaciones:</strong> {order.observations}
        </p>
      )}
    </section>
  )
}

export default OrderReview