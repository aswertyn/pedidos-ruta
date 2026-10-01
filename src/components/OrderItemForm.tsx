import { useEffect, useRef, useState } from 'react'

import { products } from '../data/products'

import type {
  BedSize,
  ProductType,
} from '../types/product'

import type { OrderItem } from '../types/orderItem'

interface OrderItemFormProps {
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

function OrderItemForm({ items, onAddItem, onRemoveItem }: OrderItemFormProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const previousCount = useRef(0)

  useEffect(() => {
    if (items.length > previousCount.current && detailsRef.current) {
      detailsRef.current.open = true
    }
    previousCount.current = items.length
  }, [items.length])

  const [productNumber, setProductNumber] = useState('')
  const [manualModel, setManualModel] = useState('')
  const [isManual, setIsManual] = useState(false)

  const [productType, setProductType] =
    useState<ProductType | ''>('')

  const [bedSize, setBedSize] =
    useState<BedSize | ''>('')

  const [quantity, setQuantity] = useState('1')
  const [price, setPrice] = useState('')

  const selectedProduct = products.find(
    (product) => product.productNumber === productNumber,
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

  const resetProductConfiguration = () => {
    setProductType('')
    setBedSize('')
    setQuantity('1')
    setPrice('')
  }

  const enableManualMode = () => {
    setIsManual(true)
    setProductNumber('')
    setManualModel('')
    resetProductConfiguration()
  }

  const enableCatalogMode = () => {
    setIsManual(false)
    setProductNumber('')
    setManualModel('')
    resetProductConfiguration()
  }

  const increaseQuantity = () => {
    const currentQuantity = Number(quantity)

    if (!Number.isInteger(currentQuantity) || currentQuantity < 1) {
      setQuantity('1')
      return
    }

    setQuantity(String(currentQuantity + 1))
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

    if (
      !model ||
      (!isManual && !selectedProduct) ||
      !productType ||
      !bedSize ||
      !Number.isInteger(numericQuantity) ||
      numericQuantity < 1 ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      return
    }

    const item: OrderItem = {
      productNumber: isManual
        ? ''
        : selectedProduct!.productNumber,
      model,
      productType,
      bedSize,
      quantity: numericQuantity,
      price: numericPrice,
      isManual,
    }

    onAddItem(item)

    setProductNumber('')
    setManualModel('')
    setProductType('')
    setBedSize('')
    setQuantity('1')
    setPrice('')
  }

  return (
    <section className="order-item-form">
      <h2>Agregar producto</h2>

      <p className="selector-help">
        Selecciona el producto y sus características.
      </p>

      {!isManual ? (
        <>
          <label className="form-label">
            Modelo

            <select
              className="form-control"
              value={productNumber}
              onChange={(event) => {
                setProductNumber(event.target.value)
                setProductType('')
                setBedSize('')
              }}
            >
              <option value="">
                Seleccione un modelo
              </option>

              {products.map((product) => (
                <option
                  key={product.productNumber}
                  value={product.productNumber}
                >
                  {product.productNumber} - {product.model}
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

      {canConfigureProduct && (
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
                  className={`option-button ${
                    productType === type ? 'selected' : ''
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
                  className={`option-button ${
                    bedSize === size ? 'selected' : ''
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
                  onChange={(event) => {
                    const value = event.target.value

                    if (value === '') {
                      setQuantity('')
                      return
                    }

                    const number = Number(value)

                    if (
                      Number.isInteger(number) &&
                      number >= 1
                    ) {
                      setQuantity(value)
                    }
                  }}
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
                  min="0.1"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={price}
                  onChange={(event) => {
                    const value = event.target.value

                    if (value === '') {
                      setPrice('')
                      return
                    }

                    const number = Number(value)

                    if (number > 0) {
                      setPrice(value)
                    }
                  }}
                />
              </div>
            </label>
          </div>

          <button
            className="primary-button add-product-button"
            type="button"
            onClick={handleSubmit}
          >
            + Agregar producto
          </button>
        </div>
      )}
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
    </section>
  )
}

export default OrderItemForm
