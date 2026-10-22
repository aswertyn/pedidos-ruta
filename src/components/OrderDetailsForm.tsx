import type { DeliveryPriority } from '../types/order'

interface OrderDetailsFormProps {
  orderDate: string
  deliveryPriority: DeliveryPriority
  purchaseOrder: string
  observations: string

  onOrderDateChange: (value: string) => void
  onDeliveryPriorityChange: (value: DeliveryPriority) => void
  onPurchaseOrderChange: (value: string) => void
  onObservationsChange: (value: string) => void
}

function OrderDetailsForm({

  orderDate,
  deliveryPriority,
  purchaseOrder,
  observations,
  onOrderDateChange,
  onDeliveryPriorityChange,
  onPurchaseOrderChange,
  onObservationsChange,
}: OrderDetailsFormProps) {
  return (
    <section className="order-details-form">
      <h2>Datos finales del pedido</h2>

      <p className="selector-help">
        Completa la información para finalizar el pedido.
      </p>

      <label className="form-label">
        Fecha del pedido

        <input
          className="form-control"
          type="date"
          value={orderDate}
          onChange={(event) =>
            onOrderDateChange(event.target.value)
          }
        />
      </label>

      <div className="delivery-priority">
        <span className="option-title">
          Tipo de entrega
        </span>

        <div className="priority-buttons">
          <button
            type="button"
            className={`option-button ${deliveryPriority === 'urgent' ? 'selected' : ''
              }`}
            onClick={() =>
              onDeliveryPriorityChange('urgent')
            }
          >
            Urgente
          </button>

          <button
            type="button"
            className={`option-button ${deliveryPriority === 'immediate'
                ? 'selected'
                : ''
              }`}
            onClick={() =>
              onDeliveryPriorityChange('immediate')
            }
          >
            Inmediato
          </button>

          <button
            type="button"
            className={`option-button ${deliveryPriority === 'scheduled'
                ? 'selected'
                : ''
              }`}
            onClick={() =>
              onDeliveryPriorityChange('scheduled')
            }
          >
            Programado
          </button>
        </div>
      </div>

      <label className="form-label">
        Orden de compra

        <input
          className="form-control"
          type="text"
          value={purchaseOrder}
          onChange={(event) =>
            onPurchaseOrderChange(event.target.value)
          }
          placeholder="Opcional"
        />
      </label>

      <label className="form-label">
        Observaciones

        <textarea
          className="form-textarea"
          value={observations}
          onChange={(event) =>
            onObservationsChange(event.target.value)
          }
          placeholder="Comentarios adicionales del pedido"
          rows={4}
        />
      </label>
    </section>
  )
}

export default OrderDetailsForm