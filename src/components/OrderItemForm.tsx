import { useEffect, useRef, useState } from 'react'

import { products } from '../data/products'

import type {
  BedSize,
  ProductType,
} from '../types/product'

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

const manualProductTypes: ProductType[] = [
  'mattress',
  'box',
  'platform',
]

const manualBedSizes: BedSize[] = [
  'ind',
  'mat',
  'Q.S.',
  'K.S.',
]

function OrderItemForm({ items, onAddItem, onRemoveItem, initialItem, onUpdateItem }: OrderItemFormProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const previousCount = useRef(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  useEffect(() => {
    if (editingIndex === null) return
    const dialog = dialogRef.current
    if (!dialog) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [editingIndex])

  useEffect(() => {
    if (items.length > previousCount.current && detailsRef.current) {
      detailsRef.current.open = true
    }
    previousCount.current = items.length
  }, [items.length])

  const [selectedModel, setSelectedModel] = useState(
    initialItem?.isManual ? '' : initialItem?.model ?? ''
  )
  const [manualModel, setManualModel] = useState(initialItem?.isManual ? initialItem.model : '')
  const [isManual, setIsManual] = useState(Boolean(initialItem?.isManual))

  const [productType, setProductType] =
    useState<ProductType | ''>(initialItem?.productType ?? '')

  const [bedSize, setBedSize] =
    useState<BedSize | ''>(initialItem?.bedSize ?? '')

  const [quantity, setQuantity] = useState(String(initialItem?.quantity ?? 1))
  const [price, setPrice] = useState(initialItem ? String(initialItem.price) : '')
  const [submitted, setSubmitted] = useState(false)

  const selectedProduct = products.find(
    (product) => product.model === selectedModel,
  )

  const availableTypes = isManual
    ? manualProductTypes
    : selectedProduct?.availableTypes ?? []

  const availableSizes = isManual
    ? manualBedSizes
    : selectedProduct?.availableSizes ?? []

  const canConfigureProduct = isManual
    ? manualModel.trim() !== ''
    : selectedProduct !== undefined

  const errors = {
    model: isManual
      ? (!manualModel.trim() ? 'Escribe el modelo.' : manualModel.trim().length > 150 ? 'El modelo admite hasta 150 caracteres.' : '')
      : (!selectedProduct ? 'Selecciona un modelo del catálogo.' : ''),
    type: !productType || !availableTypes.includes(productType) ? 'Selecciona un tipo disponible para el modelo.' : '',
    size: !bedSize || !availableSizes.includes(bedSize) ? 'Selecciona un tamaño disponible para el modelo.' : '',
    quantity: !/^\d+$/.test(quantity) || !Number.isSafeInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > 9999
      ? 'Ingresa una cantidad entera entre 1 y 9999.' : '',
    price: !/^\d+(\.\d{1,2})?$/.test(price) || !Number.isFinite(Number(price)) || Number(price) < 0.01 || Number(price) > 999999.99
      ? 'Ingresa un precio entre 0.01 y 999999.99, con hasta dos decimales.' : '',
  }

  const resetProductConfiguration = () => {
    setSubmitted(false)
    setProductType('')
    setBedSize('')
    setQuantity('1')
    setPrice('')
  }

  const enableManualMode = () => {
    setIsManual(true)
    setSelectedModel('')
    setManualModel('')
    resetProductConfiguration()
  }

  const enableCatalogMode = () => {
    setIsManual(false)
    setSelectedModel('')
    setManualModel('')
    resetProductConfiguration()
  }

  const increaseQuantity = () => {
    const currentQuantity = Number(quantity)

    if (!Number.isInteger(currentQuantity) || currentQuantity < 1) {
      setQuantity('1')
      return
    }

    setQuantity(String(Math.min(9999, currentQuantity + 1)))
  }

  const decreaseQuantity = () => {
    const currentQuantity = Number(quantity)

    if (!Number.isInteger(currentQuantity) || currentQuantity <= 1) {
      setQuantity('1')
      return
    }

    setQuantity(String(currentQuantity - 1))
  }

  const handleSubmit = () => {
    const numericQuantity = Number(quantity)
    const numericPrice = Number(price)

    const model = isManual
      ? manualModel.trim()
      : selectedProduct?.model ?? ''

    setSubmitted(true)
    if (Object.values(errors).some(Boolean) || !productType || !bedSize) {
      return
    }

    const item: OrderItem = {
      model,
      productType,
      bedSize,
      quantity: numericQuantity,
      price: numericPrice,
      isManual,
    }

    onAddItem(item)
    setSubmitted(false)

    setSelectedModel('')
    setManualModel('')
    setProductType('')
    setBedSize('')
    setQuantity('1')
    setPrice('')
  }

  return (
    <section className="order-item-form">
      <h2>{initialItem ? 'Editar producto' : 'Agregar producto'}</h2>

      <p className="selector-help">
        Selecciona el producto y sus características.
      </p>

      <form className="item-entry-form" noValidate onSubmit={(event) => { event.preventDefault(); handleSubmit() }}>
        {!isManual ? (
          <>
            <label className="form-label">
              Modelo

              <select
                className="form-control"
                aria-invalid={submitted && !!errors.model}
                value={selectedModel}
                onChange={(event) => {
                  setSelectedModel(event.target.value)
                  resetProductConfiguration()
                }}
              >
                <option value="">
                  Seleccione un modelo
                </option>

                {products.map((product) => (
                  <option
                    key={product.model}
                    value={product.model}
                  >
                    {product.model}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="manual-model-button"
              type="button"
              onClick={enableManualMode}
            >
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
                aria-invalid={submitted && !!errors.model}
                value={manualModel}
                placeholder="Escribe el modelo"
                onChange={(event) => {
                  setManualModel(event.target.value)
                }}
              />
            </label>

            <button
              className="manual-model-button"
              type="button"
              onClick={enableCatalogMode}
            >
              ← Seleccionar del catálogo
            </button>
          </>
        )}
        {(canConfigureProduct || isManual) && (
          <div className="product-options">
            <div className="option-group">
              <span className="option-title">
                Tipo
              </span>

              <div className="option-buttons">
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`option-button ${productType === type ? 'selected' : ''
                      }`}
                    onClick={() => setProductType(type)}
                  >
                    {type === 'mattress'
                      ? 'Colchón'
                      : type === 'box'
                        ? 'Box'
                        : 'Tarima'}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <span className="option-title">
                Tamaño
              </span>

              <div className="option-buttons size-buttons">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`option-button ${bedSize === size ? 'selected' : ''
                      }`}
                    onClick={() => setBedSize(size)}
                  >
                    {size === 'ind'
                      ? 'Individual'
                      : size === 'mat'
                        ? 'Matrimonial'
                        : size === 'Q.S.'
                          ? 'Queen Size'
                          : 'King Size'}
                  </button>
                ))}
              </div>
            </div>
            <div className="quantity-price-grid">
              <div className="option-group">
                <span className="option-title">
                  Cantidad
                </span>

                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    aria-label="Disminuir cantidad"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={quantity}
                    aria-label="Cantidad"
                    aria-invalid={submitted && !!errors.quantity}
                    max="9999"
                    onChange={(event) => setQuantity(event.target.value)}
                  />

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              </div>

              <label className="form-label price-field">
                Precio

                <div className="price-input">
                  <span>$</span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={price}
                    aria-label="Precio unitario"
                    aria-invalid={submitted && !!errors.price}
                    max="999999.99"
                    onChange={(event) => setPrice(event.target.value)}
                  />
                </div>
              </label>
            </div>
          </div>
        )}
        <div className="validation-message" role="alert" aria-live="polite">
          {submitted ? Object.values(errors).find(Boolean) : ''}
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
                    {item.productType === 'mattress'
                      ? 'Colchón'
                      : item.productType === 'box' ? 'Box' : 'Tarima'}
                    {' · '}
                    {item.bedSize === 'ind'
                      ? 'Individual'
                      : item.bedSize === 'mat'
                        ? 'Matrimonial'
                        : item.bedSize === 'Q.S.' ? 'Queen Size' : 'King Size'}
                    {' · '}{item.quantity} × {currencyFormatter.format(item.price)}
                  </span>
                </div>
                <strong className="accordion-item-price">
                  {currencyFormatter.format(item.quantity * item.price)}
                </strong>
                {onUpdateItem && (
                  <button type="button" className="edit-product-button" onClick={() => setEditingIndex(index)} aria-label={`Editar producto ${item.model}`}>
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
        <dialog ref={dialogRef} className="product-edit-dialog" aria-label="Editar producto" onCancel={() => setEditingIndex(null)} onClose={() => setEditingIndex(null)}>
          <OrderItemForm
            initialItem={items[editingIndex]}
            items={[]}
            onAddItem={(item) => { onUpdateItem?.(editingIndex, item); setEditingIndex(null) }}
            onRemoveItem={() => { }}
          />
          <button type="button" className="secondary-button modal-cancel" onClick={() => setEditingIndex(null)}>Cancelar</button>
        </dialog>
      )}
    </section>
  )
}

export default OrderItemForm
