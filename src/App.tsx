import { useEffect, useState } from 'react'

import AgentSelector from './components/AgentSelector'
import CustomerSelector from './components/CustomerSelector'
import ConsigneeSelector from './components/ConsigneeSelector'
import OrderItemForm from './components/OrderItemForm'
import StepIndicator from './components/StepIndicator'
import OrderDetailsForm from './components/OrderDetailsForm'
import OrderReview from './components/OrderReview'
import PolyethyleneBagForm from './components/PolyethyleneBagForm'
import PhotoCapture from './components/PhotoCapture'
import PhotoGallery from './components/PhotoGallery'
import LoginPage from './pages/LoginPage'
import type { AuthUser } from './services/authService'
import { getCurrentUser, logout } from './services/authService'

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
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [captureMode, setCaptureMode] = useState<'manual' | 'photo' | 'gallery' | null>(null)
  useEffect(() => {
    let active = true

    async function checkSession() {
      try {
        const user = await getCurrentUser()

        if (active) {
          setAuthenticatedUser(user)
        }
      } catch (error) {
        console.error('Error al comprobar la sesión:', error)
      } finally {
        if (active) {
          setCheckingSession(false)
        }
      }
    }

    checkSession()

    return () => {
      active = false
    }
  }, [])
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
  const [folio, setFolio] = useState('')
  const [conditions, setConditions] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [consigneeName, setConsigneeName] = useState('')
  const [consigneePhone, setConsigneePhone] = useState('')

  const [observations, setObservations] = useState('')
  const [polyethyleneBags, setPolyethyleneBags] = useState<PolyethyleneBag[]>([])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      alert('No fue posible cerrar la sesión. Inténtalo nuevamente.')
      return
    }

    setAuthenticatedUser(null)
    setCaptureMode(null)

    setSelectedAgent(null)
    setSelectedCustomer(null)
    setSelectedConsignee(null)
    setManualConsignee(null)
    setOrderItems([])
    setPolyethyleneBags([])
    setCurrentStep('agent')
    setOrderDate('')
    setDeliveryPriority('scheduled')
    setPurchaseOrder('')
    setFolio('')
    setConditions('')
    setCustomerPhone('')
    setConsigneeName('')
    setConsigneePhone('')

    setObservations('')
  }

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
    setCustomerPhone('')
    setConditions('')
    setConsigneeName('')
    setConsigneePhone('')
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
    setCustomerPhone(customer?.phone ?? '')
    setConditions(customer?.conditions ?? '')
    setConsigneeName('')
    setConsigneePhone('')
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
    setConsigneeName(consignee?.name ?? '')
    setConsigneePhone(consignee?.phone ?? '')
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
        folio: folio.trim(),
        conditions: conditions.trim(),
        customerPhone: customerPhone.trim(),
        consigneeName: consigneeName.trim(),
        consigneePhone: consigneePhone.trim(),

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
    (currentStep === 'agent' && selectedAgent !== null && folio.trim() !== '') ||
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
    if (!showNextButton || folio.trim() === '') return

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

  if (checkingSession) {
    return <main className="app-container">Comprobando sesión...</main>
  }

  if (!authenticatedUser) {
    return <LoginPage onLoginSuccess={setAuthenticatedUser} />
  }

  if (captureMode === null) {
    return (
      <main className="app-container">
        <div className="app-top">
          <header className="app-header">
            <div className="header-top">
              <h1>Levantamiento de pedidos</h1>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Salir
              </button>
            </div>

            <p>Selecciona cómo deseas registrar tu pedido.</p>
          </header>
        </div>

        <div className="app-content">
          <section>
            <h2>Método de captura</h2>

            <div className="capture-options">
              <button
                type="button"
                className="primary-button"
                onClick={() => setCaptureMode('manual')}
              >
                Captura manual
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setCaptureMode('photo')}
              >
                Captura por fotografía
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setCaptureMode('gallery')}
              >
                Ver fotografías registradas
              </button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (captureMode === 'gallery') {
    return (
      <main className="app-container">
        <div className="app-top">
          <header className="app-header">
            <div className="header-top">
              <h1>Fotografías registradas</h1>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Salir
              </button>
            </div>

            <p>Consulta las fotografías que has registrado.</p>
          </header>
        </div>

        <div className="app-content">
          <PhotoGallery />

          <button
            type="button"
            className="secondary-button"
            onClick={() => setCaptureMode(null)}
          >
            Volver a métodos de captura
          </button>
        </div>
      </main>
    )
  }

  if (captureMode === 'photo') {
    return (
      <main className="app-container">
        <div className="app-top">
          <header className="app-header">
            <div className="header-top">
              <h1>Captura por fotografía</h1>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Salir
              </button>
            </div>

            <p>Registra una nota de pedido mediante una fotografía.</p>
          </header>
        </div>

        <div className="app-content">
          <PhotoCapture />

          <button
            type="button"
            className="secondary-button"
            onClick={() => setCaptureMode(null)}
          >
            Volver a métodos de captura
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="app-container">
      <div className="app-top">
        <header className="app-header">
          <div className="header-top">
            <h1>Levantamiento de pedidos</h1>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Salir
            </button>
          </div>

          <p>Aplicación para captura de pedidos en ruta.</p>
        </header>

        <StepIndicator currentStep={currentStep} />
      </div>

      <div className="app-content">
        {currentStep === 'agent' && (
          <section>
            <label className="form-label folio-field">
              Folio (ingreso manual)
              <input
                className="form-control"
                type="text"
                maxLength={50}
                value={folio}
                required
                aria-describedby="folio-help"
                onChange={(event) => setFolio(event.target.value)}
                placeholder="Folio (ingreso manual)"
              />
              <small id="folio-help">El folio es obligatorio para continuar.</small>
            </label>

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
              consigneeName={consigneeName}
              onConsigneeNameChange={setConsigneeName}
              consigneePhone={consigneePhone}
              onConsigneePhoneChange={setConsigneePhone}

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
              onUpdateItem={(index, updatedItem) => setOrderItems((current) => current.map((item, itemIndex) => itemIndex === index ? updatedItem : item))}
              onRemoveItem={handleRemoveItem}
            />
            <PolyethyleneBagForm
              bags={polyethyleneBags}
              onAddBag={handleAddBag}
              onUpdateBag={(index, updatedBag) => setPolyethyleneBags((current) => current.map((bag, bagIndex) => bagIndex === index ? updatedBag : bag))}
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
