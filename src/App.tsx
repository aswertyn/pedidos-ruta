import { useState } from 'react'

import AgentSelector from './components/AgentSelector'
import CustomerSelector from './components/CustomerSelector'
import ConsigneeSelector from './components/ConsigneeSelector'
import OrderItemForm from './components/OrderItemForm'
import StepIndicator from './components/StepIndicator'
import OrderDetailsForm from './components/OrderDetailsForm'
import OrderReview from './components/OrderReview'

import { agents } from './data/agents'
import { customers } from './data/customers'
import { consignees } from './data/consignees'

import type { Agent } from './types/agent'
import type { Customer } from './types/customer'
import type { Consignee } from './types/consignee'
import type { ManualConsignee } from './types/manualConsignee'
import type { OrderItem } from './types/orderItem'
import type { OrderStep } from './types/orderStep'
import type { DeliveryPriority, Order } from './types/order'

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

function App() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null)
  const [selectedConsignee, setSelectedConsignee] =
    useState<Consignee | null>(null)
  const [manualConsignee, setManualConsignee] =
    useState<ManualConsignee | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [currentStep, setCurrentStep] = useState<OrderStep>('agent')
  const [orderDate, setOrderDate] = useState('')
  // Declaración pendiente: Estado "programado" como predeterminado actualmente*
  const [deliveryPriority, setDeliveryPriority] = useState<DeliveryPriority>('scheduled')
  const [purchaseOrder, setPurchaseOrder] = useState('')
  const [observations, setObservations] = useState('')

  const goToStep = (step: OrderStep) => {
    setCurrentStep(step)
  }

  const handleAddItem = (item: OrderItem) => {
    setOrderItems((currentItems) => [
      ...currentItems,
      item,
    ])
  }

  const handleRemoveItem = (indexToRemove: number) => {
    setOrderItems((currentItems) =>
      currentItems.filter(
        (_, index) => index !== indexToRemove,
      ),
    )
  }

  const handleAgentChange = (agentNumber: string) => {
    const agent = agents.find(
      (agent) => agent.agentNumber === agentNumber,
    )

    setSelectedAgent(agent ?? null)
    setSelectedCustomer(null)
    setSelectedConsignee(null)
    setManualConsignee(null)
    setOrderItems([])
  }

  const handleCustomerChange = (customerNumber: string) => {
    const customer = customers.find(
      (customer) => customer.customerNumber === customerNumber,
    )

    setSelectedCustomer(customer ?? null)
    setSelectedConsignee(null)
    setManualConsignee(null)
    setOrderItems([])
  }

  const handleConsigneeChange = (consigneeNumber: string) => {
    const consignee = consignees.find(
      (consignee) =>
        consignee.consigneeNumber === consigneeNumber &&
        consignee.customerNumber === selectedCustomer?.customerNumber,
    )

    setSelectedConsignee(consignee ?? null)
  }

  const agentCustomers = selectedAgent
    ? customers.filter(
      (customer) =>
        customer.agentNumber === selectedAgent.agentNumber,
    )
    : []

  const customerConsignees = selectedCustomer
    ? consignees.filter(
      (consignee) =>
        consignee.customerNumber === selectedCustomer.customerNumber,
    )
    : []

  const hasValidManualConsignee =
    manualConsignee !== null &&
    manualConsignee.address.trim() !== '' &&
    manualConsignee.city.trim() !== '' &&
    manualConsignee.receivingStartTime.trim() !== '' &&
    manualConsignee?.receivingEndTime.trim() !== '' &&
    manualConsignee?.receivingEndTime >
    manualConsignee.receivingStartTime

  const hasDeliveryDestination =
    selectedConsignee !== null || hasValidManualConsignee

  const order: Order | null =
    selectedAgent && selectedCustomer
      ? {
        agentNumber: selectedAgent.agentNumber,
        customerNumber: selectedCustomer.customerNumber,

        consigneeNumber:
          selectedConsignee?.consigneeNumber ?? null,

        manualConsignee:
          selectedConsignee ? null : manualConsignee,

        items: orderItems,

        observations,
        orderDate,
        deliveryPriority,
        purchaseOrder,
      }
      : null

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>Levantamiento de pedidos</h1>
        <p>Aplicación para captura de pedidos en ruta.</p>
      </header>

      <StepIndicator currentStep={currentStep} />

      {currentStep === 'agent' && (
        <section>
          {/* <p>Paso 1 de 6</p> */}

          <AgentSelector
            agents={agents}
            selectedAgent={selectedAgent}
            onAgentChange={handleAgentChange}
          />

          {selectedAgent && (
            <button
              className="primary-button"
              type="button"
              onClick={() => goToStep('customer')}
            >
              Continuar
            </button>
          )}
        </section>
      )}

      {currentStep === 'customer' && (
        <section>
          {/* <p>Paso 2 de 6</p> */}

          <CustomerSelector
            customers={agentCustomers}
            selectedCustomer={selectedCustomer}
            onCustomerChange={handleCustomerChange}
          />

          <div className="step-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => goToStep('agent')}
            >
              Volver
            </button>

            {selectedCustomer && (
              <button
                className="primary-button"
                type="button"
                onClick={() => goToStep('delivery')}
              >
                Continuar
              </button>
            )}
          </div>
        </section>
      )}

      {currentStep === 'delivery' && (
        <section>
          {/* <p>Paso 3 de 6</p> */}

          <ConsigneeSelector
            key={selectedCustomer?.customerNumber}
            consignees={customerConsignees}
            selectedConsignee={selectedConsignee}
            manualConsignee={manualConsignee}
            onConsigneeChange={handleConsigneeChange}
            onManualConsigneeChange={setManualConsignee}
          />

          <div className="step-acions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => goToStep('customer')}
            >
              Volver
            </button>

            {hasDeliveryDestination && (
              <button
                className="primary-button"
                type="button"
                onClick={() => goToStep('products')}
              >
                Continuar
              </button>
            )}
          </div>
        </section>
      )}

      {currentStep === 'products' && (
        <section>
          {/* <p>Paso 4 de 6</p> */}

          <OrderItemForm onAddItem={handleAddItem} />

          {orderItems.length > 0 && (
            <section className="order-items-summary">
              <div className="summary-header">
                <h2>Productos agregados</h2>

                <span className="item-count">
                  {orderItems.length}
                </span>
              </div>

              <div className="order-items-list">
                {orderItems.map((item, index) => (
                  <article
                    className="order-item-card"
                    key={`${item.productNumber}-${index}`}
                  >
                    <div className="order-item-header">
                      <div>
                        <span className="order-item-number">
                          {item.productNumber}
                        </span>

                        <h3>{item.model}</h3>

                        <p>
                          {item.productType === 'mattress'
                            ? 'Colchón'
                            : item.productType === 'box'
                              ? 'Box'
                              : 'Tarima'}
                          {' · '}
                          {item.bedSize === 'ind'
                            ? 'Individual'
                            : item.bedSize === 'mat'
                              ? 'Matrimonial'
                              : item.bedSize === 'Q.S.'
                                ? 'Queen Size'
                                : 'King Size'}
                        </p>
                      </div>

                      <button
                        className="remove-item-button"
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Eliminar
                      </button>
                    </div>

                    <div className="order-item-values">
                      <div>
                        <span>Cantidad</span>
                        <strong>{item.quantity}</strong>
                      </div>

                      <div>
                        <span>Precio</span>
                        <strong>
                          {currencyFormatter.format(item.price)}
                        </strong>
                      </div>

                      <div>
                        <span>Subtotal</span>
                        <strong>
                          {currencyFormatter.format(item.quantity * item.price)}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="order-total">
                <span>Total del pedido</span>

                <strong>
                  {currencyFormatter.format(
                    orderItems.reduce(
                      (total, item) =>
                        total + item.quantity * item.price,
                      0,
                    ),
                  )}
                </strong>
              </div>
            </section>
          )}

          <div className="step-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => goToStep('delivery')}
            >
              Volver
            </button>

            {orderItems.length > 0 && (
              <button
                className="primary-button"
                type="button"
                onClick={() => goToStep('details')}
              >
                Continuar
              </button>
            )}
          </div>
        </section>
      )}

      {currentStep === 'details' && (
        <section>
          <OrderDetailsForm
            orderDate={orderDate}
            deliveryPriority={deliveryPriority}
            purchaseOrder={purchaseOrder}
            observations={observations}
            onOrderDateChange={setOrderDate}
            onDeliveryPriorityChange={setDeliveryPriority}
            onPurchaseOrderChange={setPurchaseOrder}
            onObservationsChange={setObservations}
          />

          <div className="step-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => goToStep('products')}
            >
              Volver
            </button>

            {orderDate && (
              <button
                className="primary-button"
                type="button"
                onClick={() => goToStep('review')}
              >
                Revisar pedido
              </button>
            )}
          </div>
        </section>
      )}

      {currentStep === 'review' &&
        order &&
        selectedAgent &&
        selectedCustomer && (
          <section>
            <OrderReview
              order={order}
              agent={selectedAgent}
              customer={selectedCustomer}
              consignee={selectedConsignee}
            />

            <div className="step-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => goToStep('details')}
              >
                Volver
              </button>

              <button
                className="primary-button"
                type="button"
              >
                Enviar pedido
              </button>
            </div>
          </section>
        )}
    </main>
  )
}

export default App
