import { useEffect, useId, useRef, useState } from 'react'

import type { PolyethyleneBag } from '../types/polyethyleneBag'

interface PolyethyleneBagFormProps {
    initialBag?: PolyethyleneBag
    onUpdateBag?: (index: number, bag: PolyethyleneBag) => void
    bags: PolyethyleneBag[]
    onAddBag: (bag: PolyethyleneBag) => void
    onRemoveBag: (index: number) => void
}

const currencyFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
})

function PolyethyleneBagForm({
    initialBag,
    onUpdateBag,
    bags,
    onAddBag,
    onRemoveBag,
}: PolyethyleneBagFormProps) {
    const detailsRef = useRef<HTMLDetailsElement>(null)
    const previousCount = useRef(0)
    const validationId = useId()
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
        if (bags.length > previousCount.current && detailsRef.current) {
            detailsRef.current.open = true
        }
        previousCount.current = bags.length
    }, [bags.length])

    const [key, setKey] = useState(initialBag?.key ?? '')
    const [quantity, setQuantity] = useState(String(initialBag?.quantity ?? 1))
    const [price, setPrice] = useState(initialBag ? String(initialBag.price) : '')
    const [submitted, setSubmitted] = useState(false)
    const errors = {
        key: !['PCEM-I', 'PCEM-M', 'PCEM-Q', 'PCEM-K'].includes(key)
            ? 'Selecciona una clave de bolsa válida.' : '',
        quantity: !/^\d+$/.test(quantity) || !Number.isSafeInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > 9999
            ? 'Ingresa una cantidad entera entre 1 y 9999.' : '',
        price: !/^\d+(\.\d{1,2})?$/.test(price) || !Number.isFinite(Number(price)) || Number(price) < 0.01 || Number(price) > 999999.99
            ? 'Ingresa un precio entre 0.01 y 999999.99, con hasta dos decimales.' : '',
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

        setSubmitted(true)
        if (Object.values(errors).some(Boolean)) return

        const bag: PolyethyleneBag = {
            key: key.trim(),
            quantity: numericQuantity,
            price: numericPrice,
        }

        onAddBag(bag)
        setSubmitted(false)

        setKey('')
        setQuantity('1')
        setPrice('')
    }

    return (
        <section className="polyethylene-bag-form">
            <h2>{initialBag ? 'Editar bolsa' : 'Bolsa Polietileno (opcional)'}</h2>

            <p className="selector-help">
                Agrega las bolsas requeridas por el cliente.
            </p>

            <form className="item-entry-form" noValidate onSubmit={(event) => { event.preventDefault(); handleSubmit() }}>
            <label className="form-label">
                Clave

                <select
                    className="form-control"
                    aria-invalid={submitted && !!errors.key}
                    aria-describedby={validationId}
                    value={key}
                    onChange={(event) => setKey(event.target.value)}
                >
                    <option value="">Seleccione una clave</option>
                    <option value="PCEM-I">PCEM-I</option>
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
                            aria-label="Cantidad de bolsas"
                            aria-invalid={submitted && !!errors.quantity}
                            aria-describedby={validationId}
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
                            aria-label="Precio unitario de bolsa"
                            aria-invalid={submitted && !!errors.price}
                            aria-describedby={validationId}
                            max="999999.99"
                            onChange={(event) => setPrice(event.target.value)}
                        />
                    </div>
                </label>
            </div>

            <div id={validationId} className="validation-message" role="alert" aria-live="polite">
                {submitted ? Object.values(errors).find(Boolean) : ''}
            </div>
            <button
                className="primary-button add-product-button"
                type="submit"
            >
                {initialBag ? 'Guardar cambios' : '+ Agregar bolsa'}
            </button>
            </form>
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
                                {onUpdateBag && (
                                    <button type="button" className="edit-product-button" onClick={() => setEditingIndex(index)} aria-label={`Editar bolsa ${bag.key}`}>
                                        Editar
                                    </button>
                                )}
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
            {editingIndex !== null && bags[editingIndex] && (
                <dialog ref={dialogRef} className="product-edit-dialog" aria-label="Editar bolsa" onCancel={() => setEditingIndex(null)} onClose={() => setEditingIndex(null)}>
                    <PolyethyleneBagForm
                        initialBag={bags[editingIndex]}
                        bags={[]}
                        onAddBag={(bag) => { onUpdateBag?.(editingIndex, bag); setEditingIndex(null) }}
                        onRemoveBag={() => {}}
                    />
                    <button type="button" className="secondary-button modal-cancel" onClick={() => setEditingIndex(null)}>Cancelar</button>
                </dialog>
            )}
        </section>
    )
}

export default PolyethyleneBagForm
