import type { Customer } from '../types/customer'

interface CustomerSelectorProps {
  customers: Customer[]
  selectedCustomer: Customer | null
  onCustomerChange: (customerNumber: string) => void
}

function CustomerSelector({
  customers,
  selectedCustomer,
  onCustomerChange,
}: CustomerSelectorProps) {
  return (
    <section>
      <h2>Seleccionar cliente</h2>

      <select
        value={selectedCustomer?.customerNumber ?? ''}
        onChange={(event) => onCustomerChange(event.target.value)}
      >
        <option value="">Seleccione un cliente</option>

        {customers.map((customer) => (
          <option key={customer.customerNumber} value={customer.customerNumber}>
            {customer.customerNumber} - {customer.name}
          </option>
        ))}
      </select>

      {selectedCustomer && (
        <div>
          <h3>Datos del cliente</h3>

          <p>
            <strong>Número de cliente:</strong> {selectedCustomer.customerNumber}
          </p>

          <p>
            <strong>Nombre:</strong> {selectedCustomer.name}
          </p>

          <p>
            <strong>Dirección:</strong> {selectedCustomer.address}
          </p>

          <p>
            <strong>Población:</strong> {selectedCustomer.city}
          </p>
        </div>
      )}
    </section>
  )
}

export default CustomerSelector