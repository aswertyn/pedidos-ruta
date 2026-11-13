
import type { Consignee } from '../types/consignee'

export const consignees: Consignee[] = [
  {
    consigneeNumber: '01',
    customerNumber: '1001',
    name: 'Almacen de ejemplo uno',
    phone: '3300010001',
    address: 'Av. Patria 500',
    city: 'Zapopan',
    receivingStartTime: '09:00',
    receivingEndTime: '14:00',
  },
  {
    consigneeNumber: '02',
    customerNumber: '1001',
    name: 'Almacen de ejemplo dos',
    phone: '3300010002',
    address: 'Av. López Mateos 1800',
    city: 'Guadalajara',
    receivingStartTime: '10:00',
    receivingEndTime: '16:00',
  },
  {
    consigneeNumber: '01',
    customerNumber: '2001',
    name: 'Almacen de ejemplo tres',
    phone: '3300010003',
    address: 'Blvd. Francisco Villa 900',
    city: 'Durango',
    receivingStartTime: '08:00',
    receivingEndTime: '13:00',
  },
]
