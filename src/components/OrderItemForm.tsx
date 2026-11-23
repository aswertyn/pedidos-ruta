import { useEffect, useMemo, useRef, useState } from 'react'
import { obtenerProductos } from '../services/webService'
import type { ProductoWS } from '../services/webService'
import type { BedSize, ProductType } from '../types/product'
import type { OrderItem } from '../types/orderItem'

interface OrderItemFormProps {
  initialItem?: OrderItem
  onUpdateItem?: (index: number, item: OrderItem) => void
  items: OrderItem[]
  onAddItem: (item: OrderItem) => void
  onRemoveItem: (index: number) => void
}

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})
const manualProductTypes: ProductType[] = ['mattress', 'box', 'platform']
const manualBedSizes: BedSize[] = ['ind', 'mat', 'Q.S.', 'K.S.']

// Se comparte la consulta entre el formulario principal y el de edición.
// Si la consulta falla, se permite volver a intentarla.
let catalogoCache: ProductoWS[] | null = null
let catalogoPromise: Promise<ProductoWS[]> | null = null

function cargarCatalogo(): Promise<ProductoWS[]> {
  if (catalogoCache !== null) return Promise.resolve(catalogoCache)
  if (catalogoPromise === null) {
    catalogoPromise = obtenerProductos()
      .then((productos) => {
        catalogoCache = productos
        return productos
      })
      .finally(() => { catalogoPromise = null })
  }
  return catalogoPromise
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
}

function identificarTamano(descripcion: string): BedSize | null {
  const texto = descripcion.trim().toUpperCase()
  if (/\bIND\b$/.test(texto)) return 'ind'
  if (/\bMAT\b$/.test(texto)) return 'mat'
  if (/\bQUEEN\b$/.test(texto)) return 'Q.S.'
  if (/\bKING\b$/.test(texto)) return 'K.S.'
  return null
}

function identificarTipo(descripcion: string): ProductType | null {
  const texto = descripcion.trim().toUpperCase()
  if (texto.startsWith('COLCHON ')) return 'mattress'
  if (texto.startsWith('BOX ')) return 'box'
  if (texto.startsWith('TARIMA ')) return 'platform'
  return null
}

function sonProductosIguales(a: OrderItem, b: OrderItem): boolean {
  if (a.codigo && b.codigo) return a.codigo === b.codigo
  if (Boolean(a.codigo) !== Boolean(b.codigo)) return false
  return normalizar(a.model) === normalizar(b.model)
    && a.productType === b.productType
    && a.bedSize === b.bedSize
}

function etiquetaTipo(tipo: ProductType): string {
  return tipo === 'mattress' ? 'Colchón' : tipo === 'box' ? 'Box' : 'Tarima'
}

function etiquetaTamano(tamano: BedSize): string {
  return tamano === 'ind' ? 'Individual'
    : tamano === 'mat' ? 'Matrimonial'
      : tamano === 'Q.S.' ? 'Queen Size' : 'King Size'
}

