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
  const currencyFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })
  const productsTotal = order.items.reduce(
    (currentTotal, item) =>
      currentTotal + item.quantity * item.price,
    0,
  )

  const bagsTotal = order.polyethyleneBag.reduce(
    (currentTotal, bag) =>
      currentTotal + bag.quantity * bag.price,
    0,
  )

  const total = productsTotal + bagsTotal

  const getProductTypeName = (productType: string) => {
    switch (productType) {
      case 'mattress':
        return 'Colchón'
      case 'box':
        return 'Box'
      case 'platform':
        return 'Tarima'
      default:
        return productType
    }
  }

  const getBedSizeName = (bedSize: string) => {
    switch (bedSize) {
      case 'ind':
        return 'Individual'
      case 'mat':
        return 'Matrimonial'
      case 'Q.S.':
        return 'Queen Size'
      case 'K.S.':
        return 'King Size'
      default:
        return bedSize
    }
  }

  const getDeliveryPriorityName = () => {
    switch (order.deliveryPriority) {
      case 'urgent':
        return 'Urgente'
      case 'immediate':
        return 'Inmediato'
      case 'scheduled':
        return 'Programado'
    }
  }

  return (
    <section className="order-review">
      <h2>Revisar pedido</h2>

      <p className="selector-help">
        Verifica que la información sea correcta antes de enviar el pedido.
      </p>

      <div className="review-section">
        <h3>Agente y cliente</h3>

        <div className="review-data">
          <div>
            <span>Agente</span>
            <strong>
              {agent.agentNumber} · {agent.name}
            </strong>
          </div>

          <div>
            <span>Cliente</span>
            <strong>
              {customer.customerNumber} · {customer.name}
            </strong>
          </div>
        </div>
      </div>

      <div className="review-section">
        <h3>Lugar de entrega</h3>

        {consignee ? (
          <div className="review-data">
            <div>
              <span>Consignación</span>
              <strong>{consignee.consigneeNumber}</strong>
            </div>

            <div>
              <span>Dirección</span>
              <strong>{consignee.address}</strong>
            </div>

            <div>
              <span>Población</span>
              <strong>{consignee.city}</strong>
            </div>

            <div>
              <span>Horario</span>
              <strong>{consignee.receivingHours}</strong>
            </div>
          </div>
        ) : order.manualConsignee ? (
          <div className="review-data">
            <div>
              <span>Dirección</span>
              <strong>{order.manualConsignee.address}</strong>
            </div>

            <div>
              <span>Población</span>
              <strong>{order.manualConsignee.city}</strong>
            </div>

            <div>
              <span>Horario</span>
              <strong>
                {order.manualConsignee.receivingStartTime} -{' '}
                {order.manualConsignee.receivingEndTime}
              </strong>
            </div>
          </div>
        ) : (
          <p className="empty-message">
            Sin lugar de entrega.
          </p>
        )}
      </div>

      <div className="review-section">
        <div className="summary-header review-subsection-header">
          <h3>Productos</h3>

          <span className="item-count">
            {order.items.length}
          </span>
        </div>

        <div className="review-products">
          {order.items.map((item, index) => (
            <article
              className="review-product"
              key={`${item.productNumber}-${index}`}
            >
              <div className="review-product-header">
                <div>
                  {!item.isManual && (
                    <span className="order-item-number">
                      {item.productNumber}
                    </span>
                  )}

                  <strong>{item.model}</strong>
                </div>

                <strong>
                  {currencyFormatter.format(
                    item.quantity * item.price,
                  )}
                </strong>
              </div>

              <p>
                {getProductTypeName(item.productType)}
                {' · '}
                {getBedSizeName(item.bedSize)}
              </p>

              <p>
                {item.quantity} ×{' '}
                {currencyFormatter.format(item.price)}
              </p>
            </article>
          ))}
        </div>

        {order.polyethyleneBag.length > 0 && (
          <div className="review-bags">
            <div className="summary-header review-subsection-header">
              <h3>Bolsa Polietileno</h3>

              <span className="item-count">
                {order.polyethyleneBag.length}
              </span>
            </div>

            <div className="review-products">
              {order.polyethyleneBag.map((bag, index) => (
                <article
                  className="review-product"
                  key={`${bag.key}-${index}`}
                >
                  <div className="review-product-header">
                    <strong>{bag.key}</strong>

                    <strong>
                      {currencyFormatter.format(
                        bag.quantity * bag.price,
                      )}
                    </strong>
                  </div>

                  <p>
                    {bag.quantity} ×{' '}
                    {currencyFormatter.format(bag.price)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}

        <div className="review-total">
          <span>Total</span>
          <strong>
            {currencyFormatter.format(total)}
          </strong>
        </div>
      </div>

      <div className="review-section">
        <h3>Datos del pedido</h3>

        <div className="review-data">
          <div>
            <span>Fecha</span>
            <strong>{order.orderDate}</strong>
          </div>

          <div>
            <span>Tipo de entrega</span>
            <strong>{getDeliveryPriorityName()}</strong>
          </div>

          {order.purchaseOrder && (
            <div>
              <span>Orden de compra</span>
              <strong>{order.purchaseOrder}</strong>
            </div>
          )}

          {order.observations && (
            <div>
              <span>Observaciones</span>
              <strong>{order.observations}</strong>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default OrderReview
