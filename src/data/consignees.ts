import type { Consignee } from '../types/consignee'

export const consignees: Consignee[] = [
  {
    id: '01', //id/número del agente (la fk) 
    customerId: '1001', //id/número de cliente (la fk)
    address: 'Av. Patria 500',
    city: 'Zapopan',
    receivingHours: '09:00 - 14:00',
  },
  {
    id: '02',
    customerId: '1001',
    address: 'Av. López Mateos 1800',
    city: 'Guadalajara',
    receivingHours: '10:00 - 16:00',
  },
  {
    id: '01',
    customerId: '2001',
    address: 'Blvd. Francisco Villa 900',
    city: 'Durango',
    receivingHours: '08:00 - 13:00',
  },
]