function OrderItemForm({ items, onAddItem, onRemoveItem, initialItem, onUpdateItem }: OrderItemFormProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const previousCount = useRef(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const [catalogo, setCatalogo] = useState<ProductoWS[]>(catalogoCache ?? [])
  const [cargando, setCargando] = useState(catalogoCache === null)
  const [errorCatalogo, setErrorCatalogo] = useState('')
  const [intento, setIntento] = useState(0)
  const [busqueda, setBusqueda] = useState(initialItem?.isManual ? '' : initialItem?.model ?? '')
  const [codigoSeleccionado, setCodigoSeleccionado] = useState(initialItem?.codigo ?? '')
  const [isManual, setIsManual] = useState(Boolean(initialItem?.isManual))
  const [manualModel, setManualModel] = useState(initialItem?.isManual ? initialItem.model : '')
  const [productType, setProductType] = useState<ProductType | ''>(initialItem?.productType ?? '')
  const [bedSize, setBedSize] = useState<BedSize | ''>(initialItem?.bedSize ?? '')
  const [quantity, setQuantity] = useState(String(initialItem?.quantity ?? 1))
  const [price, setPrice] = useState(initialItem ? String(initialItem.price) : '')
  const [submitted, setSubmitted] = useState(false)
  const [duplicateError, setDuplicateError] = useState('')

  useEffect(() => {
    let activo = true
    setCargando(true)
    setErrorCatalogo('')
    cargarCatalogo()
      .then((productos) => {
        if (activo) setCatalogo(productos)
      })
      .catch((error: unknown) => {
        if (activo) setErrorCatalogo(error instanceof Error ? error.message : 'No se pudo cargar el catálogo.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => { activo = false }
  }, [intento])

  useEffect(() => {
    if (editingIndex === null) return
    const dialog = dialogRef.current
    if (!dialog) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [editingIndex])

  useEffect(() => {
    if (items.length > previousCount.current && detailsRef.current) {
      detailsRef.current.open = true
    }
    previousCount.current = items.length
  }, [items.length])

  const seleccionado = catalogo.find((producto) => producto.codigo === codigoSeleccionado)
  const tipoCatalogo = seleccionado ? identificarTipo(seleccionado.descripcion) : null
  const tamanoCatalogo = seleccionado ? identificarTamano(seleccionado.descripcion) : null

  const resultados = useMemo(() => {
    const filtro = normalizar(busqueda)
    if (!filtro) return []
    return catalogo.filter((producto) =>
      normalizar(`${producto.codigo} ${producto.descripcion}`).includes(filtro)
    ).slice(0, 40)
  }, [catalogo, busqueda])

  const tipoActual = isManual ? productType : tipoCatalogo
  const tamanoActual = isManual ? bedSize : tamanoCatalogo
  const puedeConfigurar = isManual ? manualModel.trim() !== '' : Boolean(seleccionado)

  const errors = {
    model: isManual
      ? !manualModel.trim() ? 'Escribe el modelo.'
        : manualModel.trim().length > 150 ? 'El modelo admite hasta 150 caracteres.' : ''
      : !seleccionado ? 'Selecciona un producto del catálogo.'
        : !tipoCatalogo || !tamanoCatalogo ? 'Este producto no tiene tipo o tamaño reconocido. Utiliza captura manual.' : '',
    type: isManual && (!productType || !manualProductTypes.includes(productType))
      ? 'Selecciona un tipo de producto.' : '',
    size: isManual && (!bedSize || !manualBedSizes.includes(bedSize))
      ? 'Selecciona un tamaño.' : '',
    quantity: !/^\d+$/.test(quantity) || !Number.isSafeInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > 9999
      ? 'Ingresa una cantidad entera entre 1 y 9999.' : '',
    price: !/^\d+(\.\d{1,2})?$/.test(price) || !Number.isFinite(Number(price)) || Number(price) < 0.01 || Number(price) > 999999.99
      ? 'Ingresa un precio entre 0.01 y 999999.99, con hasta dos decimales.' : '',
  }

  const resetConfiguration = () => {
    setSubmitted(false)
    setDuplicateError('')
    setProductType('')
    setBedSize('')
    setQuantity('1')
    setPrice('')
  }

  const enableManualMode = () => {
    setIsManual(true)
    setCodigoSeleccionado('')
    setBusqueda('')
    setManualModel('')
    resetConfiguration()
  }

  const enableCatalogMode = () => {
    setIsManual(false)
    setCodigoSeleccionado('')
    setBusqueda('')
    setManualModel('')
    resetConfiguration()
  }

  const increaseQuantity = () => {
    const current = Number(quantity)
    setQuantity(String(!Number.isInteger(current) || current < 1 ? 1 : Math.min(9999, current + 1)))
  }

  const decreaseQuantity = () => {
    const current = Number(quantity)
    setQuantity(String(!Number.isInteger(current) || current <= 1 ? 1 : current - 1))
  }

  const handleSubmit = () => {
    setSubmitted(true)
    setDuplicateError('')
    if (Object.values(errors).some(Boolean) || !tipoActual || !tamanoActual) return

    const item: OrderItem = {
      ...(isManual ? {} : { codigo: seleccionado!.codigo }),
      model: isManual ? manualModel.trim() : seleccionado!.descripcion,
      productType: tipoActual,
      bedSize: tamanoActual,
      quantity: Number(quantity),
      price: Number(price),
      isManual,
    }

    if (items.some((existente) => sonProductosIguales(existente, item))) {
      setDuplicateError('Este producto ya está agregado. Modifica su cantidad desde la opción de edición.')
      return
    }

    onAddItem(item)
    setSubmitted(false)
    setCodigoSeleccionado('')
    setBusqueda('')
    setManualModel('')
    setProductType('')
    setBedSize('')
    setQuantity('1')
    setPrice('')
  }

  return (
    <section className="order-item-form">
      <h2>{initialItem ? 'Editar producto' : 'Agregar producto'}</h2>
      <p className="selector-help">Busca un producto del catálogo o captúralo manualmente.</p>

      <form className="item-entry-form" noValidate onSubmit={(event) => { event.preventDefault(); handleSubmit() }}>
        {!isManual ? (
          <>
            <label className="form-label">
              Buscar producto (código o descripción)
              <input
                className="form-control"
                type="search"
                value={busqueda}
                placeholder="Ej. ALOE VERA o CCALVENI"
                onChange={(event) => {
                  setBusqueda(event.target.value)
                  setCodigoSeleccionado('')
                  setSubmitted(false)
                  setDuplicateError('')
                }}
              />
            </label>

            {cargando && <p className="selector-help">Cargando productos...</p>}
            {errorCatalogo && (
              <div className="validation-message" role="alert">
                {errorCatalogo}{' '}
                <button type="button" onClick={() => setIntento((n) => n + 1)}>Reintentar</button>
              </div>
            )}

            {!cargando && !errorCatalogo && busqueda.trim() && (
              <div className="catalog-results" role="group" aria-label="Resultados de productos">
                {resultados.length === 0 ? (
                  <p className="selector-help">No se encontraron productos.</p>
                ) : (
                  <>
                    {resultados.map((producto) => (
                      <button
                        key={producto.codigo}
                        type="button"
                        className={`catalog-result ${codigoSeleccionado === producto.codigo ? 'selected' : ''}`}
                        aria-pressed={codigoSeleccionado === producto.codigo}
                        onClick={() => {
                          setCodigoSeleccionado(producto.codigo)
                          setBusqueda(producto.descripcion)
                          setSubmitted(false)
                          setDuplicateError('')
                        }}
                      >
                        <strong>{producto.descripcion}</strong>
                        <span>{producto.codigo}</span>
                      </button>
                    ))}
                    {resultados.length === 40 && <p className="selector-help">Mostrando los primeros 40 resultados. Escribe más para filtrar.</p>}
                  </>
                )}
              </div>
            )}

            {seleccionado && (
              <div className="selected-catalog-product">
                <strong>{seleccionado.descripcion}</strong>
                <span>Código: {seleccionado.codigo}</span>
                {tipoCatalogo && tamanoCatalogo && (
                  <span>{etiquetaTipo(tipoCatalogo)} · {etiquetaTamano(tamanoCatalogo)}</span>
                )}
              </div>
            )}

            <button className="manual-model-button" type="button" onClick={enableManualMode}>
              + Capturar modelo manualmente
            </button>
          </>
        ) : (
          <>
            <label className="form-label">
              Modelo
              <input
                className="form-control"
                type="text"
                maxLength={150}
                aria-invalid={submitted && Boolean(errors.model)}
                value={manualModel}
                placeholder="Escribe el modelo"
                onChange={(event) => setManualModel(event.target.value)}
              />
            </label>
            <button className="manual-model-button" type="button" onClick={enableCatalogMode}>
              ← Seleccionar del catálogo
            </button>
          </>
        )}

        {puedeConfigurar && (
          <div className="product-options">
            {isManual ? (
              <>
                <div className="option-group">
                  <span className="option-title">Tipo</span>
                  <div className="option-buttons">
                    {manualProductTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`option-button ${productType === type ? 'selected' : ''}`}
                        onClick={() => setProductType(type)}
                      >
                        {etiquetaTipo(type)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="option-group">
                  <span className="option-title">Tamaño</span>
                  <div className="option-buttons size-buttons">
                    {manualBedSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`option-button ${bedSize === size ? 'selected' : ''}`}
                        onClick={() => setBedSize(size)}
                      >
                        {etiquetaTamano(size)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              tipoCatalogo && tamanoCatalogo && (
                <div className="option-group">
                  <span className="option-title">Presentación del catálogo</span>
                  <p>{etiquetaTipo(tipoCatalogo)} · {etiquetaTamano(tamanoCatalogo)}</p>
                </div>
              )
            )}

            <div className="quantity-price-grid">
              <div className="option-group">
                <span className="option-title">Cantidad</span>
                <div className="quantity-control">
                  <button type="button" onClick={decreaseQuantity} aria-label="Disminuir cantidad">−</button>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    step="1"
                    inputMode="numeric"
                    value={quantity}
                    aria-label="Cantidad"
                    aria-invalid={submitted && Boolean(errors.quantity)}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                  <button type="button" onClick={increaseQuantity} aria-label="Aumentar cantidad">+</button>
                </div>
              </div>
              <label className="form-label price-field">
                Precio
                <div className="price-input">
                  <span>$</span>
                  <input
                    type="number"
                    min="0.01"
                    max="999999.99"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={price}
                    aria-label="Precio unitario"
                    aria-invalid={submitted && Boolean(errors.price)}
                    onChange={(event) => setPrice(event.target.value)}
                  />
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="validation-message" role="alert" aria-live="polite">
          {duplicateError || (submitted ? Object.values(errors).find(Boolean) : '')}
        </div>
        <button className="primary-button add-product-button" type="submit">
          {initialItem ? 'Guardar cambios' : '+ Agregar producto'}
        </button>
      </form>

      {items.length > 0 && (
        <details className="items-accordion" ref={detailsRef}>
          <summary>
            Productos agregados
            <span className="accordion-count">{items.length}</span>
            <span className="accordion-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="accordion-content">
            {items.map((item, index) => (
              <article className="accordion-item" key={index}>
                <div className="accordion-item-main">
                  <strong>{item.model}</strong>
                  <span>
                    {etiquetaTipo(item.productType)} · {etiquetaTamano(item.bedSize)} ·{' '}
                    {item.quantity} × {currencyFormatter.format(item.price)}
                  </span>
                  {item.codigo && <span>Código: {item.codigo}</span>}
                </div>
                <strong className="accordion-item-price">
                  {currencyFormatter.format(item.quantity * item.price)}
                </strong>
                {onUpdateItem && (
                  <button
                    type="button"
                    className="edit-product-button"
                    onClick={() => setEditingIndex(index)}
                    aria-label={`Editar producto ${item.model}`}
                  >
                    Editar
                  </button>
                )}
                <button
                  className="accordion-remove-button"
                  type="button"
                  aria-label={`Eliminar producto ${item.model}`}
                  onClick={() => onRemoveItem(index)}
                >
                  ×
                </button>
              </article>
            ))}
          </div>
        </details>
      )}

      {editingIndex !== null && items[editingIndex] && (
        <dialog
          ref={dialogRef}
          className="product-edit-dialog"
          aria-label="Editar producto"
          onCancel={() => setEditingIndex(null)}
          onClose={() => setEditingIndex(null)}
        >
          <OrderItemForm
            initialItem={items[editingIndex]}
            items={items.filter((_, index) => index !== editingIndex)}
            onAddItem={(item) => {
              onUpdateItem?.(editingIndex, item)
              setEditingIndex(null)
            }}
            onRemoveItem={() => {}}
          />
          <button
            type="button"
            className="secondary-button modal-cancel"
            onClick={() => setEditingIndex(null)}
          >
            Cancelar
          </button>
        </dialog>
      )}
    </section>
  )
}

export default OrderItemForm