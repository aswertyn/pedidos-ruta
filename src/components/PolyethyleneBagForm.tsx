import { useState } from 'react'

import type { PolyethyleneBag } from '../types/polyethyleneBag'

interface PolyethyleneBagFormProps {
    onAddBag: (bag: PolyethyleneBag) => void
}

function PolyethyleneBagForm({
    onAddBag,
}: PolyethyleneBagFormProps) {
    const [key, setKey] = useState('')
    const [quantity, setQuantity] = useState('1')
    const [price, setPrice] = useState('')

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
            key.trim() === '' ||
            !Number.isInteger(numericQuantity) ||
            numericQuantity < 1 ||
            !Number.isFinite(numericPrice) ||
            numericPrice <= 0
        ) {
            return
        }

        const bag: PolyethyleneBag = {
            key: key.trim(),
            quantity: numericQuantity,
            price: numericPrice,
        }

        onAddBag(bag)

        setKey('')
        setQuantity('1')
        setPrice('')
    }

    return (
        <section className="polyethylene-bag-form">
            <h2>Bolsa Polietileno</h2>

            <p className="selector-help">
                Agrega las bolsas requeridas por el cliente.
            </p>

            <label className="form-label">
                Clave

                <select
                    className="form-control"
                    value={key}
                    onChange={(event) => setKey(event.target.value)}
                >
                    <option value="">Seleccione una clave</option>
                    <option value="PCEM-1">PCEM-1</option>
                    <option value="PCEM-M">PCEM-M</option>
                    <option value="PCEM-Q">PCEM-Q</option>
                    <option value="PCEM-K">PCEM-K</option>
                </select>
            </label>

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
                + Agregar bolsa
            </button>
        </section>
    )
}

export default PolyethyleneBagForm