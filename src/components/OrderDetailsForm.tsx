import type { DeliveryPriority } from '../types/order'

interface OrderDetailsFormProps {
  deliveryPriority: DeliveryPriority
  purchaseOrder: string
  observations: string

  onDeliveryPriorityChange: (value: DeliveryPriority) => void
  onPurchaseOrderChange: (value: string) => void
  onObservationsChange: (value: string) => void
}

function OrderDetailsForm({

  deliveryPriority,
  purchaseOrder,
  observations,
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
          inputMode="numeric"
          maxLength={10}
          value={purchaseOrder}
          onChange={(event) => {
            const value = event.target.value
            if (/^\d{0,10}$/.test(value)) onPurchaseOrderChange(value)
          }}
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
