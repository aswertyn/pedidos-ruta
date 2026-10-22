export interface Customer {
  customerNumber: string
  phone: string
  conditions: string
  name: string
  address: string
  city: string
  agentNumber: string //FK
}