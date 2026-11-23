export interface Customer {
  // Datos del Web Service
  customerNumber: string
  name: string
  contactName?: string
  phone: string

  // Datos complementarios para Excel
  address: string
  city: string
  conditions: string

  // Relación con el agente
  agentNumber: string
}
