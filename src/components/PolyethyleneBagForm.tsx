import { useEffect, useRef, useState } from 'react'

import type { PolyethyleneBag } from '../types/polyethyleneBag'

interface PolyethyleneBagFormProps {
    bags: PolyethyleneBag[]
    onAddBag: (bag: PolyethyleneBag) => void
    onRemoveBag: (index: number) => void
}

const currencyFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
})

function PolyethyleneBagForm({
    bags,
    onAddBag,
    onRemoveBag,
}: PolyethyleneBagFormProps) {
    const detailsRef = useRef<HTMLDetailsElement>(null)
    const previousCount = useRef(0)

    useEffect(() => {
        if (bags.length > previousCount.current && detailsRef.current) {
            detailsRef.current.open = true
        }
        previousCount.current = bags.length
    }, [bags.length])

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
            <h2>Bolsa Polietileno (opcional)</h2>

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
            {bags.length > 0 && (
                <details className="items-accordion" ref={detailsRef}>
                    <summary>
                        Bolsas agregadas
                        <span className="accordion-count">{bags.length}</span>
                        <span className="accordion-chevron" aria-hidden="true">⌄</span>
                    </summary>
                    <div className="accordion-content">
                        {bags.map((bag, index) => (
                            <article className="accordion-item" key={index}>
                                <div className="accordion-item-main">
                                    <strong>{bag.key}</strong>
                                    <span>{bag.quantity} × {currencyFormatter.format(bag.price)}</span>
                                </div>
                                <strong className="accordion-item-price">
                                    {currencyFormatter.format(bag.quantity * bag.price)}
                                </strong>
                                <button
                                    className="accordion-remove-button"
                                    type="button"
                                    aria-label={`Eliminar bolsa ${bag.key}`}
                                    onClick={() => onRemoveBag(index)}
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

export default PolyethyleneBagForm
