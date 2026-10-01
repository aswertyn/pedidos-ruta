import { useState } from 'react'

import AgentSelector from './components/AgentSelector'
import CustomerSelector from './components/CustomerSelector'
import ConsigneeSelector from './components/ConsigneeSelector'
import OrderItemForm from './components/OrderItemForm'
import StepIndicator from './components/StepIndicator'
import OrderDetailsForm from './components/OrderDetailsForm'
import OrderReview from './components/OrderReview'
import PolyethyleneBagForm from './components/PolyethyleneBagForm'

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
import type { PolyethyleneBag } from './types/polyethyleneBag'

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
  const [polyethyleneBags, setPolyethyleneBags] = useState<PolyethyleneBag[]>([])

  const handleAddBag = (bag: PolyethyleneBag) => {
    setPolyethyleneBags((currentBags) => [
      ...currentBags,
      bag,
    ])
  }

  const handleRemoveBag = (index: number) => {
    setPolyethyleneBags((currentBags) =>
      currentBags.filter((_, currentIndex) => currentIndex !== index)
    )
  }

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
    setPolyethyleneBags([])
  }

  const handleCustomerChange = (customerNumber: string) => {
    const customer = customers.find(
      (customer) => customer.customerNumber === customerNumber,
    )

    setSelectedCustomer(customer ?? null)
    setSelectedConsignee(null)
    setManualConsignee(null)
    setOrderItems([])
    setPolyethyleneBags([])
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
        polyethyleneBag: polyethyleneBags,

        observations,
        orderDate,
        deliveryPriority,
        purchaseOrder,
      }
      : null

  const productsTotal = orderItems.reduce(
    (total, item) => total + item.quantity * item.price,
    0,
  )
  const bagsTotal = polyethyleneBags.reduce(
    (total, bag) => total + bag.quantity * bag.price,
    0,
  )
  const orderTotal = productsTotal + bagsTotal

  const showBackButton = currentStep !== 'agent'

  const showNextButton =
    (currentStep === 'agent' && selectedAgent !== null) ||
    (currentStep === 'customer' && selectedCustomer !== null) ||
    (currentStep === 'delivery' && hasDeliveryDestination) ||
    (currentStep === 'products' && orderItems.length > 0) ||
    (currentStep === 'details' && orderDate !== '') ||
    currentStep === 'review'

  const handleBack = () => {
    if (currentStep === 'customer') goToStep('agent')
    if (currentStep === 'delivery') goToStep('customer')
    if (currentStep === 'products') goToStep('delivery')
    if (currentStep === 'details') goToStep('products')
    if (currentStep === 'review') goToStep('details')
  }

  const handleNext = () => {
    if (currentStep === 'agent') goToStep('customer')
    if (currentStep === 'customer') goToStep('delivery')
    if (currentStep === 'delivery') goToStep('products')
    if (currentStep === 'products') goToStep('details')
    if (currentStep === 'details') goToStep('review')

    if (currentStep === 'review') {
      // Aquí va el envío del pedido.
    }
  }

  const getNextButtonText = () => {
    if (currentStep === 'details') return 'Revisar pedido'
    if (currentStep === 'review') return 'Enviar pedido'

    return 'Continuar'
  }

  return (
    <main className="app-container">
      <div className="app-top">
        <header className="app-header">
          <h1>Levantamiento de pedidos</h1>
          <p>Aplicación para captura de pedidos en ruta.</p>
        </header>

        <StepIndicator currentStep={currentStep} />
      </div>

      <div className="app-content">
        {currentStep === 'agent' && (
          <section>
            <AgentSelector
              agents={agents}
              selectedAgent={selectedAgent}
              onAgentChange={handleAgentChange}
            />
          </section>
        )}

        {currentStep === 'customer' && (
          <section>
            <CustomerSelector
              customers={agentCustomers}
              selectedCustomer={selectedCustomer}
              onCustomerChange={handleCustomerChange}
            />
          </section>
        )}

        {currentStep === 'delivery' && (
          <section>
            <ConsigneeSelector
              key={selectedCustomer?.customerNumber}
              consignees={customerConsignees}
              selectedConsignee={selectedConsignee}
              manualConsignee={manualConsignee}
              onConsigneeChange={handleConsigneeChange}
              onManualConsigneeChange={setManualConsignee}
            />
          </section>
        )}

        {currentStep === 'products' && (
          <section>
            <OrderItemForm
              items={orderItems}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
            />
            <PolyethyleneBagForm
              bags={polyethyleneBags}
              onAddBag={handleAddBag}
              onRemoveBag={handleRemoveBag}
            />

            {(orderItems.length > 0 || polyethyleneBags.length > 0) && (
              <div className="order-total">
                <span>Total del pedido</span>
                <strong>{currencyFormatter.format(orderTotal)}</strong>
              </div>
            )}
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
            </section>
          )}
      </div>

      <div className="app-bottom">
        <div
          className={`step-actions ${showBackButton && showNextButton
            ? 'both-buttons'
            : showBackButton
              ? 'only-back'
              : 'only-next'
            }`}
        >
          <button
            className="secondary-button navigation-back"
            type="button"
            onClick={handleBack}
            disabled={!showBackButton}
            tabIndex={showBackButton ? 0 : -1}
            aria-hidden={!showBackButton}
          >
            Volver
          </button>

          <button
            className="primary-button navigation-next"
            type="button"
            onClick={handleNext}
            disabled={!showNextButton}
            tabIndex={showNextButton ? 0 : -1}
            aria-hidden={!showNextButton}
          >
            {getNextButtonText()}
          </button>
        </div>
      </div>
    </main>
  )
}

export default App
