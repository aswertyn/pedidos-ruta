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
    <section>
      <h2>Datos finales del pedido</h2>

      <label>
        Fecha del pedido
        <input
          type="date"
          value={orderDate}
          onChange={(event) => onOrderDateChange(event.target.value)}
        />
      </label>

      <fieldset>
        <legend>Tipo de entrega</legend>

        <label>
          <input
            type="radio"
            name="deliveryPriority"
            value="urgent"
            checked={deliveryPriority === 'urgent'}
            onChange={() => onDeliveryPriorityChange('urgent')}
          />
          Urgente
        </label>

        <label>
          <input
            type="radio"
            name="deliveryPriority"
            value="immediate"
            checked={deliveryPriority === 'immediate'}
            onChange={() => onDeliveryPriorityChange('immediate')}
          />
          Inmediato
        </label>

        <label>
          <input
            type="radio"
            name="deliveryPriority"
            value="scheduled"
            checked={deliveryPriority === 'scheduled'}
            onChange={() => onDeliveryPriorityChange('scheduled')}
          />
          Programado
        </label>
      </fieldset>

      <label>
        Orden de compra
        <input
          type="text"
          value={purchaseOrder}
          onChange={(event) => onPurchaseOrderChange(event.target.value)}
          placeholder="Opcional"
        />
      </label>

      <label>
        Observaciones
        <textarea
          value={observations}
          onChange={(event) => onObservationsChange(event.target.value)}
          placeholder="Comentarios adicionales del pedido"
          rows={4}
        />
      </label>
    </section>
  )
}

export default OrderDetailsForm