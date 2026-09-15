import { useState } from 'react'

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
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase().trim()

    return (
      customer.customerNumber.toLowerCase().includes(search) ||
      customer.name.toLowerCase().includes(search)
    )
  })

  return (
    <section className="customer-selector">
      <h2>Seleccionar cliente</h2>

      <p className="selector-help">
        Busca por número o nombre del cliente.
      </p>

      <input
        className="customer-search"
        type="search"
        placeholder="Número o nombre del cliente"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      <div className="customer-list">
        {filteredCustomers.map((customer) => {
          const isSelected =
            selectedCustomer?.customerNumber ===
            customer.customerNumber

          return (
            <button
              key={customer.customerNumber}
              type="button"
              className={`customer-card ${
                isSelected ? 'selected' : ''
              }`}
              onClick={() =>
                onCustomerChange(customer.customerNumber)
              }
            >
              <span className="customer-information">
                <span className="customer-number">
                  {customer.customerNumber}
                </span>

                <span className="customer-name">
                  {customer.name}
                </span>

                <span className="customer-city">
                  {customer.city}
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

        {filteredCustomers.length === 0 && (
          <p className="empty-message">
            No se encontraron clientes.
          </p>
        )}
      </div>
    </section>
  )
}

export default CustomerSelector