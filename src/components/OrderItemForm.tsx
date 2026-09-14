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
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')

  const selectedProduct = products.find(
    (product) => product.productNumber === productNumber,
  )

  const handleSubmit = () => {
    if (
      !selectedProduct ||
      !productType ||
      !bedSize ||
      !quantity ||
      !price
    ) {
      return
    }

    const item: OrderItem = {
      productNumber: selectedProduct.productNumber,
      model: selectedProduct.model,
      productType,
      bedSize,
      quantity: Number(quantity),
      price: Number(price),
    }

    onAddItem(item)

    setProductNumber('')
    setProductType('')
    setBedSize('')
    setQuantity('')
    setPrice('')
  }

  return (
    <section>
      <h2>Agregar producto</h2>

      <label>
        Modelo
        <select
          value={productNumber}
          onChange={(event) => {
            setProductNumber(event.target.value)
            setProductType('')
            setBedSize('')
          }}
        >
          <option value="">Seleccione un modelo</option>

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
        <>
          <label>
            Tipo
            <select
              value={productType}
              onChange={(event) =>
                setProductType(
                  event.target.value as ProductType,
                )
              }
            >
              <option value="">Seleccione un tipo</option>

              {selectedProduct.availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'mattress'
                    ? 'Colchón'
                    : type === 'box'
                      ? 'Box'
                      : 'Tarima'}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tamaño
            <select
              value={bedSize}
              onChange={(event) =>
                setBedSize(event.target.value as BedSize)
              }
            >
              <option value="">Seleccione un tamaño</option>

              {selectedProduct.availableSizes.map((size) => (
                <option key={size} value={size}>
                  {size === 'ind'
                    ? 'Individual'
                    : size === 'mat'
                      ? 'Matrimonial'
                      : size === 'Q.S.'
                        ? 'Queen Size'
                        : 'King Size'}
                </option>
              ))}
            </select>
          </label>

          <label>
            Cantidad
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
            />
          </label>

          <label>
            Precio
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) =>
                setPrice(event.target.value)
              }
            />
          </label>

          <button
            type="button"
            onClick={handleSubmit}
          >
            Agregar producto
          </button>
        </>
      )}
    </section>
  )
}

export default OrderItemForm