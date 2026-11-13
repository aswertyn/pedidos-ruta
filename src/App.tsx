import { useEffect, useState } from 'react'
import { FaCamera, FaPencilAlt } from 'react-icons/fa'
import { GrGallery } from 'react-icons/gr'

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
import { descargarExcel } from './services/excelService'
import { enviarPedidoN8n } from './services/n8nService'

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
  const [attemptedContinue, setAttemptedContinue] = useState(false)
  const [conditions, setConditions] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [consigneeName, setConsigneeName] = useState('')
  const [consigneePhone, setConsigneePhone] = useState('')

  const [observations, setObservations] = useState('')
  const [polyethyleneBags, setPolyethyleneBags] = useState<PolyethyleneBag[]>([])
  const [generandoExcel, setGenerandoExcel] = useState(false)
  const [enviandoPedido, setEnviandoPedido] = useState(false)
  const [pedidoEnviado, setPedidoEnviado] = useState(false)

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
    setAttemptedContinue(false)
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
    consigneeName.trim().length >= 2 &&
    /^[\p{L}][\p{L} ]*$/u.test(consigneeName.trim()) &&
    /^\d{10}$/.test(consigneePhone) &&
    manualConsignee.address.trim().length >= 10 &&
    manualConsignee.city.trim().length >= 3 &&
    manualConsignee.receivingStartTime.trim() !== '' &&
    manualConsignee.receivingEndTime.trim() !== '' &&
    manualConsignee.receivingEndTime >
    manualConsignee.receivingStartTime

  const hasCompleteManualConsignee =
    manualConsignee !== null &&
    consigneeName.trim() !== '' &&
    consigneePhone.trim() !== '' &&
    manualConsignee.address.trim() !== '' &&
    manualConsignee.city.trim() !== '' &&
    manualConsignee.receivingStartTime.trim() !== '' &&
    manualConsignee.receivingEndTime.trim() !== ''

  const hasCompleteDeliveryDestination =
    selectedConsignee !== null || hasCompleteManualConsignee

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
    (currentStep === 'agent' && selectedAgent !== null && /^\d{1,10}$/.test(folio)) ||
    (currentStep === 'customer' && selectedCustomer !== null) ||
    (currentStep === 'delivery' && hasCompleteDeliveryDestination) ||
    (currentStep === 'products' && orderItems.length > 0) ||
    (currentStep === 'details' && orderDate !== '') ||
    currentStep === 'review'

  const handleReturnToCaptureMethods = () => {
    const hasOrderData =
      folio.trim() !== '' ||
      selectedAgent !== null ||
      selectedCustomer !== null ||
      selectedConsignee !== null ||
      manualConsignee !== null ||
      orderItems.length > 0 ||
      polyethyleneBags.length > 0 ||
      orderDate !== '' ||
      purchaseOrder.trim() !== '' ||
      observations.trim() !== ''

    if (hasOrderData) {
      const confirmed = window.confirm(
        '¿Deseas volver a los métodos de captura? Los datos del pedido se conservarán mientras permanezcas en esta sesión de la página.'
      )

      if (!confirmed) return
    }

    setCaptureMode(null)
  }

  const handleBack = () => {
    if (currentStep === 'customer') goToStep('agent')
    if (currentStep === 'delivery') goToStep('customer')
    if (currentStep === 'products') goToStep('delivery')
    if (currentStep === 'details') goToStep('products')
    if (currentStep === 'review') goToStep('details')
  }

  const handleDescargarExcel = async () => {
    if (!order || !selectedCustomer || generandoExcel) return

    try {
      setGenerandoExcel(true)

      await descargarExcel({
        order,
        customer: selectedCustomer,
        consignee: selectedConsignee,
      })
    } catch (error) {
      console.error('Error al descargar Excel:', error)

      alert(
        error instanceof Error
          ? error.message
          : 'No fue posible generar el Excel'
      )
    } finally {
      setGenerandoExcel(false)
    }
  }

  const handleEnviarPedido = async () => {
    if (!order || !selectedCustomer || enviandoPedido || pedidoEnviado) return

    try {
      setEnviandoPedido(true)

      await enviarPedidoN8n({
        order,
        customer: selectedCustomer,
        consignee: selectedConsignee,
      })

      setPedidoEnviado(true)
      alert('Pedido recibido por n8n correctamente')
    } catch (error) {
      console.error('Error al enviar pedido:', error)

      alert(
        error instanceof Error
          ? error.message
          : 'No fue posible enviar el pedido'
      )
    } finally {
      setEnviandoPedido(false)
    }
  }

  const handleNext = () => {
    if (currentStep === 'agent') {
      setAttemptedContinue(true)

      if (!selectedAgent || !/^\d{1,10}$/.test(folio)) {
        return
      }

      goToStep('customer')
      return
    }

    if (currentStep === 'delivery') {
      setAttemptedContinue(true)

      if (!hasDeliveryDestination) {
        return
      }

      goToStep('products')
      return
    }

    if (!showNextButton) return

    if (currentStep === 'customer') goToStep('delivery')
    if (currentStep === 'products') goToStep('details')
    if (currentStep === 'details') goToStep('review')

    if (currentStep === 'review') {
      void handleDescargarExcel()
    }
  }

  const getNextButtonText = () => {
    if (currentStep === 'details') return 'Revisar pedido'
    if (currentStep === 'review') {
      return generandoExcel ? 'Generando Excel...' : 'Descargar Excel'
    }

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
                className="capture-card"
                onClick={() => setCaptureMode('manual')}
              >
                <span className="capture-card-icon" aria-hidden="true"><FaPencilAlt /></span>

                <span className="capture-card-content">
                  <strong>Captura manual</strong>
                  <span>
                    Registra un pedido completando el formulario paso a paso.
                  </span>
                </span>

                <span className="capture-card-arrow" aria-hidden="true">›</span>
              </button>

              <button
                type="button"
                className="capture-card"
                onClick={() => setCaptureMode('photo')}
              >
                <span className="capture-card-icon" aria-hidden="true"><FaCamera /></span>

                <span className="capture-card-content">
                  <strong>Captura por fotografía</strong>
                  <span>
                    Toma o selecciona una fotografía de una nota de pedido.
                  </span>
                </span>

                <span className="capture-card-arrow" aria-hidden="true">›</span>
              </button>

              <button
                type="button"
                className="capture-card"
                onClick={() => setCaptureMode('gallery')}
              >
                <span className="capture-card-icon" aria-hidden="true"><GrGallery /></span>

                <span className="capture-card-content">
                  <strong>Fotografías registradas</strong>
                  <span>
                    Consulta las fotografías de pedidos que has guardado.
                  </span>
                </span>

                <span className="capture-card-arrow" aria-hidden="true">›</span>
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

              <div className="header-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setCaptureMode(null)}
                >
                  Regresar
                </button>

                <button
                  type="button"
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Salir
                </button>
              </div>
            </div>

            <p>Consulta las fotografías que has registrado.</p>
          </header>
        </div>

        <div className="app-content">
          <PhotoGallery />
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

              <div className="header-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setCaptureMode(null)}
                >
                  Regresar
                </button>

                <button
                  type="button"
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Salir
                </button>
              </div>
            </div>

            <p>Registra una nota de pedido mediante una fotografía.</p>
          </header>
        </div>

        <div className="app-content">
          <PhotoCapture />
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

            <div className="header-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleReturnToCaptureMethods}
              >
                Regresar
              </button>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Salir
              </button>
            </div>
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
                inputMode="numeric"
                maxLength={10}
                value={folio}
                required
                aria-invalid={attemptedContinue && !/^\d{1,10}$/.test(folio)}
                aria-describedby={
                  attemptedContinue && !/^\d{1,10}$/.test(folio)
                    ? 'folio-help'
                    : undefined
                }
                onChange={(event) => {
                  const value = event.target.value
                  if (/^\d{0,10}$/.test(value)) setFolio(value)
                }}
                placeholder="Folio (ingreso manual)"
              />

              {attemptedContinue && !/^\d{1,10}$/.test(folio) && (
                <small id="folio-help" className="field-error" role="alert">
                  El folio es obligatorio para continuar.
                </small>
              )}
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
              showValidationErrors={attemptedContinue}

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
              <button
                type="button"
                className="primary-button"
                onClick={handleEnviarPedido}
                disabled={enviandoPedido || pedidoEnviado}
              >
                {enviandoPedido
                  ? 'Enviando...'
                  : pedidoEnviado
                    ? 'Pedido enviado'
                    : 'Enviar pedido (prueba)'}
              </button>
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
            disabled={!showNextButton || generandoExcel}
          >
            {getNextButtonText()}
          </button>
        </div>
      </div>
    </main>
  )
}

export default App
