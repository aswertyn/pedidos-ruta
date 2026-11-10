import { useState } from 'react'

import type { Consignee } from '../types/consignee'
import type { ManualConsignee } from '../types/manualConsignee'

interface ConsigneeSelectorProps {
  consigneeName: string
  onConsigneeNameChange: (value: string) => void
  consigneePhone: string
  onConsigneePhoneChange: (value: string) => void
  showValidationErrors: boolean

  consignees: Consignee[]
  selectedConsignee: Consignee | null
  manualConsignee: ManualConsignee | null
  onConsigneeChange: (consigneeNumber: string) => void
  onManualConsigneeChange: (manualConsignee: ManualConsignee) => void
}

function ConsigneeSelector({
  consigneeName,
  onConsigneeNameChange,
  consigneePhone,
  onConsigneePhoneChange,
  showValidationErrors,

  consignees,
  selectedConsignee,
  manualConsignee,
  onConsigneeChange,
  onManualConsigneeChange,
}: ConsigneeSelectorProps) {
  const [useManualAddress, setUseManualAddress] = useState(
    selectedConsignee === null && (manualConsignee !== null || consignees.length === 0),
  )

  const handleConsigneeSelection = (consigneeNumber: string) => {
    setUseManualAddress(false)
    onConsigneeChange(consigneeNumber)
  }

  const handleManualSelection = () => {
    setUseManualAddress(true)
    onConsigneeChange('')
    if (!manualConsignee) {
      onManualConsigneeChange({
        address: '',
        city: '',
        receivingStartTime: '',
        receivingEndTime: '',
      })
    }
  }

  const isNameValid =
    consigneeName.trim().length >= 2 &&
    /^[\p{L}][\p{L} ]*$/u.test(consigneeName.trim())

  const isPhoneValid = /^\d{10}$/.test(consigneePhone)

  const isAddressValid =
    (manualConsignee?.address.trim().length ?? 0) >= 10

  const isCityValid =
    (manualConsignee?.city.trim().length ?? 0) >= 3

  return (
    <section className="consignee-selector">
      <h2>Lugar de entrega</h2>

      <p className="selector-help">
        Selecciona dónde se entregará el pedido.
      </p>

      {consignees.length > 0 && (
        <div className="consignee-list">
          {consignees.map((consignee) => {
            const isSelected =
              !useManualAddress &&
              selectedConsignee?.consigneeNumber ===
              consignee.consigneeNumber

            return (
              <button
                key={consignee.consigneeNumber}
                type="button"
                className={`consignee-card ${isSelected ? 'selected' : ''
                  }`}
                onClick={() =>
                  handleConsigneeSelection(
                    consignee.consigneeNumber,
                  )
                }
              >
                <span className="consignee-information">
                  <span className="consignee-number">
                    Consignación {consignee.consigneeNumber}
                  </span>

                  <span>{consignee.name} ? {consignee.phone}</span>
                  <span className="consignee-address">
                    {consignee.address}
                  </span>

                  <span className="consignee-city">
                    {consignee.city}
                  </span>

                  <span className="consignee-hours">
                    Horario: {consignee.receivingHours}
                  </span>
                </span>

                {isSelected && (
                  <span className="selection-check">
                    ✓
                  </span>
                )}
              </button>
            )
          })}

          <button
            type="button"
            className={`manual-address-card ${useManualAddress ? 'selected' : ''
              }`}
            onClick={handleManualSelection}
          >
            <span className="manual-address-symbol">+</span>

            <span className="consignee-information">
              <span className="consignee-number">
                Otra dirección
              </span>

              <span className="consignee-city">
                Capturar lugar de entrega manualmente
              </span>
            </span>

            {useManualAddress && (
              <span className="selection-check">
                ✓
              </span>
            )}
          </button>
        </div>
      )}

      {consignees.length === 0 && (
        <div className="consignee-notice">
          <strong>Sin consignaciones registradas</strong>
          <span>
            Captura el lugar de entrega manualmente.
          </span>
        </div>
      )}

      {useManualAddress && (
        <div className="manual-address-form">
          <h3>Dirección de entrega</h3>

          <label className="form-label">
            Nombre del consignado
            <input
              className="form-control"
              type="text"
              maxLength={100}
              minLength={2}
              required
              value={consigneeName}
              aria-invalid={showValidationErrors && !isNameValid}
              onChange={(event) => {
                const value = event.target.value

                if (/^[\p{L} ]*$/u.test(value)) {
                  onConsigneeNameChange(value)
                }
              }}
              placeholder="Nombre del consignado"
            />
            {showValidationErrors && !isNameValid && (
              <small className="field-error" role="alert">
                El nombre debe contener al menos 2 caracteres válidos.
              </small>
            )}
          </label>

          <label className="form-label">
            Teléfono del consignado
            <input
              className="form-control"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              required
              value={consigneePhone}
              aria-invalid={showValidationErrors && !isPhoneValid}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, '')
                onConsigneePhoneChange(value)
              }}
              placeholder="Teléfono a 10 dígitos"
            />
            {showValidationErrors && !isPhoneValid && (
              <small className="field-error" role="alert">
                El teléfono debe contener exactamente 10 dígitos.
              </small>
            )}
          </label>



          <label>
            Dirección
            <input
              type="text"
              minLength={10}
              maxLength={200}
              required
              aria-invalid={showValidationErrors && !isAddressValid}
              placeholder="Ingresa la dirección"
              value={manualConsignee?.address ?? ''}
              onChange={(event) => {
                const value = event.target.value

                if (/^[\p{L}\p{N}\s,.#-]*$/u.test(value)) {
                  onManualConsigneeChange({
                    address: value,
                    city: manualConsignee?.city ?? '',
                    receivingStartTime:
                      manualConsignee?.receivingStartTime ?? '',
                    receivingEndTime:
                      manualConsignee?.receivingEndTime ?? '',
                  })
                }
              }}
            />
            {showValidationErrors && !isAddressValid && (
              <small className="field-error" role="alert">
                La dirección debe contener al menos 10 caracteres.
              </small>
            )}
          </label>

          <label>
            Población
            <input
              type="text"
              minLength={3}
              maxLength={100}
              required
              aria-invalid={showValidationErrors && !isCityValid}
              placeholder="Ingresa la población"
              value={manualConsignee?.city ?? ''}
              onChange={(event) => {
                const value = event.target.value

                if (/^[\p{L}\s]*$/u.test(value)) {
                  onManualConsigneeChange({
                    address: manualConsignee?.address ?? '',
                    city: value,
                    receivingStartTime:
                      manualConsignee?.receivingStartTime ?? '',
                    receivingEndTime:
                      manualConsignee?.receivingEndTime ?? '',
                  })
                }
              }}
            />
            {showValidationErrors && !isCityValid && (
              <small className="field-error" role="alert">
                La población debe contener al menos 3 caracteres.
              </small>
            )}
          </label>

          <div className="time-range">
            <label>
              Desde
              <input
                type="time"
                value={manualConsignee?.receivingStartTime ?? ''}
                onChange={(event) =>
                  onManualConsigneeChange({
                    address: manualConsignee?.address ?? '',
                    city: manualConsignee?.city ?? '',
                    receivingStartTime: event.target.value,
                    receivingEndTime:
                      manualConsignee?.receivingEndTime ?? '',
                  })
                }
              />
            </label>

            <label>
              Hasta
              <input
                type="time"
                value={manualConsignee?.receivingEndTime ?? ''}
                onChange={(event) =>
                  onManualConsigneeChange({
                    address: manualConsignee?.address ?? '',
                    city: manualConsignee?.city ?? '',
                    receivingStartTime:
                      manualConsignee?.receivingStartTime ?? '',
                    receivingEndTime: event.target.value,
                  })
                }
              />
            </label>
          </div>
        </div>
      )}
    </section>
  )
}

export default ConsigneeSelector
