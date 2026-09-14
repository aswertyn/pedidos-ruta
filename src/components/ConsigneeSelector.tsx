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

  return (
    <section>
      <h2>Consignación</h2>

      {consignees.length > 0 && (
        <>
          <select
            value={selectedConsignee?.consigneeNumber ?? ''}
            onChange={(event) => {
              setUseManualAddress(false)
              onConsigneeChange(event.target.value)
            }}
          >
            <option value="">Seleccione una consignación</option>

            {consignees.map((consignee) => (
              <option
                key={consignee.consigneeNumber}
                value={consignee.consigneeNumber}
              >
                {consignee.consigneeNumber} - {consignee.city}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setUseManualAddress(true)}
          >
            Capturar otra dirección
          </button>
        </>
      )}

      {consignees.length === 0 && (
        <p>Este cliente no tiene consignaciones registradas.</p>
      )}

      {useManualAddress && (
        <div>
          <h3>Dirección de entrega manual</h3>

          <label>
            Dirección
            <input
              type="text"
              value={manualConsignee?.address ?? ''}
              onChange={(event) =>
                onManualConsigneeChange({
                  address: event.target.value,
                  city: manualConsignee?.city ?? '',
                  receivingHours:
                    manualConsignee?.receivingHours ?? '',
                })
              }
            />
          </label>

          <label>
            Población
            <input
              type="text"
              value={manualConsignee?.city ?? ''}
              onChange={(event) =>
                onManualConsigneeChange({
                  address: manualConsignee?.address ?? '',
                  city: event.target.value,
                  receivingHours:
                    manualConsignee?.receivingHours ?? '',
                })
              }
            />
          </label>

          <label>
            Horario de recepción
            <input
              type="text"
              value={manualConsignee?.receivingHours ?? ''}
              onChange={(event) =>
                onManualConsigneeChange({
                  address: manualConsignee?.address ?? '',
                  city: manualConsignee?.city ?? '',
                  receivingHours: event.target.value,
                })
              }
            />
          </label>
        </div>
      )}

      {selectedConsignee && !useManualAddress && (
        <div>
          <h3>Datos de consignación</h3>

          <p>
            <strong>Número:</strong>{' '}
            {selectedConsignee.consigneeNumber}
          </p>

          <p>
            <strong>Dirección:</strong> {selectedConsignee.address}
          </p>

          <p>
            <strong>Población:</strong> {selectedConsignee.city}
          </p>

          <p>
            <strong>Horario de recepción:</strong>{' '}
            {selectedConsignee.receivingHours}
          </p>
        </div>
      )}
    </section>
  )
}

export default ConsigneeSelector