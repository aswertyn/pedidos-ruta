import { useState } from 'react'

import type { Consignee } from '../types/consignee'
import type { ManualConsignee } from '../types/manualConsignee'

interface ConsigneeSelectorProps {
  consignees: Consignee[]
  selectedConsignee: Consignee | null
  manualConsignee: ManualConsignee | null
  onConsigneeChange: (consigneeNumber: string) => void
  onManualConsigneeChange: (manualConsignee: ManualConsignee) => void
}

function ConsigneeSelector({
  consignees,
  selectedConsignee,
  manualConsignee,
  onConsigneeChange,
  onManualConsigneeChange,
}: ConsigneeSelectorProps) {
  const [useManualAddress, setUseManualAddress] = useState(
    consignees.length === 0,
  )

  const handleConsigneeSelection = (consigneeNumber: string) => {
    setUseManualAddress(false)
    onConsigneeChange(consigneeNumber)
  }

  const handleManualSelection = () => {
    setUseManualAddress(true)
    onConsigneeChange('')
  }

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

          <label>
            Dirección
            <input
              type="text"
              placeholder="Ingresa la dirección"
              value={manualConsignee?.address ?? ''}
              onChange={(event) =>
                onManualConsigneeChange({
                  address: event.target.value,
                  city: manualConsignee?.city ?? '',
                  receivingStartTime:
                    manualConsignee?.receivingStartTime ?? '',
                  receivingEndTime:
                    manualConsignee?.receivingEndTime ?? '',
                })
              }
            />
          </label>

          <label>
            Población
            <input
              type="text"
              placeholder="Ingresa la población"
              value={manualConsignee?.city ?? ''}
              onChange={(event) =>
                onManualConsigneeChange({
                  address: manualConsignee?.address ?? '',
                  city: event.target.value,
                  receivingStartTime:
                    manualConsignee?.receivingStartTime ?? '',
                  receivingEndTime:
                    manualConsignee?.receivingEndTime ?? '',
                })
              }
            />
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