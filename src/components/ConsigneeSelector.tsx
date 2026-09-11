import type { Consignee } from '../types/consignee'

interface ConsigneeSelectorProps {
  consignees: Consignee[]
  selectedConsignee: Consignee | null
  onConsigneeChange: (consigneeNumber: string) => void
}

function ConsigneeSelector({
  consignees,
  selectedConsignee,
  onConsigneeChange,
}: ConsigneeSelectorProps) {
  return (
    <section>
      <h2>Seleccionar consignación</h2>

      {consignees.length > 0 ? (
        <>
          <select
            value={selectedConsignee?.consigneeNumber ?? ''}
            onChange={(event) => onConsigneeChange(event.target.value)}
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

          {selectedConsignee && (
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
        </>
      ) : (
        <p>Este cliente no tiene consignaciones registradas.</p>
      )}
    </section>
  )
}

export default ConsigneeSelector