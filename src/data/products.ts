import type { Product } from '../types/product'

export const products: Product[] = [
  {
    productNumber: 'P001',
    model: 'Bamboe Aloe',
    availableTypes: ['mattress', 'box', 'platform'],
    availableSizes: [
      'ind',
      'mat',
      'Q.S.',
      'K.S.',
    ],
  },
  {
    productNumber: 'P002',
    model: 'Aloe Vera',
    availableTypes: ['mattress', 'box'],
    availableSizes: [
      'ind',
      'mat',
      'Q.S.',
      'K.S.',
    ],
  },
  {
    productNumber: 'P003',
    model: 'Amatista',
    availableTypes: ['mattress'],
    availableSizes: [
      'ind',
      'mat',
      'Q.S.',
      'K.S.',
    ],
  },
]