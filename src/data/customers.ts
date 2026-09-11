import type { Customer } from '../types/customer'

export const customers: Customer[] = [
  {
    customerNumber: '1001', //número de cliente
    name: 'Mueblería Centro',
    address: 'Av. Vallarta 1200',
    city: 'Guadalajara',
    agentNumber: '1',
  },
  {
    customerNumber: '1002',
    name: 'Distribuidora Pacífico',
    address: 'Av. México 850',
    city: 'Puerto Vallarta',
    agentNumber: '1',
  },
  {
    customerNumber: '2001',
    name: 'Muebles del Norte',
    address: 'Blvd. Durango 450',
    city: 'Durango',
    agentNumber: '2',
  },
  {
    customerNumber: '2002',
    name: 'Descanso Zacatecas',
    address: 'Av. Universidad 310',
    city: 'Zacatecas',
    agentNumber: '2',
  },
  {
    customerNumber: '3001',
    name: 'Colchones Guadalajara',
    address: 'Av. Alcalde 720',
    city: 'Guadalajara',
    agentNumber: '3',
  },
]