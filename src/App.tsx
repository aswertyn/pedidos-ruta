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
import ConsultaWebServicePage from './pages/ConsultaWebServicePage'
import type { AuthUser } from './services/authService'
import { getCurrentUser, logout } from './services/authService'
import { descargarExcel } from './services/excelService'
import { ErrorValidacionEnvio, enviarPedidoWS, obtenerClientes } from './services/webService'
import type { ResultadoEnvio } from './services/webService'

import { agents } from './data/agents'
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
  const [captureMode, setCaptureMode] = useState<
    'manual' | 'photo' | 'gallery' | 'webservice' | null
  >(null)
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
  const [webServiceCustomers, setWebServiceCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersError, setCustomersError] = useState('')
  const [selectedConsignee, setSelectedConsignee] =
    useState<Consignee | null>(null)
  const [manualConsignee, setManualConsignee] =
    useState<ManualConsignee | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [currentStep, setCurrentStep] = useState<OrderStep>('agent')
  const [orderDate, setOrderDate] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  // Declaración pendiente: Estado "programado" como predeterminado actualmente*
  const [deliveryPriority, setDeliveryPriority] = useState<DeliveryPriority>('scheduled')
  const [ocurre, setOcurre] = useState(false)
  const [purchaseOrder, setPurchaseOrder] = useState('')
  const [folio, setFolio] = useState('')
  const [attemptedContinue, setAttemptedContinue] = useState(false)
  const [conditions, setConditions] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerCity, setCustomerCity] = useState('')
  const [consigneeName, setConsigneeName] = useState('')
  const [consigneePhone, setConsigneePhone] = useState('')

  const [observations, setObservations] = useState('')
  const [polyethyleneBags, setPolyethyleneBags] = useState<PolyethyleneBag[]>([])
  const [generandoExcel, setGenerandoExcel] = useState(false)
  const [enviandoPedido, setEnviandoPedido] = useState(false)
  const [pedidoEnviado, setPedidoEnviado] = useState(false)
  const [moneda, setMoneda] = useState<'MXN' | 'USD'>('MXN')
  const [resultadoEnvio, setResultadoEnvio] = useState<ResultadoEnvio | null>(null)
  const [envioIncierto, setEnvioIncierto] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      alert('No fue posible cerrar la sesión. Inténtalo nuevamente.')
      return
    }

    setPedidoEnviado(false)
    setResultadoEnvio(null)
    setEnvioIncierto(false)
    setMoneda('MXN')
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
    setCreatedAt('')
    setDeliveryPriority('scheduled')
    setOcurre(false)
    setPurchaseOrder('')
    setFolio('')
    setConditions('')
    setCustomerPhone('')
    setCustomerAddress('')
    setCustomerCity('')
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
    setCustomerAddress('')
    setCustomerCity('')
    setConditions('')
    setConsigneeName('')
    setConsigneePhone('')
    setSelectedCustomer(null)
    setSelectedConsignee(null)
    setManualConsignee(null)
    setOrderItems([])
    setPolyethyleneBags([])
  }

  const cargarClientes = async () => {
    setLoadingCustomers(true)
    setCustomersError('')

    try {
      const clientesWS = await obtenerClientes()
      const clientes: Customer[] = clientesWS.map((cliente) => ({
        customerNumber: cliente.id_cliente,
        name: cliente.nombre_tienda ?? '',
        contactName: [cliente.nombre, cliente.paterno, cliente.materno].filter(Boolean).join(' '),
        phone: cliente.telefono ?? '',
        address: '',
        city: '',
        conditions: '',
        agentNumber: '',
      }))
      setWebServiceCustomers(clientes)
    } catch (error) {
      console.error('Error al consultar clientes:', error)
      setCustomersError(error instanceof Error ? error.message : 'No fue posible consultar los clientes')
    } finally {
      setLoadingCustomers(false)
    }
  }

  const handleCustomerChange = (customerNumber: string) => {
    const customer = webServiceCustomers.find(
      (customer) => customer.customerNumber === customerNumber,
    )

    setSelectedCustomer(customer ?? null)
    setCustomerAddress('')
    setCustomerCity('')
    setCustomerPhone(customer?.phone ?? '')
    setConditions('')
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

  // Mostrar todos los clientes hasta disponer de la relación cliente-agente.
  const agentCustomers = selectedAgent ? webServiceCustomers : []

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
    manualConsignee.city.trim().length >= 3

  const hasCompleteManualConsignee =
    manualConsignee !== null &&
    consigneeName.trim() !== '' &&
    consigneePhone.trim() !== '' &&
    manualConsignee.address.trim() !== '' &&
    manualConsignee.city.trim() !== ''

  const hasCompleteDeliveryDestination =
    selectedConsignee !== null || hasCompleteManualConsignee

  const hasDeliveryDestination =
    selectedConsignee !== null || hasValidManualConsignee

  const completedCustomer: Customer | null = selectedCustomer
    ? {
      ...selectedCustomer,
      address: customerAddress.trim(),
      city: customerCity.trim(),
      conditions: conditions.trim(),
    }
    : null

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
        createdAt,
        deliveryPriority,
        purchaseOrder,
        ocurre,
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

  const hasValidCustomerDetails =
    customerAddress.trim().length >= 10 &&
    customerCity.trim().length >= 3 &&
    conditions.trim().length > 0

  const showNextButton =
    (currentStep === 'agent' && selectedAgent !== null && /^\d{1,10}$/.test(folio)) ||
    (currentStep === 'customer' && selectedCustomer !== null) ||
    (currentStep === 'delivery' && hasCompleteDeliveryDestination && hasValidCustomerDetails) ||
    (currentStep === 'products' && orderItems.length > 0) ||
    currentStep === 'details' ||
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
    if (!order || !completedCustomer || generandoExcel) return

    try {
      setGenerandoExcel(true)

      await descargarExcel({
        order,
        customer: completedCustomer,
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
    if (!order || enviandoPedido || pedidoEnviado || envioIncierto) return
    if (!order.purchaseOrder.trim()) {
      alert('Ingresa una orden de compra antes de enviar el pedido.')
      return
    }
    if (order.polyethyleneBag.length > 0) {
      alert('Las bolsas de polietileno a?n no se pueden enviar al webservice. Ret?ralas antes de continuar.')
      return
    }
    const sinCodigo = order.items.findIndex((item) => !item.codigo?.trim())
    if (sinCodigo !== -1) {
      alert(`El producto ${sinCodigo + 1} no tiene c?digo. Selecciona un producto del cat?logo.`)
      return
    }
    setEnviandoPedido(true)
    try {
      const resultado = await enviarPedidoWS(order, moneda)
      setResultadoEnvio(resultado)
      if (resultado.partidaIncierta) setEnvioIncierto(true)
      else setPedidoEnviado(true)
    } catch (error) {
      if (error instanceof ErrorValidacionEnvio) {
        alert(error.message)
        return
      }
      // Un fallo de red puede ocurrir despu?s de que el servidor haya enviado partidas.
      setEnvioIncierto(true)
      alert(`${error instanceof Error ? error.message : 'No fue posible confirmar el env?o'}. Consulta los pedidos antes de volver a enviar.`)
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

      if (webServiceCustomers.length === 0 && !loadingCustomers) {
        void cargarClientes()
      }

      goToStep('customer')
      return
    }

    if (currentStep === 'delivery') {
      setAttemptedContinue(true)

      if (!hasDeliveryDestination || !hasValidCustomerDetails) {
        return
      }

      goToStep('products')
      return
    }

    if (!showNextButton) return

    if (currentStep === 'customer') goToStep('delivery')
    if (currentStep === 'products') goToStep('details')
    if (currentStep === 'details') {
      if (!createdAt) {
        const now = new Date()
        const localDate = [
          now.getFullYear(),
          String(now.getMonth() + 1).padStart(2, '0'),
          String(now.getDate()).padStart(2, '0'),
        ].join('-')
        setCreatedAt(now.toISOString())
        setOrderDate(localDate)
      }
      goToStep('review')
    }

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
              <button
                type="button"
                className="capture-card"
                onClick={() => setCaptureMode('webservice')}
              >
                <span className="capture-card-icon" aria-hidden="true">
                  <FaPencilAlt />
                </span>

                <span className="capture-card-content">
                  <strong>Consultas Web Service</strong>
                  <span>
                    Consultar clientes, productos y pedidos.
                  </span>
                </span>

                <span className="capture-card-arrow" aria-hidden="true">
                  ›
                </span>
              </button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (captureMode === 'webservice') {
    return (
      <main className="app-container">
        <div className="app-top">
          <header className="app-header">
            <div className="header-top">
              <h1>Consultas Web Service</h1>

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
          </header>
        </div>

        <div className="app-content">
          <ConsultaWebServicePage />
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
            {loadingCustomers && (
              <p className="selector-help">Consultando clientes del Web Service...</p>
            )}
            {customersError && (
              <div role="alert">
                <p className="field-error">{customersError}</p>
                <button type="button" className="secondary-button" onClick={() => void cargarClientes()} disabled={loadingCustomers}>
                  Reintentar consulta
                </button>
              </div>
            )}
            {!loadingCustomers && !customersError && (
              <CustomerSelector
                customers={agentCustomers}
                selectedCustomer={selectedCustomer}
                onCustomerChange={handleCustomerChange}
              />
            )}
          </section>
        )}

        {currentStep === 'delivery' && (
          <section>
            <ConsigneeSelector
              ocurre={ocurre}
              onOcurreChange={setOcurre}
              customerAddress={customerAddress}
              onCustomerAddressChange={setCustomerAddress}
              customerCity={customerCity}
              onCustomerCityChange={setCustomerCity}
              customerConditions={conditions}
              onCustomerConditionsChange={setConditions}
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
              deliveryPriority={deliveryPriority}
              purchaseOrder={purchaseOrder}

              observations={observations}
              onDeliveryPriorityChange={setDeliveryPriority}
              onPurchaseOrderChange={setPurchaseOrder}
              onObservationsChange={setObservations}
            />
          </section>
        )}

        {currentStep === 'review' &&
          order &&
          selectedAgent &&
          completedCustomer && (
            <section>
              <OrderReview
                order={order}
                agent={selectedAgent}
                customer={completedCustomer}
                consignee={selectedConsignee}
              />
              <label htmlFor="moneda-ws">Moneda para el webservice</label>{' '}
              <select id="moneda-ws" value={moneda} disabled={enviandoPedido || pedidoEnviado || envioIncierto} onChange={(event) => setMoneda(event.target.value as 'MXN' | 'USD')}>
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
              </select>
              {resultadoEnvio && (
                <div role="status">
                  <p>{resultadoEnvio.message}</p>
                  {resultadoEnvio.registradas.map((partida) => (
                    <p key={partida.index}>Producto {partida.index + 1} ({partida.codigo}): registrado con ID {partida.idPedido}</p>
                  ))}
                  {resultadoEnvio.partidaIncierta && <p>Producto {resultadoEnvio.partidaIncierta.index + 1} ({resultadoEnvio.partidaIncierta.codigo}): resultado sin confirmar.</p>}
                  {resultadoEnvio.pendientes?.map((partida) => <p key={partida.index}>Producto {partida.index + 1} ({partida.codigo}): no enviado.</p>)}
                </div>
              )}
              {envioIncierto && !resultadoEnvio && <p role="alert">No se pudo confirmar el resultado. Consulta el webservice antes de volver a enviar.</p>}
              <button
                type="button"
                className="primary-button"
                onClick={handleEnviarPedido}
                disabled={enviandoPedido || pedidoEnviado || envioIncierto}
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
