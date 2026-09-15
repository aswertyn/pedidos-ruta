import { useState } from 'react'

import { products } from '../data/products'

import type {
  BedSize,
  ProductType,
} from '../types/product'

import type { OrderItem } from '../types/orderItem'

interface OrderItemFormProps {
  onAddItem: (item: OrderItem) => void
}

function OrderItemForm({ onAddItem }: OrderItemFormProps) {
  const [productNumber, setProductNumber] = useState('')
  const [productType, setProductType] = useState<ProductType | ''>('')
  const [bedSize, setBedSize] = useState<BedSize | ''>('')
  const [quantity, setQuantity] = useState('1')
  const [price, setPrice] = useState('')

  const selectedProduct = products.find(
    (product) => product.productNumber === productNumber,
  )

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

    if (
      !selectedProduct ||
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
      productNumber: selectedProduct.productNumber,
      model: selectedProduct.model,
      productType,
      bedSize,
      quantity: numericQuantity,
      price: numericPrice,
    }

    onAddItem(item)

    setProductNumber('')
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

      {selectedProduct && (
        <div className="product-options">
          <div className="option-group">
            <span className="option-title">
              Tipo
            </span>

            <div className="option-buttons">
              {selectedProduct.availableTypes.map((type) => (
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
              {selectedProduct.availableSizes.map((size) => (
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
                  onChange={(event) => {
                    const value = event.target.value
                    if (value === '') {
                      setQuantity('')
                      return
                    }
                    const number = Number(value)
                    // Evitar decimales
                    if (Number.isInteger(number) && number >= 1) {
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
    </section>
  )
}

export default OrderItemForm